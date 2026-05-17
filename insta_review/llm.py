from __future__ import annotations

import json
import os
import time
from typing import Any
import urllib.error
import urllib.request


def optimize_payload(payload: dict[str, object], max_chars: int = 12000) -> str:
    """Return a compact JSON prompt payload for chat-completions models."""
    optimized: dict[str, Any] = {}
    for key, value in payload.items():
        optimized[key] = _compact_value(value)

    serialized = json.dumps(optimized, ensure_ascii=False, indent=2, default=str)

    if len(serialized) > max_chars:
        return json.dumps(
            {
                "payload_truncated": True,
                "payload_excerpt": serialized[:max_chars],
            },
            ensure_ascii=False,
            indent=2,
        )

    return serialized


def _compact_value(value: object) -> object:
    if isinstance(value, str):
        return value[:2000]

    if isinstance(value, list):
        return [_compact_value(item) for item in value[:20]]

    if isinstance(value, dict):
        return {
            str(key): _compact_value(item)
            for key, item in list(value.items())[:20]
        }

    return value


class GroqClient:
    """Thin wrapper around the Groq chat-completions API (OpenAI-compatible)."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.model = model or os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not set. Use --dry-run to skip AI generation.")

    def complete(self, system_prompt: str, user_payload: dict[str, object]) -> str:
        serialized_payload = optimize_payload(user_payload)
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": serialized_payload,
                },
            ],
            "temperature": 0.7,
            "max_tokens": 1024,
        }

        for attempt in range(5):
            request = urllib.request.Request(
                "https://api.groq.com/openai/v1/chat/completions",
                data=json.dumps(body).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "insta-growth-manager/0.1",
                },
                method="POST",
            )

            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                    return _extract_text(payload)

            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                if exc.code in {429, 500, 502, 503, 504} and attempt < 4:
                    time.sleep(_retry_delay(exc, attempt))
                    continue

                raise RuntimeError(
                    f"Groq API request failed: {exc.code} {detail}"
                ) from exc
            except urllib.error.URLError as exc:
                if attempt < 4:
                    time.sleep(5 * (attempt + 1))
                    continue

                raise RuntimeError(f"Groq API request failed: {exc.reason}") from exc

        raise RuntimeError("Groq API retries exhausted.")


def _retry_delay(exc: urllib.error.HTTPError, attempt: int) -> int:
    retry_after = exc.headers.get("Retry-After")
    if retry_after and retry_after.isdigit():
        return max(1, int(retry_after))

    return 15 * (attempt + 1)


def _extract_text(payload: dict[str, object]) -> str:
    """Extract assistant message text from a chat-completions response."""
    choices = payload.get("choices", [])
    if isinstance(choices, list) and choices and isinstance(choices[0], dict):
        message = choices[0].get("message", {})
        if not isinstance(message, dict):
            raise RuntimeError("Groq API returned a malformed message.")

        text = message.get("content")
        if isinstance(text, str):
            return text

    raise RuntimeError("Groq API returned no text output.")

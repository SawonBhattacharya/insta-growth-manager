from __future__ import annotations
import time
import json
import os
import urllib.error
import urllib.request

def optimize_payload(payload: dict, max_chars: int = 6000) -> dict:
    """
    Aggressively reduce payload size for LLM requests.
    """

    optimized = {}

    for key, value in payload.items():

        # Strings
        if isinstance(value, str):
            optimized[key] = value[:1000]

        # Lists
        elif isinstance(value, list):

            trimmed_list = []

            for item in value[:10]:

                if isinstance(item, str):
                    trimmed_list.append(item[:300])

                elif isinstance(item, dict):
                    trimmed_item = {
                        k: str(v)[:200]
                        for k, v in list(item.items())[:10]
                    }
                    trimmed_list.append(trimmed_item)

                else:
                    trimmed_list.append(item)

            optimized[key] = trimmed_list

        # Dicts
        elif isinstance(value, dict):
            optimized[key] = {
                k: str(v)[:300]
                for k, v in list(value.items())[:10]
            }

        else:
            optimized[key] = value

    # HARD serialization cutoff
    serialized = json.dumps(optimized, ensure_ascii=False)

    if len(serialized) > max_chars:
        serialized = serialized[:max_chars]

    return {"compressed_payload": serialized}
class GroqClient:
    """Thin wrapper around the Groq chat-completions API (OpenAI-compatible)."""

    def __init__(self, api_key: str | None = None, model: str | None = None) -> None:
        self.api_key = api_key or os.environ.get("GROQ_API_KEY")
        self.model = model or os.environ.get("GROQ_MODEL", "llama-3.1-8b-instant")
        if not self.api_key:
            raise RuntimeError("GROQ_API_KEY is not set. Use --dry-run to skip AI generation.")

    def complete(self, system_prompt: str, user_payload: dict[str, object]) -> str:
        optimized_payload = optimize_payload(user_payload)
        serialized_payload = optimized_payload["compressed_payload"]
        print("Payload chars:", len(serialized_payload))
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": optimized_payload["compressed_payload"]
                },
            ],
            "temperature": 0.7,
            "max_tokens": 1024,
        }
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
        for attempt in range(5):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    payload = json.loads(response.read().decode("utf-8"))
                    return _extract_text(payload)

            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")

                # Handle rate limiting
                if exc.code == 429:
                    wait_time = 15 * (attempt + 1)

                    print(f"Rate limit hit. Retrying in {wait_time}s...")
                    time.sleep(wait_time)

                    continue

                # Other HTTP errors
                raise RuntimeError(
                    f"Groq API request failed: {exc.code} {detail}"
                ) from exc

        raise RuntimeError("Groq API retries exhausted.")

        return _extract_text(payload)


def _extract_text(payload: dict[str, object]) -> str:
    """Extract assistant message text from a chat-completions response."""
    choices = payload.get("choices", [])
    if choices:
        message = choices[0].get("message", {})
        text = message.get("content")
        if isinstance(text, str):
            return text

    raise RuntimeError("Groq API returned no text output.")

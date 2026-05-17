import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from insta_review.llm import _extract_text, optimize_payload


class LLMTestCase(unittest.TestCase):
    def test_optimize_payload_returns_valid_json_when_truncated(self):
        serialized = optimize_payload({"items": ["x" * 1000 for _ in range(20)]}, max_chars=100)

        payload = json.loads(serialized)

        self.assertTrue(payload["payload_truncated"])
        self.assertIn("payload_excerpt", payload)

    def test_extract_text_reads_chat_completion_response(self):
        response = {
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "report text",
                    }
                }
            ]
        }

        self.assertEqual(_extract_text(response), "report text")


if __name__ == "__main__":
    unittest.main()

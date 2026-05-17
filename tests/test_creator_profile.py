import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from insta_review.creator_profile import CreatorProfile


class CreatorProfileTestCase(unittest.TestCase):
    def test_context_contains_account_specific_inputs(self):
        profile = CreatorProfile(
            account_name="@city_bites",
            niche="Budget food reviews",
            audience="Students and young professionals",
            goals="Increase saves and restaurant collaborations",
            content_style="Short reels with prices and honest ratings",
            posting_capacity="3 reels per week",
            constraints="No face reveal",
        )

        context = profile.to_context_markdown()

        self.assertIn("@city_bites", context)
        self.assertIn("Budget food reviews", context)
        self.assertIn("No face reveal", context)
        self.assertEqual(profile.report_title(), "Instagram Growth Report - @city_bites")


if __name__ == "__main__":
    unittest.main()

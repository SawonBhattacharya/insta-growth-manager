from datetime import date
import json
import re
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from insta_review.models import DailyMetric, KPIReport
from insta_review.report import build_html_report


class ReportTestCase(unittest.TestCase):
    def test_build_html_report_contains_tabs_and_embedded_data(self):
        html = build_html_report(
            metrics=[
                DailyMetric(
                    date=date(2026, 5, 1),
                    views=100,
                    reach=80,
                    interactions=12,
                    profile_visits=5,
                    follows=1,
                )
            ],
            kpis=KPIReport(
                period_start=date(2026, 5, 1),
                period_end=date(2026, 5, 1),
                days_count=1,
                total_views=100,
                total_reach=80,
                total_interactions=12,
                total_profile_visits=5,
                total_follows=1,
                engagement_rate=0.15,
                follow_conversion_rate=0.2,
                view_to_reach_ratio=1.25,
                dead_days_count=0,
                avg_reach_per_day=80,
                avg_views_per_day=100,
                reach_growth_wow=None,
                best_views_day="2026-05-01",
                best_reach_day="2026-05-01",
            ),
            strategy_report="## Strategy\n\n**Focus** on profile conversion.",
            content_plan="## Weekly Plan\n\n1. Post one reel.",
        )

        self.assertIn("id=\"dashboard\"", html)
        self.assertIn("id=\"strategy\"", html)
        self.assertIn("id=\"plan\"", html)
        self.assertIn("Export Full Report PDF", html)
        self.assertIn("<strong>Focus</strong>", html)

        match = re.search(
            r'<script id="report-data" type="application/json">(.*?)</script>',
            html,
            re.DOTALL,
        )
        self.assertIsNotNone(match)
        payload = json.loads(match.group(1))
        self.assertEqual(payload["kpis"]["total_reach"], 80)
        self.assertEqual(payload["metrics"][0]["views"], 100)


if __name__ == "__main__":
    unittest.main()

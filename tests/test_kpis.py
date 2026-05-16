from datetime import date
import unittest

from insta_review.kpis import calculate_kpis
from insta_review.models import DailyMetric


class KPITestCase(unittest.TestCase):
    def test_calculate_kpis_matches_core_formulas(self):
        metrics = [
            DailyMetric(date=date(2026, 5, 1), views=10, reach=5, interactions=1, profile_visits=2, follows=1),
            DailyMetric(date=date(2026, 5, 2), views=20, reach=10, interactions=2, profile_visits=3, follows=0),
            DailyMetric(date=date(2026, 5, 3), views=30, reach=0, interactions=0, profile_visits=0, follows=0),
        ]

        report = calculate_kpis(metrics)

        self.assertEqual(report.total_views, 60)
        self.assertEqual(report.total_reach, 15)
        self.assertEqual(report.total_interactions, 3)
        self.assertEqual(report.engagement_rate, 3 / 15)
        self.assertEqual(report.follow_conversion_rate, 1 / 5)
        self.assertEqual(report.view_to_reach_ratio, 4)
        self.assertEqual(report.dead_days_count, 1)

    def test_reach_growth_wow_uses_last_two_complete_7_day_windows(self):
        metrics = [
            DailyMetric(date=date(2026, 5, day), reach=10)
            for day in range(1, 8)
        ] + [
            DailyMetric(date=date(2026, 5, day), reach=15)
            for day in range(8, 15)
        ]

        report = calculate_kpis(metrics)

        self.assertEqual(report.reach_growth_wow, 0.5)


if __name__ == "__main__":
    unittest.main()

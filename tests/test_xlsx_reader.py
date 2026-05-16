from pathlib import Path
import unittest

from insta_review.xlsx_reader import read_daily_metrics


class XLSXReaderTestCase(unittest.TestCase):
    def test_reads_user_workbook_when_available(self):
        workbook = Path(__file__).resolve().parent.parent / "data" / "insta monthly review.xlsx"
        if not workbook.exists():
            self.skipTest("User workbook is not available on this machine.")

        metrics = read_daily_metrics(workbook)

        self.assertEqual(len(metrics), 28)
        self.assertEqual(metrics[0].date.isoformat(), "2026-04-17")
        self.assertEqual(metrics[-1].date.isoformat(), "2026-05-14")
        self.assertEqual(sum(day.reach for day in metrics), 4945)
        self.assertEqual(sum(day.interactions for day in metrics), 455)


if __name__ == "__main__":
    unittest.main()

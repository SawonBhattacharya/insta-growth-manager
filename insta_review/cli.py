from __future__ import annotations

import argparse
from pathlib import Path

from .workflow import run_workflow


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Automate Instagram monthly review strategy reports.")
    parser.add_argument("--excel", required=True, help="Path to the Instagram monthly review .xlsx file.")
    parser.add_argument("--niche-context", help="Path to niche_context.md.")
    parser.add_argument("--strategist-prompt", help="Path to strategist_prompt.txt.")
    parser.add_argument("--content-prompt", help="Path to content_creator_prompt.txt.")
    parser.add_argument("--out-dir", default="outputs", help="Directory for generated files.")
    parser.add_argument("--model", help="Groq model override.")
    parser.add_argument("--dry-run", action="store_true", help="Parse metrics and KPIs only; do not call Groq.")
    args = parser.parse_args(argv)

    metrics, kpis = run_workflow(
        excel_path=args.excel,
        niche_context_path=args.niche_context,
        strategist_prompt_path=args.strategist_prompt,
        content_prompt_path=args.content_prompt,
        out_dir=args.out_dir,
        dry_run=args.dry_run,
        model=args.model,
    )

    print(f"Parsed {len(metrics)} daily rows from {Path(args.excel).name}.")
    print(f"Period: {kpis.period_start.isoformat()} to {kpis.period_end.isoformat()}")
    print(f"Total reach: {kpis.total_reach}")
    print(f"Engagement rate: {kpis.engagement_rate:.2%}")
    print(f"Follow conversion: {kpis.follow_conversion_rate:.2%}")
    print(f"View/reach ratio: {kpis.view_to_reach_ratio:.2f}x")
    print(f"Dead days: {kpis.dead_days_count}")
    print(f"Report written to: {(Path(args.out_dir) / 'report.html').resolve()}")
    return 0

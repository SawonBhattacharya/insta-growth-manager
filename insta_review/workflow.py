from __future__ import annotations

import json
from datetime import date, timedelta
from pathlib import Path

from .kpis import calculate_kpis
from .llm import GroqClient
from .models import DailyMetric, KPIReport
from .xlsx_reader import read_daily_metrics


def run_workflow(
    excel_path: str | Path,
    niche_context_path: str | Path | None,
    strategist_prompt_path: str | Path | None,
    content_prompt_path: str | Path | None,
    out_dir: str | Path,
    dry_run: bool = False,
    model: str | None = None,
) -> tuple[list[DailyMetric], KPIReport]:
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    metrics = read_daily_metrics(excel_path)
    kpis = calculate_kpis(metrics)

    _write_json(out_path / "daily_metrics.json", [day.to_json() for day in metrics])
    _write_json(out_path / "kpis.json", kpis.to_json())

    if dry_run:
        return metrics, kpis

    missing = [
        name
        for name, value in {
            "niche context": niche_context_path,
            "strategist prompt": strategist_prompt_path,
            "content prompt": content_prompt_path,
        }.items()
        if value is None
    ]
    if missing:
        raise ValueError(f"Missing required inputs for AI generation: {', '.join(missing)}")

    niche_context = Path(niche_context_path).read_text(encoding="utf-8")
    strategist_prompt = Path(strategist_prompt_path).read_text(encoding="utf-8")
    content_prompt = Path(content_prompt_path).read_text(encoding="utf-8")

    client = GroqClient(model=model)
    strategy_report = client.complete(
        strategist_prompt,
        {
            "kpi_metrics": kpis.to_json(),
            "daily_raw_metrics": [day.to_json() for day in metrics],
            "niche_context": niche_context,
        },
    )
    (out_path / "strategy_report.md").write_text(strategy_report, encoding="utf-8")

    content_plan = client.complete(
        content_prompt,
        {
            "strategy_report": strategy_report,
            "niche_context": niche_context,
            "week": _next_week_label(kpis.period_end),
        },
    )
    (out_path / "weekly_content_plan.md").write_text(content_plan, encoding="utf-8")

    return metrics, kpis


def _write_json(path: Path, payload: object) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def _next_week_label(period_end: date) -> str:
    start = period_end + timedelta(days=1)
    end = start + timedelta(days=6)
    return f"Week of {start.strftime('%d %b')}–{end.strftime('%d %b %Y')}"

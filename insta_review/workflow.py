from __future__ import annotations

from datetime import date, timedelta
from pathlib import Path

from .kpis import calculate_kpis
from .llm import GroqClient
from .models import DailyMetric, KPIReport
from .report import write_html_report
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

    if dry_run:
        write_html_report(out_path / "report.html", metrics, kpis)
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

    return run_custom_workflow(
        excel_path=excel_path,
        niche_context=niche_context,
        strategist_prompt=strategist_prompt,
        content_prompt=content_prompt,
        out_dir=out_dir,
        dry_run=False,
        model=model,
    )


def run_custom_workflow(
    excel_path: str | Path,
    niche_context: str,
    strategist_prompt: str,
    content_prompt: str,
    out_dir: str | Path,
    dry_run: bool = False,
    model: str | None = None,
    report_title: str = "Instagram Growth Report",
) -> tuple[list[DailyMetric], KPIReport]:
    out_path = Path(out_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    metrics = read_daily_metrics(excel_path)
    kpis = calculate_kpis(metrics)

    if dry_run:
        write_html_report(out_path / "report.html", metrics, kpis, title=report_title)
        return metrics, kpis

    client = GroqClient(model=model)
    strategy_report = client.complete(
        strategist_prompt,
        {
            "kpi_metrics": kpis.to_json(),
            "daily_raw_metrics": [day.to_json() for day in metrics],
            "niche_context": niche_context,
        },
    )

    content_plan = client.complete(
        content_prompt,
        {
            "strategy_report": strategy_report,
            "niche_context": niche_context,
            "week": _next_week_label(kpis.period_end),
        },
    )
    write_html_report(
        out_path / "report.html",
        metrics,
        kpis,
        strategy_report,
        content_plan,
        title=report_title,
    )

    return metrics, kpis


def _next_week_label(period_end: date) -> str:
    start = period_end + timedelta(days=1)
    end = start + timedelta(days=6)
    return f"Week of {start.strftime('%d %b')} - {end.strftime('%d %b %Y')}"

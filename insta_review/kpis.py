from __future__ import annotations

from .models import DailyMetric, KPIReport


def calculate_kpis(metrics: list[DailyMetric]) -> KPIReport:
    if not metrics:
        raise ValueError("No daily metrics found in workbook.")

    total_views = sum(day.views for day in metrics)
    total_reach = sum(day.reach for day in metrics)
    total_interactions = sum(day.interactions for day in metrics)
    total_profile_visits = sum(day.profile_visits for day in metrics)
    total_follows = sum(day.follows for day in metrics)

    reach_growth_wow = _reach_growth_wow(metrics)
    best_views_day = max(metrics, key=lambda day: day.views).date.isoformat() if metrics else None
    best_reach_day = max(metrics, key=lambda day: day.reach).date.isoformat() if metrics else None

    return KPIReport(
        period_start=metrics[0].date,
        period_end=metrics[-1].date,
        days_count=len(metrics),
        total_views=total_views,
        total_reach=total_reach,
        total_interactions=total_interactions,
        total_profile_visits=total_profile_visits,
        total_follows=total_follows,
        engagement_rate=_safe_divide(total_interactions, total_reach),
        follow_conversion_rate=_safe_divide(total_follows, total_profile_visits),
        view_to_reach_ratio=_safe_divide(total_views, total_reach),
        dead_days_count=sum(1 for day in metrics if day.reach < 5),
        avg_reach_per_day=_safe_divide(total_reach, len(metrics)),
        avg_views_per_day=_safe_divide(total_views, len(metrics)),
        reach_growth_wow=reach_growth_wow,
        best_views_day=best_views_day,
        best_reach_day=best_reach_day,
    )


def _reach_growth_wow(metrics: list[DailyMetric]) -> float | None:
    if len(metrics) < 14:
        return None

    current_week = metrics[-7:]
    previous_week = metrics[-14:-7]
    current_reach = sum(day.reach for day in current_week)
    previous_reach = sum(day.reach for day in previous_week)
    if previous_reach == 0:
        return None
    return (current_reach - previous_reach) / previous_reach


def _safe_divide(numerator: int | float, denominator: int | float) -> float:
    if denominator == 0:
        return 0.0
    return numerator / denominator

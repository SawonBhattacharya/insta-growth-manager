from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import date


@dataclass(frozen=True)
class DailyMetric:
    date: date
    views: int = 0
    reach: int = 0
    interactions: int = 0
    profile_visits: int = 0
    follows: int = 0

    def to_json(self) -> dict[str, object]:
        data = asdict(self)
        data["date"] = self.date.isoformat()
        return data


@dataclass(frozen=True)
class KPIReport:
    period_start: date
    period_end: date
    days_count: int
    total_views: int
    total_reach: int
    total_interactions: int
    total_profile_visits: int
    total_follows: int
    engagement_rate: float
    follow_conversion_rate: float
    view_to_reach_ratio: float
    dead_days_count: int
    avg_reach_per_day: float
    avg_views_per_day: float
    reach_growth_wow: float | None
    best_views_day: str | None
    best_reach_day: str | None

    def to_json(self) -> dict[str, object]:
        data = asdict(self)
        data["period_start"] = self.period_start.isoformat()
        data["period_end"] = self.period_end.isoformat()
        return data

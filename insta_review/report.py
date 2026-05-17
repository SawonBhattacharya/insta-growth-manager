from __future__ import annotations

import html
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any

from .models import DailyMetric, KPIReport


def write_html_report(
    path: str | Path,
    metrics: list[DailyMetric],
    kpis: KPIReport,
    strategy_report: str | None = None,
    content_plan: str | None = None,
) -> None:
    report_path = Path(path)
    report_path.write_text(
        build_html_report(metrics, kpis, strategy_report, content_plan),
        encoding="utf-8",
    )


def build_html_report(
    metrics: list[DailyMetric],
    kpis: KPIReport,
    strategy_report: str | None = None,
    content_plan: str | None = None,
) -> str:
    metrics_json = [day.to_json() for day in metrics]
    kpis_json = kpis.to_json()
    report_data = {
        "metrics": metrics_json,
        "kpis": kpis_json,
    }

    strategy_html = _markdown_to_html(
        strategy_report
        or "Strategy report was not generated because this run used dry-run mode."
    )
    content_html = _markdown_to_html(
        content_plan
        or "Weekly content plan was not generated because this run used dry-run mode."
    )

    period = f"{_format_date(kpis.period_start.isoformat())} - {_format_date(kpis.period_end.isoformat())}"
    generated_at = datetime.now().strftime("%d %b %Y, %I:%M %p")

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Instagram Growth Report</title>
  <style>
    :root {{
      --bg: #f7f8fb;
      --panel: #ffffff;
      --ink: #17202a;
      --muted: #667085;
      --line: #d9dee8;
      --blue: #2563eb;
      --teal: #0f766e;
      --coral: #dc5f4b;
      --amber: #b7791f;
      --violet: #6d5bd0;
    }}

    * {{ box-sizing: border-box; }}

    body {{
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }}

    header {{
      background: #ffffff;
      border-bottom: 1px solid var(--line);
    }}

    .header-inner {{
      max-width: 1180px;
      margin: 0 auto;
      padding: 28px 20px 22px;
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 18px;
      align-items: end;
    }}

    h1 {{
      margin: 0 0 6px;
      font-size: 30px;
      line-height: 1.15;
      letter-spacing: 0;
    }}

    .subtitle {{
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }}

    .actions {{
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }}

    button {{
      min-height: 40px;
      border: 1px solid var(--line);
      background: #ffffff;
      color: var(--ink);
      border-radius: 8px;
      padding: 0 14px;
      font-weight: 700;
      cursor: pointer;
    }}

    button.primary {{
      background: var(--ink);
      border-color: var(--ink);
      color: #ffffff;
    }}

    nav {{
      max-width: 1180px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }}

    .tab-button {{
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-bottom: 3px solid transparent;
    }}

    .tab-button.active {{
      color: var(--blue);
      border-bottom-color: var(--blue);
    }}

    main {{
      max-width: 1180px;
      margin: 0 auto;
      padding: 24px 20px 40px;
    }}

    .tab-panel {{ display: none; }}
    .tab-panel.active {{ display: block; }}

    .summary-grid {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }}

    .metric {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
      min-height: 118px;
    }}

    .metric span {{
      display: block;
      color: var(--muted);
      font-size: 13px;
      margin-bottom: 8px;
    }}

    .metric strong {{
      display: block;
      font-size: 28px;
      line-height: 1.1;
      word-break: break-word;
    }}

    .metric small {{
      display: block;
      color: var(--muted);
      margin-top: 8px;
      font-size: 12px;
    }}

    .dashboard-layout {{
      display: grid;
      grid-template-columns: 1.45fr 1fr;
      gap: 16px;
      align-items: start;
    }}

    .section {{
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 18px;
      margin-bottom: 16px;
    }}

    h2, h3 {{
      margin: 0 0 12px;
      letter-spacing: 0;
      line-height: 1.25;
    }}

    h2 {{ font-size: 22px; }}
    h3 {{ font-size: 17px; }}

    .chart-wrap {{
      position: relative;
      width: 100%;
      height: 310px;
    }}

    canvas {{
      display: block;
      width: 100%;
      height: 100%;
    }}

    .legend {{
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
      color: var(--muted);
      font-size: 13px;
      margin-top: 10px;
    }}

    .dot {{
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 6px;
    }}

    .insight-list {{
      display: grid;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }}

    .insight-list li {{
      border-left: 4px solid var(--teal);
      background: #f8fbfb;
      padding: 10px 12px;
      border-radius: 6px;
    }}

    .data-table {{
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }}

    .data-table th,
    .data-table td {{
      border-bottom: 1px solid var(--line);
      padding: 9px 8px;
      text-align: right;
      white-space: nowrap;
    }}

    .data-table th:first-child,
    .data-table td:first-child {{
      text-align: left;
    }}

    .table-scroll {{
      overflow-x: auto;
    }}

    .content {{
      max-width: 860px;
    }}

    .content h2 {{
      margin-top: 24px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 8px;
    }}

    .content h2:first-child {{ margin-top: 0; }}

    .content h3 {{ margin-top: 20px; }}
    .content p {{ margin: 0 0 12px; }}
    .content li {{ margin-bottom: 8px; }}
    .content strong {{ color: #101828; }}

    @media (max-width: 860px) {{
      .header-inner {{
        grid-template-columns: 1fr;
        align-items: start;
      }}

      .actions {{ justify-content: flex-start; }}
      .summary-grid {{ grid-template-columns: repeat(2, minmax(0, 1fr)); }}
      .dashboard-layout {{ grid-template-columns: 1fr; }}
    }}

    @media (max-width: 560px) {{
      h1 {{ font-size: 24px; }}
      .summary-grid {{ grid-template-columns: 1fr; }}
      button {{ width: 100%; }}
      nav {{ padding-top: 6px; }}
    }}

    @media print {{
      body {{ background: #ffffff; }}
      header, nav, .actions {{ display: none !important; }}
      main {{ max-width: none; padding: 0; }}
      .section, .metric {{
        border-color: #d0d5dd;
        break-inside: avoid;
      }}
      .tab-panel {{ display: none !important; }}
      body.print-all .tab-panel,
      body.print-current .tab-panel.active {{
        display: block !important;
      }}
    }}
  </style>
</head>
<body>
  <header>
    <div class="header-inner">
      <div>
        <h1>Instagram Growth Report</h1>
        <p class="subtitle">Reporting period: {html.escape(period)}. Generated {html.escape(generated_at)}.</p>
      </div>
      <div class="actions" aria-label="Export options">
        <button type="button" onclick="printCurrent()">Export Current Tab PDF</button>
        <button type="button" class="primary" onclick="printAll()">Export Full Report PDF</button>
      </div>
    </div>
    <nav aria-label="Report tabs">
      <button type="button" class="tab-button active" data-tab="dashboard">Dashboard</button>
      <button type="button" class="tab-button" data-tab="strategy">Strategy</button>
      <button type="button" class="tab-button" data-tab="plan">Weekly Plan</button>
    </nav>
  </header>

  <main>
    <section id="dashboard" class="tab-panel active">
      {_dashboard_html(metrics_json, kpis_json)}
    </section>

    <section id="strategy" class="tab-panel">
      <article class="section content">
        {strategy_html}
      </article>
    </section>

    <section id="plan" class="tab-panel">
      <article class="section content">
        {content_html}
      </article>
    </section>
  </main>

  <script id="report-data" type="application/json">{_script_json(report_data)}</script>
  <script>
    const reportData = JSON.parse(document.getElementById('report-data').textContent);

    document.querySelectorAll('.tab-button').forEach((button) => {{
      button.addEventListener('click', () => {{
        document.querySelectorAll('.tab-button').forEach((item) => item.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach((panel) => panel.classList.remove('active'));
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
      }});
    }});

    function printCurrent() {{
      document.body.classList.remove('print-all');
      document.body.classList.add('print-current');
      window.print();
    }}

    function printAll() {{
      document.body.classList.remove('print-current');
      document.body.classList.add('print-all');
      window.print();
    }}

    window.addEventListener('afterprint', () => {{
      document.body.classList.remove('print-current', 'print-all');
    }});

    function drawLineChart(canvasId, series) {{
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      ctx.scale(scale, scale);

      const width = rect.width;
      const height = rect.height;
      const pad = {{ left: 42, right: 16, top: 18, bottom: 34 }};
      const values = series.flatMap((item) => item.values);
      const maxValue = Math.max(1, ...values);
      const points = reportData.metrics.length;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = '#d9dee8';
      ctx.lineWidth = 1;
      ctx.font = '12px Arial';
      ctx.fillStyle = '#667085';

      for (let i = 0; i <= 4; i++) {{
        const y = pad.top + ((height - pad.top - pad.bottom) * i / 4);
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();
        const label = Math.round(maxValue - (maxValue * i / 4)).toLocaleString();
        ctx.fillText(label, 6, y + 4);
      }}

      series.forEach((item) => {{
        ctx.strokeStyle = item.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        item.values.forEach((value, index) => {{
          const x = pad.left + ((width - pad.left - pad.right) * index / Math.max(1, points - 1));
          const y = height - pad.bottom - ((height - pad.top - pad.bottom) * value / maxValue);
          if (index === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }});
        ctx.stroke();
      }});

      const first = reportData.metrics[0]?.date || '';
      const last = reportData.metrics[reportData.metrics.length - 1]?.date || '';
      ctx.fillStyle = '#667085';
      ctx.fillText(formatShortDate(first), pad.left, height - 10);
      const lastLabel = formatShortDate(last);
      ctx.fillText(lastLabel, width - pad.right - ctx.measureText(lastLabel).width, height - 10);
    }}

    function drawBarChart(canvasId, bars) {{
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * scale));
      canvas.height = Math.max(1, Math.floor(rect.height * scale));
      ctx.scale(scale, scale);

      const width = rect.width;
      const height = rect.height;
      const pad = {{ left: 16, right: 16, top: 20, bottom: 58 }};
      const maxValue = Math.max(1, ...bars.map((bar) => bar.value));
      const slot = (width - pad.left - pad.right) / bars.length;

      ctx.clearRect(0, 0, width, height);
      ctx.font = '12px Arial';
      bars.forEach((bar, index) => {{
        const barWidth = Math.min(82, slot * 0.56);
        const x = pad.left + slot * index + (slot - barWidth) / 2;
        const barHeight = (height - pad.top - pad.bottom) * bar.value / maxValue;
        const y = height - pad.bottom - barHeight;
        ctx.fillStyle = bar.color;
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = '#17202a';
        const valueText = String(bar.value.toLocaleString());
        ctx.fillText(valueText, x + (barWidth - ctx.measureText(valueText).width) / 2, y - 7);
        ctx.fillStyle = '#667085';
        const words = bar.label.split(' ');
        words.forEach((word, wordIndex) => {{
          ctx.fillText(word, x, height - 36 + wordIndex * 14);
        }});
      }});
    }}

    function formatShortDate(value) {{
      if (!value) return '';
      const date = new Date(value + 'T00:00:00');
      return date.toLocaleDateString(undefined, {{ month: 'short', day: 'numeric' }});
    }}

    function renderCharts() {{
      const metrics = reportData.metrics;
      drawLineChart('reachViewsChart', [
        {{ label: 'Reach', color: '#2563eb', values: metrics.map((day) => day.reach || 0) }},
        {{ label: 'Views', color: '#dc5f4b', values: metrics.map((day) => day.views || 0) }},
      ]);
      drawBarChart('actionChart', [
        {{ label: 'Interactions', color: '#0f766e', value: reportData.kpis.total_interactions || 0 }},
        {{ label: 'Profile Visits', color: '#b7791f', value: reportData.kpis.total_profile_visits || 0 }},
        {{ label: 'Follows', color: '#6d5bd0', value: reportData.kpis.total_follows || 0 }},
      ]);
    }}

    window.addEventListener('resize', renderCharts);
    renderCharts();
  </script>
</body>
</html>
"""


def _dashboard_html(metrics: list[dict[str, object]], kpis: dict[str, object]) -> str:
    return f"""
      <div class="summary-grid">
        {_metric_card("Total Reach", _format_number(kpis["total_reach"]), "Unique accounts reached")}
        {_metric_card("Total Views", _format_number(kpis["total_views"]), f"{_format_number(kpis['avg_views_per_day'])} average per day")}
        {_metric_card("Engagement Rate", _format_percent(kpis["engagement_rate"]), "Interactions divided by reach")}
        {_metric_card("Follow Conversion", _format_percent(kpis["follow_conversion_rate"]), "Follows divided by profile visits")}
      </div>

      <div class="dashboard-layout">
        <div>
          <section class="section">
            <h2>Reach And Views Trend</h2>
            <div class="chart-wrap"><canvas id="reachViewsChart" aria-label="Reach and views trend"></canvas></div>
            <div class="legend">
              <span><i class="dot" style="background:#2563eb"></i>Reach</span>
              <span><i class="dot" style="background:#dc5f4b"></i>Views</span>
            </div>
          </section>

          <section class="section">
            <h2>Daily Numbers</h2>
            <div class="table-scroll">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Views</th>
                    <th>Reach</th>
                    <th>Interactions</th>
                    <th>Profile Visits</th>
                    <th>Follows</th>
                  </tr>
                </thead>
                <tbody>
                  {_daily_rows(metrics)}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div>
          <section class="section">
            <h2>Audience Actions</h2>
            <div class="chart-wrap"><canvas id="actionChart" aria-label="Audience action totals"></canvas></div>
          </section>

          <section class="section">
            <h2>Quick Read</h2>
            <ul class="insight-list">
              <li>{_best_day_sentence("views", kpis.get("best_views_day"))}</li>
              <li>{_best_day_sentence("reach", kpis.get("best_reach_day"))}</li>
              <li>{html.escape(str(kpis["dead_days_count"]))} low-reach days need lighter daily activity.</li>
              <li>View-to-reach ratio is {_format_decimal(kpis["view_to_reach_ratio"])}x.</li>
              <li>Week-over-week reach growth is {_format_optional_percent(kpis.get("reach_growth_wow"))}.</li>
            </ul>
          </section>
        </div>
      </div>
    """


def _metric_card(label: str, value: str, note: str) -> str:
    return f"""
      <section class="metric">
        <span>{html.escape(label)}</span>
        <strong>{html.escape(value)}</strong>
        <small>{html.escape(note)}</small>
      </section>
    """


def _daily_rows(metrics: list[dict[str, object]]) -> str:
    rows = []
    for day in metrics:
        rows.append(
            "<tr>"
            f"<td>{html.escape(_format_date(str(day['date'])))}</td>"
            f"<td>{_format_number(day['views'])}</td>"
            f"<td>{_format_number(day['reach'])}</td>"
            f"<td>{_format_number(day['interactions'])}</td>"
            f"<td>{_format_number(day['profile_visits'])}</td>"
            f"<td>{_format_number(day['follows'])}</td>"
            "</tr>"
        )
    return "\n".join(rows)


def _markdown_to_html(markdown: str) -> str:
    blocks: list[str] = []
    list_items: list[str] = []
    list_type: str | None = None

    def flush_list() -> None:
        nonlocal list_items, list_type
        if list_items and list_type:
            blocks.append(f"<{list_type}>{''.join(list_items)}</{list_type}>")
        list_items = []
        list_type = None

    for raw_line in markdown.splitlines():
        line = raw_line.strip()
        if not line or line == "---":
            flush_list()
            continue

        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        bullet = re.match(r"^[-*]\s+(.+)$", line)
        numbered = re.match(r"^\d+\.\s+(.+)$", line)

        if heading:
            flush_list()
            level = min(len(heading.group(1)), 3)
            blocks.append(f"<h{level}>{_inline_markdown(heading.group(2))}</h{level}>")
        elif bullet:
            if list_type != "ul":
                flush_list()
                list_type = "ul"
            list_items.append(f"<li>{_inline_markdown(bullet.group(1))}</li>")
        elif numbered:
            if list_type != "ol":
                flush_list()
                list_type = "ol"
            list_items.append(f"<li>{_inline_markdown(numbered.group(1))}</li>")
        else:
            flush_list()
            blocks.append(f"<p>{_inline_markdown(line)}</p>")

    flush_list()
    return "\n".join(blocks)


def _inline_markdown(text: str) -> str:
    escaped = html.escape(text)
    return re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", escaped)


def _script_json(payload: dict[str, Any]) -> str:
    return json.dumps(payload, ensure_ascii=False).replace("</", "<\\/")


def _format_number(value: object) -> str:
    if isinstance(value, float):
        return f"{value:,.1f}"
    if isinstance(value, int):
        return f"{value:,}"
    return html.escape(str(value))


def _format_percent(value: object) -> str:
    if not isinstance(value, (float, int)):
        return "N/A"
    return f"{value * 100:.1f}%"


def _format_optional_percent(value: object) -> str:
    if value is None:
        return "not available"
    return _format_percent(value)


def _format_decimal(value: object) -> str:
    if not isinstance(value, (float, int)):
        return "N/A"
    return f"{value:.2f}"


def _format_date(value: str) -> str:
    parsed = datetime.strptime(value, "%Y-%m-%d")
    return parsed.strftime("%d %b %Y")


def _best_day_sentence(metric_name: str, day: object) -> str:
    if not day:
        return f"Best {metric_name} day is not available yet."
    return f"Best {metric_name} day was {_format_date(str(day))}."

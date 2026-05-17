# Instagram Monthly Review Automation

This codebase automates the analytics-to-content-planning workflow for `@sawon_chitrokotha`.

It reads Instagram monthly review Excel exports, computes the KPI package expected by the strategist prompt, generates a strategist report, then feeds that report into the content creator prompt to produce a weekly content plan. The Streamlit app lets other creators upload their own analytics and describe their niche before generating the report.

## What It Automates

- Section 2-7 style workflow: ingest data, normalize daily metrics, calculate KPIs, create the strategy brief, and create the weekly content plan.
- Section 8 stays manual: you still review/publish inside Instagram.
- Sections 9-10 remain planning inputs: prompts and niche context live in `insta_review/prompts/` and `insta_review/context/`.
- Section 11 support: a single `outputs/report.html` file is generated for review and sharing.
- Section 12 review support: `--dry-run` lets you verify parsing and KPI math before using the API.

## Setup

Requires Python 3.10+.

For AI generation, copy `.env.example` to `.env` and replace the placeholder key, or set:

```powershell
$env:GROQ_API_KEY="your_api_key"
```

Optionally set a model:

```powershell
$env:GROQ_MODEL="llama-3.1-8b-instant"
```

## Quick Start (Local)

```powershell
python -m insta_review `
  --excel "data\insta monthly review.xlsx" `
  --niche-context "insta_review\context\niche_context.md" `
  --strategist-prompt "insta_review\prompts\strategist_prompt.txt" `
  --content-prompt "insta_review\prompts\content_creator_prompt.txt" `
  --out-dir ".\outputs"
```

To only parse the workbook and compute KPIs:

```powershell
python -m insta_review `
  --excel "data\insta monthly review.xlsx" `
  --dry-run
```

Run the smoke tests:

```powershell
python -m unittest discover -s tests
```

## Streamlit App

Run the local app:

```powershell
streamlit run streamlit_app.py
```

The app supports:

- Excel upload.
- Creator onboarding fields for niche, audience, goals, content style, capacity, and constraints.
- Generic strategy and content prompts that adapt to the creator context.
- A single downloadable `report.html` with dashboard, strategy, weekly plan, and PDF export buttons.

For Streamlit Community Cloud, deploy `streamlit_app.py` from this repository and add `GROQ_API_KEY` as an app secret.

## GitHub Actions (CI)

A manual workflow is available to generate reports without a local setup.

### One-Time Setup

1. Go to your repo **Settings > Secrets and variables > Actions**.
2. Add a secret named `GROQ_API_KEY` with your Groq API key.

### Running the Workflow

1. Go to the **Actions** tab in your GitHub repo.
2. Select **Generate Instagram Report** from the left sidebar.
3. Click **Run workflow** and fill in the options:

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `data_file` | Yes | `data/insta monthly review.xlsx` | Workbook to generate the report from. Add new choices in the workflow file when you add new `.xlsx` files. |
| `model` | No | `llama-3.1-8b-instant` | Groq model to use. |
| `dry_run` | No | `false` | Check to parse and compute KPIs only (skip Groq calls). |

4. Once the run completes, download `report.html` from the **Artifacts** section at the bottom of the run page.

### Adding New Data Files

Drop new `.xlsx` exports into the `data/` directory, commit, and push. Then add the new file path to the `data_file` choices in `.github/workflows/generate_report.yml`.

## Outputs

- `outputs/report.html`

The report has three tabs:

- Dashboard: summary numbers, charts, and daily metrics.
- Strategy: the strategist report in plain language.
- Weekly Plan: the content plan for the next week.

Use the export buttons in the report to save the current tab or the full report as a PDF.

## Project Structure

```text
insta-growth-manager/
|-- .github/workflows/     # GitHub Actions CI workflow
|-- data/                  # Instagram monthly review .xlsx exports
|-- insta_review/
|   |-- context/           # Niche context markdown
|   |-- prompts/           # Strategist and content creator prompts
|   |-- cli.py             # CLI argument parsing
|   |-- creator_profile.py # Account-specific context builder
|   |-- kpis.py            # KPI calculations
|   |-- llm.py             # Groq API client
|   |-- models.py          # Data models (DailyMetric, KPIReport)
|   |-- prompt_templates.py # Generic strategy and content prompts
|   |-- report.py          # Static HTML report builder
|   |-- workflow.py        # End-to-end orchestration
|   `-- xlsx_reader.py     # .xlsx parser (stdlib only)
|-- outputs/               # Generated report.html
|-- streamlit_app.py       # Upload-and-generate web app
`-- tests/                 # Unit tests
```

## Notes

The workbook is expected to contain sheets similar to:

- `Views`
- `reach`
- `interaction`
- `visit`
- `follow`

Each sheet should include a `Date` column and a `Primary` value column.

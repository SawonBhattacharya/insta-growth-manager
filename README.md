# Instagram Monthly Review Automation

This codebase automates the analytics-to-content-planning workflow for `@sawon_chitrokotha`.

It reads Instagram monthly review Excel exports, computes the KPI package expected by the strategist prompt, generates a strategist report, then feeds that report into the content creator prompt to produce a weekly content plan.

## What It Automates

- Section 2-7 style workflow: ingest data, normalize daily metrics, calculate KPIs, create the strategy brief, and create the weekly content plan.
- Section 8 stays manual: you still review/publish inside Instagram.
- Sections 9-10 remain planning inputs: prompts and niche context live in `insta_review/prompts/` and `insta_review/context/`.
- Section 11 support: generated files are saved in `outputs/` so you can inspect and iterate.
- Section 12 review support: `--dry-run` lets you verify parsing and KPI math before using the API.

## Setup

Requires Python 3.10+.

No external dependencies — the parser reads `.xlsx` files using the Python standard library.

For AI generation, copy `.env.example` to `.env` and replace the placeholder key, or set:

```powershell
$env:OPENAI_API_KEY="your_api_key"
```

Optionally set a model:

```powershell
$env:OPENAI_MODEL="gpt-4.1-mini"
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

## GitHub Actions (CI)

A manual workflow is available to generate reports without a local setup.

### One-Time Setup

1. Go to your repo **Settings → Secrets and variables → Actions**.
2. Add a secret named `OPENAI_API_KEY` with your OpenAI API key.

### Running the Workflow

1. Go to the **Actions** tab in your GitHub repo.
2. Select **Generate Instagram Report** from the left sidebar.
3. Click **Run workflow** and fill in the options:

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `data_file` | No | *(auto-detect)* | Path to the `.xlsx` file in the repo, e.g. `data/insta monthly review.xlsx`. Leave blank to auto-pick the newest file in `data/`. |
| `model` | No | `gpt-4.1-mini` | OpenAI model to use. |
| `dry_run` | No | `false` | Check to parse and compute KPIs only (skip OpenAI calls). |

4. Once the run completes, download the generated reports from the **Artifacts** section at the bottom of the run page.

### Adding New Data Files

Drop new `.xlsx` exports into the `data/` directory, commit, and push. The workflow will auto-detect the newest file, or you can specify the exact path when triggering.

## Outputs

- `outputs/daily_metrics.json`
- `outputs/kpis.json`
- `outputs/strategy_report.md`
- `outputs/weekly_content_plan.md`

## Project Structure

```
insta-growth-manager/
├── .github/workflows/     # GitHub Actions CI workflow
├── data/                  # Instagram monthly review .xlsx exports
├── insta_review/
│   ├── context/           # Niche context markdown
│   ├── prompts/           # Strategist & content creator prompts
│   ├── cli.py             # CLI argument parsing
│   ├── kpis.py            # KPI calculations
│   ├── llm.py             # OpenAI API client
│   ├── models.py          # Data models (DailyMetric, KPIReport)
│   ├── workflow.py        # End-to-end orchestration
│   └── xlsx_reader.py     # .xlsx parser (stdlib only)
├── outputs/               # Generated reports
└── tests/                 # Unit tests
```

## Notes

The workbook is expected to contain sheets similar to:

- `Views`
- `reach`
- `interaction`
- `visit`
- `follow`

Each sheet should include a `Date` column and a `Primary` value column.

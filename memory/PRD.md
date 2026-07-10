# Pulse — Multi-Platform Social Media Growth Manager

## Original Problem Statement
> User has a working Streamlit-based Instagram Growth Planner (http://instagram-growth-planner.streamlit.app) that turns Instagram exports into a manager-style growth report. They want to generalize it: multi-platform (Instagram + X + LinkedIn + YouTube + TikTok), multi-agent analysis, and an actionable plan that goes beyond a report.

## User Choices
- Platforms: Instagram, Twitter/X, LinkedIn, YouTube, TikTok
- Data ingestion: CSV/XLSX/PDF upload (API integrations planned for v2)
- LLM: Claude Sonnet 4.5 via Emergent Universal LLM Key
- Auth: Emergent-managed Google login
- Output: Interactive dashboard + downloadable (print-to-PDF) report

## Architecture
- **Frontend**: React 19, react-router-dom 7, Tailwind, shadcn/ui, recharts, lucide-react.
- **Backend**: FastAPI, Motor (MongoDB async), emergentintegrations (Claude Sonnet 4.5), pypdf, pandas/openpyxl for CSV/Excel parsing.
- **Auth**: Emergent-managed Google OAuth. Sessions stored in `user_sessions` collection, 7-day httpOnly cookie.

## Multi-agent system
Five sequential agents share context via Mongo state:
1. **Audience Analyst** — decodes behavioral signals from raw metrics.
2. **Content Strategist** — designs pillars, formats and hooks for the niche.
3. **Engagement Coach** — crafts behavior-changing CTAs.
4. **Competitor Insight** — maps positioning against inspiration accounts.
5. **Action Planner** — synthesizes everything into a JSON 30-day plan (north-star metric, weekly themes, content ideas, posting schedule, daily checklist, risks).

Logs stream into Mongo and are polled (1.5s) by the frontend terminal view.

## Implemented (Feb 2026)
- Landing page (Swiss brutalist editorial style, signal-red + Klein-blue accents).
- Google OAuth via Emergent (callback handling, protected routes, cookie session).
- Dashboard: list / create / delete brand projects.
- Project setup: 9-field creator profile (account, niche, audience, goals, content style, capacity, offers, inspiration, constraints).
- Upload page: 5-platform selector, drag-drop CSV/XLSX/PDF, parsed numeric & time-series extraction.
- Multi-agent terminal execution view with per-agent status cards.
- Growth Report: north-star block, multi-platform time-series charts (recharts), agent narratives, 30-day action plan (weekly themes, content ideas, schedule, checklist, risks).
- Print-to-PDF and JSON export.

## Backlog (P0 / P1 / P2)
- **P1**: Direct API integration (Meta Graph, X API, LinkedIn, YouTube Data, TikTok Display) once developer apps are approved.
- **P1**: Streaming agent output (SSE) instead of polling.
- **P2**: Multi-brand comparison / portfolio analytics.
- **P2**: Scheduled re-analysis (weekly cadence + diff vs previous report).
- **P2**: Share-link for client-facing read-only report.
- **P2**: Server-side PDF generation (currently uses browser print).

## Next Tasks
- Validate full E2E via testing agent.
- Once user reviews, polish copy and add empty-state illustrations.

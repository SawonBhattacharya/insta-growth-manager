# Pulse — Product Roadmap

> Living document. Last updated: Feb 2026.

## Vision
Pulse is the **AI growth team** every creator and small business should have but can't afford. We turn raw social data + market intelligence into a senior-grade growth plan — automated, continuous, and actionable.

---

## Where we are today (MVP, shipped)

| Capability | Status |
|---|---|
| Multi-platform ingestion via CSV / XLSX / PDF (IG, X, LinkedIn, YouTube, TikTok) | ✅ |
| 5-agent Claude Sonnet 4.5 pipeline (Analyst → Strategist → Coach → Scout → Planner) | ✅ |
| Brand profile & multi-brand workspace | ✅ |
| Growth report (charts + agent narratives + 30-day plan) | ✅ |
| Print-to-PDF / JSON export | ✅ |
| Shareable read-only client links (with expiry) | ✅ |
| Per-platform export-guide dialogs | ✅ |
| Emergent Google Auth | ✅ |

**Current limitation**: every report is a one-shot analysis based only on the user's own uploaded data. No memory, no comparison, no live signals, no market context.

---

## Phase 1 — Make reports persistent and conversational
*Goal: shift Pulse from "report generator" to "always-on growth advisor".*

### 1.1 Report comparison & longitudinal tracking
- Every saved report becomes a **time-stamped snapshot** in the user's workspace.
- New **Compare** view: pick any two reports → side-by-side diff on north-star metric, audience movement, content mix, what changed in the plan.
- **Auto-trend detection**: if a metric moves >X% across reports, flag it on the dashboard with a one-line interpretation ("Reach dropped 22% MoM — likely linked to Reels frequency cut").
- **Cohort view**: progress chart of north-star metric across all past reports (one dot per report).

### 1.2 Knowledge base + chat ("Ask the Bureau")
- Every uploaded file, parsed table, and agent output is chunked and embedded into a per-brand vector store (e.g., Mongo Atlas Vector Search or pgvector).
- A **chat panel** on every brand page where users can ask:
  - "When did my saves start dropping?"
  - "Which Reels format gave me the best follower lift last quarter?"
  - "What did the Content Strategist recommend last month vs this month?"
- Powered by RAG over the user's own reports + metrics. Same Claude Sonnet 4.5 backend, new `/api/brands/{id}/ask` endpoint with citations to the source reports.
- "Smart prompts" — pre-baked questions per agent type (e.g., "Audit my hooks", "Show me posts that punched above their weight").

### 1.3 Annotations & feedback loop
- Users can mark a recommendation as **Tried / Worked / Didn't work**. That signal feeds the next report — the Strategist learns what the creator will actually execute.
- Optional **goal tracker**: define a numeric target (e.g., 5k followers in 90 days), Pulse tracks weekly progress against it.

**Engineering scope**: ~3–4 weeks. New collections: `report_snapshots`, `brand_chat_sessions`, `recommendation_feedback`. New endpoints: `/compare`, `/ask`, `/feedback`. Embedding model via Emergent LLM key (OpenAI text-embedding-3-small).

---

## Phase 2 — Stop relying only on user data. Read the market.
*Goal: move from "report on your numbers" to "report on your numbers vs your niche".*

### 2.1 Direct API integrations (no more CSV exports)
Replace manual uploads with OAuth'd live pulls. Order of priority based on creator demand:

| Platform | API | Notes |
|---|---|---|
| Instagram & Facebook | Meta Graph API + Instagram Insights | Requires Meta App Review (~2–6 weeks) |
| YouTube | YouTube Data API v3 + Analytics API | Easiest approval, daily refresh |
| LinkedIn | LinkedIn Marketing & Community Management API | Needs partner approval |
| X / Twitter | X API v2 (paid Basic tier minimum) | Cost-heavy — gate behind paid plan |
| TikTok | TikTok Display API + TikTok for Business | Approval is the bottleneck |

- Auto-refresh nightly. Reports become **dynamic**, not one-shot.
- "Connect a platform" replaces the upload screen for users who don't want manual exports (uploads stay as fallback for newer/edge platforms).

### 2.2 Market research agents
Add new agent types that fetch external signals, not just user data:

- **Trend Scout Agent** — pulls trending audio/hashtags/topics from each platform's public APIs (TikTok Trends, YouTube Trending, etc.) and Google Trends. Flags 5 emerging trends per niche per week.
- **Niche Benchmarker Agent** — uses public APIs + a curated competitor list to compute median engagement rates, posting cadence, and follower velocity for the niche. The user sees how they rank ("Your engagement is in the 73rd percentile for fitness creators with 5–10k followers").
- **Audience Behavior Agent** — pulls signals from comments, replies, and (with user opt-in) DMs to identify recurring questions, objections, content requests.

All built on the same `LlmChat` + tool-use pattern, with web-search and structured API call tools.

### 2.3 Competitor watchlist
- Users add up to N competitor accounts per brand.
- Pulse polls their public posts and computes deltas: posting frequency, format mix, engagement velocity.
- Weekly digest: "3 things your competitors did this week that worked."

**Engineering scope**: ~6–8 weeks. Heaviest lift = Meta + TikTok app review (parallel to dev). Vendor evaluation needed for cost-effective trends data (Exploding Topics API, RapidAPI niche APIs, etc.).

---

## Phase 3 — From "advice" to "execution"
*Goal: don't just plan the post — help ship it.*

### 3.1 Content drafting
- Inside the action plan, every content idea has a **"Draft this"** button → produces caption + hook variants + hashtag set + (optional) image prompt for Nano Banana / GPT Image.
- One-click export to a scheduled-content tool (Buffer / Later / Metricool) via their APIs.

### 3.2 Scheduled re-analysis
- Weekly cron: re-run the multi-agent system on the latest data + previous report context. Email a 5-bullet "what changed this week" digest.

### 3.3 Multi-brand portfolio view
- For agencies and creator-economy operators managing 5+ brands.
- Cross-brand benchmarking, shared learnings ("Brand A's best-performing hook style helped Brand B too").

---

## Phase 4 — Stretch / moonshots

- **Voice-first assistant** ("Hey Pulse, what should I post tomorrow?") via OpenAI realtime or ElevenLabs.
- **Sponsor matching** — based on niche + audience profile, surface relevant sponsorship leads from a curated database (revenue share with brands).
- **Educational layer** — short, contextual courses ("How to fix flat reach in 7 days") triggered by patterns in the user's data.
- **API for tooling partners** — let Buffer, Notion, Linktree embed a Pulse-powered "Growth Score" widget.

---

## Cross-cutting technical bets

| Bet | Why it matters |
|---|---|
| Streaming (SSE) for all agent runs | Lower perceived latency, better UX during long Claude calls |
| Per-brand vector store + RAG | Powers chat, comparison, and personalization |
| Background job queue (e.g., Celery or RQ) | Required for nightly refreshes & scheduled re-analyses |
| Object storage for raw exports | We're keeping originals — important for re-processing |
| Observability (Logfire or OpenTelemetry) | Per-agent latency / error rates / token spend |

---

## Internal milestones (suggested)

| Milestone | Target |
|---|---|
| Report comparison + chat ("Ask the Bureau") live in beta | T + 4 weeks |
| Meta Graph + YouTube Data API live for paid tier | T + 10 weeks |
| Trend Scout + Niche Benchmarker agents shipped | T + 14 weeks |
| Scheduled weekly re-analysis | T + 16 weeks |
| Content drafting + scheduling export | T + 20 weeks |

(Assumes a team of 1 PM + 2 full-stack + 1 designer.)

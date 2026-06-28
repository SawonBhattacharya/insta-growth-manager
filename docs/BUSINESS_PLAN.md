# Pulse — Business Plan & Funding Pitch

> A pitch-ready document. All financial numbers are working assumptions and should be refined with real data before investor conversations.

---

## 1. The opportunity in one paragraph

There are **200M+ creators** worldwide and **400M+ small businesses with at least one social channel**. Every one of them sees a dashboard full of numbers they don't know how to act on. Existing tools (Buffer, Later, Metricool, Hootsuite) help them **publish**; analytics tools (Sprout, Iconosquare) help them **measure**. Nobody is helping them **decide**. Pulse is the AI growth manager that decides — and ships a plan — every week.

---

## 2. Problem

- Platform dashboards report data; they don't explain it. Creators spend 3–6 hours per month interpreting their own numbers (validated by users of `instagram-growth-planner.streamlit.app`).
- Boutique social media managers charge $1,500–$5,000 per month and most creators can't afford that.
- Generic AI chat tools (ChatGPT, Claude.ai) give surface-level advice without the creator's data.
- DIY analytics requires juggling 4–6 exports across platforms.

**Pulse compresses what a $3k/month social media manager does into a $29–$99/month product.**

---

## 3. Solution

Pulse is a multi-agent AI growth manager that:
1. Ingests data from every social platform the creator uses.
2. Runs a 5-agent specialist team (Analyst → Strategist → Coach → Scout → Planner) on every refresh.
3. Adds market intelligence (trends, competitors, niche benchmarks) the user couldn't produce alone.
4. Outputs a real plan — north-star metric, weekly themes, content ideas, daily checklist, risks — with the ability to ask follow-up questions and compare reports over time.
5. Becomes a **persistent growth co-pilot**, not a one-shot tool.

---

## 4. Why now

- LLM costs are down 80–90% since 2023. A multi-agent analysis that cost $5/run last year now costs $0.30.
- Platform APIs are stable and well-documented; Meta and YouTube specifically have improved analytics endpoints.
- Creator economy professionalized: there are 50M+ "professional" creators globally treating content as their primary income. They will pay for tools that help them grow.
- LLM long-context (200k+ tokens) makes it economically viable to feed every past report + every chunk of data into a single reasoning pass.

---

## 5. Target users (in priority order)

| Segment | Who | Pain | Willingness to pay |
|---|---|---|---|
| **Solopreneur creators (5k–100k followers)** | Food, fitness, finance, parenting, etc. niches monetizing via brand deals, courses, affiliate, products | Low time, no analytics skill, growth has plateaued | $29–$49 / mo |
| **Small businesses with 1 social manager** | Local cafes, gyms, D2C brands, real-estate, clinics | One stretched marketer running 3+ accounts | $79–$149 / mo |
| **Creator-economy agencies** | Agencies managing 5–50 creator clients | Reporting is 60% of their cost; they need leverage | $299–$999 / mo (multi-seat) |
| **Brand social teams (mid-market)** | 20–500 employee companies | Need cross-channel narrative, executive-ready reports | $799–$2,499 / mo |

We start with segments 1 and 2 (PLG/self-serve) and add 3 and 4 once retention + word-of-mouth are proven.

---

## 6. Business model

Tiered SaaS with usage-aware limits.

| Tier | Price (USD / mo, billed annually) | Limits |
|---|---|---|
| **Free** | $0 | 1 brand, 1 manual report per month, no API connections, no chat history |
| **Creator** | $29 | 1 brand, 4 reports/mo, all platform API connections, Ask the Bureau (20 questions/mo), 90-day history |
| **Pro** | $79 | 3 brands, weekly auto-refresh, unlimited chat, full history, competitor watchlist (5 accounts), scheduled re-analysis |
| **Agency** | $299 | 15 brands, white-label share links, client logins (read-only), priority support |
| **Enterprise / Brand** | Custom from $799 | Unlimited brands, SSO, custom integrations, dedicated success manager |

### Secondary revenue
- **AI credit add-ons** — when users blow through their monthly LLM budget (heavy chat, deeper agent runs), they buy extra credits.
- **Sponsor matching marketplace** — once Pulse knows the niche + audience of N thousand creators, brands pay to surface relevant sponsorships. Take rate 10–15%.
- **Education / courses** — bundled "fix flat reach" or "monetize 5k followers" mini-courses gated to Pro tier.
- **API & embed** — partners (Buffer, Linktree, Notion) embed a Pulse "Growth Score" widget. Per-call pricing.

---

## 7. Unit economics (illustrative, must be validated)

**Per Creator-tier user ($29/mo):**
- LLM cost per report (5 agents × ~5k tokens each, Claude Sonnet 4.5): ~$0.35
- 4 reports/mo + 20 chat questions: ~$2.50 LLM/mo
- Infra (Mongo Atlas, hosting, embeddings, jobs): ~$0.80/mo
- Payment fees (Stripe, ~3%): $0.87
- **Gross margin per Creator-tier user: ~$24.80 (~85%)**

**Per Pro-tier user ($79/mo):**
- Heavier usage + weekly auto-refresh + competitor pulls: ~$8 LLM + $1.50 infra
- **Gross margin: ~$66 (~84%)**

**CAC target (year 1)**: blended <$40 via organic + referral. Expected **payback < 2 months on Creator, ~1 month on Pro**.

---

## 8. Go-to-market

### Phase A — Founder-led launch (months 0–6)
- Free tool magnet: keep a single-report mode behind a Google login. The existing Streamlit Instagram Growth Planner becomes the funnel.
- Build in public on X / LinkedIn / Threads — every shareable client report carries a "Powered by Pulse" CTA (already shipped) → organic acquisition loop.
- Targeted partnerships with creator newsletters (Creator Spotlight, ARN, etc.) for sponsored issues.

### Phase B — PLG flywheel (months 6–18)
- Sharable reports themselves are the marketing — every Pulse user who shares a report with a client/collaborator becomes a top-of-funnel event.
- Referral program (1 free month for both sides on first paid conversion).
- SEO play: programmatic "How to read your Instagram insights / YouTube analytics / etc." landing pages, each with a single-click "let Pulse explain mine" CTA.

### Phase C — Sales-assisted (months 18+)
- Add Agency + Enterprise outbound for the high-ARPU tiers.
- Conference presence (VidSummit, Social Media Marketing World, Creator Economy Expo).

### Distribution moats
- **Network effect via shareable reports** — already shipped. Every report shared with a client = a free demo for Pulse.
- **Data flywheel** — the more brands run reports through Pulse, the better the Niche Benchmarker becomes (no PII, just aggregated medians per niche / follower band).

---

## 9. Competitive landscape

| Category | Players | How Pulse differentiates |
|---|---|---|
| Analytics & reporting | Iconosquare, Sprout Social, Hootsuite Insights, Metricool | They show data; we **explain and prescribe**. Multi-agent reasoning, not dashboards. |
| Scheduling + light AI | Buffer AI, Later, Hypefury | They publish; we **strategize**. Complement, not replace — integration target. |
| Generic AI assistants | ChatGPT, Claude.ai, Perplexity | They don't see your data; we ingest it and remember it across reports. |
| Boutique social media managers | Freelancers, micro-agencies | 30–100x cheaper than a human SMM, available 24/7, never sleeps, never raises rates. |
| Streamlit-style scripts | One-off niche tools (incl. the founder's original) | Pulse is multi-platform, persistent, conversational, and runs continuously. |

---

## 10. Defensibility

1. **Proprietary multi-agent orchestration** — the specific prompt engineering, agent handoff schema, and JSON plan structure get sharper with every run.
2. **Per-brand vector memory** — switching costs grow over time; the longer a user uses Pulse, the better the chat and comparison get.
3. **Niche benchmark dataset** — aggregated, anonymized medians per niche × follower-band × platform. Hard to replicate without our user base.
4. **Embedded share loop** — every shared report is a marketing asset we own.

---

## 11. Team & talent gaps (for funding context)

To execute the roadmap above, the hire plan should be roughly:

- **Founding engineer (full-stack + AI)** — owns the agent architecture and platform integrations.
- **Growth marketer / community lead** — runs the build-in-public engine and partnerships.
- **Senior designer (part-time → full-time)** — already excellent design system; needs maintenance as features grow.
- **Customer success / agency lead (post-Series A)** — owns Agency + Enterprise.

---

## 12. Financial plan (working assumptions)

### 24-month projection (conservative)

| Quarter | Paid users (end) | MRR | ARR | Burn / mo |
|---|---|---|---|---|
| Q1 (launch) | 100 | $4k | $48k | $8k |
| Q2 | 400 | $16k | $192k | $15k |
| Q3 | 1,200 | $50k | $600k | $25k |
| Q4 | 3,000 | $130k | $1.56M | $40k |
| Q5 | 6,000 | $270k | $3.24M | $60k |
| Q6 | 11,000 | $510k | $6.12M | $90k |
| Q7 | 18,000 | $850k | $10.2M | $130k |
| Q8 | 28,000 | $1.35M | $16.2M | $180k |

Numbers assume ~80% gross margin, ~5% monthly churn early dropping to ~2% by Q6, and Agency/Enterprise mix grows from 0% to ~25% of MRR.

### Funding ask

**Pre-seed / Seed: $750k–$1.5M (SAFE or priced round)**

Use of funds (over 18 months):
- **45% engineering + product** (2 senior engineers + 1 designer for the roadmap)
- **20% LLM + infra** (Claude / OpenAI tokens, Mongo Atlas, observability, jobs)
- **20% marketing** (newsletter sponsorships, content, paid trial of programmatic SEO)
- **10% platform compliance** (Meta App Review, LinkedIn partner approval, TikTok approval — legal + security audits)
- **5% buffer / contingency**

This gets us to a defensible **Series A milestone**: ~$1.5M ARR, 6k+ paying users, three platform integrations live, weekly active engagement > 60%.

---

## 13. Key risks & mitigations

| Risk | Mitigation |
|---|---|
| Platform API approval delays (especially Meta, TikTok) | CSV/PDF upload remains a permanent fallback; we ship value without APIs |
| LLM price spikes | Multi-provider abstraction via Emergent LLM key; can swap to GPT-5 / Gemini 3 at any time |
| Big platform (Meta, YouTube) launches a competing "AI insights" feature | We're cross-platform — they're not. And we own the planning / accountability layer, which platforms don't naturally own. |
| AI commoditization | Defensibility shifts to data (niche benchmarks), workflow (multi-agent + memory), and distribution (share loop). |
| Churn from creators who plateau | Engagement features (chat, weekly digest, scheduled re-analysis) keep value compounding |

---

## 14. The narrative arc (use for the pitch deck)

> Every creator and small business owner gets a dashboard full of numbers and no idea what to do with them. We spent 3 hours a week explaining those numbers to friends — so we built the team of five AI specialists that would explain them automatically. In four months we've turned a Streamlit experiment into a multi-platform AI growth manager that's already producing shareable reports, generating its own acquisition loop. With $1M we ship the live data integrations, the market-intelligence agents, and the persistent memory layer that turn Pulse from a tool into the AI growth team every creator wishes they could afford.

---

## 15. Open questions for investor conversations

These are good to surface honestly — they signal rigour, not weakness:

1. What's the right wedge segment to dominate first? Food creators? Fitness? B2B LinkedIn creators?
2. Buy vs. build for trends data — partner with Exploding Topics / Trendpop, or build our own scraper?
3. How aggressive on agency tier vs. doubling down on PLG self-serve?
4. White-label vs. branded — is "Pulse" the brand, or does the agency tier rebrand as "Powered by Pulse"?
5. Should we offer a one-off "report for hire" mode for non-subscribers, priced like a consultant?

---

## 16. What we want from a lead investor

- Conviction in the creator economy beyond the hype cycle.
- Operator experience scaling PLG B2B SaaS.
- Networks into Meta / YouTube partner programs (helps fast-track API approvals).
- Comfort with AI-native cost structures and the multi-agent / RAG architecture.

---

*Prepared by the founder. February 2026.*

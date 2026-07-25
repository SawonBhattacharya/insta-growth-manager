# Pulse — Codebase Analysis (Post-Merge)

## What the Project Has Become

The project has evolved significantly from the original single-file Streamlit script (`insta-growth-planner`). It is now a **full-stack, multi-platform social media growth manager** named **Pulse**. 

Instead of just Instagram, it now supports Instagram, X (Twitter), LinkedIn, YouTube, and TikTok. It uses a sophisticated **multi-agent LLM pipeline** to analyze audience data, generate content strategies, and provide actionable 30-day plans.

---

## Architecture Snapshot

The codebase is now split into a modern decoupled architecture:

- **Frontend (`frontend/`)**: React 19, React Router v7, Tailwind CSS, shadcn/ui, Recharts.
- **Backend (`backend/`)**: FastAPI, MongoDB (Motor async driver), `pandas`/`pypdf` for parsing file uploads.
- **AI/LLM**: Claude Sonnet 4.5 (via Emergent Universal LLM Key), utilizing a 5-agent pipeline (Audience Analyst, Content Strategist, Engagement Coach, Competitor Insight, Action Planner).
- **Authentication**: Emergent-managed Google OAuth (using secure httpOnly cookies).
- **Database**: MongoDB (collections for `users`, `user_sessions`, `projects`, `uploads`, `reports`, `feedback`, `market_intel`).

---

## What Is Fully Done ✅

1. **Auth & Workspaces**: Google OAuth integration, multi-brand workspaces, and comprehensive 9-field creator profile setup.
2. **Data Ingestion**: Multi-platform upload support for CSV, XLSX, and PDF files. Extracts numeric summaries and time-series data.
3. **Multi-Agent Pipeline**: 
   - **Audience Analyst**: Decodes behavioral signals.
   - **Content Strategist**: Designs pillars, formats, and hooks.
   - **Engagement Coach**: Crafts behavior-changing CTAs.
   - **Competitor Insight**: Maps positioning.
   - **Action Planner**: Synthesizes the final JSON 30-day plan.
4. **Interactive Dashboard**: Real-time terminal execution view for agents, Recharts time-series graphs, North-Star metric block, and downloadable JSON/Print-to-PDF reports.
5. **Advanced Features**: 
   - **Comparison View**: Trend charts and side-by-side diffs of multiple reports over time.
   - **"Ask the Bureau" Chat**: A RAG-lite persistent chat interface per brand, using past reports as context.
   - **Feedback Loop**: "Tried/Worked/Didn't work" buttons on content ideas that feed back into the AI's context for the next analysis run.
   - **Market Intel**: Agents for Trend Scouting, Niche Benchmarking, and Audience Behavior (currently using LLM-enriched placeholders).
6. **Sharing & Growth**: Read-only public share links (`/share/{token}`) that double as an acquisition channel.

---

## What Are the Gaps (To Complete MVP) ❌

According to your `BUILD_LOG_AND_NEXT_STEPS.md`, the core engine is 100% verified, but the following **P0 (Must Ship)** items remain before a public launch:

1. **Competitor Watchlist (Phase 2.3)**: Manual handle entry + an LLM-generated weekly digest of "what your competitors did this week."
2. **Pitch Pack Export**: A single branded PDF bundling the latest report, market intel, and trend charts (with a Pulse footer for built-in acquisition).
3. **Onboarding Polish**: Empty-state copy, a first-time tour on the Dashboard, and a sample-data demo brand for new signups.
4. **Pricing & Paywall Scaffolding**: Stripe Checkout integration to gate the `Run analysis` and chat features per tier (Free / Creator / Pro). Test keys are already in the pod env.
5. **Email Transactionals**: Welcome emails and "report ready" notifications (via Resend or SendGrid).

---

## How to Complete it as an MVP

To cross the finish line for the MVP launch, follow this sequence:

1. **Implement Stripe (Paywall)**: Add a simple frontend pricing modal and backend middleware to check user subscription status before allowing them to trigger `/api/projects/{id}/analyze`.
2. **Add Transactional Emails**: Integrate the `resend` Python SDK in the backend. Fire off an email when a user signs up and when the multi-agent `analyze()` function completes.
3. **Build the Pitch Pack PDF**: Enhance the existing Print-to-PDF functionality on the frontend to include Market Intel and Comparison charts in a single cleanly formatted view.
4. **Competitor Watchlist UI**: Add a new tab in the Project view for users to add competitor handles, and pipe this data into the `Competitor Insight` agent's prompt during analysis.
5. **Onboarding Data**: Create a seed script that injects a dummy "Demo Project" into a new user's account upon their first login so they aren't staring at an empty dashboard.

---

## Free Resources for Deployment

You can deploy this entire stack for **$0/month** while validating the product:

### 1. Frontend (React) -> Vercel or Netlify
- **Vercel** is highly recommended for React. It’s completely free for hobby/indie projects.
- Connect your GitHub repo, set the build command (`npm run build`), and set the `REACT_APP_BACKEND_URL` environment variable to your deployed backend URL.

### 2. Backend (FastAPI) -> Render or Railway
- **Render** offers a free Web Service tier. It spins down after 15 mins of inactivity (first load takes ~30s), which is perfectly fine for an MVP.
- Connect your GitHub repo, set the start command to `uvicorn backend.server:app --host 0.0.0.0 --port $PORT`, and add your environment variables (`EMERGENT_LLM_KEY`, `MONGO_URL`, `DB_NAME`).

### 3. Database (MongoDB) -> MongoDB Atlas
- **MongoDB Atlas** offers a free **M0 cluster** (up to 512MB storage), which is more than enough for user profiles, JSON agent outputs, and chat histories.

### 4. Emails -> Resend
- **Resend** has a generous free tier of 3,000 emails per month (100/day). Perfect for welcome emails and analysis notifications.

### 5. Payments -> Stripe
- **Stripe** has no fixed monthly fees; they only take a standard percentage (usually 2.9% + 30¢) on successful transactions.

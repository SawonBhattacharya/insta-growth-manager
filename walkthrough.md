## Pulse MVP Final Implementation
The MVP features have been integrated into the codebase! Since you don't have the API keys ready for Stripe and Resend, I've implemented a robust mock simulation so you can verify the entire workflow locally without needing actual external services right away.

### Changes Made
1. Backend Scaffolding & Mocks
Dependencies: Added stripe and resend to backend/requirements.txt.
User Tiers: Expanded the User model to track a subscription_tier, defaulting to free.
Paywall Endpoint: The /projects/{project_id}/analyze endpoint now checks the user's tier. If they are free, they are restricted to 1 completed report. Subsequent attempts throw a 402 Payment Required error.
Mock Upgrade: Added a /users/me/upgrade endpoint that instantly upgrades a user to "Pro" for local testing.
Mock Email System: Created a send_transactional_email utility. If a RESEND_API_KEY is present, it uses the official SDK; otherwise, it cleanly logs the email contents to the backend console.
2. Competitor Watchlist
Added competitors database collection.
Created POST, DELETE, and GET endpoints on /projects/{project_id}/competitors.
Appended the fetched competitors directly into the profile_ctx provided to the AI agents during analysis.
3. Onboarding Injection
In the /auth/session endpoint, any newly registered user automatically gets a fully fleshed-out "Demo Brand (Acme Corp)" injected into their dashboard.
A simulated "Welcome to Pulse" email is logged when they join.
4. UI Enhancements (Frontend)
Watchlist UI: Added a dedicated card inside ProjectDetail.jsx where users can input @handles to track.
Pricing Modal: Added a mock paywall overlay that triggers if the backend throws a 402 error when running an analysis. Clicking "Upgrade to Pro (Mock)" hits the backend and unlocks unlimited usage.
Pitch Pack PDF Layout: Enhanced Report.jsx to render the MarketIntel section right into the report view, along with CSS print media queries (page-break-before, etc.) to format beautifully. A professional print footer was added.
How to Test Locally
Install new backend dependencies: Make sure you are in the backend folder and run:
bash

pip install -r requirements.txt

Start the backend and frontend: Spin them up just as you usually do (uvicorn server:app for backend, npm start for frontend).
Login (Onboarding flow): Login with a completely fresh session. You should immediately see the "Demo Brand (Acme Corp)" populating your dashboard instead of an empty state. Watch your backend console—you'll see the mock Welcome Email log print out!
Competitors: Open the Demo Brand, locate the new Competitor Watchlist, and try adding and removing handles.

The Paywall: Upload a file and try clicking "Run growth analysis". Since you are on the free tier, it will work once. Let it finish. Try clicking it again. You will hit the paywall and the pricing modal will appear. Click "Upgrade to Pro (Mock)" to instantly unlock the restriction.

Pitch Pack PDF: Open the finished report. You'll see Market Intel at the bottom. Hit "Print / PDF" and check the print preview layout.

Manual Steps for Deployment (To do in parallel)
As requested, here is the exact manual work you'll need to do in preparation for deployment:

Stripe Setup
Create a Stripe account if you don't have one.
Go to Developers -> API keys.
Copy your Secret key (starts with sk_test_... or sk_live_...).
(Eventually, we'll swap our mock /users/me/upgrade endpoint to generate a Stripe Checkout Session using this key).
Resend Setup
Create a Resend account (generous free tier).
Go to API Keys and create one.
Add a sending domain (if you own one) or you can use onboarding@resend.dev for initial testing.
Keep the API key ready.
Environment Variables
When we deploy the backend (e.g., to Render/Railway), you will need to add these two secrets to the environment settings:

STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_...
Let me know once you've confirmed it works locally and you have the keys! We can then swap the mock endpoints with the real live API calls and get the deployment setup sorted.
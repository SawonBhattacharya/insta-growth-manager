import React from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, ExternalLink } from "lucide-react";

const GUIDES = {
  instagram: {
    name: "Instagram",
    color: "#E1306C",
    source: "Meta Business Suite",
    url: "https://business.facebook.com/",
    steps: [
      "Go to business.facebook.com and log in with the account that manages this Instagram profile.",
      "Open Insights (or Analytics) from the left sidebar and select the Instagram account.",
      "Pick a date range — the last 28 or 30 days works well for a monthly review.",
      "Export each metric separately: Views, Reach, Content Interactions, Profile Visits, Follows.",
      "Combine the exports into one .xlsx workbook with sheets named: Views, Reach, Interaction, Visit, Follow.",
      "Each sheet should have a Date column and a daily value column. Upload the workbook here.",
    ],
    tip: "If your export uses slightly different names, just keep the meaning the same.",
  },
  twitter: {
    name: "X / Twitter",
    color: "#0A0A0A",
    source: "X Analytics",
    url: "https://analytics.twitter.com/",
    steps: [
      "Sign in to your X account, click your profile picture and go to More → Creator Studio → Analytics. Or visit analytics.twitter.com directly.",
      "On the Tweets tab pick the date range (Last 28 days is the default for monthly review).",
      "Click 'Export data' and choose 'By Tweet' — this downloads a CSV with per-post impressions, engagements, likes, retweets, replies.",
      "Optionally also export 'By Day' for a daily impressions/profile-visits time series.",
      "Upload one or both CSVs below using the X / Twitter platform tab.",
    ],
    tip: "X Premium users get richer exports — non-Premium users can still upload the standard analytics CSV.",
  },
  linkedin: {
    name: "LinkedIn",
    color: "#0033FF",
    source: "LinkedIn Page or Creator Analytics",
    url: "https://www.linkedin.com/",
    steps: [
      "For a Company Page: open the page admin view → Analytics → choose Updates, Followers, or Visitors.",
      "For a personal Creator profile: go to your profile → Analytics & tools → choose Post impressions or Followers.",
      "Set the date range to the last 28 days (or your preferred review window).",
      "Click the 'Export' button — LinkedIn delivers an .xlsx with per-post and time-series tabs.",
      "Repeat for each section (Updates, Followers, Visitors) and upload them here under the LinkedIn tab.",
    ],
    tip: "If you only have one report, the Updates / Posts export is the most analysis-rich — start there.",
  },
  youtube: {
    name: "YouTube",
    color: "#FF3B00",
    source: "YouTube Studio",
    url: "https://studio.youtube.com/",
    steps: [
      "Go to studio.youtube.com and sign in with your channel's Google account.",
      "Open Analytics from the left sidebar.",
      "Pick a date range (Last 28 days is the default). Choose the Overview or Content tab depending on what you want analyzed.",
      "Click the 'Export current view' download icon (top right of the data table) and pick CSV or Google Sheets.",
      "For richer analysis also export Audience and Reach tab data.",
      "Upload the CSV(s) here under the YouTube tab.",
    ],
    tip: "Exporting the Content tab gives per-video performance — that's gold for the Content Strategist agent.",
  },
  tiktok: {
    name: "TikTok",
    color: "#FFC000",
    source: "TikTok Studio / Business Suite",
    url: "https://www.tiktok.com/tiktokstudio",
    steps: [
      "Switch to a TikTok Business or Creator account if you haven't already (Settings → Account → Switch to Business).",
      "Go to tiktok.com/tiktokstudio (or TikTok Business Center) and open Analytics.",
      "Pick your date range — typically Last 28 days.",
      "Click the 'Download data' button on the Overview, Content, and Followers tabs. TikTok provides CSV exports.",
      "Upload the CSVs here under the TikTok tab.",
    ],
    tip: "If you don't see Download Data, you might still be on the mobile app — the export is desktop-only.",
  },
};

export default function ExportGuide({ platform = "instagram", trigger }) {
  const g = GUIDES[platform] || GUIDES.instagram;
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="overline text-[#0033FF] hover:text-[#FF3B00] inline-flex items-center gap-1" data-testid={`export-guide-trigger-${platform}`}>
            <BookOpen size={12} /> How to export {g.name} data
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl rounded-none border-2 border-[#0A0A0A] bg-white p-0">
        <div className="p-6 sm:p-8" data-testid={`export-guide-${platform}`}>
          <div className="overline" style={{ color: g.color }}>// export guide</div>
          <h2 className="font-display font-black text-3xl tracking-tighter mt-2">How to export from {g.name}</h2>
          <div className="overline text-[#8A8A8A] mt-2">Source: {g.source}</div>

          <ol className="mt-6 space-y-3">
            {g.steps.map((s, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed">
                <span className="font-mono font-bold text-[#FF3B00] w-6 flex-shrink-0">{String(i+1).padStart(2,"0")}.</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>

          <div className="mt-6 border-l-4 border-[#FFC000] bg-[#FFF6E0] p-4 text-sm">
            <strong>Tip:</strong> {g.tip}
          </div>

          <a
            href={g.url}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 btn-secondary !py-2 !px-4 text-xs"
            data-testid={`export-guide-open-${platform}`}
          >
            Open {g.source} <ExternalLink size={12} />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

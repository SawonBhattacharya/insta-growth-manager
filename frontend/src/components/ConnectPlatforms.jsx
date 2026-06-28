import React from "react";
import { Lock, Instagram, Twitter, Linkedin, Youtube, Music2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram, eta: "Pending Meta App Review" },
  { key: "youtube",   label: "YouTube",   icon: Youtube,   eta: "Beta — request access" },
  { key: "linkedin",  label: "LinkedIn",  icon: Linkedin,  eta: "Partner approval in progress" },
  { key: "twitter",   label: "X / Twitter", icon: Twitter, eta: "Live on Pro plan (soon)" },
  { key: "tiktok",    label: "TikTok",    icon: Music2,    eta: "Approval in progress" },
];

export default function ConnectPlatforms() {
  const notify = (label) => toast(`${label} live-connect is coming soon — for now, upload exports above.`);
  return (
    <div className="brutal-card p-6" data-testid="connect-platforms">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="overline text-[#0033FF]">// live API connections · coming soon</div>
          <h3 className="font-display font-black text-xl mt-1">Connect your platforms directly</h3>
          <p className="text-sm text-[#4A4A4A] mt-1">Skip the manual exports. We're rolling out OAuth-based auto-refresh per platform.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {PLATFORMS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => notify(p.label)}
              className="border-2 border-dashed border-[#0A0A0A]/40 p-4 flex flex-col items-center gap-2 hover:border-[#0A0A0A] hover:bg-white transition-all"
              data-testid={`connect-${p.key}`}
            >
              <Icon size={22} strokeWidth={2} />
              <div className="overline text-[10px]">{p.label}</div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[#8A8A8A]">
                <Lock size={10} /> Soon
              </div>
              <div className="text-[10px] text-center text-[#4A4A4A] leading-tight">{p.eta}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

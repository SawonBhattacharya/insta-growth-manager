import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Check, X, Eye } from "lucide-react";

const OPTIONS = [
  { key: "tried", icon: Eye, label: "Tried", color: "#FFC000" },
  { key: "worked", icon: Check, label: "Worked", color: "#0033FF" },
  { key: "didnt_work", icon: X, label: "Didn't work", color: "#FF3B00" },
];

export default function FeedbackButtons({ reportId, itemKey, current, onChange, disabled }) {
  const [state, setState] = useState(current || null);
  useEffect(() => { setState(current || null); }, [current]);

  const set = async (val) => {
    if (disabled) return;
    const next = state === val ? null : val;
    setState(next);
    try {
      await axios.post(`${API}/reports/${reportId}/feedback`, { item_key: itemKey, status: next });
    } catch {
      setState(state);
    }
    onChange?.(next);
  };

  if (disabled) return null;

  return (
    <div className="flex gap-1 mt-2 print:hidden" data-testid={`feedback-${itemKey}`}>
      {OPTIONS.map((o) => {
        const Icon = o.icon;
        const active = state === o.key;
        return (
          <button
            key={o.key}
            onClick={() => set(o.key)}
            title={o.label}
            className={`border-2 border-[#0A0A0A] px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1 ${
              active ? "text-white" : "bg-white text-[#0A0A0A] hover:translate-y-[-1px]"
            }`}
            style={active ? { backgroundColor: o.color } : {}}
            data-testid={`feedback-${itemKey}-${o.key}`}
          >
            <Icon size={10} /> {o.label}
          </button>
        );
      })}
    </div>
  );
}

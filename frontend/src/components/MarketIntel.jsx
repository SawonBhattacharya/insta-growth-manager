import React, { useEffect, useState } from "react";
import axios from "axios";
import { API } from "@/App";
import { Radar, RefreshCw, Sparkles, Users, Target } from "lucide-react";
import { toast } from "sonner";

export default function MarketIntel({ projectId }) {
  const [intel, setIntel] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const r = await axios.get(`${API}/projects/${projectId}/market-intel`);
      setIntel(r.data && Object.keys(r.data).length ? r.data : null);
    } catch {}
  };

  useEffect(() => { load(); }, [projectId]);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await axios.post(`${API}/projects/${projectId}/market-intel`);
      setIntel(r.data);
      toast.success("Market intel refreshed");
    } catch {
      toast.error("Could not refresh market intel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brutal-card p-6" data-testid="market-intel-panel">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="overline text-[#FF3B00]">// market intel · the bureau scouts</div>
          <h3 className="font-display font-black text-xl mt-1">What's moving in your niche</h3>
          <div className="text-xs font-mono text-[#8A8A8A] mt-1">{intel?._source || "Placeholder + LLM enrichment · live APIs coming soon"}</div>
        </div>
        <button onClick={refresh} disabled={loading} className="btn-secondary !py-2 !px-3 text-xs" data-testid="refresh-market-intel">
          <RefreshCw size={14} className={`inline mr-1 ${loading ? "animate-spin" : ""}`} /> {loading ? "Scouting…" : "Refresh"}
        </button>
      </div>

      {!intel ? (
        <div className="border-2 border-dashed border-[#0A0A0A]/30 p-8 text-center">
          <Radar size={32} strokeWidth={1.5} className="mx-auto mb-3" />
          <div className="font-display font-bold text-lg">No market intel yet</div>
          <p className="text-sm text-[#4A4A4A] mt-2 mb-4">Click Refresh to fetch trending topics, niche benchmarks, and audience behavior signals for your brand.</p>
          <button onClick={refresh} disabled={loading} className="btn-primary text-xs" data-testid="first-refresh-market-intel">
            <Sparkles size={14} className="inline mr-1" /> Fetch market intel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div data-testid="trend-scout">
            <div className="overline text-[#0033FF] mb-2"><Sparkles size={11} className="inline mr-1" /> trend scout</div>
            <ul className="space-y-2 text-sm">
              {(intel.trend_scout?.trending_topics || []).map((t, i) => (
                <li key={i} className="border-l-4 border-[#0033FF] pl-3">
                  <div className="font-semibold">{t.topic}</div>
                  <div className="text-xs text-[#4A4A4A]">{t.why_now}</div>
                  {t.platform && <div className="overline text-[10px] text-[#8A8A8A] mt-1">{t.platform}</div>}
                </li>
              ))}
            </ul>
            {(intel.trend_scout?.trending_audio_or_hashtags || []).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {intel.trend_scout.trending_audio_or_hashtags.map((h, i) => (
                  <span key={i} className="text-[10px] font-mono bg-[#0A0A0A] text-white px-2 py-1">{h}</span>
                ))}
              </div>
            )}
          </div>

          <div data-testid="niche-benchmarker">
            <div className="overline text-[#FF3B00] mb-2"><Target size={11} className="inline mr-1" /> niche benchmarker</div>
            <div className="space-y-1 text-sm">
              {intel.niche_benchmarker?.niche && <div><strong>Niche:</strong> {intel.niche_benchmarker.niche}</div>}
              {intel.niche_benchmarker?.median_engagement_rate && <div><strong>Median ER:</strong> {intel.niche_benchmarker.median_engagement_rate}</div>}
              {intel.niche_benchmarker?.ranking_estimate && (
                <div className="font-display font-black text-2xl text-[#FF3B00] mt-2">{intel.niche_benchmarker.ranking_estimate}</div>
              )}
            </div>
            <div className="mt-3">
              <div className="overline text-[10px] text-[#8A8A8A] mb-1">// top creators do differently</div>
              <ul className="space-y-1 text-xs">
                {(intel.niche_benchmarker?.what_top_creators_do_differently || []).map((s, i) => (
                  <li key={i}>▸ {s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div data-testid="audience-behavior">
            <div className="overline text-[#0A0A0A] mb-2"><Users size={11} className="inline mr-1" /> audience behavior</div>
            <div>
              <div className="overline text-[10px] text-[#8A8A8A] mb-1">// recurring questions</div>
              <ul className="space-y-1 text-xs mb-3">
                {(intel.audience_behavior?.recurring_questions || []).map((q, i) => (
                  <li key={i}>? {q}</li>
                ))}
              </ul>
              <div className="overline text-[10px] text-[#8A8A8A] mb-1">// content requests</div>
              <ul className="space-y-1 text-xs">
                {(intel.audience_behavior?.content_requests || []).map((q, i) => (
                  <li key={i}>▸ {q}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

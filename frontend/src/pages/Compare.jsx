import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { ArrowLeft, GitCompare } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";

function extractNumber(s) {
  if (!s) return null;
  const m = String(s).replace(/,/g, "").match(/-?\d+\.?\d*/);
  return m ? parseFloat(m[0]) : null;
}

function Section({ title, color, a, b, render }) {
  return (
    <div className="brutal-card p-6">
      <div className="overline mb-3" style={{ color }}>// {title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="overline text-[#8A8A8A] mb-2">Report A</div>
          {render(a)}
        </div>
        <div className="md:border-l-2 md:border-[#0A0A0A]/10 md:pl-6">
          <div className="overline text-[#FF3B00] mb-2">Report B</div>
          {render(b)}
        </div>
      </div>
    </div>
  );
}

export default function Compare() {
  const { projectId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const aId = params.get("a");
  const bId = params.get("b");
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [trend, setTrend] = useState([]);
  const [a, setA] = useState(null);
  const [b, setB] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, r, t] = await Promise.all([
          axios.get(`${API}/projects/${projectId}`),
          axios.get(`${API}/projects/${projectId}/reports`),
          axios.get(`${API}/projects/${projectId}/trend`),
        ]);
        setProject(p.data);
        const completed = (r.data || []).filter(x => x.status === "complete");
        setReports(completed);
        setTrend(t.data?.trend || []);
        if (!aId && completed[1]) setParams({ a: completed[1].report_id, b: aId || completed[0]?.report_id || "" });
        else if (!bId && completed[0]) setParams({ a: aId || completed[1]?.report_id || "", b: completed[0].report_id });
      } catch {
        toast.error("Could not load");
      }
    })();
  }, [projectId]);

  useEffect(() => {
    (async () => {
      if (aId) { try { const r = await axios.get(`${API}/reports/${aId}`); setA(r.data); } catch {} }
      if (bId) { try { const r = await axios.get(`${API}/reports/${bId}`); setB(r.data); } catch {} }
    })();
  }, [aId, bId]);

  const trendData = useMemo(() => trend.map((t, i) => ({
    idx: i + 1,
    label: new Date(t.created_at).toLocaleDateString(),
    current: extractNumber(t.north_star_current),
    target: extractNumber(t.north_star_target),
  })).filter(d => d.current != null), [trend]);

  const planA = a?.final_plan;
  const planB = b?.final_plan;

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="compare-page">
      <TopBar active="dash" />
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <Link to={`/projects/${projectId}`} className="overline text-[#8A8A8A] hover:text-[#FF3B00]" data-testid="back-to-project">
          <ArrowLeft size={12} className="inline mr-1" /> back to brand
        </Link>
        <div className="mt-4 mb-8">
          <div className="overline">§ Compare</div>
          <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">
            {project?.account_name || "Brand"} · history & diff
          </h1>
        </div>

        {/* Pickers */}
        <div className="brutal-card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="overline mb-2 block">Report A (earlier)</label>
              <select
                value={aId || ""}
                onChange={(e) => setParams({ a: e.target.value, b: bId || "" })}
                className="w-full border-2 border-[#0A0A0A] bg-white p-3 font-mono text-xs"
                data-testid="picker-a"
              >
                <option value="">— pick a report —</option>
                {reports.map(r => (
                  <option key={r.report_id} value={r.report_id}>
                    {new Date(r.created_at).toLocaleDateString()} · {r.report_id.slice(-6)} · {(r.platforms || []).join(",")}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="overline mb-2 block">Report B (later)</label>
              <select
                value={bId || ""}
                onChange={(e) => setParams({ a: aId || "", b: e.target.value })}
                className="w-full border-2 border-[#0A0A0A] bg-white p-3 font-mono text-xs"
                data-testid="picker-b"
              >
                <option value="">— pick a report —</option>
                {reports.map(r => (
                  <option key={r.report_id} value={r.report_id}>
                    {new Date(r.created_at).toLocaleDateString()} · {r.report_id.slice(-6)} · {(r.platforms || []).join(",")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trend chart */}
        {trendData.length >= 1 && (
          <div className="brutal-card p-6 mb-8" data-testid="trend-chart">
            <div className="overline text-[#0033FF] mb-3">// north-star metric across all reports</div>
            <div className="font-display font-bold text-lg mb-4">
              {trend[trend.length - 1]?.north_star_metric || "North-star metric"}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <XAxis dataKey="label" stroke="#0A0A0A" tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                <YAxis stroke="#0A0A0A" tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                <Tooltip contentStyle={{ border: "2px solid #0A0A0A", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Line type="monotone" dataKey="current" stroke="#0A0A0A" strokeWidth={3} dot={{ r: 4 }} name="Current" />
                <Line type="monotone" dataKey="target" stroke="#FF3B00" strokeWidth={3} dot={{ r: 4 }} strokeDasharray="6 4" name="Target" />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-xs text-[#8A8A8A] font-mono mt-2">
              {trendData.length} completed report{trendData.length === 1 ? "" : "s"}.
              {trendData.length === 1 && " Run another analysis later to see growth over time."}
            </div>
          </div>
        )}

        {/* Side-by-side */}
        {a && b ? (
          <div className="space-y-6" data-testid="diff-section">
            <Section
              title="north-star metric"
              color="#0033FF"
              a={planA?.north_star}
              b={planB?.north_star}
              render={(ns) => ns ? (
                <div>
                  <div className="font-display font-black text-2xl">{ns.current}</div>
                  <div className="text-xs text-[#8A8A8A] mt-1">{ns.metric}</div>
                  <div className="overline text-[#FF3B00] mt-3">target</div>
                  <div className="font-display font-bold text-lg">{ns.target}</div>
                  <p className="text-xs text-[#4A4A4A] mt-2 leading-relaxed">{ns.why}</p>
                </div>
              ) : <div className="text-xs text-[#8A8A8A]">No north-star recorded.</div>}
            />

            <Section
              title="weekly themes"
              color="#FF3B00"
              a={planA?.weekly_themes}
              b={planB?.weekly_themes}
              render={(items) => items?.length ? (
                <ol className="space-y-2">
                  {items.map((w, i) => (
                    <li key={i} className="text-sm">
                      <span className="font-mono text-[#8A8A8A] mr-2">W{w.week || i+1}.</span>
                      <strong>{w.theme}</strong>
                      <div className="text-xs text-[#4A4A4A] ml-7">{w.focus}</div>
                    </li>
                  ))}
                </ol>
              ) : <div className="text-xs text-[#8A8A8A]">No themes.</div>}
            />

            <Section
              title="content ideas"
              color="#0A0A0A"
              a={planA?.content_ideas}
              b={planB?.content_ideas}
              render={(items) => items?.length ? (
                <ul className="space-y-2">
                  {items.slice(0, 6).map((c, i) => (
                    <li key={i} className="text-sm border-l-4 border-[#FF3B00] pl-3">
                      <div className="overline text-[#0033FF] text-[10px]">{c.platform} · {c.format}</div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-xs text-[#4A4A4A]">Hook: {c.hook}</div>
                    </li>
                  ))}
                  {items.length > 6 && <li className="text-xs text-[#8A8A8A]">+ {items.length - 6} more</li>}
                </ul>
              ) : <div className="text-xs text-[#8A8A8A]">No ideas recorded.</div>}
            />

            <Section
              title="daily checklist"
              color="#0033FF"
              a={planA?.daily_checklist}
              b={planB?.daily_checklist}
              render={(items) => items?.length ? (
                <ul className="space-y-1 text-sm">
                  {items.map((c, i) => <li key={i}>▸ {c}</li>)}
                </ul>
              ) : <div className="text-xs text-[#8A8A8A]">No checklist.</div>}
            />

            <Section
              title="key risks"
              color="#FF3B00"
              a={planA?.key_risks}
              b={planB?.key_risks}
              render={(items) => items?.length ? (
                <ul className="space-y-1 text-sm">
                  {items.map((r, i) => <li key={i}>⚠ {r}</li>)}
                </ul>
              ) : <div className="text-xs text-[#8A8A8A]">No risks recorded.</div>}
            />

            <div className="text-xs font-mono text-[#8A8A8A] text-center">
              Report A: {new Date(a.created_at).toLocaleString()} · Report B: {new Date(b.created_at).toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="brutal-card p-10 text-center">
            <GitCompare size={40} strokeWidth={1.5} className="mx-auto mb-4" />
            <div className="font-display font-bold text-xl">Pick two reports to compare</div>
            <div className="text-sm text-[#4A4A4A] mt-2">
              {reports.length < 2 ? "You need at least two completed reports. Run another analysis from the brand page." : "Use the dropdowns above."}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

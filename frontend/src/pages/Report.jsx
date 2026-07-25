import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Download, Printer, ArrowLeft, Target, ListChecks, CalendarDays, Lightbulb, AlertTriangle, Share2, Copy, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import FeedbackButtons from "@/components/FeedbackButtons";
import MarketIntel from "@/components/MarketIntel";

function MD({ text }) {
  if (!text) return null;
  // light markdown: headings + lists + bold
  const lines = text.split("\n");
  return (
    <div className="prose-pulse space-y-2 text-[#0A0A0A]">
      {lines.map((l, i) => {
        if (l.startsWith("### ")) return <h4 key={i} className="font-display font-bold text-lg mt-4">{l.slice(4)}</h4>;
        if (l.startsWith("## ")) return <h3 key={i} className="font-display font-black text-xl mt-5">{l.slice(3)}</h3>;
        if (l.startsWith("# ")) return <h2 key={i} className="font-display font-black text-2xl mt-6">{l.slice(2)}</h2>;
        if (l.startsWith("- ") || l.startsWith("* ")) return (
          <div key={i} className="flex gap-2 text-sm leading-relaxed">
            <span className="text-[#FF3B00] font-bold">▸</span>
            <span dangerouslySetInnerHTML={{ __html: l.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
          </div>
        );
        if (/^\d+\./.test(l)) return (
          <div key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
        );
        if (l.trim() === "") return <div key={i} className="h-1" />;
        return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: l.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
      })}
    </div>
  );
}

export default function Report() {
  const { reportId, token } = useParams();
  const isPublic = !!token;
  const [report, setReport] = useState(null);
  const [charts, setCharts] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [shareInfo, setShareInfo] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [feedback, setFeedback] = useState({});

  useEffect(() => {
    (async () => {
      if (isPublic) {
        try {
          const r = await axios.get(`${API}/public/share/${token}`);
          setReport(r.data.report);
          setCharts(r.data.charts);
          setProjectName(r.data.project?.account_name || "");
        } catch (e) {
          setReport({ status: "missing", error: e.response?.data?.detail || "Link unavailable" });
        }
        return;
      }
      const r = await axios.get(`${API}/reports/${reportId}`);
      setReport(r.data);
      try {
        const c = await axios.get(`${API}/projects/${r.data.project_id}/charts`);
        setCharts(c.data);
      } catch {}
      try {
        const s = await axios.get(`${API}/reports/${reportId}/share`);
        if (s.data?.share_token) setShareInfo(s.data);
      } catch {}
      try {
        const fb = await axios.get(`${API}/reports/${reportId}/feedback`);
        setFeedback(fb.data || {});
      } catch {}
    })();
  }, [reportId, token, isPublic]);

  const plan = report?.final_plan;
  const platforms = Object.keys(charts?.platforms || {});

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `pulse-report-${(reportId||token)}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  const createShare = async (days) => {
    try {
      const r = await axios.post(`${API}/reports/${reportId}/share`, { expires_in_days: days });
      setShareInfo(r.data);
      toast.success("Share link created");
    } catch {
      toast.error("Could not create share link");
    }
  };

  const revokeShare = async () => {
    await axios.delete(`${API}/reports/${reportId}/share`);
    setShareInfo(null);
    toast.success("Link revoked");
  };

  const shareUrl = shareInfo?.share_token ? `${window.location.origin}/share/${shareInfo.share_token}` : "";

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!report) return (
    <div className="min-h-screen bg-[#F4F4F0]">{!isPublic && <TopBar />}<div className="p-12 font-mono text-sm">loading report…</div></div>
  );

  if (report.status === "missing") return (
    <div className="min-h-screen bg-[#F4F4F0] flex items-center justify-center">
      <div className="brutal-card p-10 max-w-md text-center">
        <div className="overline text-[#FF3B00] mb-3">// 404</div>
        <h2 className="font-display font-black text-3xl">Link unavailable</h2>
        <p className="text-sm text-[#4A4A4A] mt-3">This share link has expired or been revoked.</p>
        <a href="/" className="btn-primary inline-block mt-6 text-xs">Visit Pulse</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="report-page">
      {!isPublic && <TopBar active="dash" />}
      {isPublic && (
        <header className="border-b-2 border-[#0A0A0A] bg-[#F4F4F0]">
          <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3" data-testid="public-pulse-logo">
              <div className="w-8 h-8 bg-[#FF3B00] border-2 border-[#0A0A0A] flex items-center justify-center">
                <div className="w-2 h-2 bg-white"></div>
              </div>
              <div>
                <div className="font-display font-black text-xl leading-none">PULSE</div>
                <div className="overline text-[#8A8A8A] leading-none mt-0.5">growth.intelligence</div>
              </div>
            </a>
            <div className="text-xs font-mono text-[#8A8A8A] hidden sm:block">Read-only · shared report</div>
            <a href="/" className="btn-secondary !py-2 !px-3 text-xs" data-testid="public-cta">Get your own report</a>
          </div>
        </header>
      )}
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10 print:py-2">
        <div className="flex items-center justify-between flex-wrap gap-4 print:hidden">
          {!isPublic ? (
            <Link to={`/projects/${report.project_id}`} className="overline text-[#8A8A8A] hover:text-[#FF3B00]" data-testid="back-to-project">
              <ArrowLeft size={12} className="inline mr-1" /> back to brand
            </Link>
          ) : (
            <div className="overline text-[#8A8A8A]">{projectName ? `${projectName} · ` : ""}Growth report</div>
          )}
          <div className="flex gap-3 flex-wrap">
            {!isPublic && (
              <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                <DialogTrigger asChild>
                  <button className="btn-secondary !py-2 !px-3 text-xs" data-testid="share-report-button">
                    <Share2 size={14} className="inline mr-1" /> Share
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-lg rounded-none border-2 border-[#0A0A0A] bg-white p-0">
                  <div className="p-6 sm:p-8" data-testid="share-dialog">
                    <div className="overline text-[#0033FF]">// share with a client</div>
                    <h2 className="font-display font-black text-2xl tracking-tighter mt-2">Public, read-only link</h2>
                    <p className="text-sm text-[#4A4A4A] mt-2">Anyone with the URL can view the report. No login required. Revoke it any time.</p>
                    {shareInfo?.share_token ? (
                      <div className="mt-6 space-y-4">
                        <div className="border-2 border-[#0A0A0A] p-3 flex items-center gap-2">
                          <input readOnly value={shareUrl} className="flex-1 bg-transparent text-xs font-mono outline-none" data-testid="share-url-input" />
                          <button onClick={copyShare} className="btn-primary !py-1 !px-3 text-[10px]" data-testid="copy-share-url">
                            <Copy size={12} className="inline mr-1" /> Copy
                          </button>
                        </div>
                        <div className="text-xs font-mono text-[#8A8A8A]">
                          {shareInfo.expires_at ? `Expires ${new Date(shareInfo.expires_at).toLocaleDateString()}` : "No expiry — open until you revoke"}
                        </div>
                        <div className="flex gap-3">
                          <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-secondary !py-2 !px-3 text-xs" data-testid="open-share-url">
                            <ExternalLink size={12} className="inline mr-1" /> Open preview
                          </a>
                          <button onClick={revokeShare} className="btn-secondary !py-2 !px-3 text-xs !text-[#FF3B00] !border-[#FF3B00] hover:!bg-[#FF3B00] hover:!text-white" data-testid="revoke-share">
                            <Trash2 size={12} className="inline mr-1" /> Revoke
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 space-y-3">
                        <div className="overline">// pick an expiry</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: "7 days", days: 7 },
                            { label: "30 days", days: 30 },
                            { label: "90 days", days: 90 },
                            { label: "No expiry", days: 0 },
                          ].map((opt) => (
                            <button
                              key={opt.label}
                              onClick={() => createShare(opt.days)}
                              className="border-2 border-[#0A0A0A] bg-white hover:bg-[#0A0A0A] hover:text-white py-3 px-2 font-display font-bold text-xs uppercase tracking-wide transition-colors"
                              data-testid={`share-expiry-${opt.days}`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <button className="btn-secondary !py-2 !px-3 text-xs" onClick={downloadJson} data-testid="download-json">
              <Download size={14} className="inline mr-1" /> JSON
            </button>
            <button className="btn-primary !py-2 !px-3 text-xs" onClick={printReport} data-testid="print-report">
              <Printer size={14} className="inline mr-1" /> Print / PDF
            </button>
          </div>
        </div>

        {/* COVER */}
        <section className="mt-8 border-2 border-[#0A0A0A] bg-white p-8 sm:p-12">
          <div className="overline text-[#FF3B00] mb-3">Pulse Growth Report №{(reportId || token || "").slice(-4).toUpperCase()}</div>
          <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.95]">
            {plan?.north_star?.metric || "Your growth, decoded."}
          </h1>
          {plan?.north_star && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-t-2 border-[#0A0A0A] pt-8">
              <div>
                <div className="overline text-[#8A8A8A]">Current</div>
                <div className="font-display font-black text-3xl mt-1">{plan.north_star.current}</div>
              </div>
              <div>
                <div className="overline text-[#0033FF]">Target (30 days)</div>
                <div className="font-display font-black text-3xl mt-1 text-[#0033FF]">{plan.north_star.target}</div>
              </div>
              <div>
                <div className="overline text-[#FF3B00]">Why this matters</div>
                <div className="text-sm mt-2 text-[#4A4A4A] leading-relaxed">{plan.north_star.why}</div>
              </div>
            </div>
          )}
        </section>

        {/* CHARTS */}
        {platforms.length > 0 && (
          <section className="mt-8 page-break-inside-avoid">
            <div className="overline mb-3">§ 01 · Signals</div>
            <Tabs defaultValue={platforms[0]} className="w-full">
              <TabsList className="bg-transparent border-2 border-[#0A0A0A] rounded-none h-auto p-0 flex-wrap">
                {platforms.map((p) => (
                  <TabsTrigger
                    key={p}
                    value={p}
                    className="rounded-none data-[state=active]:bg-[#0A0A0A] data-[state=active]:text-white px-5 py-2 font-display font-bold uppercase tracking-wide text-xs border-r-2 border-[#0A0A0A] last:border-r-0"
                    data-testid={`chart-tab-${p}`}
                  >
                    {p}
                  </TabsTrigger>
                ))}
              </TabsList>
              {platforms.map((p) => {
                const data = charts.platforms[p];
                const series = data.timeseries || [];
                const numericKeys = series.length > 0
                  ? Object.keys(series[0]).filter(k => k !== "date").slice(0, 3)
                  : [];
                const metricEntries = Object.entries(data.metrics || {});
                return (
                  <TabsContent key={p} value={p} className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-8 brutal-card p-6">
                        <div className="overline text-[#0033FF] mb-2">// time series</div>
                        {series.length > 0 ? (
                          <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={series}>
                              <XAxis dataKey="date" stroke="#0A0A0A" tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                              <YAxis stroke="#0A0A0A" tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                              <Tooltip contentStyle={{ border: "2px solid #0A0A0A", borderRadius: 0, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                              <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 11 }} />
                              {numericKeys.map((k, i) => (
                                <Line key={k} type="monotone" dataKey={k} stroke={["#0A0A0A","#FF3B00","#0033FF"][i]} strokeWidth={3} dot={false} />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="text-sm text-[#8A8A8A] py-12 text-center">No time-series data detected in uploads.</div>
                        )}
                      </div>
                      <div className="lg:col-span-4 brutal-card p-6">
                        <div className="overline text-[#FF3B00] mb-3">// metric summary</div>
                        {metricEntries.length === 0 ? (
                          <div className="text-sm text-[#8A8A8A]">No numeric columns detected.</div>
                        ) : (
                          <div className="space-y-2 max-h-[260px] overflow-y-auto">
                            {metricEntries.slice(0, 12).map(([k, v]) => (
                              <div key={k} className="flex justify-between items-baseline border-b border-[#0A0A0A]/10 pb-1">
                                <span className="text-xs font-mono text-[#4A4A4A] truncate pr-2">{k}</span>
                                <span className="font-display font-bold text-sm">{Math.round(v.sum).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </section>
        )}

        {/* AGENT REPORTS */}
        <section className="mt-12 page-break-before">
          <div className="overline mb-3">§ 02 · Bureau findings</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: "audience_analyst", title: "Audience Analyst", color: "#0033FF" },
              { key: "content_strategist", title: "Content Strategist", color: "#FF3B00" },
              { key: "engagement_coach", title: "Engagement Coach", color: "#0A0A0A" },
              { key: "competitor_insight", title: "Competitor Insight", color: "#0033FF" },
            ].map((a) => (
              <div key={a.key} className="brutal-card p-6" data-testid={`agent-output-${a.key}`}>
                <div className="overline" style={{ color: a.color }}>// {a.title}</div>
                <h3 className="font-display font-black text-2xl tracking-tight mt-2 mb-4">{a.title}</h3>
                {(report.agent_outputs?.[a.key] || "").startsWith("(agent error") ? (
                  <div className="border-2 border-dashed border-[#FF3B00] p-4 text-sm">
                    <div className="overline text-[#FF3B00] mb-2">// agent stalled</div>
                    <p className="text-[#4A4A4A]">This agent didn't return a clean response. The other agents finished and the action plan below is still valid — re-run the analysis from the brand page to refresh this section.</p>
                  </div>
                ) : (
                  <MD text={report.agent_outputs?.[a.key] || ""} />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ACTION PLAN */}
        {plan && (
          <section className="mt-12 page-break-before">
            <div className="overline mb-3 text-[#FF3B00]">§ 03 · 30-Day Action Plan</div>
            <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tighter mb-8">The plan</h2>

            {plan.weekly_themes && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-2 border-[#0A0A0A] mb-8">
                {plan.weekly_themes.map((w, i) => (
                  <div key={i} className={`p-5 ${i < (plan.weekly_themes.length - 1) ? "md:border-r-2 border-[#0A0A0A]" : ""}`} data-testid={`week-${i+1}`}>
                    <div className="overline text-[#0033FF]">Week {w.week || i+1}</div>
                    <div className="font-display font-black text-lg mt-2">{w.theme}</div>
                    <div className="text-xs text-[#4A4A4A] mt-2 leading-relaxed">{w.focus}</div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {plan.content_ideas && (
                <div className="lg:col-span-7 brutal-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={18} />
                    <div className="overline">// content ideas</div>
                  </div>
                  <div className="space-y-3">
                    {plan.content_ideas.map((c, i) => (
                      <div key={i} className="border-l-4 border-[#FF3B00] pl-4 py-2" data-testid={`idea-${i}`}>
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="overline text-[#0033FF] text-[10px]">{c.platform}</span>
                          <span className="overline text-[#8A8A8A] text-[10px]">{c.format}</span>
                        </div>
                        <div className="font-display font-bold text-base mt-1">{c.title}</div>
                        <div className="text-xs text-[#4A4A4A] mt-1"><strong>Hook:</strong> {c.hook}</div>
                        <div className="text-xs text-[#4A4A4A]"><strong>CTA:</strong> {c.cta}</div>
                        <FeedbackButtons
                          reportId={reportId}
                          itemKey={`idea_${i}`}
                          current={feedback[`idea_${i}`]?.status}
                          onChange={(v) => setFeedback({ ...feedback, [`idea_${i}`]: v ? { status: v } : undefined })}
                          disabled={isPublic}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="lg:col-span-5 space-y-6">
                {plan.posting_schedule && (
                  <div className="brutal-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays size={18} />
                      <div className="overline">// posting schedule</div>
                    </div>
                    <div className="space-y-2">
                      {plan.posting_schedule.map((s, i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-[#0A0A0A]/10 pb-2" data-testid={`schedule-${i}`}>
                          <span className="font-mono font-bold w-10">{s.day}</span>
                          <span className="overline text-[#0033FF] text-[10px]">{s.platform}</span>
                          <span className="text-xs text-[#4A4A4A]">{s.format}</span>
                          <span className="font-mono text-xs">{s.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {plan.daily_checklist && (
                  <div className="brutal-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ListChecks size={18} />
                      <div className="overline">// daily checklist</div>
                    </div>
                    <div className="space-y-2">
                      {plan.daily_checklist.map((c, i) => (
                        <label key={i} className="flex items-start gap-3 text-sm cursor-pointer" data-testid={`checklist-${i}`}>
                          <input type="checkbox" className="mt-1 w-4 h-4 border-2 border-[#0A0A0A] accent-[#FF3B00]" />
                          <span className="leading-relaxed">{c}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {plan.key_risks && (
                  <div className="brutal-card p-6 bg-[#FFF6E0]">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={18} className="text-[#FF3B00]" />
                      <div className="overline text-[#FF3B00]">// risks</div>
                    </div>
                    <ul className="space-y-2">
                      {plan.key_risks.map((r, i) => (
                        <li key={i} className="text-sm leading-relaxed">▸ {r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!plan && report.status === "complete" && (
          <section className="mt-12 brutal-card p-6">
            <div className="overline mb-3 text-[#FF3B00]">// raw planner output</div>
            <pre className="text-xs font-mono whitespace-pre-wrap">{report.agent_outputs?.action_planner || ""}</pre>
          </section>
        )}

        <div className="mt-12 page-break-before">
          <MarketIntel projectId={report.project_id} />
        </div>

        {/* PRINT FOOTER */}
        <div className="hidden print:flex items-center justify-between mt-12 pt-4 border-t-2 border-[#0A0A0A] text-xs font-mono">
          <div>Generated by Pulse • The Multi-Agent Growth Manager</div>
          <div>{projectName || "Pitch Pack"}</div>
        </div>
      </main>

      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .page-break-before { page-break-before: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          body { background: white; }
          .brutal-card { border: 2px solid #0A0A0A !important; box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}

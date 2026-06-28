import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { ArrowRight } from "lucide-react";

export default function Analysis() {
  const { projectId, reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [logs, setLogs] = useState([]);
  const logEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let timer = null;
    const poll = async () => {
      try {
        const r = await axios.get(`${API}/reports/${reportId}`);
        if (!mounted) return;
        setReport(r.data);
        setLogs(r.data.logs || []);
        if (r.data.status === "running") {
          timer = setTimeout(poll, 1500);
        } else if (r.data.status === "complete") {
          setTimeout(() => navigate(`/reports/${reportId}`, { replace: true }), 1200);
        }
      } catch {
        timer = setTimeout(poll, 3000);
      }
    };
    poll();
    return () => { mounted = false; if (timer) clearTimeout(timer); };
  }, [reportId, navigate]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  const colorFor = (msg) => {
    if (msg.startsWith("[boot]")) return "boot";
    if (msg.startsWith("[done]")) return "done";
    if (msg.startsWith("[error]")) return "error";
    return "";
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="analysis-page">
      <TopBar active="dash" />
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <div className="overline mb-2">§ Live · multi-agent execution</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">
          The bureau is working{report?.status === "running" ? "…" : ""}
        </h1>
        <p className="mt-3 text-[#4A4A4A]">Five agents are reading your data sequentially. Don't close this tab — it'll auto-redirect when done.</p>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <div className="terminal p-5 h-[520px] overflow-y-auto" data-testid="agent-terminal">
              <div className="mb-3 flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 bg-[#FF3B00] inline-block"></span>
                <span className="w-2.5 h-2.5 bg-[#FFC000] inline-block"></span>
                <span className="w-2.5 h-2.5 bg-[#00E676] inline-block"></span>
                <span className="ml-3 text-white/40">pulse@bureau — {reportId}</span>
              </div>
              {logs.map((l, i) => (
                <div key={i} className={`log-line ${colorFor(l.msg)}`}>
                  <span className="text-white/40 mr-2">{new Date(l.t).toLocaleTimeString()}</span>
                  {l.msg}
                </div>
              ))}
              {report?.status === "running" && (
                <div className="log-line">
                  <span className="text-white/40 mr-2">{new Date().toLocaleTimeString()}</span>
                  thinking<span className="caret"></span>
                </div>
              )}
              {report?.status === "failed" && (
                <div className="log-line error">[abort] {report.error || "unknown error"}</div>
              )}
              <div ref={logEndRef} />
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-4">
            <div className="brutal-card p-5">
              <div className="overline text-[#0033FF]">// status</div>
              <div className="font-display font-black text-2xl mt-2 capitalize">{report?.status || "loading"}</div>
              <div className="mt-3 text-xs font-mono text-[#8A8A8A]">
                Records: {report?.platforms?.length || 0} platforms
              </div>
            </div>
            {["audience_analyst","content_strategist","engagement_coach","competitor_insight","action_planner"].map((k, i) => {
              const done = !!report?.agent_outputs?.[k];
              return (
                <div key={k} className="brutal-card p-4 flex items-center justify-between" data-testid={`agent-status-${k}`}>
                  <div>
                    <div className="overline text-[#8A8A8A]">Agent · 0{i+1}</div>
                    <div className="font-display font-bold text-sm mt-1 capitalize">{k.replace(/_/g, " ")}</div>
                  </div>
                  <div className={`overline ${done ? "text-[#0033FF]" : "text-[#8A8A8A]"}`}>
                    {done ? "✓ done" : "···"}
                  </div>
                </div>
              );
            })}
            {report?.status === "complete" && (
              <button className="btn-primary w-full" onClick={() => navigate(`/reports/${reportId}`)} data-testid="goto-report">
                View report <ArrowRight size={16} className="inline" />
              </button>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

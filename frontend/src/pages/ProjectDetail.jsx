import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { toast } from "sonner";
import { UploadCloud, FileText, Trash2, Play, ArrowRight, Instagram, Twitter, Linkedin, Youtube, Music2, X, BookOpen } from "lucide-react";
import ExportGuide from "@/components/ExportGuide";
import ChatPanel from "@/components/ChatPanel";
import MarketIntel from "@/components/MarketIntel";
import ConnectPlatforms from "@/components/ConnectPlatforms";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: Instagram, accent: "#E1306C" },
  { key: "twitter", label: "X / Twitter", icon: Twitter, accent: "#0A0A0A" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, accent: "#0033FF" },
  { key: "youtube", label: "YouTube", icon: Youtube, accent: "#FF3B00" },
  { key: "tiktok", label: "TikTok", icon: Music2, accent: "#FFC000" },
];

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [uploads, setUploads] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("instagram");
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const [p, u, r] = await Promise.all([
        axios.get(`${API}/projects/${projectId}`),
        axios.get(`${API}/projects/${projectId}/uploads`),
        axios.get(`${API}/projects/${projectId}/reports`),
      ]);
      setProject(p.data);
      setUploads(u.data);
      setReports(r.data);
    } catch {
      toast.error("Could not load project");
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const onDrop = async (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) await handleFiles(files);
  };

  const handleFiles = async (files) => {
    setBusy(true);
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("platform", selectedPlatform);
      try {
        await axios.post(`${API}/projects/${projectId}/uploads`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success(`${f.name} uploaded`);
      } catch (e) {
        toast.error(`${f.name}: ${e.response?.data?.detail || "failed"}`);
      }
    }
    setBusy(false);
    load();
  };

  const removeUpload = async (id) => {
    await axios.delete(`${API}/uploads/${id}`);
    toast.success("Removed");
    load();
  };

  const runAnalysis = async () => {
    if (uploads.length === 0) {
      toast.error("Upload at least one export first");
      return;
    }
    setAnalyzing(true);
    try {
      const r = await axios.post(`${API}/projects/${projectId}/analyze`);
      navigate(`/projects/${projectId}/analyze/${r.data.report_id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Analysis failed to start");
      setAnalyzing(false);
    }
  };

  const platformCounts = PLATFORMS.reduce((acc, p) => {
    acc[p.key] = uploads.filter(u => u.platform === p.key).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="project-detail-page">
      <TopBar active="dash" />
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-10">
        <Link to="/dashboard" className="overline text-[#8A8A8A] hover:text-[#FF3B00]" data-testid="back-to-dash">← back to brands</Link>
        {project && (
          <div className="mt-4 mb-10">
            <div className="overline">§ Brand</div>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">{project.account_name}</h1>
            <p className="mt-3 text-[#4A4A4A] max-w-3xl">{project.niche}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT: upload */}
          <section className="lg:col-span-7 space-y-6">
            <div className="brutal-card p-6">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <div className="overline text-[#0033FF]">// step 01 · choose platform</div>
                <ExportGuide platform={selectedPlatform} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const active = selectedPlatform === p.key;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPlatform(p.key)}
                      className={`border-2 border-[#0A0A0A] p-3 flex flex-col items-center gap-2 transition-all ${
                        active ? "bg-[#0A0A0A] text-white" : "bg-white hover:translate-y-[-2px]"
                      }`}
                      data-testid={`platform-${p.key}`}
                    >
                      <Icon size={22} strokeWidth={2} />
                      <span className="overline text-[10px]">{p.label}</span>
                      <span className="text-xs font-mono">{platformCounts[p.key]} file{platformCounts[p.key] === 1 ? "" : "s"}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="brutal-card p-10 text-center cursor-pointer"
              onClick={() => fileRef.current?.click()}
              data-testid="upload-dropzone"
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".csv,.xlsx,.xls,.pdf"
                className="hidden"
                onChange={(e) => e.target.files?.length && handleFiles(Array.from(e.target.files))}
              />
              <div className="overline text-[#FF3B00] mb-4">// step 02 · drop your exports</div>
              <UploadCloud size={48} strokeWidth={1.5} className="mx-auto" />
              <div className="font-display font-bold text-2xl mt-4">Drag &amp; drop CSV · XLSX · PDF</div>
              <div className="text-sm text-[#4A4A4A] mt-2">or click to browse — multiple files supported</div>
              <div className="mt-4 inline-block btn-secondary !py-2 !px-4 text-xs">
                Selected platform: {PLATFORMS.find(p => p.key === selectedPlatform)?.label}
              </div>
              {busy && <div className="mt-4 font-mono text-xs text-[#0033FF]">uploading…</div>}
            </div>

            {/* upload list */}
            <div className="brutal-card p-6">
              <div className="overline mb-4">// ingested files ({uploads.length})</div>
              {uploads.length === 0 ? (
                <div className="text-sm text-[#8A8A8A] py-6 text-center">No files yet. Upload your first platform export above.</div>
              ) : (
                <div className="divide-y-2 divide-[#0A0A0A]/10">
                  {uploads.map((u) => (
                    <div key={u.upload_id} className="flex items-center justify-between py-3" data-testid={`upload-${u.upload_id}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText size={20} strokeWidth={2} className="flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-semibold text-sm truncate">{u.filename}</div>
                          <div className="text-xs font-mono text-[#8A8A8A]">
                            {u.platform.toUpperCase()} · {(u.size/1024).toFixed(1)} KB · {u.parsed?.rows || 0} rows
                          </div>
                        </div>
                      </div>
                      <button onClick={() => removeUpload(u.upload_id)} className="text-[#8A8A8A] hover:text-[#FF3B00]" data-testid={`remove-upload-${u.upload_id}`}>
                        <X size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: action + reports */}
          <aside className="lg:col-span-5 space-y-6">
            <div className="brutal-card p-6 bg-[#0A0A0A] text-white">
              <div className="overline text-[#FF3B00] mb-2">// step 03 · run analysis</div>
              <h3 className="font-display font-black text-2xl mb-2">Wake the bureau</h3>
              <p className="text-sm text-white/70 mb-6">
                Five agents will read your uploads, debate, and produce a 30-day plan.
                Expect ~30–60 seconds.
              </p>
              <button
                onClick={runAnalysis}
                disabled={analyzing || uploads.length === 0}
                className="w-full bg-[#FF3B00] text-white border-2 border-[#FF3B00] font-display font-black uppercase tracking-wider py-3 hover:bg-[#CC2F00] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                data-testid="run-analysis-button"
              >
                <Play size={16} /> {analyzing ? "Starting…" : "Run growth analysis"}
              </button>
              <div className="mt-3 text-xs font-mono text-white/50">
                {uploads.length === 0 ? "Upload at least one file to enable." : `${uploads.length} files queued for ingestion`}
              </div>
            </div>

            <div className="brutal-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="overline">// past reports ({reports.length})</div>
                {reports.filter(r => r.status === "complete").length >= 2 && (
                  <Link to={`/projects/${projectId}/compare`} className="overline text-[#0033FF] hover:text-[#FF3B00]" data-testid="open-compare">
                    Compare →
                  </Link>
                )}
              </div>
              {reports.length === 0 ? (
                <div className="text-sm text-[#8A8A8A] py-3">No reports yet.</div>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <Link
                      key={r.report_id}
                      to={r.status === "complete" ? `/reports/${r.report_id}` : `/projects/${projectId}/analyze/${r.report_id}`}
                      className="block border-2 border-[#0A0A0A]/10 hover:border-[#0A0A0A] p-3 transition-all"
                      data-testid={`report-${r.report_id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm font-mono">{r.report_id}</div>
                          <div className="text-xs text-[#8A8A8A] mt-1">
                            {new Date(r.created_at).toLocaleString()} · {(r.platforms || []).join(", ")}
                          </div>
                        </div>
                        <div className={`overline ${r.status === "complete" ? "text-[#0033FF]" : r.status === "failed" ? "text-[#FF3B00]" : "text-[#FFC000]"}`}>
                          {r.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>

        <div className="mt-8">
          <ConnectPlatforms />
        </div>

        <div className="mt-8">
          <MarketIntel projectId={projectId} />
        </div>

        {reports.some(r => r.status === "complete") && (
          <div className="mt-8">
            <ChatPanel projectId={projectId} />
          </div>
        )}
      </main>
    </div>
  );
}

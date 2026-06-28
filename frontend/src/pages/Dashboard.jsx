import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { Plus, ArrowRight, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const r = await axios.get(`${API}/projects`);
      setProjects(r.data);
    } catch (e) {
      toast.error("Couldn't load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this project and all its uploads & reports?")) return;
    await axios.delete(`${API}/projects/${id}`);
    toast.success("Project deleted");
    load();
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="dashboard-page">
      <TopBar active="dash" />
      <main className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
          <div>
            <div className="overline mb-2">§ Workspace</div>
            <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Your brands</h1>
            <p className="mt-3 text-[#4A4A4A] max-w-xl">Each brand is a creator account with its own profile, uploads and growth reports.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/projects/new")} data-testid="new-project-button">
            <Plus size={18} className="inline mr-1" /> New brand
          </button>
        </div>

        {loading ? (
          <div className="font-mono text-sm">loading…</div>
        ) : projects.length === 0 ? (
          <div className="brutal-card p-12 text-center" data-testid="empty-projects">
            <div className="overline text-[#FF3B00] mb-4">// empty desk</div>
            <h3 className="font-display font-black text-3xl tracking-tighter">No brands yet</h3>
            <p className="text-[#4A4A4A] mt-3 mb-6 max-w-md mx-auto">
              Add your first creator brand to start ingesting platform exports.
            </p>
            <button className="btn-primary" onClick={() => navigate("/projects/new")} data-testid="empty-cta">
              Create first brand
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div key={p.project_id} className="brutal-card p-6 flex flex-col" data-testid={`project-card-${p.project_id}`}>
                <div className="overline text-[#0033FF]">// brand</div>
                <h3 className="font-display font-black text-2xl mt-2 tracking-tight">{p.account_name}</h3>
                <p className="text-sm text-[#4A4A4A] mt-2 line-clamp-3">{p.niche}</p>
                <div className="mt-4 text-xs font-mono text-[#8A8A8A] flex items-center gap-2">
                  <Calendar size={12} /> {new Date(p.created_at).toLocaleDateString()}
                </div>
                <div className="mt-5 flex items-center justify-between border-t-2 border-[#0A0A0A]/10 pt-4">
                  <Link to={`/projects/${p.project_id}`} className="overline text-[#FF3B00] hover:text-[#0A0A0A]" data-testid={`open-project-${p.project_id}`}>
                    Open <ArrowRight size={12} className="inline" />
                  </Link>
                  <button onClick={() => remove(p.project_id)} className="text-[#8A8A8A] hover:text-[#FF3B00]" data-testid={`delete-project-${p.project_id}`}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import TopBar from "@/components/TopBar";
import { API } from "@/App";
import { toast } from "sonner";

const FIELDS = [
  { key: "account_name", label: "Account name or handle", placeholder: "@kolkata.streetfood", required: true, type: "input" },
  { key: "niche", label: "What is the brand about?", placeholder: "Kolkata street food reviews for budget-conscious students and young professionals.", required: true, type: "textarea" },
  { key: "audience", label: "Who is the target audience?", placeholder: "People aged 18–30 in Kolkata who want affordable, reliable food recommendations.", required: true, type: "textarea" },
  { key: "goals", label: "What are the main goals?", placeholder: "Grow followers, lift saves & shares, attract cafe collaborations.", required: true, type: "textarea" },
  { key: "content_style", label: "What do they post now?", placeholder: "Reels with food closeups, price breakdowns, honest captions, occasional vendor stories.", required: true, type: "textarea" },
  { key: "posting_capacity", label: "Realistic posting capacity", placeholder: "3 reels and 4 story-days per week.", type: "input" },
  { key: "offers_or_products", label: "Offers, products, business model", placeholder: "Sponsored visits, affiliate deals, local guide PDFs.", type: "textarea" },
  { key: "inspiration_accounts", label: "Inspiration / competitor accounts", placeholder: "@account1, @account2", type: "input" },
  { key: "constraints", label: "Constraints or preferences", placeholder: "No face reveal, low budget, weekends only.", type: "textarea" },
];

export default function ProjectSetup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map(f => [f.key, ""])));
  const [saving, setSaving] = useState(false);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const canSave = FIELDS.filter(f => f.required).every(f => form[f.key].trim());

  const save = async () => {
    if (!canSave) {
      toast.error("Fill the required fields");
      return;
    }
    try {
      setSaving(true);
      const r = await axios.post(`${API}/projects`, form);
      toast.success("Brand created");
      navigate(`/projects/${r.data.project_id}`);
    } catch {
      toast.error("Could not create brand");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F0]" data-testid="project-setup-page">
      <TopBar active="dash" />
      <main className="max-w-[1100px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="overline mb-2">§ New brand</div>
        <h1 className="font-display font-black text-4xl sm:text-5xl tracking-tighter">Tell the agents about the brand</h1>
        <p className="mt-3 text-[#4A4A4A] max-w-2xl">
          The richer the context, the sharper the report. Required fields are marked.
        </p>

        <div className="mt-10 brutal-card p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <label className="overline block mb-2">
                  {f.label} {f.required && <span className="text-[#FF3B00]">*</span>}
                </label>
                {f.type === "textarea" ? (
                  <textarea
                    value={form[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    rows={3}
                    className="w-full border-2 border-[#0A0A0A] bg-white p-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0033FF]"
                    data-testid={`field-${f.key}`}
                  />
                ) : (
                  <input
                    value={form[f.key]}
                    onChange={(e) => update(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full border-2 border-[#0A0A0A] bg-white p-3 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#0033FF]"
                    data-testid={`field-${f.key}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t-2 border-[#0A0A0A]/10 pt-6">
            <button className="btn-secondary" onClick={() => navigate("/dashboard")} data-testid="cancel-button">Cancel</button>
            <button className="btn-primary" disabled={!canSave || saving} onClick={save} data-testid="save-project-button">
              {saving ? "Creating…" : "Create brand"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

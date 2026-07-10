import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { API } from "@/App";
import { Send, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

const PROMPTS = [
  "What changed between my last two reports?",
  "Which content idea should I prioritize this week?",
  "Why did my engagement drop?",
  "Audit my hooks — what's working and what isn't?",
];

export default function ChatPanel({ projectId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const load = async () => {
    try {
      const r = await axios.get(`${API}/projects/${projectId}/chat`);
      setMessages(r.data || []);
    } catch {}
  };

  useEffect(() => { load(); }, [projectId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async (q) => {
    const question = (q ?? input).trim();
    if (!question || sending) return;
    setSending(true);
    setInput("");
    const optimistic = { msg_id: `tmp_${Date.now()}`, question, answer: "", created_at: new Date().toISOString(), pending: true };
    setMessages((m) => [...m, optimistic]);
    try {
      const r = await axios.post(`${API}/projects/${projectId}/ask`, { question });
      setMessages((m) => m.map((x) => (x.msg_id === optimistic.msg_id ? r.data : x)));
    } catch (e) {
      setMessages((m) => m.filter((x) => x.msg_id !== optimistic.msg_id));
      toast.error(e.response?.data?.detail || "Chat failed");
    } finally {
      setSending(false);
    }
  };

  const clear = async () => {
    if (!window.confirm("Clear chat history?")) return;
    await axios.delete(`${API}/projects/${projectId}/chat`);
    setMessages([]);
  };

  return (
    <div className="brutal-card p-6" data-testid="chat-panel">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="overline text-[#0033FF]">// ask the bureau</div>
          <h3 className="font-display font-black text-xl mt-1">Question your data</h3>
        </div>
        {messages.length > 0 && (
          <button onClick={clear} className="text-[#8A8A8A] hover:text-[#FF3B00]" data-testid="clear-chat" title="Clear">
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {messages.length === 0 && (
        <div className="space-y-2 mb-4">
          <div className="overline text-[#8A8A8A] mb-2">// try one of these</div>
          {PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => send(p)}
              className="block w-full text-left text-sm border-2 border-[#0A0A0A]/20 hover:border-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-white p-3 transition-all"
              data-testid={`suggested-prompt-${i}`}
            >
              <Sparkles size={12} className="inline mr-2" /> {p}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2" data-testid="chat-messages">
        {messages.map((m) => (
          <div key={m.msg_id} className="space-y-2">
            <div className="flex justify-end">
              <div className="bg-[#0A0A0A] text-white px-3 py-2 max-w-[85%] text-sm" data-testid="chat-question">{m.question}</div>
            </div>
            <div className="flex justify-start">
              <div className="border-2 border-[#0A0A0A] bg-white px-3 py-2 max-w-[90%] text-sm whitespace-pre-wrap" data-testid="chat-answer">
                {m.pending ? <span className="font-mono text-[#8A8A8A]">thinking…</span> : m.answer}
                {m.cited_reports?.length > 0 && !m.pending && (
                  <div className="mt-2 text-[10px] font-mono text-[#8A8A8A]">cited: {m.cited_reports.join(", ")}</div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(); }}
        className="mt-4 flex gap-2 items-stretch"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your data…"
          className="flex-1 border-2 border-[#0A0A0A] bg-white p-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0033FF]"
          data-testid="chat-input"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary !px-4" data-testid="chat-send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

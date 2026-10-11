"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatWindow from "@/components/ChatWindow";
import SettingsModal from "@/components/SettingsModal";
import Sidebar from "@/components/Sidebar";
import { DEFAULT_SETTINGS, loadChats, loadSettings, saveChats, saveSettings, type Att, type Chat, type Msg, type Settings } from "@/lib/storage";
import { uid } from "@/lib/utils";

export default function Home() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const busyRef = useRef(false);

  useEffect(() => { setChats(loadChats()); setSettings(loadSettings()); setReady(true); }, []);
  useEffect(() => { if (ready && !busy) saveChats(chats); }, [chats, ready, busy]);
  useEffect(() => { if (ready) saveSettings(settings); }, [settings, ready]);

  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", settings.theme === "dark" || (settings.theme === "system" && mq.matches));
    apply(); mq.addEventListener("change", apply); return () => mq.removeEventListener("change", apply);
  }, [settings.theme]);

  const patch = useCallback((id: string, fn: (c: Chat) => Chat) => setChats((p) => p.map((c) => (c.id === id ? fn(c) : c))), []);
  const newChat = useCallback(() => { abort.current?.abort(); setActiveId(null); setDrawer(false); }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.shiftKey && e.key.toLowerCase() === "o") { e.preventDefault(); newChat(); }
      else if (mod && e.key === ",") { e.preventDefault(); setShowSettings(true); }
      else if (e.key === "Escape") setShowSettings(false);
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [newChat]);

  const run = async (id: string, history: Msg[]) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true);
    const aid = uid();
    const setAi = (fn: (m: Msg) => Msg) => patch(id, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === aid ? fn(m) : m)) }));
    patch(id, (c) => ({ ...c, messages: [...history, { id: aid, role: "assistant", content: "" }], updated: Date.now() }));
    const ac = new AbortController(); abort.current = ac;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: ac.signal,
        body: JSON.stringify({ model: settings.model, messages: history.map(({ role, content, atts }) => ({ role, content, atts })) }),
      });
      if (!res.ok || !res.body) { const j = await res.json().catch(() => ({})); throw new Error(j.error || `Request failed (${res.status})`); }
      const reader = res.body.getReader(), dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read(); if (done) break;
        acc += dec.decode(value, { stream: true }); const t = acc;
        setAi((m) => ({ ...m, content: t }));
      }
      if (!acc) throw new Error("The model returned an empty response.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        const msg = e instanceof TypeError ? "Network error - check your connection and try again." : (e as Error).message;
        setAi((m) => ({ ...m, error: true, content: m.content || msg }));
      }
    } finally { busyRef.current = false; setBusy(false); abort.current = null; }
  };

  const send = (text: string, atts: Att[]) => {
    if (busyRef.current || (!text && !atts.length)) return;
    const user: Msg = { id: uid(), role: "user", content: text, atts: atts.length ? atts : undefined };
    let id = activeId; let prior: Msg[] = [];
    if (id) prior = chats.find((c) => c.id === id)?.messages.filter((m) => !m.error) ?? [];
    else {
      id = uid(); const cid = id;
      setChats((p) => [{ id: cid, title: (text || atts[0]?.name || "New chat").slice(0, 40), messages: [], updated: Date.now() }, ...p]);
      setActiveId(cid);
    }
    run(id, [...prior, user]);
  };

  const regen = (mid: string) => {
    const chat = chats.find((c) => c.id === activeId); if (!chat || busyRef.current) return;
    const i = chat.messages.findIndex((m) => m.id === mid); if (i < 1) return;
    run(chat.id, chat.messages.slice(0, i));
  };

  const active = chats.find((c) => c.id === activeId) ?? null;
  if (!ready) return null;

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar chats={chats} activeId={activeId} open={drawer} collapsed={collapsed} onClose={() => setDrawer(false)} onNew={newChat}
        onSelect={(id) => { abort.current?.abort(); setActiveId(id); setDrawer(false); }}
        onRename={(id, title) => patch(id, (c) => ({ ...c, title }))}
        onDelete={(id) => { if (id === activeId) { abort.current?.abort(); setActiveId(null); } setChats((p) => p.filter((c) => c.id !== id)); }}
        onSettings={() => { setShowSettings(true); setDrawer(false); }} />
      <ChatWindow chat={active} busy={busy} model={settings.model} onModel={(model) => setSettings((s) => ({ ...s, model }))}
        onMenu={() => (window.innerWidth < 768 ? setDrawer(true) : setCollapsed((c) => !c))}
        onSend={send} onStop={() => abort.current?.abort()} onRegen={regen}
        onFeedback={(mid, f) => active && patch(active.id, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === mid ? { ...m, feedback: m.feedback === f ? undefined : f } : m)) }))} />
      {showSettings && <SettingsModal settings={settings} onChange={setSettings} onClose={() => setShowSettings(false)}
        onClear={() => { abort.current?.abort(); setChats([]); setActiveId(null); setShowSettings(false); }} />}
    </div>
  );
}

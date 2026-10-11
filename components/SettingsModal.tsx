"use client";
import { Monitor, Moon, Sun, X } from "lucide-react";
import { MODELS, type Settings } from "@/lib/storage";
import { cn } from "@/lib/utils";

type P = { settings: Settings; onChange: (s: Settings) => void; onClear: () => void; onClose: () => void };
const THEMES = [{ id: "light", n: "Light", i: Sun }, { id: "dark", n: "Dark", i: Moon }, { id: "system", n: "System", i: Monitor }] as const;
const KEYS = [["Send message", "Enter"], ["New line", "Shift + Enter"], ["New chat", "Ctrl/⌘ + Shift + O"], ["Open settings", "Ctrl/⌘ + ,"], ["Close dialog", "Esc"]];

export default function SettingsModal({ settings, onChange, onClear, onClose }: P) {
  const h = "mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500";
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-label="Settings" onClick={(e) => e.stopPropagation()} className="fade-up max-h-[90dvh] w-full max-w-md space-y-6 overflow-y-auto rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#1a1a1d]">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Settings</h2><button aria-label="Close" onClick={onClose} className="grid size-8 place-items-center rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10"><X size={18} /></button></div>
        <section><h3 className={h}>Theme</h3>
          <div className="grid grid-cols-3 gap-2">{THEMES.map(({ id, n, i: Icon }) => (
            <button key={id} onClick={() => onChange({ ...settings, theme: id })} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2 text-sm transition", settings.theme === id ? "border-indigo-500 bg-indigo-500/10" : "border-zinc-200 dark:border-white/10")}><Icon size={15} />{n}</button>))}</div></section>
        <section><h3 className={h}>Model</h3>
          <select value={settings.model} onChange={(e) => onChange({ ...settings, model: e.target.value })} className="w-full rounded-xl border border-zinc-200 bg-transparent px-3 py-2 text-sm dark:border-white/10 dark:bg-[#1a1a1d]">{MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select></section>
        <section><h3 className={h}>Keyboard shortcuts</h3>
          <dl className="space-y-1.5 text-sm">{KEYS.map(([a, b]) => <div key={a} className="flex justify-between"><dt>{a}</dt><dd><kbd className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-white/10">{b}</kbd></dd></div>)}</dl></section>
        <section><h3 className={h}>Data</h3>
          <button onClick={() => { if (confirm("Delete all conversations? This cannot be undone.")) onClear(); }} className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10">Clear all conversations</button></section>
        <section><h3 className={h}>About</h3><p className="text-sm text-zinc-500">Mindly AI v0.1 - your AI workspace for thinking, creating and exploring. Chats are stored locally in your browser.</p></section>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { Check, Pencil, Plus, Search, Settings, Sparkles, Trash2, X } from "lucide-react";
import type { Chat } from "@/lib/storage";
import { cn } from "@/lib/utils";

type P = {
  chats: Chat[]; activeId: string | null; open: boolean; collapsed: boolean;
  onClose: () => void; onNew: () => void; onSelect: (id: string) => void;
  onRename: (id: string, t: string) => void; onDelete: (id: string) => void; onSettings: () => void;
};

export default function Sidebar(p: P) {
  const [q, setQ] = useState("");
  const [ed, setEd] = useState<string | null>(null);
  const [val, setVal] = useState("");
  const list = p.chats.filter((c) => c.title.toLowerCase().includes(q.toLowerCase())).sort((a, b) => b.updated - a.updated);
  const commit = () => { if (ed && val.trim()) p.onRename(ed, val.trim()); setEd(null); };
  const ib = "grid size-7 place-items-center rounded-lg hover:bg-zinc-200 dark:hover:bg-white/10";

  return (
    <>
      {p.open && <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={p.onClose} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-zinc-200 bg-zinc-50 transition-transform duration-300 dark:border-white/10 dark:bg-[#0b0b0d] md:static md:translate-x-0",
        p.open ? "translate-x-0" : "-translate-x-full", p.collapsed && "md:hidden")}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 font-semibold"><span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><Sparkles size={16} /></span>Mindly AI</div>
          <button aria-label="Close sidebar" className={cn(ib, "md:hidden")} onClick={p.onClose}><X size={18} /></button>
        </div>
        <div className="space-y-2 px-3">
          <button onClick={p.onNew} className="flex w-full items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium transition hover:shadow-sm dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"><Plus size={16} />New Chat</button>
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations" className="w-full rounded-xl bg-zinc-100 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 dark:bg-white/5" /></div>
        </div>
        <nav className="mt-3 flex-1 space-y-0.5 overflow-y-auto px-2">
          {list.length === 0 && <p className="px-3 py-4 text-sm text-zinc-400">{q ? "No matches" : "No conversations yet"}</p>}
          {list.map((c) => (
            <div key={c.id} className={cn("group flex items-center gap-1 rounded-xl px-3 py-2 text-sm transition", c.id === p.activeId ? "bg-zinc-200/70 dark:bg-white/10" : "hover:bg-zinc-100 dark:hover:bg-white/5")}>
              {ed === c.id ? (
                <>
                  <input autoFocus value={val} onChange={(e) => setVal(e.target.value)} onBlur={commit} onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") setEd(null); }} className="min-w-0 flex-1 rounded bg-transparent outline-none ring-1 ring-indigo-500" />
                  <button aria-label="Save name" className={ib} onMouseDown={commit}><Check size={14} /></button>
                </>
              ) : (
                <>
                  <button className="min-w-0 flex-1 truncate text-left" onClick={() => p.onSelect(c.id)}>{c.title}</button>
                  <div className={cn("flex", c.id === p.activeId ? "" : "md:hidden md:group-hover:flex")}>
                    <button aria-label="Rename" className={ib} onClick={() => { setEd(c.id); setVal(c.title); }}><Pencil size={14} /></button>
                    <button aria-label="Delete" className={ib} onClick={() => p.onDelete(c.id)}><Trash2 size={14} /></button>
                  </div>
                </>
              )}
            </div>
          ))}
        </nav>
        <div className="space-y-1 border-t border-zinc-200 p-3 dark:border-white/10">
          <button onClick={p.onSettings} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-white/5"><Settings size={16} />Settings</button>
          <div className="flex items-center gap-3 px-3 py-2"><span className="grid size-8 place-items-center rounded-full bg-indigo-600 text-sm font-medium text-white">Y</span><div className="text-sm leading-tight"><div className="font-medium">You</div><div className="text-xs text-zinc-500">Local workspace</div></div></div>
        </div>
      </aside>
    </>
  );
}

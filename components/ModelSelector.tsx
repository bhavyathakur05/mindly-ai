"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { MODELS } from "@/lib/storage";

export default function ModelSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = MODELS.find((m) => m.id === value) ?? MODELS[1];
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-white/10">
        {cur.name}<ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="fade-up absolute left-0 top-full z-20 mt-1 w-60 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#1a1a1d]">
          {MODELS.map((m) => (
            <button key={m.id} onClick={() => { onChange(m.id); setOpen(false); }} className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-zinc-100 dark:hover:bg-white/10">
              <span><span className="block text-sm font-medium">{m.name}</span><span className="text-xs text-zinc-500">{m.desc}</span></span>
              {m.id === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

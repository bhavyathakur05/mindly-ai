"use client";
import { Paperclip, X, FileText } from "lucide-react";
import { useRef } from "react";
import type { Att } from "@/lib/storage";

// Extension point: add PDF/text extraction here and put the result on the Att.
export async function readFiles(files: FileList | File[]): Promise<Att[]> {
  return Promise.all(Array.from(files).map((f) => new Promise<Att>((res) => {
    if (!f.type.startsWith("image/") || f.size > 5_000_000) return res({ name: f.name, type: f.type });
    const r = new FileReader();
    r.onload = () => res({ name: f.name, type: f.type, data: r.result as string });
    r.onerror = () => res({ name: f.name, type: f.type });
    r.readAsDataURL(f);
  })));
}

export function FileButton({ onFiles }: { onFiles: (f: FileList) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" multiple hidden onChange={(e) => { if (e.target.files) onFiles(e.target.files); e.target.value = ""; }} />
      <button type="button" aria-label="Attach files" onClick={() => ref.current?.click()} className="grid size-9 place-items-center rounded-xl text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-white/10"><Paperclip size={18} /></button>
    </>
  );
}

export function Previews({ atts, onRemove }: { atts: Att[]; onRemove?: (i: number) => void }) {
  if (!atts.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {atts.map((a, i) => (
        <div key={i} className="group relative">
          {a.data ? <img src={a.data} alt={a.name} className="size-16 rounded-xl border border-zinc-200 object-cover dark:border-white/10" />
            : <div className="flex h-16 max-w-44 items-center gap-2 rounded-xl border border-zinc-200 px-3 text-xs dark:border-white/10"><FileText size={16} /><span className="truncate">{a.name}</span></div>}
          {onRemove && <button aria-label="Remove attachment" onClick={() => onRemove(i)} className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><X size={12} /></button>}
        </div>
      ))}
    </div>
  );
}

"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "lucide-react";
import type { Att } from "@/lib/storage";
import { FileButton, Previews, readFiles } from "./FileUpload";
import { cn } from "@/lib/utils";

type P = { busy: boolean; onSend: (text: string, atts: Att[]) => void; onStop: () => void };

export default function ChatInput({ busy, onSend, onStop }: P) {
  const [text, setText] = useState("");
  const [atts, setAtts] = useState<Att[]>([]);
  const [drag, setDrag] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { const el = ta.current; if (!el) return; el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight, 200) + "px"; }, [text]);

  const canSend = !busy && (text.trim().length > 0 || atts.length > 0);
  const submit = () => { if (!canSend) return; onSend(text.trim(), atts); setText(""); setAtts([]); };
  const add = async (f: FileList | File[]) => { const n = await readFiles(f); setAtts((a) => [...a, ...n]); };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); if (e.dataTransfer.files.length) add(e.dataTransfer.files); }}
        className={cn("rounded-3xl border bg-white p-2 shadow-sm transition dark:bg-[#1a1a1d]", drag ? "border-indigo-500 ring-4 ring-indigo-500/15" : "border-zinc-200 dark:border-white/10")}
      >
        {atts.length > 0 && <div className="px-2 pb-2 pt-1"><Previews atts={atts} onRemove={(i) => setAtts((a) => a.filter((_, j) => j !== i))} /></div>}
        <div className="flex items-end gap-1">
          <FileButton onFiles={add} />
          <textarea ref={ta} rows={1} value={text} placeholder={drag ? "Drop files to attach…" : "Message Mindly AI"} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit(); } }}
            className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 outline-none placeholder:text-zinc-400" />
          {busy ? (
            <button aria-label="Stop generating" onClick={onStop} className="grid size-9 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"><Square size={14} fill="currentColor" /></button>
          ) : (
            <button aria-label="Send" disabled={!canSend} onClick={submit} className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-30"><ArrowUp size={18} /></button>
          )}
        </div>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-400">Mindly AI can make mistakes. Check important information.</p>
    </div>
  );
}

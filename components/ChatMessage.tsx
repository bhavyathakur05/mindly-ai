"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { AlertCircle, Check, Copy, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Msg } from "@/lib/storage";
import { Previews } from "./FileUpload";
import { cn } from "@/lib/utils";

type P = { msg: Msg; loading: boolean; onRegen: () => void; onFeedback: (f: "like" | "dislike") => void };

export default function ChatMessage({ msg, loading, onRegen, onFeedback }: P) {
  const [copied, setCopied] = useState(false);
  if (msg.role === "user") {
    return (
      <div className="fade-up flex flex-col items-end gap-2">
        {msg.atts && <Previews atts={msg.atts} />}
        {msg.content && <div className="max-w-[85%] whitespace-pre-wrap rounded-3xl bg-zinc-100 px-4 py-2.5 dark:bg-white/10">{msg.content}</div>}
      </div>
    );
  }
  const act = "grid size-8 place-items-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-white";
  return (
    <div className="fade-up group flex justify-start">
      <div className="min-w-0 max-w-full">
        {msg.error ? (
          <div className="flex items-start gap-2 rounded-2xl border border-red-300/60 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /><div><p>{msg.content}</p>
              <button onClick={onRegen} className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-current px-2.5 py-1 font-medium"><RefreshCw size={14} />Retry</button></div>
          </div>
        ) : !msg.content ? (
          <div className="dots py-3 text-zinc-500"><span /><span /><span /></div>
        ) : (
          <div className="prose prose-zinc max-w-none dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{msg.content}</ReactMarkdown>
          </div>
        )}
        {!msg.error && msg.content && (
          <div className={cn("mt-1 flex gap-0.5 transition", loading ? "invisible" : "md:opacity-0 md:group-hover:opacity-100")}>
            <button aria-label="Copy" className={act} onClick={async () => { await navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? <Check size={16} /> : <Copy size={16} />}</button>
            <button aria-label="Regenerate" className={act} onClick={onRegen}><RefreshCw size={16} /></button>
            <button aria-label="Like" className={cn(act, msg.feedback === "like" && "text-indigo-500")} onClick={() => onFeedback("like")}><ThumbsUp size={16} /></button>
            <button aria-label="Dislike" className={cn(act, msg.feedback === "dislike" && "text-indigo-500")} onClick={() => onFeedback("dislike")}><ThumbsDown size={16} /></button>
          </div>
        )}
      </div>
    </div>
  );
}

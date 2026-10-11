"use client";
import { Sparkles } from "lucide-react";

const CARDS = [
  { e: "💡", t: "Brainstorm", p: "Help me generate ideas" },
  { e: "💻", t: "Build", p: "Help me create something" },
  { e: "📚", t: "Learn", p: "Explain something to me" },
  { e: "✍️", t: "Create", p: "Help me write something" },
];
const CHIPS = ["Explain quantum computing simply", "Help me build a website", "Give me project ideas", "Analyze this concept"];

export default function WelcomeScreen({ onPick }: { onPick: (p: string) => void }) {
  return (
    <div className="fade-up mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"><Sparkles size={26} /></div>
      <h1 className="text-4xl font-semibold tracking-tight">Mindly AI</h1>
      <p className="mt-2 text-zinc-500 dark:text-zinc-400">Your AI workspace for thinking, creating and exploring.</p>
      <h2 className="mb-6 mt-10 text-xl font-medium">How can I help you today?</h2>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {CARDS.map((c) => (
          <button key={c.t} onClick={() => onPick(c.p)} className="group rounded-2xl border border-zinc-200 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-indigo-400/60 hover:shadow-lg dark:border-white/10 dark:hover:bg-white/5">
            <div className="text-xl transition group-hover:scale-110">{c.e}</div>
            <div className="mt-2 font-medium">{c.t}</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{c.p}</div>
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {CHIPS.map((c) => <button key={c} onClick={() => onPick(c)} className="rounded-full border border-zinc-200 px-3.5 py-1.5 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/10">{c}</button>)}
      </div>
    </div>
  );
}

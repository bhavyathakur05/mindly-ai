"use client";
import { useEffect, useRef } from "react";
import { PanelLeft } from "lucide-react";
import type { Att, Chat } from "@/lib/storage";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import ModelSelector from "./ModelSelector";
import WelcomeScreen from "./WelcomeScreen";

type P = {
  chat: Chat | null; busy: boolean; model: string;
  onModel: (m: string) => void; onMenu: () => void;
  onSend: (t: string, a: Att[]) => void; onStop: () => void;
  onRegen: (id: string) => void; onFeedback: (id: string, f: "like" | "dislike") => void;
};

export default function ChatWindow({ chat, busy, model, onModel, onMenu, onSend, onStop, onRegen, onFeedback }: P) {
  const end = useRef<HTMLDivElement>(null);
  const msgs = chat?.messages ?? [];
  const last = msgs[msgs.length - 1];
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs.length, last?.content]);

  return (
    <main className="flex h-dvh min-w-0 flex-1 flex-col">
      <header className="flex items-center gap-1 px-3 py-2">
        <button aria-label="Toggle sidebar" onClick={onMenu} className="grid size-9 place-items-center rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10"><PanelLeft size={18} /></button>
        <ModelSelector value={model} onChange={onModel} />
      </header>
      <div className="flex-1 overflow-y-auto">
        {msgs.length === 0 ? <WelcomeScreen onPick={(p) => onSend(p, [])} /> : (
          <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
            {msgs.map((m) => (
              <ChatMessage key={m.id} msg={m} loading={busy && m === last} onRegen={() => onRegen(m.id)} onFeedback={(f) => onFeedback(m.id, f)} />
            ))}
            <div ref={end} />
          </div>
        )}
      </div>
      <ChatInput busy={busy} onSend={onSend} onStop={onStop} />
    </main>
  );
}

// Persistence layer. Replace these four functions to move to a database/API later.
export type Att = { name: string; type: string; data?: string }; // data = data URL (images only)
export type Msg = { id: string; role: "user" | "assistant"; content: string; atts?: Att[]; error?: boolean; feedback?: "like" | "dislike" };
export type Chat = { id: string; title: string; messages: Msg[]; updated: number };
export type Settings = { theme: "light" | "dark" | "system"; model: string };

export const MODELS = [
  { id: "fast", name: "Mindly Fast", desc: "Quick answers" },
  { id: "smart", name: "Mindly Smart", desc: "Balanced quality" },
  { id: "reasoning", name: "Mindly Reasoning", desc: "Hard problems" },
];
export const DEFAULT_SETTINGS: Settings = { theme: "system", model: "smart" };

const CHATS = "mindly.chats", SET = "mindly.settings";
const read = <T,>(k: string, fb: T): T => { try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : fb; } catch { return fb; } };

export const loadChats = () => read<Chat[]>(CHATS, []);
export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(SET, {}) });
export const saveSettings = (s: Settings) => localStorage.setItem(SET, JSON.stringify(s));
export const saveChats = (chats: Chat[]) => {
  // Image data is dropped when persisting to stay under the localStorage quota.
  const slim = chats.map((c) => ({ ...c, messages: c.messages.map((m) => ({ ...m, atts: m.atts?.map(({ name, type }) => ({ name, type })) })) }));
  try { localStorage.setItem(CHATS, JSON.stringify(slim)); } catch { /* quota exceeded */ }
};

// Provider layer (server-only): Google Gemini. Returns a stream of plain text.
import type { Att } from "./storage";

export type ChatInput = { role: "user" | "assistant"; content: string; atts?: Att[] };
class ApiError extends Error { constructor(m: string, public status = 500) { super(m); } }

const modelFor = (tier: string) =>
  process.env[`AI_MODEL_${tier.toUpperCase()}`] || process.env.AI_MODEL || "gemini-3.5-flash-lite";

export async function streamChat(messages: ChatInput[], tier: string) {
  const key = process.env.AI_API_KEY;
  if (!key) throw new ApiError("AI_API_KEY is not set. Add it to .env.local and restart `npm run dev`.");

  const contents = messages.map((m) => {
    const parts: object[] = (m.atts ?? []).filter((a) => a.data?.startsWith("data:image/")).map((a) => {
      const [meta, data] = a.data!.split(",");
      return { inlineData: { mimeType: meta.slice(5, meta.indexOf(";")), data } };
    });
    const files = (m.atts ?? []).filter((a) => !a.data).map((a) => a.name);
    parts.push({ text: (m.content || "") + (files.length ? `\n[Attached files: ${files.join(", ")}]` : "") || "See attached." });
    return { role: m.role === "assistant" ? "model" : "user", parts };
  });

  const up = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelFor(tier)}:streamGenerateContent?alt=sse`,
    {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You are Mindly AI, a helpful, concise assistant. Reply in Markdown." }] },
        contents,
      }),
    }
  );
  if (!up.ok || !up.body) throw new ApiError(`Provider error (${up.status}): ${(await up.text()).slice(0, 200)}`, up.status);

  const dec = new TextDecoder(), enc = new TextEncoder();
  let buf = "";
  return up.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) {
      buf += dec.decode(chunk, { stream: true });
      const lines = buf.split("\n"); buf = lines.pop()!;
      for (const l of lines) {
        if (!l.startsWith("data: ")) continue;
        try {
          const j = JSON.parse(l.slice(6));
          for (const p of j.candidates?.[0]?.content?.parts ?? []) if (p.text) ctl.enqueue(enc.encode(p.text));
        } catch { /* partial line */ }
      }
    },
  }));
}
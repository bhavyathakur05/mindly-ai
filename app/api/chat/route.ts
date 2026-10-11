import { streamChat, type ChatInput } from "@/lib/ai";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, model } = (await req.json()) as { messages: ChatInput[]; model: string };
    if (!Array.isArray(messages) || !messages.length) return Response.json({ error: "No messages provided." }, { status: 400 });
    const stream = await streamChat(messages, model || "smart");
    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" } });
  } catch (e) {
    const err = e as Error & { status?: number };
    return Response.json({ error: err.message }, { status: err.status ?? 500 });
  }
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { respond } from "@/server/assistant";
import { allowRequest } from "@/server/assistant/rate-limit";

export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 12_000;

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(600) }))
    .min(1)
    .max(12),
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowRequest(ip)) {
    return NextResponse.json({ code: "rate_limited", message: "Too many messages. Please wait a minute." }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ code: "invalid_request", message: "Request too large." }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ code: "invalid_request", message: "Invalid JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || parsed.data.messages[parsed.data.messages.length - 1].role !== "user") {
    return NextResponse.json({ code: "invalid_request", message: "Send up to 12 messages of at most 600 characters, ending with a user message." }, { status: 400 });
  }

  const reply = await respond(parsed.data.messages);
  return NextResponse.json({ reply });
}

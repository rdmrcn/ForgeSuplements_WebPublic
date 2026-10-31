import { answerLocally, type EngineDeps } from "./engine";
import { getLlmConfig, phraseWithLlm } from "./llm";
import type { AssistantReply, ChatMessage } from "./types";

export type { AssistantReply, ChatMessage } from "./types";

export async function respond(messages: ChatMessage[], deps: EngineDeps = {}): Promise<AssistantReply> {
  const local = await answerLocally(messages, deps);
  const config = getLlmConfig();
  if (!config) return local;
  try {
    const text = await phraseWithLlm(config, messages, local);
    return text ? { ...local, text, source: "ai" } : local;
  } catch (error) {
    console.warn("[assistant] LLM unavailable, using built-in answers.", error instanceof Error ? error.message : error);
    return local;
  }
}

export type Lang = "en" | "tr";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantLink {
  label: string;
  href: string;
}

export type Intent =
  | "greeting"
  | "order"
  | "shipping-countries"
  | "shipping-country"
  | "delivery-time"
  | "shipping-cost"
  | "product"
  | "products"
  | "goal"
  | "guide"
  | "discount"
  | "payment"
  | "returns"
  | "human"
  | "medical"
  | "unknown";

export interface AssistantReply {
  text: string;
  links: AssistantLink[];
  suggestions: string[];
  intent: Intent;
  language: Lang;
  /** "rules" = answered from store data by the built-in engine, "ai" = phrased by a configured language model. */
  source: "rules" | "ai";
}

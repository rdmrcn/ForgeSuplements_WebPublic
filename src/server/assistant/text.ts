import type { ChatMessage, Lang } from "./types";

/** Lower-cases, strips diacritics (including Turkish dotless i) and turns punctuation into spaces. */
export function fold(input: string): string {
  return input
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True if any needle starts a word in the (folded) text. Handles Turkish suffixes: "ulkelere" matches "ulke". */
export function has(text: string, needles: string[]): boolean {
  return needles.some((n) => new RegExp(`(?:^| )${escape(fold(n))}`).test(text));
}

/** True if any needle appears as a whole word. */
export function hasWord(text: string, words: string[]): boolean {
  return words.some((w) => new RegExp(`(?:^| )${escape(fold(w))}(?: |$)`).test(text));
}

const TR_MARKERS = [
  "merhaba", "selam", "nasil", "icin", "hangi", "siparis", "siparisim", "kargo", "kargom", "kac", "gun", "ulke",
  "ulkelere", "mi", "mu", "nedir", "bana", "lutfen", "ne", "zaman", "fiyat", "var", "yok", "teslimat",
  "tesekkurler", "ulasir", "ulasacak", "ne", "isler", "kullanilir", "indirim", "odeme", "iade", "stok", "mi",
];
const EN_MARKERS = [
  "the", "is", "what", "how", "when", "where", "which", "do", "does", "can", "ship", "order", "my", "for", "to",
  "you", "are", "i", "hello", "hi", "thanks", "price", "much", "many", "will", "it",
];

function score(text: string, markers: string[]): number {
  const words = new Set(text.split(" "));
  return markers.reduce((n, m) => n + (words.has(m) ? 1 : 0), 0);
}

export function detectLanguage(messages: ChatMessage[]): Lang {
  const users = messages.filter((m) => m.role === "user").reverse();
  for (const m of users) {
    if (/[çğıöşüÇĞİÖŞÜ]/.test(m.content)) return "tr";
    const folded = fold(m.content);
    const tr = score(folded, TR_MARKERS);
    const en = score(folded, EN_MARKERS);
    if (tr > en) return "tr";
    if (en > tr) return "en";
  }
  return "en";
}

export const ORDER_ID_PATTERN = /FRG-DEMO-[A-Z0-9]{10}/i;
export const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

/** Finds an order id and email anywhere in the user's messages, newest first. */
export function extractOrderCredentials(messages: ChatMessage[]): { orderId?: string; email?: string } {
  let orderId: string | undefined;
  let email: string | undefined;
  for (const m of [...messages].reverse()) {
    if (m.role !== "user") continue;
    orderId ??= m.content.match(ORDER_ID_PATTERN)?.[0].toUpperCase();
    email ??= m.content.match(EMAIL_PATTERN)?.[0].toLowerCase();
  }
  return { orderId, email };
}

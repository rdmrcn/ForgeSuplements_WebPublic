"use client";

import { clsx } from "clsx";
import { Bot, Loader2, MessageCircle, PackageSearch, Send, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { brand } from "@/config/brand";

export const HELPDESK_OPEN_EVENT = "forge:helpdesk-open";

export function openHelpDesk(prompt?: string) {
  window.dispatchEvent(new CustomEvent(HELPDESK_OPEN_EVENT, { detail: { prompt } }));
}

interface Reply {
  text: string;
  links: { label: string; href: string }[];
  suggestions: string[];
  source: "rules" | "ai";
  language: "en" | "tr";
}

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  reply?: Reply;
  error?: boolean;
}

const copy = {
  en: {
    title: `${brand.name} help desk`,
    subtitle: "Automated assistant for this demo store",
    welcome: `Hi, I'm the ${brand.name} help desk assistant. I can estimate when an order arrives, tell you which countries we ship to, and explain what each supplement is commonly used for.`,
    placeholder: "Ask about orders, shipping or products",
    send: "Send message",
    track: "Track an order",
    orderNo: "Order number",
    email: "Checkout email",
    check: "Check delivery",
    thinking: "Looking that up",
    failed: "I couldn't reach the help desk. Please try again.",
    limited: "You're sending messages quickly. Please wait a minute and try again.",
    disclaimer: "Automated answers from this store's demo data. No medical advice.",
    rules: "Answered from store data",
    ai: "Phrased by an AI model from store data",
    close: "Close help desk",
    open: "Open help desk",
    suggestions: ["Which countries do you ship to?", "Which supplement is for muscle gain?", "How long does delivery take?", "Any discount codes?"],
  },
  tr: {
    title: `${brand.name} yardım masası`,
    subtitle: "Bu demo mağaza için otomatik asistan",
    welcome: `Merhaba, ben ${brand.name} yardım masası asistanıyım. Siparişin ne zaman ulaşır tahmin edebilir, hangi ülkelere gönderim yaptığımızı söyleyebilir ve her takviyenin genelde ne için kullanıldığını anlatabilirim.`,
    placeholder: "Sipariş, kargo ya da ürünleri sor",
    send: "Mesajı gönder",
    track: "Siparişimi sorgula",
    orderNo: "Sipariş numarası",
    email: "Ödemede kullandığın e-posta",
    check: "Teslimatı kontrol et",
    thinking: "Bakıyorum",
    failed: "Yardım masasına ulaşamadım. Lütfen tekrar dene.",
    limited: "Çok hızlı mesaj gönderiyorsun. Lütfen bir dakika bekleyip tekrar dene.",
    disclaimer: "Bu mağazanın demo verisinden otomatik yanıtlar. Tıbbi tavsiye değildir.",
    rules: "Mağaza verisinden yanıtlandı",
    ai: "Mağaza verisinden yapay zeka ile ifade edildi",
    close: "Yardım masasını kapat",
    open: "Yardım masasını aç",
    suggestions: ["Hangi ülkelere gönderim var?", "Kas yapmak için hangi ürün?", "Teslimat kaç gün sürer?", "İndirim kodu var mı?"],
  },
} as const;

type Lang = keyof typeof copy;

function BotText({ text }: { text: string }) {
  const blocks: ({ type: "p"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("- ")) {
      const last = blocks[blocks.length - 1];
      if (last?.type === "ul") last.items.push(line.slice(2));
      else blocks.push({ type: "ul", items: [line.slice(2)] });
    } else if (line.trim()) {
      blocks.push({ type: "p", text: line });
    }
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.type === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="space-y-1 pl-4 [&>li]:list-disc [&>li]:marker:text-ember">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}

export function HelpDesk() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [trackOpen, setTrackOpen] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [orderEmail, setOrderEmail] = useState("");
  const nextId = useRef(1);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const messagesRef = useRef<Message[]>([]);
  const t = copy[lang];

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const ensureWelcome = useCallback(() => {
    setMessages((current) => {
      if (current.length > 0) return current;
      const l: Lang = navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en";
      setLang(l);
      return [
        {
          id: 0,
          role: "assistant",
          text: copy[l].welcome,
          reply: { text: copy[l].welcome, links: [], suggestions: [...copy[l].suggestions], source: "rules", language: l },
        },
      ];
    });
  }, []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, 500);
      if (!text || pending) return;
      const userMessage: Message = { id: nextId.current++, role: "user", text };
      const history = [...messagesRef.current, userMessage].filter((m) => !m.error);
      setMessages((m) => [...m, userMessage]);
      setDraft("");
      setPending(true);
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-10).map((m) => ({ role: m.role, content: m.text.slice(0, 600) })) }),
        });
        if (res.status === 429) throw new Error("limited");
        if (!res.ok) throw new Error("failed");
        const data = (await res.json()) as { reply: Reply };
        setLang(data.reply.language);
        setMessages((m) => [...m, { id: nextId.current++, role: "assistant", text: data.reply.text, reply: data.reply }]);
      } catch (error) {
        const limited = error instanceof Error && error.message === "limited";
        setMessages((m) => [...m, { id: nextId.current++, role: "assistant", text: limited ? t.limited : t.failed, error: true }]);
      } finally {
        setPending(false);
      }
    },
    [pending, t.failed, t.limited],
  );

  const sendRef = useRef(send);
  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  useEffect(() => {
    function onOpen(event: Event) {
      const prompt = (event as CustomEvent<{ prompt?: string }>).detail?.prompt;
      ensureWelcome();
      setOpen(true);
      if (prompt) window.setTimeout(() => void sendRef.current(prompt), 50);
    }
    window.addEventListener(HELPDESK_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(HELPDESK_OPEN_EVENT, onOpen);
  }, [ensureWelcome]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTo({ top: el.scrollHeight });
  }, [messages, pending, open]);

  const close = useCallback(() => {
    setOpen(false);
    launcher.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === "assistant")?.id;

  return (
    <>
      <button
        ref={launcher}
        type="button"
        onClick={() => {
          ensureWelcome();
          setOpen(true);
        }}
        aria-label={t.open}
        aria-expanded={open}
        aria-controls="helpdesk-panel"
        data-testid="helpdesk-launcher"
        className={clsx(
          "fixed bottom-4 right-4 z-[60] inline-flex h-12 items-center gap-2 bg-ink pl-4 pr-5 text-[0.8125rem] font-semibold uppercase tracking-[0.1em] text-bone shadow-[var(--shadow-soft)] transition-[background-color,color,transform] hover:bg-ember hover:text-ink sm:bottom-6 sm:right-6",
          open && "pointer-events-none translate-y-2 opacity-0",
        )}
        tabIndex={open ? -1 : 0}
      >
        <MessageCircle className="size-5" aria-hidden />
        Help
      </button>

      {open && (
        <section
          id="helpdesk-panel"
          role="dialog"
          aria-label={t.title}
          data-testid="helpdesk-panel"
          className="fixed inset-x-2 bottom-2 z-[70] flex h-[min(42rem,calc(100dvh-5rem))] flex-col border border-ink bg-bone text-ink shadow-[0_20px_60px_-12px_rgb(0_0_0/0.45)] [animation:rise_0.35s_var(--ease-out-expo)_both] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[26rem]"
        >
          <header className="flex shrink-0 items-center gap-3 bg-ink px-4 py-3 text-bone">
            <span className="inline-flex size-9 items-center justify-center bg-ember text-ink">
              <Bot className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="display text-xl leading-none">{t.title}</h2>
              <p className="mt-1 truncate text-xs text-bone/65">{t.subtitle}</p>
            </div>
            <button type="button" onClick={close} aria-label={t.close} className="inline-flex size-10 items-center justify-center hover:bg-bone/10">
              <X className="size-5" aria-hidden />
            </button>
          </header>

          <div ref={log} role="log" aria-label="Conversation" aria-live="polite" data-testid="helpdesk-messages" className="flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[0.9375rem] leading-relaxed">
            {messages.map((m) => (
              <div key={m.id} className={clsx("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                <div
                  data-testid={m.role === "assistant" ? "helpdesk-message" : "helpdesk-user-message"}
                  role={m.error ? "alert" : undefined}
                  className={clsx(
                    "max-w-[92%] px-3.5 py-2.5",
                    m.role === "user" ? "bg-ink text-bone" : m.error ? "border border-[#c0392b]/40 bg-[#c0392b]/8" : "border border-line bg-white/70",
                  )}
                >
                  {m.role === "assistant" ? <BotText text={m.text} /> : m.text}
                </div>
                {m.reply && m.reply.links.length > 0 && (
                  <ul className="flex max-w-[92%] flex-wrap gap-1.5">
                    {m.reply.links.map((l) => (
                      <li key={l.href + l.label}>
                        <Link href={l.href} onClick={() => setOpen(false)} className="inline-block border border-ink px-2.5 py-1 text-xs font-semibold hover:bg-ink hover:text-bone">
                          {l.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {m.reply && m.id !== 0 && (
                  <p className="text-[0.6875rem] text-stone">{m.reply.source === "ai" ? t.ai : t.rules}</p>
                )}
                {m.reply && m.id === lastAssistantId && !pending && m.reply.suggestions.length > 0 && (
                  <ul className="flex max-w-full flex-wrap gap-1.5" aria-label="Suggested questions">
                    {m.reply.suggestions.map((s) => (
                      <li key={s}>
                        <button type="button" onClick={() => void send(s)} data-testid="helpdesk-suggestion" className="border border-line-strong bg-bone px-2.5 py-1 text-left text-xs hover:border-ink hover:bg-ink hover:text-bone">
                          {s}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {pending && (
              <p className="inline-flex items-center gap-2 text-sm text-stone" role="status" data-testid="helpdesk-pending">
                <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> {t.thinking}
              </p>
            )}
          </div>

          <div className="shrink-0 border-t border-line bg-bone p-3">
            {trackOpen ? (
              <form
                className="mb-3 space-y-2 border border-line bg-white/60 p-3"
                data-testid="helpdesk-track-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setTrackOpen(false);
                  void send(`Where is my order ${orderNo.trim()}? My checkout email is ${orderEmail.trim()}`);
                  setOrderNo("");
                  setOrderEmail("");
                }}
              >
                <label className="block text-xs font-semibold">
                  {t.orderNo}
                  <input value={orderNo} onChange={(e) => setOrderNo(e.target.value)} required pattern="FRG-DEMO-[A-Za-z0-9]{10}" placeholder="FRG-DEMO-ABC123XYZ0" autoComplete="off" className="mt-1 h-10 w-full border border-line-strong bg-white px-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember" />
                </label>
                <label className="block text-xs font-semibold">
                  {t.email}
                  <input type="email" value={orderEmail} onChange={(e) => setOrderEmail(e.target.value)} required autoComplete="email" className="mt-1 h-10 w-full border border-line-strong bg-white px-2.5 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember" />
                </label>
                <button type="submit" className="h-10 w-full bg-ink text-xs font-semibold uppercase tracking-[0.1em] text-bone hover:bg-ember hover:text-ink">
                  {t.check}
                </button>
              </form>
            ) : (
              <button type="button" onClick={() => setTrackOpen(true)} data-testid="helpdesk-track" className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold underline underline-offset-4 hover:text-ember">
                <PackageSearch className="size-4" aria-hidden /> {t.track}
              </button>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(draft);
              }}
              className="flex gap-2"
            >
              <label htmlFor="helpdesk-input" className="sr-only">{t.placeholder}</label>
              <input
                id="helpdesk-input"
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={500}
                autoComplete="off"
                placeholder={t.placeholder}
                data-testid="helpdesk-input"
                className="h-11 min-w-0 flex-1 border border-line-strong bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
              />
              <button type="submit" disabled={pending || !draft.trim()} aria-label={t.send} data-testid="helpdesk-send" className="inline-flex size-11 items-center justify-center bg-ink text-bone hover:bg-ember hover:text-ink disabled:opacity-40">
                <Send className="size-4" aria-hidden />
              </button>
            </form>
            <p className="mt-2 text-[0.6875rem] text-stone">{t.disclaimer}</p>
          </div>
        </section>
      )}
    </>
  );
}

export function HelpDeskLink({ children, prompt, className }: { children: React.ReactNode; prompt?: string; className?: string }) {
  return (
    <button type="button" onClick={() => openHelpDesk(prompt)} className={className}>
      {children}
    </button>
  );
}

import { useId, type ReactNode } from "react";
import { brand } from "@/config/brand";
import type { Product, Variant } from "@/domain/types";

const BODIES = {
  black: { base: "#0e0e0d", lid: "#1c1c1a", text: "#f4f0e8", sub: "#a39d91", shade: 1 },
  bone: { base: "#e9e3d5", lid: "#161615", text: "#161615", sub: "#6e685d", shade: 0.5 },
  charcoal: { base: "#242423", lid: "#0e0e0d", text: "#f4f0e8", sub: "#aaa498", shade: 0.9 },
  umber: { base: "#2b1e16", lid: "#14100d", text: "#f4f0e8", sub: "#b2a590", shade: 1 },
  slate: { base: "#161c20", lid: "#0a0d0f", text: "#f4f0e8", sub: "#9aa6ad", shade: 1 },
} as const;

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

const contrastOn = (hex: string) => (luminance(hex) > 0.36 ? "#0b0b0a" : "#f4f0e8");

function fit(text: string, width: number, max: number): number {
  return Math.min(max, Math.floor(width / (Math.max(text.length, 1) * 0.5)));
}

function layoutLabel(top: number, lines: [string, string?], size: number) {
  let y = top + 14;
  const mark = y + 8;
  y += 26;
  const ruleY = y;
  y += 14;
  const nameLines = lines.filter((l): l is string => Boolean(l)).map((text) => {
    const fontSize = Math.max(size, 22);
    y += fontSize * 0.86;
    const line = { text, size: fontSize, y };
    y += 6;
    return line;
  });
  return { mark, ruleY, nameLines, descY: y + 12 };
}

interface Props {
  product: Product;
  variant?: Variant;
  className?: string;
  /** Hide the floor shadow, for use over busy backgrounds. */
  bare?: boolean;
}

/**
 * Original packaging render, drawn as inline SVG from catalog data. Every pack is
 * generated from the same system (wordmark, label grid, flavour band, weight line)
 * with different silhouettes per product format.
 */
export function PackShot({ product, variant, className, bare }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const v = variant ?? product.variants.find((x) => x.id === product.defaultVariantId) ?? product.variants[0];
  const art = product.pack;
  const body = BODIES[art.body];
  const accent = art.flavorDriven && v.flavorHex ? v.flavorHex : art.accent;
  const accentText = contrastOn(accent);
  const kind = art.kind;

  const font = { fontFamily: "var(--font-display), 'Arial Narrow', sans-serif", fontWeight: 800 } as const;
  const mono = { fontFamily: "var(--font-geist-mono), monospace" } as const;

  const geometry = {
    tub: { left: 118, right: 282, top: 150, bottom: 430, max: 62 },
    pouch: { left: 118, right: 282, top: 118, bottom: 430, max: 66 },
    bottle: { left: 134, right: 266, top: 214, bottom: 436, max: 40 },
    jar: { left: 128, right: 272, top: 206, bottom: 428, max: 46 },
  }[kind];

  const width = geometry.right - geometry.left;
  const sizes = art.lines.filter(Boolean).map((l) => fit(l!, width, geometry.max));
  const uniform = art.lines.filter(Boolean).length > 1 ? Math.min(...sizes) : sizes[0];

  const { mark, ruleY, nameLines, descY } = layoutLabel(geometry.top, art.lines, uniform);
  const chipH = 26;
  const chipY = geometry.bottom - 56;
  const weightY = geometry.bottom - 14;
  const flavor = v.flavor ?? "";
  const meta = [v.size.toUpperCase(), v.servings && kind !== "jar" && kind !== "bottle" ? `${v.servings} SERVINGS` : null]
    .filter(Boolean)
    .join("  ·  ");

  const label = (
    <g>
      <text x={geometry.left} y={mark} fill={body.text} style={{ ...font, letterSpacing: 4 }} fontSize={20}>
        {brand.name}
      </text>
      <rect x={geometry.right - 14} y={mark - 14} width={14} height={14} fill={accent} />
      <rect x={geometry.left} y={ruleY} width={width} height={1.5} fill={accent} />
      {nameLines.map((l) => (
        <text key={l.text} x={geometry.left - 1} y={l.y} fill={body.text} fontSize={l.size} style={{ ...font, letterSpacing: -0.5 }}>
          {l.text}
        </text>
      ))}
      <text x={geometry.left} y={descY} fill={body.sub} fontSize={7.5} style={{ ...mono, letterSpacing: 1.2 }}>
        {art.descriptor.toUpperCase()}
      </text>
      {flavor ? (
        <g>
          <rect x={geometry.left} y={chipY} width={width} height={chipH} fill={accent} />
          <text
            x={geometry.left + 9}
            y={chipY + 17}
            fill={accentText}
            fontSize={Math.min(15, fit(flavor.toUpperCase(), width - 18, 15) + 2)}
            style={{ ...font, letterSpacing: 1.5 }}
          >
            {flavor.toUpperCase()}
          </text>
        </g>
      ) : (
        <rect x={geometry.left} y={chipY + chipH - 3} width={width} height={3} fill={accent} />
      )}
      <text x={geometry.left} y={weightY} fill={body.text} fontSize={9} style={{ ...mono, letterSpacing: 1.4 }}>
        {meta}
      </text>
    </g>
  );

  const shade = (o: number) => o * body.shade;
  const defs = (
    <defs>
      <linearGradient id={`${uid}s`} x1="0" x2="1" y1="0" y2="0">
        <stop offset="0" stopColor="#000" stopOpacity={shade(0.62)} />
        <stop offset="0.1" stopColor="#000" stopOpacity={shade(0.2)} />
        <stop offset="0.27" stopColor="#fff" stopOpacity={0.2 * (art.body === "bone" ? 0.8 : 1)} />
        <stop offset="0.4" stopColor="#fff" stopOpacity={0.05} />
        <stop offset="0.72" stopColor="#000" stopOpacity={shade(0.1)} />
        <stop offset="0.93" stopColor="#000" stopOpacity={shade(0.42)} />
        <stop offset="1" stopColor="#000" stopOpacity={shade(0.68)} />
      </linearGradient>
      <linearGradient id={`${uid}v`} x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
        <stop offset="0.15" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.85" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.28" />
      </linearGradient>
      <filter id={`${uid}b`} x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur stdDeviation="7" />
      </filter>
      <clipPath id={`${uid}c`}>
        {kind === "pouch" ? (
          <path d="M96 70 Q94 130 85 210 Q77 310 85 408 Q87 438 98 456 L302 456 Q313 438 315 408 Q323 310 315 210 Q306 130 304 70 Z" />
        ) : kind === "bottle" ? (
          <path d="M172 118 C172 150 118 150 118 196 L118 436 Q118 454 136 454 L264 454 Q282 454 282 436 L282 196 C282 150 228 150 228 118 Z" />
        ) : kind === "jar" ? (
          <path d="M112 186 H288 Q292 186 292 192 V424 Q292 448 268 448 H132 Q108 448 108 424 V192 Q108 186 112 186 Z" />
        ) : (
          <path d="M90 128 H310 V416 Q310 442 284 442 H116 Q90 442 90 416 Z" />
        )}
      </clipPath>
    </defs>
  );

  const overlay = (
    <g clipPath={`url(#${uid}c)`} pointerEvents="none">
      <rect x="60" y="40" width="280" height="440" fill={`url(#${uid}s)`} />
      <rect x="60" y="40" width="280" height="440" fill={`url(#${uid}v)`} />
    </g>
  );

  const ridges = (x0: number, x1: number, y0: number, y1: number, step = 7) =>
    Array.from({ length: Math.floor((x1 - x0) / step) }, (_, i) => (
      <line key={i} x1={x0 + i * step + 4} x2={x0 + i * step + 4} y1={y0 + 5} y2={y1 - 5} stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />
    ));

  let silhouette: ReactNode;
  if (kind === "tub") {
    silhouette = (
      <g>
        <path d="M90 128 H310 V416 Q310 442 284 442 H116 Q90 442 90 416 Z" fill={body.base} />
        <rect x="90" y="128" width="220" height="5" fill={accent} />
        {label}
        <g>
          <rect x="82" y="58" width="236" height="74" rx="11" fill={body.lid} />
          {ridges(82, 318, 58, 132)}
          <rect x="82" y="58" width="236" height="6" rx="3" fill="#fff" fillOpacity="0.1" />
          <rect x="82" y="122" width="236" height="10" fill="#000" fillOpacity="0.25" />
        </g>
        {overlay}
        <rect x="82" y="58" width="236" height="74" rx="11" fill={`url(#${uid}s)`} />
      </g>
    );
  } else if (kind === "pouch") {
    silhouette = (
      <g>
        <path d="M96 70 Q94 130 85 210 Q77 310 85 408 Q87 438 98 456 L302 456 Q313 438 315 408 Q323 310 315 210 Q306 130 304 70 Z" fill={body.base} />
        <rect x="90" y="56" width="220" height="40" fill={body.lid} />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1="92" x2="308" y1={62 + i * 4} y2={62 + i * 4} stroke="#fff" strokeOpacity="0.1" />
        ))}
        <path d="M168 56 L200 74 L232 56" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="1.5" />
        <rect x="90" y="96" width="220" height="3" fill={accent} />
        {label}
        <rect x="92" y="440" width="216" height="18" fill={body.lid} />
        {Array.from({ length: 5 }, (_, i) => (
          <line key={i} x1="94" x2="306" y1={444 + i * 3.4} y2={444 + i * 3.4} stroke="#fff" strokeOpacity="0.09" />
        ))}
        {[ [110, 230, 150, 262], [296, 150, 262, 200], [120, 330, 170, 360], [300, 300, 250, 330] ].map(([x1, y1, x2, y2], i) => (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeOpacity="0.05" strokeWidth="2" />
        ))}
        {overlay}
      </g>
    );
  } else if (kind === "bottle") {
    silhouette = (
      <g>
        <path d="M172 118 C172 150 118 150 118 196 L118 436 Q118 454 136 454 L264 454 Q282 454 282 436 L282 196 C282 150 228 150 228 118 Z" fill={body.base} />
        <g clipPath={`url(#${uid}c)`}>
          <rect x="110" y="120" width="180" height="96" fill={accent} fillOpacity="0.82" />
          <rect x="110" y="120" width="180" height="26" fill="#000" fillOpacity="0.22" />
          <rect x="110" y="430" width="180" height="26" fill={accent} fillOpacity="0.4" />
        </g>
        <rect x="118" y={geometry.top - 10} width="164" height={geometry.bottom - geometry.top + 14} fill={body.base} />
        <rect x="118" y={geometry.top - 10} width="164" height="3" fill={accent} />
        {label}
        <rect x="172" y="84" width="56" height="38" fill="#0e0e0d" />
        <rect x="160" y="40" width="80" height="50" rx="8" fill="#0e0e0d" />
        {ridges(160, 240, 40, 90, 6)}
        <rect x="160" y="40" width="80" height="5" rx="2.5" fill="#fff" fillOpacity="0.14" />
        <rect x="160" y="84" width="80" height="6" fill={accent} />
        {overlay}
        <rect x="160" y="40" width="80" height="50" rx="8" fill={`url(#${uid}s)`} />
      </g>
    );
  } else {
    const cap = art.body === "bone" ? "#161615" : art.accent;
    silhouette = (
      <g>
        <path d="M112 186 H288 Q292 186 292 192 V424 Q292 448 268 448 H132 Q108 448 108 424 V192 Q108 186 112 186 Z" fill={body.base} />
        {label}
        <rect x="104" y="116" width="192" height="74" rx="10" fill={cap} />
        {ridges(104, 296, 116, 190, 6.4)}
        <rect x="104" y="116" width="192" height="6" rx="3" fill="#fff" fillOpacity="0.2" />
        <rect x="104" y="182" width="192" height="8" fill="#000" fillOpacity="0.28" />
        {overlay}
        <rect x="104" y="116" width="192" height="74" rx="10" fill={`url(#${uid}s)`} />
      </g>
    );
  }

  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role="img"
      aria-label={`${product.title}${flavor && !product.title.includes(flavor) ? `, ${flavor}` : ""}, ${v.size} pack. Illustrative original packaging render.`}
      preserveAspectRatio="xMidYMid meet"
    >
      {defs}
      {!bare && <ellipse cx="200" cy="452" rx={kind === "bottle" ? 110 : 138} ry="13" fill="#000" fillOpacity="0.42" filter={`url(#${uid}b)`} />}
      {silhouette}
    </svg>
  );
}

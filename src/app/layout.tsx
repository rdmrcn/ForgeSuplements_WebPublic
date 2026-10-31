import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import type { CSSProperties } from "react";
import { brand } from "@/config/brand";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { HelpDesk } from "@/components/help/help-desk";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { StoreHydrator } from "@/components/layout/store-hydrator";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const shoulders = Big_Shoulders({ variable: "--font-shoulders", subsets: ["latin", "latin-ext"], weight: ["700", "800", "900"] });
const instrument = Instrument_Serif({ variable: "--font-instrument", subsets: ["latin"], weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  openGraph: {
    type: "website",
    siteName: brand.name,
    title: `${brand.name} | ${brand.tagline}`,
    description: brand.description,
    locale: "en_IE",
  },
  twitter: { card: "summary_large_image", title: brand.name, description: brand.description },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: brand.colors.ink,
  width: "device-width",
  initialScale: 1,
};

const brandVars = {
  "--brand-ink": brand.colors.ink,
  "--brand-charcoal": brand.colors.charcoal,
  "--brand-graphite": brand.colors.graphite,
  "--brand-bone": brand.colors.bone,
  "--brand-sand": brand.colors.sand,
  "--brand-stone": brand.colors.stone,
  "--brand-accent": brand.colors.accent,
} as CSSProperties;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={brand.locale}
      style={brandVars}
      className={`${geistSans.variable} ${geistMono.variable} ${shoulders.variable} ${instrument.variable}`}
    >
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:bg-ember focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        <StoreHydrator />
        <AnnouncementBar />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <CartDrawer />
        <HelpDesk />
        <Toaster />
      </body>
    </html>
  );
}

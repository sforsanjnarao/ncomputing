import type { Metadata } from "next";
import { Electrolize, Roboto, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { WebVitals } from "./web-vitals";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VisitorTracker } from "@/components/visitor-tracker";
import { AutoLeadPrompt } from "@/components/auto-lead-prompt";

const electrolize = Electrolize({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-electrolize",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
});

export const metadata: Metadata = {
  title: {
    default: "NComputing India — one PC, many desktops",
    template: "%s · NComputing India",
  },
  description:
    "Run 2 to 30 independent desktops from a single PC or server. Cut hardware, electricity and maintenance costs by up to 75% across schools, colleges and small businesses in India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${electrolize.variable} ${roboto.variable} ${spaceMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans">
        <WebVitals />
        <VisitorTracker />
        <AutoLeadPrompt />
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

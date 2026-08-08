import type { Metadata } from "next";
import { Electrolize, Roboto, Space_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";
import { WebVitals } from "./web-vitals";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

// Electrolize is reserved for the big hero-level h1 titles only — a
// geometric, techy face used sparingly for impact. It ships one weight, so
// those headings lean on size and tracking rather than font-weight.
const electrolize = Electrolize({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-electrolize",
});

// Roboto carries subheadings, body copy and the rest of the UI (buttons,
// nav, forms) — readable at length, which the site's marketing paragraphs
// need more than a display face does.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

// Space Mono is reserved for numeric/data display — order numbers and price
// totals — where a monospaced face actually earns its place.
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
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}

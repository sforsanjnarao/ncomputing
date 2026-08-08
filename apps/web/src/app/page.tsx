import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowRight, Cpu, IndianRupee, Recycle, Wrench } from "lucide-react";
import { fetchFromApi } from "@/lib/api";
import type { Product } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { ProductCard } from "@/components/product-card";
import { LeadCta } from "@/components/lead-cta";

// Below the fold and interactive-only — its JS ships in a separate chunk
// instead of the initial homepage bundle.
const SavingsCalculator = dynamic(() =>
  import("@/components/savings-calculator").then((m) => m.SavingsCalculator),
);

const PAIN_POINTS = [
  {
    icon: IndianRupee,
    title: "Every seat costs a whole PC",
    body: "Thirty users means thirty processors, thirty disks and thirty Windows licences — most of them idle most of the day.",
  },
  {
    icon: Wrench,
    title: "Maintenance scales with machines",
    body: "One software update becomes thirty desk visits. One failed disk takes a student or a counter offline for a week.",
  },
  {
    icon: Cpu,
    title: "The power bill grows with the room",
    body: "A desktop PC draws around 110 watts. Thirty of them also heat a room that then has to be cooled.",
  },
  {
    icon: Recycle,
    title: "They all age at once",
    body: "Bought together, obsolete together. Four years later the entire bill arrives a second time.",
  },
];

export default async function HomePage() {
  const { products } = await fetchFromApi<{ products: Product[] }>("/products");

  return (
    <>
      {/* Hero — the whole proposition in one sentence, because this visitor has
          probably never heard the words "desktop virtualisation". */}
      <section className="hero-gradient border-b border-slate-200">
        <div className="container-page py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="eyebrow">Desktop virtualisation for India</p>
            <h1 className="heading-1 mt-3">
              One computer. Up to thirty people using it at the same time.
            </h1>
            <p className="lead mt-5">
              A modern PC is far more powerful than any one person needs.
              NComputing shares that power across many users, each with their
              own monitor, keyboard, mouse, files and desktop. Schools and small
              businesses across India use it to cut hardware, electricity and
              maintenance costs by half or more.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/products" size="lg">
                Check the products <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <LeadCta type="DEMO" label="Book a demo" variant="secondary" />
            </div>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-6 border-t border-slate-200 pt-8 sm:grid-cols-4">
            {[
              ["25,000+", "schools using NComputing"],
              ["12 million+", "daily users worldwide"],
              ["140+", "countries deployed in"],
              ["Up to 90%", "less electricity per seat"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="text-2xl font-semibold text-ink sm:text-3xl">
                  {value}
                </dt>
                <dd className="mt-1 text-sm text-slate-600">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Problem */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">The problem</p>
            <h2 className="heading-2 mt-3">
              A computer room is not one purchase. It is thirty of everything.
            </h2>
            <p className="lead mt-4">
              Most of what a lab or an office actually costs shows up after the
              invoice is paid.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PAIN_POINTS.map((point) => (
              <div
                key={point.title}
                className="rounded-2xl border border-slate-200 p-6"
              >
                <point.icon className="h-6 w-6 text-brand-700" />
                <h3 className="mt-4 font-semibold">{point.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {point.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator — the single most persuasive thing on the page for a buyer
          who thinks in rupees rather than in technology. */}
      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="mb-8 max-w-2xl">
            <p className="eyebrow">What it would cost you</p>
            <h2 className="heading-2 mt-3">
              Move the slider to your number of seats.
            </h2>
            <p className="lead mt-4">
              Compare buying one PC per person against sharing a few hosts.
              Every assumption is printed underneath so you can check it against
              your own quotes.
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </section>

      {/* Products */}
      <section className="section">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">Choose a product</p>
            <h2 className="heading-2 mt-3">
              Three ways to give someone a desktop.
            </h2>
            <p className="lead mt-4">
              They differ in one thing: where the desktop actually runs. Start
              with the one that matches your situation — each has a page
              explaining who it is for.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-ink">
        <div className="container-page flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-semibold text-white">
              Not sure which one fits your room?
            </h2>
            <p className="mt-2 text-slate-300">
              Tell us how many people need a computer and what they do all day.
              We will tell you honestly which product suits — including if the
              answer is none of them.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <LeadCta
              type="SALES"
              label="Talk to sales"
              className="bg-white text-ink hover:bg-slate-100"
            />
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center rounded-lg border border-white/25 px-6 text-base font-medium text-white hover:bg-white/10"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { fetchFromApi } from "@/lib/api";
import { WHY_CONTENT } from "@/content/why";
import type { Product } from "@/lib/types";
import { ButtonLink } from "@/components/ui/button";
import { LeadCta } from "@/components/lead-cta";

type PageProps = { params: { slug: string } };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const content = WHY_CONTENT[params.slug];
  if (!content) return { title: "Product" };
  return { title: `Why ${params.slug}`, description: content.problemTitle };
}

export default async function WhyPage({ params }: PageProps) {
  const content = WHY_CONTENT[params.slug];
  if (!content) notFound();

  const { product } = await fetchFromApi<{ product: Product }>(`/products/${params.slug}`);

  return (
    <>
      <section className="border-b border-slate-200 bg-white">
        <div className="container-page py-12 sm:py-16">
          <nav className="text-sm text-slate-500">
            <Link href="/products" className="hover:text-ink">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{product.name}</span>
          </nav>

          <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Who this is for</p>
              <p className="mt-2 text-lg font-medium text-ink">{content.audience}</p>
              <h1 className="heading-1 mt-6">{content.problemTitle}</h1>
              <p className="lead mt-5">{content.problemBody}</p>
            </div>
            <div className="shrink-0 text-7xl" aria-hidden>
              {product.imageEmoji}
            </div>
          </div>
        </div>
      </section>

      {/* Symptoms — named in the buyer's own language, not ours. If they
          recognise themselves here, the rest of the page is worth reading. */}
      <section className="section">
        <div className="container-page">
          <h2 className="heading-2">Does this sound familiar?</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {content.symptoms.map((symptom) => (
              <div key={symptom.title} className="rounded-2xl border border-slate-200 p-6">
                <div className="flex items-start gap-3">
                  <X className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <h3 className="font-semibold">{symptom.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{symptom.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">The fix</p>
            <h2 className="heading-2 mt-3">{content.solutionTitle}</h2>
            <p className="lead mt-4">{content.solutionBody}</p>
          </div>

          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {content.steps.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-white p-6 shadow-card">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="heading-2">Best for</h2>
            <ul className="mt-6 space-y-3">
              {content.bestFor.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-savings-600" />
                  <span className="text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Saying plainly when the product is wrong is what makes the rest of
              the page believable. */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold">When it is the wrong choice</h2>
            <p className="mt-3 leading-relaxed text-slate-700">{content.notFor}</p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
            >
              Compare all three products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-ink">
        <div className="container-page flex flex-col gap-6 py-14 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              Sounds right? Here are the specifications.
            </h2>
            <p className="mt-2 text-slate-300">
              Configure your {product.name}, choose a support plan and order it online.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={`/products/${product.slug}`} size="lg" className="bg-white text-ink hover:bg-slate-100">
              View specs &amp; buy <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <LeadCta
              type="DEMO"
              label="Book a demo first"
              productSlug={product.slug}
              className="border border-white/25 bg-transparent text-white hover:bg-white/10"
            />
          </div>
        </div>
      </section>
    </>
  );
}

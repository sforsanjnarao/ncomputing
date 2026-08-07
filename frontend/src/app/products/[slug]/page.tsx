import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, HelpCircle } from "lucide-react";
import { fetchFromApi } from "@/lib/api";
import { WHY_CONTENT } from "@/content/why";
import type { Product } from "@/lib/types";
import { ProductConfigurator } from "@/components/product-configurator";
import { LeadCta } from "@/components/lead-cta";

type PageProps = { params: { slug: string } };

async function getProduct(slug: string) {
  try {
    const { product } = await fetchFromApi<{ product: Product }>(`/products/${slug}`);
    return product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) return { title: "Product not found" };
  return { title: product.name, description: product.summary };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await getProduct(params.slug);
  if (!product) notFound();

  const hasWhyPage = Boolean(WHY_CONTENT[product.slug]);

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="text-sm text-slate-500">
        <Link href="/products" className="hover:text-ink">
          Products
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr,26rem]">
        <div>
          <div className="text-6xl" aria-hidden>
            {product.imageEmoji}
          </div>
          <h1 className="heading-1 mt-4">{product.name}</h1>
          <p className="mt-2 text-lg font-medium text-brand-700">{product.tagline}</p>
          <p className="lead mt-5">{product.summary}</p>

          {hasWhyPage && (
            <Link
              href={`/products/${product.slug}/why`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-800 hover:bg-brand-100"
            >
              <HelpCircle className="h-4 w-4" />
              New to this? Read what problem it solves first
            </Link>
          )}

          <div className="mt-10">
            <h2 className="heading-2 text-xl">Why people choose it</h2>
            <ul className="mt-4 space-y-3">
              {product.highlights.map((highlight) => (
                <li key={highlight} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-savings-600" />
                  <span className="text-slate-700">{highlight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <h2 className="heading-2 text-xl">Specifications</h2>
            <dl className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200">
              {Object.entries(product.specs).map(([label, value]) => (
                <div key={label} className="grid gap-1 p-4 sm:grid-cols-[12rem,1fr] sm:gap-4">
                  <dt className="text-sm font-medium text-slate-500">{label}</dt>
                  <dd className="text-sm text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-10 rounded-2xl bg-slate-50 p-6">
            <h2 className="font-semibold">Buying more than 25 devices?</h2>
            <p className="mt-2 text-sm text-slate-600">
              Larger deployments are usually quoted rather than bought online — we can size the
              host machines for you and include installation.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <LeadCta
                type="PRICING"
                label="Request a quote"
                variant="secondary"
                size="md"
                productSlug={product.slug}
              />
              <LeadCta
                type="DEMO"
                label="Book a demo"
                variant="ghost"
                size="md"
                productSlug={product.slug}
              />
            </div>
          </div>
        </div>

        <ProductConfigurator product={product} />
      </div>
    </div>
  );
}

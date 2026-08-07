import type { Metadata } from "next";
import Link from "next/link";
import { fetchFromApi } from "@/lib/api";
import { formatInr } from "@/lib/format";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { LeadCta } from "@/components/lead-cta";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Three NComputing thin clients for Indian schools and small businesses: RX420 for shared labs, RX300+ for adding single seats, RX-RDP+ for cloud desktops.",
};

const COMPARISON: { label: string; value: (product: Product) => string }[] = [
  { label: "Type", value: (p) => (p.type === "HARDWARE" ? "Hardware" : "Software") },
  { label: "Price", value: (p) => formatInr(p.amount) },
  { label: "Where the desktop runs", value: (p) => p.specifications["Works with"] ?? "On your own host PC" },
  { label: "Platform", value: (p) => p.specifications.Platform ?? "—" },
];

export default async function ProductsPage() {
  const { products } = await fetchFromApi<{ products: Product[] }>("/products");

  return (
    <>
      <section className="hero-gradient border-b border-slate-200">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-2xl">
            <p className="eyebrow">Products</p>
            <h1 className="heading-1 mt-3">Three products. One question decides it.</h1>
            <p className="lead mt-5">
              Where does the desktop run? On a host PC in your building, or in Microsoft&rsquo;s
              cloud? Answer that and the choice is almost made for you.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container-page">
          <div className="grid gap-6 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-16">
        <div className="container-page">
          <h2 className="heading-2">Side by side</h2>

          {/* Wide tables are the one thing that genuinely cannot reflow on a
              phone, so this one scrolls inside its own container. */}
          <div className="mt-6 -mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
            <table className="w-full min-w-[640px] border-collapse overflow-hidden rounded-xl bg-white text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="p-4 text-left font-medium text-slate-500">&nbsp;</th>
                  {products.map((product) => (
                    <th key={product.id} className="p-4 text-left">
                      <Link href={`/products/${product.slug}`} className="hover:text-brand-700">
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs font-normal text-slate-500">{product.tagline}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row) => (
                  <tr key={row.label} className="border-b border-slate-100 last:border-0">
                    <th className="p-4 text-left font-medium text-slate-500">{row.label}</th>
                    {products.map((product) => (
                      <td key={product.id} className="p-4 tabular-nums">
                        {row.value(product)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-600">Still not sure which one?</p>
            <LeadCta type="SALES" label="Ask us" variant="secondary" size="md" />
          </div>
        </div>
      </section>
    </>
  );
}

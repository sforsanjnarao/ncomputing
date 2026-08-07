import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { formatInr } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardBody className="flex flex-1 flex-col">
        <div className="text-4xl" aria-hidden>
          {product.imageEmoji}
        </div>

        <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-brand-700">{product.tagline}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{product.summary}</p>

        <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
          <Users className="h-4 w-4 text-slate-400" />
          {product.usersPerDevice} {product.usersPerDevice === 1 ? "user" : "users"} per device
        </div>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">Starting at</p>
          <p className="text-2xl font-semibold tabular-nums">{formatInr(product.priceInPaise)}</p>
          <p className="text-xs text-slate-500">
            {formatInr(Math.round(product.priceInPaise / product.usersPerDevice))} per seat, plus GST
          </p>
        </div>

        {/* The "why" page comes first on purpose: this buyer needs the problem
            framed before a spec sheet means anything to them. */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/products/${product.slug}/why`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800"
          >
            Why this one? <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium hover:bg-slate-50"
          >
            Specs &amp; buy
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

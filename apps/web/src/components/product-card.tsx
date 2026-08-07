import Link from "next/link";
import { ArrowRight, Monitor, Cloud } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const Icon = product.type === "HARDWARE" ? Monitor : Cloud;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardBody className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <Icon className="h-8 w-8 text-brand-700" aria-hidden />
          <Badge tone={product.type === "HARDWARE" ? "blue" : "green"}>
            {product.type === "HARDWARE" ? "Hardware" : "Software"}
          </Badge>
        </div>

        <h3 className="mt-4 text-lg font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm font-medium text-brand-700">
          {product.tagline}
        </p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
          {product.summary}
        </p>

        <div className="mt-5 border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">Starting at</p>
          <p className="font-mono text-2xl font-semibold tabular-nums">
            {formatInr(product.amount)}
          </p>
        </div>

        {/* The "why" page comes first on purpose: this buyer needs the problem
            framed before a spec sheet means anything to them. */}
        <div className="mt-5 flex flex-col gap-2">
          <Link
            href={`/products/${product.slug}/why`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-700 px-5 text-sm font-medium text-white hover:bg-brand-800"
          >
            BUY <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 px-5 text-sm font-medium hover:bg-slate-50"
          >
            Why this one?
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}

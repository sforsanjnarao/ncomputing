"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatInr } from "@/lib/format";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default function CartPage() {
  const { lines, updateQuantity, remove, totalAmount, itemCount } = useCart();

  if (lines.length === 0) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <ShoppingCart className="h-10 w-10 text-slate-300" />
        <h1 className="mt-4 text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 max-w-sm text-slate-600">
          Have a look at the three products and pick the one that matches how
          your desktops run.
        </p>
        <ButtonLink href="/products" size="lg" className="mt-6">
          Browse products
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="heading-1">Your cart</h1>
      <p className="mt-2 text-slate-600">
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr,22rem] lg:items-start">
        <ul className="space-y-4">
          {lines.map((line) => (
            <li key={line.key}>
              <Card>
                <CardBody className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Link
                      href={`/products/${line.slug}`}
                      className="font-semibold hover:text-brand-700"
                    >
                      {line.name}
                    </Link>
                    {line.seats && (
                      <p className="mt-1 text-sm text-slate-500">
                        {line.seats} licence seats
                      </p>
                    )}
                    <p className="mt-2 text-sm text-slate-600">
                      {formatInr(line.unitAmount)} each
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-lg border border-slate-300">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.key, line.quantity - 1)
                        }
                        className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50"
                        aria-label={`Decrease ${line.name} quantity`}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm tabular-nums">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(line.key, line.quantity + 1)
                        }
                        className="grid h-9 w-9 place-items-center text-slate-600 hover:bg-slate-50"
                        aria-label={`Increase ${line.name} quantity`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold tabular-nums">
                        {formatInr(line.unitAmount * line.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => remove(line.key)}
                        className="mt-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </li>
          ))}
        </ul>

        <Card className="lg:sticky lg:top-24">
          <CardBody className="space-y-4">
            <h2 className="font-semibold">Order summary</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatInr(totalAmount)}</dd>
              </div>
            </dl>

            <ButtonLink href="/checkout" size="lg" className="w-full">
              Proceed to checkout
            </ButtonLink>
            <ButtonLink
              href="/products"
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Continue shopping
            </ButtonLink>

            {/* Prices are recalculated by the API at checkout; this is only a
                preview, so a stale localStorage cart cannot mislead anyone. */}
            <p className="text-xs text-slate-500">
              Final pricing is confirmed by our server at checkout. Shipping is
              free across India.
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

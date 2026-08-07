"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Product, ProductOption } from "@/lib/types";

const GST_RATE = 0.18;

type OptionGroup = [group: string, options: ProductOption[]];

/** Groups options in the order the seed defined them, e.g. Support plan → Add-ons. */
function groupOptions(options: ProductOption[]): OptionGroup[] {
  const groups = new Map<string, ProductOption[]>();
  for (const option of options) {
    const existing = groups.get(option.group);
    if (existing) existing.push(option);
    else groups.set(option.group, [option]);
  }
  return Array.from(groups.entries());
}

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const groups = useMemo(() => groupOptions(product.options), [product.options]);

  // One selection per group, starting from whichever option the catalogue marks
  // as default.
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      groups.map(([group, options]) => [
        group,
        (options.find((option) => option.isDefault) ?? options[0]).id,
      ])
    )
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedOptions = useMemo(
    () =>
      Object.values(selection)
        .map((id) => product.options.find((option) => option.id === id))
        .filter((option): option is ProductOption => Boolean(option)),
    [selection, product.options]
  );

  const unitPriceInPaise =
    product.priceInPaise +
    selectedOptions.reduce((sum, option) => sum + option.priceDeltaInPaise, 0);
  const subtotalInPaise = unitPriceInPaise * quantity;
  const totalInPaise = subtotalInPaise + Math.round(subtotalInPaise * GST_RATE);

  function handleAdd(goToCart: boolean) {
    add(product, selectedOptions, quantity);
    if (goToCart) {
      router.push("/cart");
      return;
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <Card className="lg:sticky lg:top-24">
      <CardBody className="space-y-6">
        <div>
          <p className="text-sm text-slate-500">Configure your {product.name}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatInr(unitPriceInPaise)}
            <span className="ml-2 text-sm font-normal text-slate-500">per device</span>
          </p>
          <p className="text-sm text-slate-500">
            {formatInr(Math.round(unitPriceInPaise / product.usersPerDevice))} per seat, excluding
            GST
          </p>
        </div>

        {groups.map(([group, options]) => (
          <fieldset key={group}>
            <legend className="text-sm font-medium text-slate-700">{group}</legend>
            <div className="mt-2 space-y-2">
              {options.map((option) => {
                const checked = selection[group] === option.id;
                return (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      checked
                        ? "border-brand-600 bg-brand-50"
                        : "border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <input
                      type="radio"
                      name={group}
                      value={option.id}
                      checked={checked}
                      onChange={() => setSelection((current) => ({ ...current, [group]: option.id }))}
                      className="mt-1 accent-brand-700"
                    />
                    <span className="flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-medium">{option.label}</span>
                        <span className="text-sm tabular-nums text-slate-600">
                          {option.priceDeltaInPaise === 0
                            ? "Included"
                            : `+ ${formatInr(option.priceDeltaInPaise)}`}
                        </span>
                      </span>
                      {option.description && (
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {option.description}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}

        <div>
          <p className="text-sm font-medium text-slate-700">Quantity</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-slate-300">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="grid h-11 w-11 place-items-center text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(event) =>
                  setQuantity(Math.min(500, Math.max(1, Number(event.target.value) || 1)))
                }
                className="h-11 w-16 border-x border-slate-300 text-center tabular-nums outline-none"
                aria-label="Quantity"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(500, q + 1))}
                className="grid h-11 w-11 place-items-center text-slate-600 hover:bg-slate-50"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              = {quantity * product.usersPerDevice} seats
            </p>
          </div>
        </div>

        <dl className="space-y-1.5 border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-600">Subtotal</dt>
            <dd className="tabular-nums">{formatInr(subtotalInPaise)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">GST (18%)</dt>
            <dd className="tabular-nums">
              {formatInr(Math.round(subtotalInPaise * GST_RATE))}
            </dd>
          </div>
          <div className="flex justify-between pt-1.5 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatInr(totalInPaise)}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <Button size="lg" className="w-full" onClick={() => handleAdd(true)}>
            <ShoppingCart className="h-4 w-4" /> Buy now
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={() => handleAdd(false)}>
            {added ? (
              <>
                <Check className="h-4 w-4 text-savings-600" /> Added to cart
              </>
            ) : (
              "Add to cart"
            )}
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

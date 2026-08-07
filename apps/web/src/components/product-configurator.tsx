"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { formatInr } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import type { Product } from "@/lib/types";

export function ProductConfigurator({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [seats, setSeats] = useState(1);
  const [added, setAdded] = useState(false);

  const isSoftware = product.type === "SOFTWARE";
  const totalAmount = product.amount * quantity;

  function handleAdd(goToCart: boolean) {
    add(product, quantity, isSoftware ? seats : undefined);
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
          <p className="text-sm text-slate-500">{product.name}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {formatInr(product.amount)}
            <span className="ml-2 text-sm font-normal text-slate-500">
              {isSoftware ? "per licence" : "per device"}
            </span>
          </p>
        </div>

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
                  setQuantity(
                    Math.min(500, Math.max(1, Number(event.target.value) || 1)),
                  )
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
          </div>
        </div>

        {isSoftware && (
          <Field label="Licence seats">
            {(props) => (
              <Input
                {...props}
                type="number"
                min={1}
                value={seats}
                onChange={(event) =>
                  setSeats(Math.max(1, Number(event.target.value) || 1))
                }
              />
            )}
          </Field>
        )}

        <dl className="border-t border-slate-200 pt-4 text-sm">
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatInr(totalAmount)}</dd>
          </div>
        </dl>

        <div className="space-y-2">
          <Button size="lg" className="w-full" onClick={() => handleAdd(true)}>
            <ShoppingCart className="h-4 w-4" /> Buy now
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={() => handleAdd(false)}
          >
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

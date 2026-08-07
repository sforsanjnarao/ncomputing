"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { loadRazorpayScript, openRazorpayCheckout, RazorpaySuccess } from "@/lib/razorpay";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import type { Address, Order } from "@/lib/types";

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand",
  "West Bengal",
];

type PaymentInit = {
  keyId: string;
  razorpayOrderId: string;
  amountInPaise: number;
  orderNumber: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, totalAmount, clear } = useCart();
  // Most-recently-saved address prefills the form so a returning customer
  // does not have to retype it — they can just confirm or tweak it.
  const savedAddress = user?.addresses?.[0];

  const needsShipping = useMemo(() => lines.some((line) => line.type === "HARDWARE"), [lines]);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  // The cart lives in localStorage, so it is only knowable after hydration.
  useEffect(() => {
    if (hydrated && lines.length === 0) router.replace("/cart");
  }, [hydrated, lines.length, router]);

  function readAddress(data: Record<string, string>, prefix: "shipping" | "billing") {
    return {
      fullName: data[`${prefix}FullName`],
      fullAddress: data[`${prefix}FullAddress`],
      city: data[`${prefix}City`],
      state: data[`${prefix}State`],
      postalCode: data[`${prefix}PostalCode`],
      country: "India",
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;
    // Only the fields actually rendered exist in the form: when there is no
    // shipping section, the "billing" fields are the only ones on the page.
    const billingAddress = needsShipping
      ? readAddress(data, sameAsShipping ? "shipping" : "billing")
      : readAddress(data, "billing");
    const shippingAddress = needsShipping ? readAddress(data, "shipping") : undefined;

    try {
      // 1. Create the order. The API prices it from its own catalogue — the
      //    total shown on this page is only a preview.
      const { order } = await api.post<{ order: Order }>("/orders", {
        billingAddress,
        shippingAddress,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          seats: line.seats,
        })),
      });

      // 2. Ask the API to open a Razorpay order for that amount.
      const payment = await api.post<PaymentInit>("/payments/create-order", { orderId: order.id });

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) throw new Error("Could not load the payment window. Check your connection.");

      // 3. Hand over to Razorpay. Note the order already exists in our database
      //    as PENDING — if the user abandons here, we still have the record.
      openRazorpayCheckout({
        key: payment.keyId,
        amount: payment.amountInPaise,
        currency: "INR",
        name: "NComputing India",
        description: `Order ${payment.orderNumber}`,
        order_id: payment.razorpayOrderId,
        prefill: {
          name: user?.name ?? "",
          email: user?.email ?? "",
          contact: user?.phone ?? "",
        },
        theme: { color: "#1d4ed8" },
        modal: { ondismiss: () => setSubmitting(false) },
        handler: async (response: RazorpaySuccess) => {
          try {
            // 4. The signature is verified server-side before anything is
            //    marked paid.
            await api.post("/payments/verify", response);
            clear();
            router.push(`/account/orders/${order.id}?placed=1`);
          } catch {
            setFormError(
              "Payment went through but we could not confirm it here. Check My orders in a moment — our webhook will update it."
            );
            setSubmitting(false);
          }
        },
      });
    } catch (caught) {
      if (caught instanceof ApiError && caught.details) setErrors(caught.details);
      setFormError(
        caught instanceof ApiError
          ? caught.message
          : caught instanceof Error
            ? caught.message
            : "Could not start checkout."
      );
      setSubmitting(false);
    }
  }

  if (!hydrated || lines.length === 0) return null;

  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="heading-1">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr,22rem] lg:items-start">
        <div className="space-y-6">
          {needsShipping && (
            <>
              <AddressFields
                legend="Shipping address"
                prefix="shipping"
                errors={errors}
                defaultAddress={savedAddress}
              />

              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(event) => setSameAsShipping(event.target.checked)}
                  className="h-4 w-4 accent-brand-700"
                />
                Billing address is the same as shipping
              </label>
            </>
          )}

          {(!needsShipping || !sameAsShipping) && (
            <AddressFields
              legend="Billing address"
              prefix="billing"
              errors={errors}
              defaultAddress={savedAddress}
            />
          )}
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardBody className="space-y-4">
            <h2 className="font-semibold">Order summary</h2>

            <ul className="space-y-3 border-b border-slate-200 pb-4">
              {lines.map((line) => (
                <li key={line.key} className="flex justify-between gap-3 text-sm">
                  <span>
                    <span className="font-medium">{line.name}</span>
                    <span className="text-slate-500"> × {line.quantity}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatInr(line.unitAmount * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="text-savings-700">Free</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="font-mono tabular-nums">{formatInr(totalAmount)}</dd>
              </div>
            </dl>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Opening payment…" : `Pay ${formatInr(totalAmount)}`}
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" /> Payment handled by Razorpay. We never see your card.
            </p>
          </CardBody>
        </Card>
      </form>
    </div>
  );
}

/** Same fields for shipping and billing — one component, used twice. When the
 *  signed-in user already has a saved address, its values seed the form so
 *  they only need to confirm it rather than retype it every order. */
function AddressFields({
  legend,
  prefix,
  errors,
  defaultAddress,
}: {
  legend: string;
  prefix: "shipping" | "billing";
  errors: Record<string, string[]>;
  defaultAddress?: Address;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold">{legend}</h2>
        <Field label="Full name" error={errors[`${prefix}Address`]?.[0]}>
          {(props) => (
            <Input
              {...props}
              name={`${prefix}FullName`}
              required
              placeholder="Who should we address this to?"
              defaultValue={defaultAddress?.fullName}
            />
          )}
        </Field>
        <Field label="Address">
          {(props) => (
            <Textarea
              {...props}
              name={`${prefix}FullAddress`}
              required
              rows={3}
              placeholder="Building, street, area, landmark"
              defaultValue={defaultAddress?.fullAddress}
            />
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            {(props) => (
              <Input {...props} name={`${prefix}City`} required defaultValue={defaultAddress?.city} />
            )}
          </Field>
          <Field label="State">
            {(props) => (
              <Select
                {...props}
                name={`${prefix}State`}
                required
                defaultValue={defaultAddress?.state ?? ""}
              >
                <option value="" disabled>
                  Select
                </option>
                {STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field label="PIN code">
            {(props) => (
              <Input
                {...props}
                name={`${prefix}PostalCode`}
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="560001"
                defaultValue={defaultAddress?.postalCode}
              />
            )}
          </Field>
        </div>
      </CardBody>
    </Card>
  );
}

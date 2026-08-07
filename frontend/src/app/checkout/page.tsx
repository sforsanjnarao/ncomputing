"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { api, ApiError } from "@/lib/api";
import { formatInr } from "@/lib/format";
import { loadRazorpayScript, openRazorpayCheckout, RazorpaySuccess } from "@/lib/razorpay";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/field";
import type { Order } from "@/lib/types";

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
  const { lines, subtotalInPaise, taxInPaise, totalInPaise, clear } = useCart();

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
      line1: data[`${prefix}Line1`],
      line2: data[`${prefix}Line2`] || undefined,
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
    const shippingAddress = readAddress(data, "shipping");

    try {
      // 1. Create the order. The API prices it from its own catalogue — the
      //    totals shown on this page are only a preview.
      const { order } = await api.post<{ order: Order }>("/orders", {
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : readAddress(data, "billing"),
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          optionIds: line.optionIds,
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
          name: data.customerName,
          email: data.customerEmail,
          contact: data.customerPhone,
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
          <Card>
            <CardBody className="space-y-4">
              <h2 className="font-semibold">Contact details</h2>
              <Field label="Contact name" error={errors.customerName?.[0]}>
                {(props) => (
                  <Input {...props} name="customerName" required defaultValue={user?.name} />
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" error={errors.customerEmail?.[0]}>
                  {(props) => (
                    <Input
                      {...props}
                      name="customerEmail"
                      type="email"
                      required
                      defaultValue={user?.email}
                    />
                  )}
                </Field>
                <Field label="Mobile" error={errors.customerPhone?.[0]}>
                  {(props) => (
                    <Input
                      {...props}
                      name="customerPhone"
                      required
                      inputMode="numeric"
                      placeholder="9876543210"
                      defaultValue={user?.phone ?? ""}
                    />
                  )}
                </Field>
              </div>
            </CardBody>
          </Card>

          <AddressFields legend="Shipping address" prefix="shipping" errors={errors} />

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={sameAsShipping}
              onChange={(event) => setSameAsShipping(event.target.checked)}
              className="h-4 w-4 accent-brand-700"
            />
            Billing address is the same as shipping
          </label>

          {!sameAsShipping && (
            <AddressFields legend="Billing address" prefix="billing" errors={errors} />
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
                    <span className="block text-xs text-slate-500">
                      {line.optionLabels.map((option) => option.label).join(" · ")}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">
                    {formatInr(line.unitPriceInPaise * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="tabular-nums">{formatInr(subtotalInPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">GST (18%)</dt>
                <dd className="tabular-nums">{formatInr(taxInPaise)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="text-savings-700">Free</dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatInr(totalInPaise)}</dd>
              </div>
            </dl>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Opening payment…" : `Pay ${formatInr(totalInPaise)}`}
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

/** Same six fields for shipping and billing — one component, used twice. */
function AddressFields({
  legend,
  prefix,
  errors,
}: {
  legend: string;
  prefix: "shipping" | "billing";
  errors: Record<string, string[]>;
}) {
  return (
    <Card>
      <CardBody className="space-y-4">
        <h2 className="font-semibold">{legend}</h2>
        <Field label="Address line 1" error={errors[`${prefix}Address`]?.[0]}>
          {(props) => (
            <Input {...props} name={`${prefix}Line1`} required placeholder="Building, street" />
          )}
        </Field>
        <Field label="Address line 2 (optional)">
          {(props) => <Input {...props} name={`${prefix}Line2`} placeholder="Area, landmark" />}
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="City">
            {(props) => <Input {...props} name={`${prefix}City`} required />}
          </Field>
          <Field label="State">
            {(props) => (
              <Select {...props} name={`${prefix}State`} required defaultValue="">
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
              />
            )}
          </Field>
        </div>
      </CardBody>
    </Card>
  );
}

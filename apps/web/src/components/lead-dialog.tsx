"use client";

import { FormEvent, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import type { LeadType } from "@/lib/types";

/** Single form behind all three lead paths — demo, sales, pricing. They collect
 *  the same details and just tag the submission differently. */
export function LeadDialog({
  open,
  onClose,
  type,
  title,
  description,
  productSlug,
  defaultSeats,
}: {
  open: boolean;
  onClose: () => void;
  type: LeadType;
  title: string;
  description: string;
  productSlug?: string;
  defaultSeats?: number;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;

    try {
      await api.post("/leads", {
        type,
        name: data.name,
        email: data.email,
        phone: data.phone,
        organization: data.organization || undefined,
        seats: data.seats ? Number(data.seats) : undefined,
        message: data.message || undefined,
        productSlug,
      });
      setSent(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Could not send that. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setSent(false);
    setError(null);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      description={description}
    >
      {sent ? (
        <div className="py-4 text-center">
          <p className="font-medium text-savings-700">Thanks — we have it.</p>
          <p className="mt-1 text-sm text-slate-600">
            Our team will get back to you within a working day.
          </p>
          <Button className="mt-4" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Name">
            {(props) => <Input {...props} name="name" required />}
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email">
              {(props) => (
                <Input {...props} name="email" type="email" required />
              )}
            </Field>
            <Field label="Mobile">
              {(props) => (
                <Input
                  {...props}
                  name="phone"
                  required
                  inputMode="numeric"
                  placeholder="9876543210"
                />
              )}
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Organization (optional)">
              {(props) => <Input {...props} name="organization" />}
            </Field>
            <Field label="Seats (optional)">
              {(props) => (
                <Input
                  {...props}
                  name="seats"
                  type="number"
                  min={1}
                  defaultValue={defaultSeats}
                />
              )}
            </Field>
          </div>
          <Field label="Anything else? (optional)">
            {(props) => <Textarea {...props} name="message" rows={3} />}
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? "Sending…" : "Send"}
          </Button>
        </form>
      )}
    </Modal>
  );
}

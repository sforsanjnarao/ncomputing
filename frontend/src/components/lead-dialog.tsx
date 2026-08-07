"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import type { LeadType } from "@/lib/types";

/**
 * Single form behind all three lead paths — demo, sales, pricing. They collect
 * the same information and differ only in wording, so one component with a
 * `type` prop beats three near-identical forms.
 */
export function LeadDialog({
  open,
  onClose,
  type,
  title,
  description,
  defaultSeats,
  productSlug,
}: {
  open: boolean;
  onClose: () => void;
  type: LeadType;
  title: string;
  description?: string;
  defaultSeats?: number;
  productSlug?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

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
      setSubmitted(true);
    } catch (error) {
      if (error instanceof ApiError && error.details) setErrors(error.details);
      setFormError(error instanceof ApiError ? error.message : "Could not send. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    onClose();
    // Reset only after the closing animation would have finished, so the user
    // does not watch the form flash back before it disappears.
    setTimeout(() => setSubmitted(false), 200);
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} description={description}>
      {submitted ? (
        <div className="py-4 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-savings-600" />
          <p className="mt-3 font-medium">Thank you — we have your details.</p>
          <p className="mt-1 text-sm text-slate-600">
            Someone from our team will call you within one working day.
          </p>
          <Button variant="secondary" className="mt-5" onClick={handleClose}>
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Your name" error={errors.name?.[0]}>
            {(props) => <Input {...props} name="name" required placeholder="Ravi Sharma" />}
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" error={errors.email?.[0]}>
              {(props) => (
                <Input {...props} name="email" type="email" required placeholder="you@school.in" />
              )}
            </Field>
            <Field label="Mobile" error={errors.phone?.[0]}>
              {(props) => (
                <Input {...props} name="phone" required inputMode="numeric" placeholder="9876543210" />
              )}
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="School / organisation" error={errors.organization?.[0]}>
              {(props) => <Input {...props} name="organization" placeholder="Sunrise Public School" />}
            </Field>
            <Field label="How many seats?" error={errors.seats?.[0]}>
              {(props) => (
                <Input
                  {...props}
                  name="seats"
                  type="number"
                  min={1}
                  defaultValue={defaultSeats}
                  placeholder="30"
                />
              )}
            </Field>
          </div>

          <Field label="Anything we should know?" error={errors.message?.[0]}>
            {(props) => (
              <Textarea
                {...props}
                name="message"
                placeholder="We have an existing lab of 20 old PCs we would like to replace."
              />
            )}
          </Field>

          {formError && <p className="text-sm text-red-600">{formError}</p>}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Sending…" : "Send request"}
          </Button>
          <p className="text-center text-xs text-slate-500">
            We only use these details to contact you about this enquiry.
          </p>
        </form>
      )}
    </Modal>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ApiError } from "@/lib/api";

export function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const data = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>;

    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
        organization: data.organization || undefined,
      });
      router.push("/account/orders");
      router.refresh();
    } catch (caught) {
      if (caught instanceof ApiError && caught.details) setErrors(caught.details);
      setFormError(caught instanceof ApiError ? caught.message : "Could not create the account.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Your name" error={errors.name?.[0]}>
        {(props) => <Input {...props} name="name" required autoComplete="name" />}
      </Field>
      <Field label="Email" error={errors.email?.[0]}>
        {(props) => <Input {...props} name="email" type="email" required autoComplete="email" />}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Mobile" error={errors.phone?.[0]}>
          {(props) => <Input {...props} name="phone" inputMode="numeric" autoComplete="tel" />}
        </Field>
        <Field label="Organisation" error={errors.organization?.[0]}>
          {(props) => <Input {...props} name="organization" autoComplete="organization" />}
        </Field>
      </div>
      <Field label="Password" hint="At least 8 characters." error={errors.password?.[0]}>
        {(props) => (
          <Input {...props} name="password" type="password" required autoComplete="new-password" />
        )}
      </Field>

      {formError && <p className="text-sm text-red-600">{formError}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

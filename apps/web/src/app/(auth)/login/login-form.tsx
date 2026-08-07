"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { ApiError } from "@/lib/api";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = Object.fromEntries(
      new FormData(event.currentTarget),
    ) as Record<string, string>;

    try {
      const user = await login(data.email, data.password);

      // Send admins to the dashboard, and everyone else back to whatever the
      // middleware interrupted.
      const next = searchParams.get("next");
      const destination =
        user.role === "ADMIN" ? "/admin" : next || "/account/orders";

      router.push(destination);
      // Re-run middleware and server components now that the cookie exists.
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ApiError ? caught.message : "Could not sign in.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email">
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        )}
      </Field>
      <Field label="Password">
        {(props) => (
          <Input
            {...props}
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        )}
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      <div className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
        <p className="font-medium text-slate-700">Demo accounts</p>
        <p className="mt-1">Admin — admin@ncomputing.in / Admin@12345</p>
        <p>Customer — user@ncomputing.in / User@12345</p>
      </div>
    </form>
  );
}

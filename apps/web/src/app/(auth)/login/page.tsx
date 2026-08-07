import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in"
      subtitle="Sign in to place an order or track one you have already placed."
      footer={{
        text: "New here?",
        linkText: "Create an account",
        href: "/register",
      }}
    >
      {/* useSearchParams needs a Suspense boundary for static rendering. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}

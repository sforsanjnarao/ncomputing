import type { Metadata } from "next";
import { AuthCard } from "@/components/auth-card";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an account"
      subtitle="You need an account to place an order, so we can show you its status later."
      footer={{ text: "Already have one?", linkText: "Sign in", href: "/login" }}
    >
      <RegisterForm />
    </AuthCard>
  );
}

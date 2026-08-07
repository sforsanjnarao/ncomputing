"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { AdminNav } from "./admin-nav";

/**
 * Admin has its own chrome — no marketing header, no footer. Access is enforced
 * twice: this client guard sends non-admins away, and every API call underneath
 * goes through requireRole('ADMIN') on the server (the real boundary).
 *
 * The parent (protected) layout already guarantees a signed-in user; here we
 * only add the role check.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.role !== "ADMIN") {
      router.replace("/account/orders");
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-content px-5 py-8 sm:px-6 lg:px-8">
          <p className="text-slate-500">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNav />
      <div className="mx-auto w-full max-w-content px-5 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}

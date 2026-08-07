"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

/**
 * Client-side route guard — the first of the two auth layers.
 *
 * It redirects rather than protects: it exists so people are not shown a page
 * they cannot use. The real enforcement is protectMiddleware / requireRole on
 * the Express API, since a determined user can always call the API directly.
 */
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      // Remember where they were headed so login can send them back.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="container-page flex min-h-[50vh] items-center justify-center">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}

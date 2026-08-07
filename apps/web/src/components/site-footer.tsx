"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold">NComputing India</p>
          <p className="mt-1 max-w-md text-sm text-slate-600">
            Desktop virtualisation for schools, colleges and small businesses. One PC, many
            desktops.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
          <Link href="/products" className="hover:text-ink">
            Products
          </Link>
          <Link href="/how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/contact" className="hover:text-ink">
            Talk to sales
          </Link>
          <Link href="/login" className="hover:text-ink">
            Sign in
          </Link>
        </nav>
      </div>
      <div className="border-t border-slate-200">
        <div className="container-page py-4 text-xs text-slate-500">
          Built as an assignment project. Product names and specifications belong to NComputing;
          prices shown are indicative.
        </div>
      </div>
    </footer>
  );
}

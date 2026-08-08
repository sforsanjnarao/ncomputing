"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

/** Fires a PAGE_VIEW on first load and every client-side route change. */
export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("PAGE_VIEW", { path: pathname });
  }, [pathname]);

  return null;
}

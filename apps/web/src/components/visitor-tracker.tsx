"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { track } from "@/lib/track";

export function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track("PAGE_VIEW", { path: pathname });
  }, [pathname]);

  return null;
}

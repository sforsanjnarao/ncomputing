"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/** Rendered inside the (server) product page purely to fire one client-side event on mount. */
export function TrackProductView({ slug }: { slug: string }) {
  useEffect(() => {
    track("PRODUCT_VIEW", { productSlug: slug });
  }, [slug]);

  return null;
}

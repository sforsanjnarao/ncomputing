"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

export function TrackProductView({ slug }: { slug: string }) {
  useEffect(() => {
    track("PRODUCT_VIEW", { productSlug: slug });
  }, [slug]);

  return null;
}

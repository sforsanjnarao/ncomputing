"use client";

import { useState } from "react";
import { LeadDialog } from "@/components/lead-dialog";
import { buttonClasses } from "@/components/ui/button";
import type { LeadType } from "@/lib/types";

const COPY: Record<LeadType, { title: string; description: string }> = {
  DEMO: {
    title: "Book a demo",
    description:
      "We will set up a live walkthrough on your own network, at a time that suits you.",
  },
  SALES: {
    title: "Talk to sales",
    description: "Tell us what you are trying to do and we will call you back.",
  },
  PRICING: {
    title: "Request pricing",
    description:
      "Tell us how many seats you need and we will email a written quote.",
  },
};

/** Button that opens the lead form, so marketing pages can drop in a lead
 *  capture point without becoming client components themselves. */
export function LeadCta({
  type,
  label,
  variant = "primary",
  size = "lg",
  className,
  productSlug,
}: {
  type: LeadType;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  productSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const copy = COPY[type];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={buttonClasses(variant, size, className)}
      >
        {label}
      </button>
      <LeadDialog
        open={open}
        onClose={() => setOpen(false)}
        type={type}
        title={copy.title}
        description={copy.description}
        productSlug={productSlug}
      />
    </>
  );
}

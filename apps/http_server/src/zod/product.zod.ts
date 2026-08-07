import { z } from "zod";
import { ProductType } from "@repo/db";

export const CreateProductSchema = z.object({
  slug: z
    .string()
    .min(2, "Enter a slug, e.g. rx420.")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only."),
  name: z.string().min(2, "Enter a product name."),
  type: z.nativeEnum(ProductType),
  amount: z.coerce.number().positive("Enter a price greater than zero."),
  currency: z.string().length(3).default("INR"),
  tagline: z.string().min(2, "Enter a short tagline."),
  summary: z.string().min(2, "Enter a summary."),
  highlights: z.array(z.string().min(1)).default([]),
  specifications: z.record(z.string()).default({}),
  isActive: z.boolean().default(true),
});

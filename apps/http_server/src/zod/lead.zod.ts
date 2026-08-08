import { z } from "zod";
import { LeadStatus, LeadType } from "@repo/db";

export const CreateLeadSchema = z.object({
  type: z.nativeEnum(LeadType),
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  organization: z.string().optional(),
  seats: z.coerce.number().int().min(1).max(100000).optional(),
  productSlug: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export const ListLeadsSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  type: z.nativeEnum(LeadType).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export const UpdateLeadSchema = z.object({ status: z.nativeEnum(LeadStatus) });

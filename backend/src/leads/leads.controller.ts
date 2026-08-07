import { Request, Response } from "express";
import { LeadStatus, LeadType } from "@prisma/client";
import { z } from "zod";
import * as service from "./leads.service";
import { sendLeadNotification } from "../utils/email";

const createLeadSchema = z.object({
  type: z.nativeEnum(LeadType),
  name: z.string().min(2, "Please enter your name."),
  email: z.string().email("Please enter a valid email."),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  organization: z.string().optional(),
  seats: z.coerce.number().int().min(1).max(100000).optional(),
  productSlug: z.string().optional(),
  message: z.string().max(2000).optional(),
});

export async function createLeadHandler(req: Request, res: Response) {
  const input = createLeadSchema.parse(req.body);
  const lead = await service.createLead(input);

  // A failed notification must not fail the visitor's form submission — the
  // lead is already safely in the database.
  sendLeadNotification(lead).catch((error) => console.error("[email] lead notify failed", error));

  res.status(201).json({ lead });
}

const listSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(LeadStatus).optional(),
  type: z.nativeEnum(LeadType).optional(),
});

export async function adminListLeadsHandler(req: Request, res: Response) {
  res.json({ leads: await service.listLeads(listSchema.parse(req.query)) });
}

const updateSchema = z.object({ status: z.nativeEnum(LeadStatus) });

export async function adminUpdateLeadHandler(req: Request, res: Response) {
  const { status } = updateSchema.parse(req.body);
  res.json({ lead: await service.updateLeadStatus(req.params.id, status) });
}

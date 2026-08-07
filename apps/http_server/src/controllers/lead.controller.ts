import { Request, Response } from "express";
import { prisma, Prisma } from "@repo/db";
import {
  CreateLeadSchema,
  ListLeadsSchema,
  UpdateLeadSchema,
} from "../zod/lead.zod";
import { sendLeadNotification } from "../utils/email";

export const createLead = async (req: Request, res: Response) => {
  const parsed = CreateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        error: "Please check the highlighted fields.",
        details: parsed.error.flatten().fieldErrors,
      });
  }

  try {
    const lead = await prisma.lead.create({ data: parsed.data });

    // A failed notification must not fail the visitor's form submission — the
    // lead is already safely in the database.
    sendLeadNotification(lead).catch((err) => console.error(err));

    return res.status(201).json({ lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const adminListLeads = async (req: Request, res: Response) => {
  const parsed = ListLeadsSchema.safeParse(req.query);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        error: "Invalid filters.",
        details: parsed.error.flatten().fieldErrors,
      });
  }

  try {
    const where: Prisma.LeadWhereInput = {};
    if (parsed.data.status) where.status = parsed.data.status;
    if (parsed.data.type) where.type = parsed.data.type;
    if (parsed.data.search) {
      const search = parsed.data.search.trim();
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { organization: { contains: search, mode: "insensitive" } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({ leads });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const adminUpdateLead = async (req: Request, res: Response) => {
  const parsed = UpdateLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        error: "Invalid status.",
        details: parsed.error.flatten().fieldErrors,
      });
  }

  try {
    const exists = await prisma.lead.findUnique({
      where: { id: req.params.id },
    });
    if (!exists)
      return res.status(404).json({ error: "That lead does not exist." });

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });
    return res.status(200).json({ lead });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

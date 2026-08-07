import { LeadStatus, LeadType, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { notFound } from "../utils/errors";

export type CreateLeadInput = {
  type: LeadType;
  name: string;
  email: string;
  phone: string;
  organization?: string;
  seats?: number;
  productSlug?: string;
  message?: string;
};

export function createLead(input: CreateLeadInput) {
  return prisma.lead.create({ data: input });
}

export function listLeads(filters: { search?: string; status?: LeadStatus; type?: LeadType }) {
  const where: Prisma.LeadWhereInput = {};

  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { organization: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.lead.findMany({ where, orderBy: { createdAt: "desc" } });
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const exists = await prisma.lead.findUnique({ where: { id } });
  if (!exists) throw notFound("That lead does not exist.");
  return prisma.lead.update({ where: { id }, data: { status } });
}

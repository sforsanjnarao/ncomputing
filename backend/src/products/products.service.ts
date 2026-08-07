import { prisma } from "../config/prisma";
import { notFound } from "../utils/errors";

const withOptions = {
  options: { orderBy: [{ group: "asc" as const }, { sortOrder: "asc" as const }] },
};

export function listProducts() {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: withOptions,
  });
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: withOptions,
  });
  if (!product || !product.isActive) throw notFound("That product does not exist.");
  return product;
}

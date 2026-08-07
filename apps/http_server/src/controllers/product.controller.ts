import { Request, Response } from "express";
import { prisma } from "@repo/db";
import { CreateProductSchema } from "../zod/product.zod";

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
    if (!product || !product.isActive) {
      return res.status(404).json({ error: "That product does not exist." });
    }
    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const adminListProducts = async (_req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json({ products });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const parsed = CreateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please check the highlighted fields.", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return res.status(400).json({ error: "A product with that slug already exists." });

    const product = await prisma.product.create({ data: parsed.data });
    return res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

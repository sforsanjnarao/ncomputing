import { Request, Response } from "express";
import { prisma, Prisma, Role } from "@repo/db";
import { CreateOrderSchema, AdminListOrdersSchema, UpdateOrderStatusSchema } from "../zod/order.zod";
import { AddressInput } from "../zod/address.zod";

const orderInclude = {
  items: { include: { product: true } },
  user: { select: { id: true, name: true, email: true, organization: true } },
  billingAddress: true,
  shippingAddress: true,
} satisfies Prisma.OrderInclude;

function generateOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NC-${date}-${random}`;
}

// Reuses a matching saved address for this user, or saves a new one. This is
// what lets a returning customer's next order come pre-filled instead of
// asking them to retype the same address every time.
async function resolveAddress(userId: string, input: AddressInput) {
  const existing = await prisma.address.findFirst({
    where: { userId, ...input },
  });
  if (existing) return existing.id;

  const created = await prisma.address.create({ data: { userId, ...input } });
  return created.id;
}

// Create an order. Prices come from the database, never from the request body:
// the client sends *what* it wants (product + quantity); the server decides
// what that costs. Otherwise anyone could POST a ₹1 order.
export const createOrder = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Please check the highlighted fields.", details: parsed.error.flatten().fieldErrors });
  }
  const input = parsed.data;

  try {
    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((item) => item.productId) }, isActive: true },
    });

    let orderAmount = 0;
    let needsShipping = false;
    const lines = [];

    for (const item of input.items) {
      const product = products.find((candidate) => candidate.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: "One of the products in your cart is no longer available." });
      }
      if (product.type === "HARDWARE") needsShipping = true;

      orderAmount += product.amount * item.quantity;
      lines.push({
        productId: product.id,
        quantity: item.quantity,
        seats: item.seats,
        serviceDurationMonths: item.serviceDurationMonths,
      });
    }
    // Guards against float drift when summing many line items.
    orderAmount = Math.round(orderAmount * 100) / 100;

    if (needsShipping && !input.shippingAddress) {
      return res.status(400).json({ error: "Shipping address is required for hardware orders." });
    }

    const billingAddressId = await resolveAddress(userId, input.billingAddress);
    const shippingAddressId = input.shippingAddress
      ? await resolveAddress(userId, input.shippingAddress)
      : undefined;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        orderAmount,
        orderCurrency: "INR",
        billingAddressId,
        shippingAddressId,
        // The order and its items are written in one statement, so a
        // half-created order can never exist.
        items: { create: lines },
      },
      include: orderInclude,
    });

    return res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: orderInclude,
    });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

// An ADMIN may read any order; a USER only their own. The check lives here
// because it depends on the data, which middleware cannot see.
export const getOrder = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "unauthorized" });

  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude });
    if (!order) return res.status(404).json({ error: "That order does not exist." });
    if (req.user!.role !== Role.ADMIN && order.userId !== userId) {
      return res.status(403).json({ error: "forbidden" });
    }
    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const adminListOrders = async (req: Request, res: Response) => {
  const parsed = AdminListOrdersSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid filters.", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const where: Prisma.OrderWhereInput = {};
    if (parsed.data.status) where.status = parsed.data.status;
    if (parsed.data.search) {
      const search = parsed.data.search.trim();
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const orders = await prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: orderInclude });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  const parsed = UpdateOrderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid status.", details: parsed.error.flatten().fieldErrors });
  }

  try {
    const exists = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!exists) return res.status(404).json({ error: "That order does not exist." });

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
      include: orderInclude,
    });
    return res.status(200).json({ order });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "something went wrong" });
  }
};

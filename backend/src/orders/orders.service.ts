import { OrderStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { badRequest, forbidden, notFound } from "../utils/errors";

export const GST_RATE = 0.18;

export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CartItemInput = {
  productId: string;
  quantity: number;
  optionIds: string[];
};

export type CreateOrderInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  billingAddress: Address;
  items: CartItemInput[];
};

const orderInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true, organization: true } },
} satisfies Prisma.OrderInclude;

function generateOrderNumber() {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `NC-${date}-${random}`;
}

/**
 * Builds the priced line items for a cart.
 *
 * Prices come from the database, never from the request body. The client sends
 * *what* it wants (product + options + quantity); the server decides what that
 * costs. Otherwise anyone could POST a ₹1 order.
 */
async function priceCart(items: CartItemInput[]) {
  if (items.length === 0) throw badRequest("Your cart is empty.");

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((item) => item.productId) }, isActive: true },
    include: { options: true },
  });

  const lines = items.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) throw badRequest("One of the products in your cart is no longer available.");
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 500) {
      throw badRequest("Quantity must be a whole number between 1 and 500.");
    }

    const selected = item.optionIds.map((optionId) => {
      const option = product.options.find((candidate) => candidate.id === optionId);
      // Guards against an option id from a different product being smuggled in.
      if (!option) throw badRequest(`Invalid configuration for ${product.name}.`);
      return option;
    });

    const unitPriceInPaise =
      product.priceInPaise + selected.reduce((sum, option) => sum + option.priceDeltaInPaise, 0);

    return {
      productId: product.id,
      productName: product.name,
      unitPriceInPaise,
      quantity: item.quantity,
      lineTotalInPaise: unitPriceInPaise * item.quantity,
      selectedOptions: selected.map((option) => ({
        id: option.id,
        group: option.group,
        label: option.label,
        priceDeltaInPaise: option.priceDeltaInPaise,
      })),
    };
  });

  const subtotalInPaise = lines.reduce((sum, line) => sum + line.lineTotalInPaise, 0);
  const taxInPaise = Math.round(subtotalInPaise * GST_RATE);

  return { lines, subtotalInPaise, taxInPaise, totalInPaise: subtotalInPaise + taxInPaise };
}

export async function createOrder(input: CreateOrderInput) {
  const { lines, subtotalInPaise, taxInPaise, totalInPaise } = await priceCart(input.items);

  return prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: input.userId,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      shippingAddress: input.shippingAddress as unknown as Prisma.InputJsonValue,
      billingAddress: input.billingAddress as unknown as Prisma.InputJsonValue,
      subtotalInPaise,
      taxInPaise,
      totalInPaise,
      // The order and its items are written in one statement, so a half-created
      // order can never exist.
      items: {
        create: lines.map((line) => ({
          productId: line.productId,
          productName: line.productName,
          unitPriceInPaise: line.unitPriceInPaise,
          quantity: line.quantity,
          lineTotalInPaise: line.lineTotalInPaise,
          selectedOptions: line.selectedOptions as unknown as Prisma.InputJsonValue,
        })),
      },
    },
    include: orderInclude,
  });
}

/**
 * Fetches one order, enforcing ownership.
 *
 * An ADMIN may read anything; a USER may only read their own. This check lives
 * in the service rather than the route because it depends on the *data*, which
 * middleware cannot see.
 */
export async function getOrderForUser(orderId: string, userId: string, role: Role) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw notFound("That order does not exist.");
  if (role !== Role.ADMIN && order.userId !== userId) throw forbidden();
  return order;
}

export function listOrdersForUser(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });
}

export type AdminOrderFilters = {
  search?: string;
  status?: OrderStatus;
};

export function listAllOrders(filters: AdminOrderFilters) {
  const where: Prisma.OrderWhereInput = {};

  if (filters.status) where.status = filters.status;

  if (filters.search) {
    const search = filters.search.trim();
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customerName: { contains: search, mode: "insensitive" } },
      { customerEmail: { contains: search, mode: "insensitive" } },
    ];
  }

  return prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, include: orderInclude });
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const exists = await prisma.order.findUnique({ where: { id: orderId } });
  if (!exists) throw notFound("That order does not exist.");

  return prisma.order.update({ where: { id: orderId }, data: { status }, include: orderInclude });
}

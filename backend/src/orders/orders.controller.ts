import { Request, Response } from "express";
import { OrderStatus } from "@prisma/client";
import { z } from "zod";
import * as service from "./orders.service";

const addressSchema = z.object({
  line1: z.string().min(3, "Please enter the address."),
  line2: z.string().optional(),
  city: z.string().min(2, "Please enter the city."),
  state: z.string().min(2, "Please enter the state."),
  postalCode: z.string().regex(/^\d{6}$/, "PIN code must be 6 digits."),
  country: z.string().min(2).default("India"),
});

const createOrderSchema = z.object({
  customerName: z.string().min(2, "Please enter a contact name."),
  customerEmail: z.string().email("Please enter a valid email."),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a 10-digit Indian mobile number."),
  shippingAddress: addressSchema,
  billingAddress: addressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(500),
        optionIds: z.array(z.string()).default([]),
      })
    )
    .min(1, "Your cart is empty."),
});

export async function createOrderHandler(req: Request, res: Response) {
  const input = createOrderSchema.parse(req.body);
  const order = await service.createOrder({ ...input, userId: req.user!.id });
  res.status(201).json({ order });
}

export async function myOrdersHandler(req: Request, res: Response) {
  res.json({ orders: await service.listOrdersForUser(req.user!.id) });
}

export async function getOrderHandler(req: Request, res: Response) {
  const order = await service.getOrderForUser(req.params.id, req.user!.id, req.user!.role);
  res.json({ order });
}

const adminListSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});

export async function adminListOrdersHandler(req: Request, res: Response) {
  const filters = adminListSchema.parse(req.query);
  res.json({ orders: await service.listAllOrders(filters) });
}

const updateStatusSchema = z.object({ status: z.nativeEnum(OrderStatus) });

export async function adminUpdateStatusHandler(req: Request, res: Response) {
  const { status } = updateStatusSchema.parse(req.body);
  res.json({ order: await service.updateOrderStatus(req.params.id, status) });
}

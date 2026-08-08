import { z } from "zod";
import { OrderStatus } from "@repo/db";
import { AddressSchema } from "./address.zod";

export const CreateOrderSchema = z.object({
  billingAddress: AddressSchema,
  
  shippingAddress: AddressSchema.optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(500),
        seats: z.number().int().min(1).optional(),
        serviceDurationMonths: z.number().int().min(1).optional(),
      }),
    )
    .min(1, "Your cart is empty."),
});

export const AdminListOrdersSchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export const MyOrdersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

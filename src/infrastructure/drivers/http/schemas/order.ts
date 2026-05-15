import { z } from "zod";

export const OrderSchema = z
  .object({
    id: z.string().uuid(),
    establishmentId: z.string().uuid(),
    roomId: z.string().uuid().nullable(),
    eventId: z.string().uuid().nullable(),
    tableId: z.string().uuid().nullable(),
    waiterId: z.string().uuid().nullable(),
    createdBy: z.string().uuid().nullable(),
    status: z.enum(["pending", "confirmed", "preparing", "served", "cancelled"]),
    notes: z.string().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi("Order");

export type OrderResponse = z.infer<typeof OrderSchema>;

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export const CreateOrderSchema = z
  .object({
    establishmentId: z.string().uuid(),
    roomId: z.string().uuid().nullable().optional(),
    eventId: z.string().uuid().nullable().optional(),
    tableId: z.string().uuid().nullable().optional(),
    waiterId: z.string().uuid().nullable().optional(),
    createdBy: z.string().uuid().nullable().optional(),
    status: z.enum(["pending", "confirmed", "preparing", "served", "cancelled"]).default("pending"),
    notes: z.string().nullable().optional(),
  })
  .openapi("CreateOrderBody");

export type CreateOrderBody = z.infer<typeof CreateOrderSchema>;

export const OrderParamsSchema = z.object({
  id: z.string().regex(uuidRegex, "Invalid order ID format"),
});

export const OrderEstablishmentParamsSchema = z.object({
  establishmentId: z.string().regex(uuidRegex, "Invalid establishment ID format"),
});

export const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "served", "cancelled"]).optional(),
  notes: z.string().nullable().optional(),
});

export type UpdateOrderRequest = z.infer<typeof UpdateOrderSchema>;
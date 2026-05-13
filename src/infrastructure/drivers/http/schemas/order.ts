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

export const OrderParamsSchema = z.object({
  id: z.string().uuid("Invalid order ID format"),
});

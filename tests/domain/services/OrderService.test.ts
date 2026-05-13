import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "@domain/services/OrderService";
import type { OrderRepository } from "@domain/ports/drivens/OrderRepository";
import { Order, type OrderStatus } from "@domain/entities/Order";
import { ok, fail } from "@domain/value-objects/Result";

describe("OrderService", () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;

  const validOrderData = (overrides: Partial<any> = {}) => {
    return {
      id: "550e8400-e29b-41d4-a716-446655440000",
      establishmentId: "550e8400-e29b-41d4-a716-446655441111",
      status: "pending" as OrderStatus,
      ...overrides,
    };
  };

  function fakeOrder(data: Partial<Order> = {}): Order {
    return new Order(
      data.id ?? "fake-uuid",
      data.establishmentId ?? "fake-establishment-uuid",
      data.roomId ?? null,
      data.eventId ?? null,
      data.tableId ?? null,
      data.waiterId ?? null,
      data.createdBy ?? null,
      data.status ?? "pending",
      data.notes ?? null,
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date()
    );
  }

  beforeEach(() => {
    orderRepository = {
      findById: vi.fn(),
    } as unknown as OrderRepository;

    orderService = new OrderService(orderRepository);
  });

  // --- TESTS: findById ---

  describe("findById", () => {
    it("should return an order when it exists", async () => {
      const existingOrder = fakeOrder();
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(existingOrder));

      const result = await orderService.findById(existingOrder.id);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(existingOrder);
      }
    });

    it("should return ok with null when the order does not exist", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(null));

      const result = await orderService.findById("non-existent-id");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it("should return a failure when the provided ID is empty", async () => {
      const result = await orderService.findById("");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("INVALID_ID");
        expect(result.error.message).toBe("Order ID is required");
      }
    });

    it("should propagate a failure when the repository fails", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(
        fail("RETRIEVE_ERROR", "Database connection lost")
      );

      const result = await orderService.findById("any-id");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.code).toBe("RETRIEVE_ERROR");
      }
    });
  });
});
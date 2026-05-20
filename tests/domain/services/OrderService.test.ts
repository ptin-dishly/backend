import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderService } from "@domain/services/OrderService";
import type { OrderRepository, CreateOrderInput } from "@domain/ports/drivens/OrderRepository";
import { Order, type OrderStatus } from "@domain/entities/Order";
import { ok, fail } from "@domain/value-objects/Result";

describe("OrderService", () => {
  let orderService: OrderService;
  let orderRepository: OrderRepository;

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
      data.items ?? [],
      data.createdAt ?? new Date(),
      data.updatedAt ?? new Date(),
    );
  }

  const validCreateInput = (overrides: Partial<CreateOrderInput> = {}): CreateOrderInput => ({
    establishmentId: "550e8400-e29b-41d4-a716-446655441111",
    roomId: null,
    eventId: null,
    tableId: null,
    waiterId: null,
    createdBy: null,
    notes: null,
    items: [
      {
        recipeId: "660e8400-e29b-41d4-a716-446655442222",
        menuCardItemId: null,
        quantity: 1,
        name: "Test dish",
        specialNotes: null,
        hasAllergenRisk: false,
        allergyPerson: null,
      },
    ],
    ...overrides,
  });

  beforeEach(() => {
    orderRepository = {
      findActiveByTableId: vi.fn(),
      findActiveTableIds: vi.fn(),
      findAllActiveForDashboard: vi.fn(),
      create: vi.fn(),
      updateItemStatus: vi.fn(),
      closeOrder: vi.fn(),
      findById: vi.fn(),
      findByEstablishmentId: vi.fn(),
      deleteById: vi.fn(),
      update: vi.fn(),
    } as unknown as OrderRepository;

    orderService = new OrderService(orderRepository);
  });

  // --- findById ---
  describe("findById", () => {
    it("should return an order when it exists", async () => {
      const existing = fakeOrder();
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(existing));
      const result = await orderService.findById(existing.id);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBe(existing);
    });

    it("should return ok with null when the order does not exist", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(null));
      const result = await orderService.findById("non-existent-id");
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toBeNull();
    });

    it("should return INVALID_ID when ID empty", async () => {
      const result = await orderService.findById("");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });

    it("should propagate failure when repo fails", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(fail("RETRIEVE_ERROR", "DB error"));
      const result = await orderService.findById("any-id");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("RETRIEVE_ERROR");
    });
  });

  // --- findByEstablishmentId ---
  describe("findByEstablishmentId", () => {
    const validEstId = "550e8400-e29b-41d4-a716-446655441111";

    it("should return list of orders", async () => {
      const orders = [fakeOrder({ id: "o1" }), fakeOrder({ id: "o2" })];
      vi.mocked(orderRepository.findByEstablishmentId).mockResolvedValue(ok(orders));
      const result = await orderService.findByEstablishmentId(validEstId);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toHaveLength(2);
    });

    it("should return empty list", async () => {
      vi.mocked(orderRepository.findByEstablishmentId).mockResolvedValue(ok([]));
      const result = await orderService.findByEstablishmentId(validEstId);
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value).toEqual([]);
    });

    it("should return INVALID_ID when empty", async () => {
      const result = await orderService.findByEstablishmentId("");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });
  });

  // --- deleteById ---
  describe("deleteById", () => {
    it("should delete an order", async () => {
      vi.mocked(orderRepository.deleteById).mockResolvedValue(ok(undefined));
      const result = await orderService.deleteById("550e8400-e29b-41d4-a716-446655440000");
      expect(result.ok).toBe(true);
    });

    it("should fail when id is empty", async () => {
      const result = await orderService.deleteById("");
      expect(orderRepository.deleteById).not.toHaveBeenCalled();
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("INVALID_ID");
    });

    it("should handle not found", async () => {
      vi.mocked(orderRepository.deleteById).mockResolvedValue(fail("NOT_FOUND", "Order not found"));
      const result = await orderService.deleteById("550e8400-e29b-41d4-a716-446655440000");
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  // --- update ---
  describe("update", () => {
    it("should update an order", async () => {
      const existing = fakeOrder();
      const updated = { status: "confirmed" as OrderStatus };
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(existing));
      vi.mocked(orderRepository.update).mockResolvedValue(ok({ ...existing, ...updated } as Order));

      const result = await orderService.update(existing.id, updated);
      expect(result.ok).toBe(true);
      expect(orderRepository.update).toHaveBeenCalled();
    });

    it("should return NOT_FOUND when order doesn't exist", async () => {
      vi.mocked(orderRepository.findById).mockResolvedValue(ok(null));
      const result = await orderService.update("ghost-id", { status: "served" });
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("NOT_FOUND");
    });
  });

  // --- createOrder (with items) ---
  describe("createOrder", () => {
    it("should create an order with items", async () => {
      const input = validCreateInput({ notes: "Test note" });
      const expected = fakeOrder({ establishmentId: input.establishmentId, notes: input.notes });
      vi.mocked(orderRepository.create).mockResolvedValue(ok(expected));

      const result = await orderService.createOrder(input);

      expect(orderRepository.create).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.establishmentId).toBe(input.establishmentId);
      }
    });

    it("should propagate failure when repo fails", async () => {
      const input = validCreateInput();
      vi.mocked(orderRepository.create).mockResolvedValue(fail("CREATE_ERROR", "Failed to create order"));
      const result = await orderService.createOrder(input);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe("CREATE_ERROR");
    });
  });

  // --- markItemServed / closeOrder ---
  describe("item lifecycle", () => {
    it("markItemServed delegates to repo", async () => {
      vi.mocked(orderRepository.updateItemStatus).mockResolvedValue(ok(undefined));
      const result = await orderService.markItemServed("o1", "i1");
      expect(orderRepository.updateItemStatus).toHaveBeenCalledWith("o1", "i1", "served");
      expect(result.ok).toBe(true);
    });

    it("closeOrder delegates to repo", async () => {
      vi.mocked(orderRepository.closeOrder).mockResolvedValue(ok(undefined));
      const result = await orderService.closeOrder("o1");
      expect(orderRepository.closeOrder).toHaveBeenCalledWith("o1");
      expect(result.ok).toBe(true);
    });
  });
});

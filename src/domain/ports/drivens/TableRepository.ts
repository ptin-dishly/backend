import type { Result } from "@domain/value-objects/Result";

export interface RoomTable {
  id: string;
  roomId: string;
  tableNumber: string;
  capacity: number | null;
  establishmentId: string;
}

export interface CreateTableInput {
  roomId: string;
  tableNumber: string;
  capacity?: number | null;
}

export interface TableRepository {
  findAll(): Promise<Result<RoomTable[]>>;
  create(input: CreateTableInput): Promise<Result<RoomTable>>;
  delete(id: string): Promise<Result<boolean>>;
}

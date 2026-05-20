import type { Result } from "@domain/value-objects/Result";

export interface Room {
  id: string;
  name: string;
  establishmentId: string;
}

export interface RoomRepository {
  findAll(): Promise<Result<Room[]>>;
}

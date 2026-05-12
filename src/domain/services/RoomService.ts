import type { Room, RoomRepository } from "@domain/ports/drivens/RoomRepository";
import type { Result } from "@domain/value-objects/Result";

export class RoomService {
  constructor(private readonly roomRepository: RoomRepository) {}

  findAll(): Promise<Result<Room[]>> {
    return this.roomRepository.findAll();
  }
}

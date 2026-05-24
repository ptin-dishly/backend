import type {
  CreateTableInput,
  RoomTable,
  TableRepository,
} from "@domain/ports/drivens/TableRepository";
import type { Result } from "@domain/value-objects/Result";

export class TableService {
  constructor(private readonly tableRepository: TableRepository) {}

  findAll(): Promise<Result<RoomTable[]>> {
    return this.tableRepository.findAll();
  }

  create(input: CreateTableInput): Promise<Result<RoomTable>> {
    return this.tableRepository.create(input);
  }

  update(id: string, data: { tableNumber?: string; capacity?: number | null }): Promise<Result<RoomTable | null>> {
    return this.tableRepository.update(id, data);
  }

  delete(id: string): Promise<Result<boolean>> {
    return this.tableRepository.delete(id);
  }
}

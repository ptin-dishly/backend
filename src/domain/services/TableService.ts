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

  delete(id: string): Promise<Result<boolean>> {
    return this.tableRepository.delete(id);
  }
}

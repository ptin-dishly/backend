import type { Menu } from "@domain/entities/Menu";
import type { Result } from "@domain/value-objects/Result";

export interface CreateMenuData {
  id: string;
  establishmentId: string;
  name: string;
  isPublic: boolean;
  qrCodeUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuRepository {
  findById(id: string): Promise<Result<Menu | null>>;
  findAll(): Promise<Result<Menu[]>>;
  findByAllergen(allergenId: string): Promise<Result<Menu[]>>;
}

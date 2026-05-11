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

export interface CreateMenuInput {
  establishmentId: string;
  name: string;
  isPublic: boolean;
  qrCodeUrl: string | null;
  items: Array<{
    recipeId: string;
    price: number;
    displayOrder: number;
    isAvailable: boolean;
  }>;
}

export interface UpdateMenuData {
  establishmentId?: string;
  name?: string;
  isPublic?: boolean;
  qrCodeUrl?: string | null;
}

export interface MenuRepository {
  findById(id: string): Promise<Result<Menu | null>>;
  findByEstablishmentId(establishmentId: string): Promise<Result<Menu[]>>;
  findByAllergen(allergenId: string): Promise<Result<Menu[]>>;
  update(id: string, data: UpdateMenuData): Promise<Result<Menu>>;
  create(data: CreateMenuInput): Promise<Result<Menu>>;
}

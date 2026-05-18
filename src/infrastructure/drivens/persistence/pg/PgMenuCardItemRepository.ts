import type {
  MenuCardItemRepository,
  MenuCardItemWithRecipe,
  MenuItemAllergen,
} from "@domain/ports/drivens/MenuCardItemRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

const BASE_SELECT = `
  SELECT
    mci.id,
    mci.menu_card_id,
    mci.recipe_id,
    mci.price,
    mci.display_order,
    mci.is_available,
    r.establishment_id,
    r.name            AS recipe_name,
    r.description     AS recipe_description,
    r.category,
    r.portion_size_kg,
    r.servings,
    r.preparation_time,
    r.version,
    r.created_by,
    COALESCE(
      json_agg(
        json_build_object('code', a.code, 'nameEs', a.name_es, 'nameCa', a.name_ca)
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'
    ) AS allergens
  FROM menu_card_items mci
  INNER JOIN recipes r ON mci.recipe_id = r.id
  LEFT JOIN recipe_allergens ra ON ra.recipe_id = r.id AND ra.contains = TRUE
  LEFT JOIN allergens a ON a.id = ra.allergen_id
`;

const GROUP_AND_ORDER = `
  GROUP BY mci.id, mci.menu_card_id, mci.recipe_id, mci.price, mci.display_order,
           mci.is_available, r.establishment_id, r.name, r.description, r.category,
           r.portion_size_kg, r.servings, r.preparation_time, r.version, r.created_by
  ORDER BY mci.display_order ASC
`;

function mapRow(row: Record<string, unknown>): MenuCardItemWithRecipe {
  return {
    id: row.id as string,
    menuCardId: row.menu_card_id as string,
    recipeId: row.recipe_id as string,
    price: Number(row.price),
    displayOrder: row.display_order as number,
    isAvailable: row.is_available as boolean,
    establishmentId: row.establishment_id as string,
    recipeName: row.recipe_name as string,
    recipeDescription: row.recipe_description as string,
    category: row.category as string,
    portionSizeKg: Number(row.portion_size_kg),
    servings: row.servings as number,
    preparationTime: row.preparation_time as number,
    version: row.version as number,
    createdBy: row.created_by as string,
    allergens: (row.allergens as MenuItemAllergen[]) ?? [],
  };
}

export class PgMenuCardItemRepository implements MenuCardItemRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>> {
    try {
      const result = await this.pool.query(`${BASE_SELECT} ${GROUP_AND_ORDER};`);
      return ok(result.rows.map(mapRow));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menu card items with recipes", error);
    }
  }

  async findAllByEstablishmentWithRecipes(establishmentId: string): Promise<Result<MenuCardItemWithRecipe[]>> {
    try {
      const result = await this.pool.query(
        `${BASE_SELECT} WHERE r.establishment_id = $1 ${GROUP_AND_ORDER};`,
        [establishmentId],
      );
      return ok(result.rows.map(mapRow));
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menu card items by establishment", error);
    }
  }
}

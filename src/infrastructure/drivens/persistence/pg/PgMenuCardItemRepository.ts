import type {
  MenuCardItemRepository,
  MenuCardItemWithRecipe,
} from "@domain/ports/drivens/MenuCardItemRepository";
import type { Result } from "@domain/value-objects/Result";
import { fail, ok } from "@domain/value-objects/Result";
import type pg from "pg";

export class PgMenuCardItemRepository implements MenuCardItemRepository {
  constructor(private readonly pool: pg.Pool) {}

  async findAllWithRecipes(): Promise<Result<MenuCardItemWithRecipe[]>> {
    try {
      const query = `
        SELECT 
          mci.id, 
          mci.menu_card_id, 
          mci.recipe_id, 
          mci.price, 
          mci.display_order, 
          mci.is_available,
          r.establishment_id, 
          r.name AS recipe_name, 
          r.description AS recipe_description, 
          r.category, 
          r.portion_size_kg, 
          r.servings, 
          r.preparation_time, 
          r.version, 
          r.created_by
        FROM menu_card_items mci
        INNER JOIN recipes r ON mci.recipe_id = r.id
        ORDER BY mci.display_order ASC;
      `;

      const result = await this.pool.query(query);

      const items: MenuCardItemWithRecipe[] = result.rows.map((row) => ({
        id: row.id,
        menuCardId: row.menu_card_id,
        recipeId: row.recipe_id,
        price: Number(row.price),
        displayOrder: row.display_order,
        isAvailable: row.is_available,
        establishmentId: row.establishment_id,
        recipeName: row.recipe_name,
        recipeDescription: row.recipe_description,
        category: row.category,
        portionSizeKg: Number(row.portion_size_kg),
        servings: row.servings,
        preparationTime: row.preparation_time,
        version: row.version,
        createdBy: row.created_by,
      }));
      return ok(items);
    } catch (error) {
      return fail("RETRIEVE_ERROR", "Failed to retrieve menu card items with recipes", error);
    }
  }
}

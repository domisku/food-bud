import { CategoryResource } from "./category-resource";
import { DishResource } from "./dish-resource";
import { TagsResource } from "./tags-resource";
import { AICategorizer } from "../utils/ai-categorizer";

/**
 * Service for automatically categorizing dishes using AI analysis.
 * This service fetches dishes and categories, analyzes them, and applies
 * appropriate category tags to dishes.
 */
export class AutoCategorizationService {
  /**
   * Automatically categorizes all dishes in the database.
   * Fetches all dishes and categories, uses AI to determine appropriate
   * categories, and updates the database with new categorizations.
   * 
   * @param overwriteExisting If true, replaces existing categories. If false, only categorizes dishes without categories.
   * @returns Object containing statistics about the categorization process
   */
  static async autoCategorizeDishes(
    overwriteExisting: boolean = false
  ): Promise<{
    totalDishes: number;
    categorizedDishes: number;
    skippedDishes: number;
    failedDishes: number;
    categoriesByDish: Map<string, string[]>;
  }> {
    // Fetch all dishes and categories
    const [dishes, categories] = await Promise.all([
      DishResource.getDishes(),
      CategoryResource.getCategories(),
    ]);

    if (categories.length === 0) {
      throw new Error("No categories found. Please create categories first.");
    }

    const stats = {
      totalDishes: dishes.length,
      categorizedDishes: 0,
      skippedDishes: 0,
      failedDishes: 0,
      categoriesByDish: new Map<string, string[]>(),
    };

    // Process each dish
    for (const dish of dishes) {
      try {
        // Check if dish already has categories
        if (!overwriteExisting) {
          const existingCategories = await TagsResource.getDishCategoryIds(dish.id);
          if (existingCategories.length > 0) {
            stats.skippedDishes++;
            continue;
          }
        }

        // Use AI to determine appropriate categories
        const suggestedCategoryIds = AICategorizer.categorizeDish(dish, categories);

        if (suggestedCategoryIds.length > 0) {
          // If overwriting, delete existing categories first
          if (overwriteExisting) {
            await TagsResource.deleteDishTags(dish.id);
          }

          // Apply the suggested categories
          const tags = suggestedCategoryIds.map((categoryId) => ({
            dishId: dish.id,
            categoryId,
          }));

          await TagsResource.addTags(tags);

          stats.categorizedDishes++;
          stats.categoriesByDish.set(dish.id, suggestedCategoryIds);
        } else {
          stats.skippedDishes++;
        }
      } catch (error) {
        console.error(`Failed to categorize dish ${dish.id}:`, error);
        stats.failedDishes++;
      }
    }

    return stats;
  }

  /**
   * Categorizes a single dish.
   * 
   * @param dishId The ID of the dish to categorize
   * @param overwriteExisting If true, replaces existing categories
   * @returns Array of category IDs that were applied
   */
  static async categorizeSingleDish(
    dishId: string,
    overwriteExisting: boolean = false
  ): Promise<string[]> {
    const [dish, categories] = await Promise.all([
      DishResource.getDish(dishId),
      CategoryResource.getCategories(),
    ]);

    if (!dish) {
      throw new Error(`Dish with ID ${dishId} not found`);
    }

    if (categories.length === 0) {
      throw new Error("No categories found. Please create categories first.");
    }

    // Check existing categories
    if (!overwriteExisting) {
      const existingCategories = await TagsResource.getDishCategoryIds(dishId);
      if (existingCategories.length > 0) {
        return existingCategories;
      }
    }

    // Use AI to determine appropriate categories
    const suggestedCategoryIds = AICategorizer.categorizeDish(dish, categories);

    if (suggestedCategoryIds.length > 0) {
      // If overwriting, delete existing categories first
      if (overwriteExisting) {
        await TagsResource.deleteDishTags(dishId);
      }

      // Apply the suggested categories
      const tags = suggestedCategoryIds.map((categoryId) => ({
        dishId,
        categoryId,
      }));

      await TagsResource.addTags(tags);
    }

    return suggestedCategoryIds;
  }

  /**
   * Previews what categories would be assigned to dishes without actually applying them.
   * Useful for reviewing AI suggestions before committing.
   * 
   * @returns Map of dish IDs to suggested category IDs and names
   */
  static async previewCategorization(): Promise<
    Array<{
      dishId: string;
      dishName: string;
      currentCategories: string[];
      suggestedCategories: Array<{ id: string; name: string }>;
    }>
  > {
    const [dishes, categories] = await Promise.all([
      DishResource.getDishes(),
      CategoryResource.getCategories(),
    ]);

    const previews = [];

    for (const dish of dishes) {
      const currentCategoryIds = await TagsResource.getDishCategoryIds(dish.id);
      const currentCategoryNames = await CategoryResource.getCategoryNames(dish.id);

      const suggestedCategoryIds = AICategorizer.categorizeDish(dish, categories);
      const suggestedCategories = suggestedCategoryIds.map((id) => {
        const category = categories.find((c) => c.id === id);
        return {
          id,
          name: category?.name || "Unknown",
        };
      });

      previews.push({
        dishId: dish.id,
        dishName: dish.name,
        currentCategories: currentCategoryNames,
        suggestedCategories,
      });
    }

    return previews;
  }
}

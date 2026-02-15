import { ICategory } from "../models/category.interface";
import { IDish } from "../models/dish.interface";

/**
 * Interface for Quill delta operation
 */
interface QuillOp {
  insert: string | object;
  attributes?: any;
}

/**
 * Interface for Quill delta format
 */
interface QuillDelta {
  ops: QuillOp[];
}

/**
 * AI-powered categorization utility that automatically assigns categories to dishes
 * based on their names and descriptions using keyword matching and semantic analysis.
 */
export class AICategorizer {
  /**
   * Analyzes a dish and suggests appropriate categories based on its name and description.
   * Uses keyword matching and semantic patterns to determine relevance.
   * 
   * @param dish The dish to categorize
   * @param availableCategories All available categories
   * @returns Array of category IDs that match the dish
   */
  static categorizeDish(
    dish: IDish,
    availableCategories: ICategory[]
  ): string[] {
    const dishText = this.prepareDishText(dish);
    const matchedCategoryIds: string[] = [];

    for (const category of availableCategories) {
      if (this.matchesCategory(dishText, category)) {
        matchedCategoryIds.push(category.id);
      }
    }

    return matchedCategoryIds;
  }

  /**
   * Prepares dish text for analysis by combining name and description
   * and normalizing the text.
   */
  private static prepareDishText(dish: IDish): string {
    let text = dish.name.toLowerCase();
    
    // Parse description if it exists (it might be JSON from Quill editor)
    if (dish.description) {
      try {
        const descData: QuillDelta = JSON.parse(dish.description);
        // Quill stores content in ops array
        if (descData.ops && Array.isArray(descData.ops)) {
          const descText = descData.ops
            .map((op: QuillOp) => (typeof op.insert === "string" ? op.insert : ""))
            .join(" ");
          text += " " + descText.toLowerCase();
        }
      } catch {
        // If not JSON, treat as plain text
        text += " " + dish.description.toLowerCase();
      }
    }

    return text;
  }

  /**
   * Determines if a dish matches a category based on keyword analysis.
   * Uses various matching strategies including:
   * - Direct keyword matching
   * - Partial word matching
   * - Common food category patterns
   */
  private static matchesCategory(dishText: string, category: ICategory): boolean {
    const categoryName = category.name.toLowerCase();
    
    // Direct match - category name appears in dish text
    if (dishText.includes(categoryName)) {
      return true;
    }

    // Check if dish text contains words from category name
    const categoryWords = categoryName.split(/\s+/);
    for (const word of categoryWords) {
      if (word.length > 3 && dishText.includes(word)) {
        return true;
      }
    }

    // Apply specific categorization rules based on common patterns
    return this.applyCategoryRules(dishText, categoryName);
  }

  /**
   * Applies specific categorization rules for common food categories.
   * This can be extended with more sophisticated rules or ML models.
   */
  private static applyCategoryRules(dishText: string, categoryName: string): boolean {
    // Chicken/Poultry category rules
    if (this.matchesAnyWord(categoryName, ["chicken", "vištiena", "višta", "poultry"])) {
      return this.matchesAnyWord(dishText, [
        "chicken", "vištiena", "višta", "viščiukas",
        "grilled chicken", "fried chicken", "roasted chicken",
        "chicken breast", "chicken wing", "chicken thigh"
      ]);
    }

    // Beef category rules
    if (this.matchesAnyWord(categoryName, ["beef", "jautiena", "mėsa"])) {
      return this.matchesAnyWord(dishText, [
        "beef", "jautiena", "steak", "burger",
        "meatball", "mėsos", "mėsa"
      ]);
    }

    // Pork category rules
    if (this.matchesAnyWord(categoryName, ["pork", "kiauliena"])) {
      return this.matchesAnyWord(dishText, [
        "pork", "kiauliena", "bacon", "ham",
        "sausage", "dešra", "šoninė"
      ]);
    }

    // Fish/Seafood category rules
    if (this.matchesAnyWord(categoryName, ["fish", "žuvis", "seafood", "jūros gėrybės"])) {
      return this.matchesAnyWord(dishText, [
        "fish", "žuvis", "salmon", "lašiša", "tuna", "tunas",
        "cod", "menkė", "shrimp", "krevetė", "seafood"
      ]);
    }

    // Vegetarian/Vegan category rules
    if (this.matchesAnyWord(categoryName, ["vegetarian", "vegetariškas", "vegan", "veganiška"])) {
      return this.matchesAnyWord(dishText, [
        "vegetable", "daržovė", "salad", "salotos",
        "tofu", "veggie", "plant-based", "augalinis"
      ]) && !this.matchesAnyWord(dishText, [
        "chicken", "beef", "pork", "fish", "meat",
        "vištiena", "jautiena", "kiauliena", "žuvis", "mėsa"
      ]);
    }

    // Pasta category rules
    if (this.matchesAnyWord(categoryName, ["pasta", "makaronai"])) {
      return this.matchesAnyWord(dishText, [
        "pasta", "makaronai", "spaghetti", "spagečiai",
        "penne", "fusilli", "linguine", "noodle"
      ]);
    }

    // Soup category rules
    if (this.matchesAnyWord(categoryName, ["soup", "sriuba"])) {
      return this.matchesAnyWord(dishText, [
        "soup", "sriuba", "broth", "sultinys",
        "chowder", "bisque", "stew", "troškinys"
      ]);
    }

    // Dessert category rules
    if (this.matchesAnyWord(categoryName, ["dessert", "desertas", "sweet", "saldus"])) {
      return this.matchesAnyWord(dishText, [
        "cake", "tortas", "pie", "pyragas", "ice cream", "ledai",
        "chocolate", "šokoladas", "cookie", "sausainis",
        "dessert", "sweet", "saldus", "desertas"
      ]);
    }

    // Salad category rules
    if (this.matchesAnyWord(categoryName, ["salad", "salotos"])) {
      return this.matchesAnyWord(dishText, [
        "salad", "salotos", "lettuce", "salotos lapai",
        "greens", "žalumynai"
      ]);
    }

    // Breakfast category rules
    if (this.matchesAnyWord(categoryName, ["breakfast", "pusryčiai"])) {
      return this.matchesAnyWord(dishText, [
        "egg", "kiaušinis", "pancake", "blynai", "oatmeal", "avižinė",
        "breakfast", "pusryčiai", "cereal", "dribsniai"
      ]);
    }

    return false;
  }

  /**
   * Helper method to check if text contains any of the provided words.
   */
  private static matchesAnyWord(text: string, words: string[]): boolean {
    return words.some(word => text.includes(word.toLowerCase()));
  }

  /**
   * Batch categorizes multiple dishes at once.
   * Returns a map of dish IDs to their suggested category IDs.
   */
  static batchCategorizeDishes(
    dishes: IDish[],
    availableCategories: ICategory[]
  ): Map<string, string[]> {
    const results = new Map<string, string[]>();

    for (const dish of dishes) {
      const categoryIds = this.categorizeDish(dish, availableCategories);
      if (categoryIds.length > 0) {
        results.set(dish.id, categoryIds);
      }
    }

    return results;
  }
}

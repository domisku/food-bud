import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiResource {
  private static genAI: GoogleGenerativeAI | null = null;

  /**
   * Initialize the Gemini AI client
   */
  private static getClient(): GoogleGenerativeAI {
    if (!this.genAI) {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY environment variable is not set");
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI;
  }

  /**
   * Suggest categories for a dish based on its name
   * @param dishName The name of the dish
   * @param existingCategories List of existing category names
   * @returns A promise that resolves with an array of suggested category names
   */
  static async suggestCategories(
    dishName: string,
    existingCategories: string[],
  ): Promise<string[]> {
    if (!dishName || dishName.trim() === "") {
      return [];
    }

    try {
      const genAI = this.getClient();
      // Use the free gemini-1.5-flash model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Sanitize the dish name by escaping special characters
      const sanitizedDishName = dishName.replace(/["\\\n\r]/g, " ").trim();

      const prompt = `Given the dish name "${sanitizedDishName}" and the following existing categories: ${existingCategories.join(", ")}.

Suggest 3-5 most relevant category names from the existing categories list that would be appropriate for this dish. Only return category names that exist in the provided list.

Return ONLY a JSON array of category names, without any additional text or formatting. Example: ["Category1", "Category2", "Category3"]

If no existing categories match well, return an empty array: []`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      // Parse the JSON response
      try {
        const suggestions = JSON.parse(text);
        if (Array.isArray(suggestions)) {
          // Filter to only include categories that actually exist
          return suggestions.filter((cat) =>
            existingCategories.includes(cat),
          );
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text);
        return [];
      }

      return [];
    } catch (error) {
      console.error("Error getting category suggestions from Gemini:", error);
      // Fail gracefully - return empty array if API call fails
      return [];
    }
  }
}

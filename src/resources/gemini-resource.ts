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

    if (existingCategories.length === 0) {
      throw new Error("Nėra kategorijų. Pirmiausia sukurkite kategorijas.");
    }

    try {
      const genAI = this.getClient();
      // Use gemini-pro (stable free tier model)
      // Alternative: gemini-1.5-flash-latest for newer features
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Sanitize the dish name by escaping special characters
      const sanitizedDishName = dishName.replace(/["\\\n\r]/g, " ").trim();

      const prompt = `Given the dish name "${sanitizedDishName}" and the following existing categories: ${existingCategories.join(", ")}.

Suggest 3-5 most relevant category names from the existing categories list that would be appropriate for this dish. Only return category names that exist in the provided list.

Return ONLY a JSON array of category names, without any additional text or formatting. Example: ["Category1", "Category2", "Category3"]

If no existing categories match well, return an empty array: []`;

      console.log("Gemini request - Dish:", sanitizedDishName, "Categories:", existingCategories);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();

      console.log("Gemini response:", text);

      // Parse the JSON response
      try {
        // Remove markdown code blocks if present
        let cleanText = text;
        if (text.startsWith("```")) {
          cleanText = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }

        const suggestions = JSON.parse(cleanText);
        if (Array.isArray(suggestions)) {
          // Filter to only include categories that actually exist
          const filtered = suggestions.filter((cat) =>
            existingCategories.includes(cat),
          );
          console.log("Filtered suggestions:", filtered);
          return filtered;
        } else {
          throw new Error("AI atsakymas nėra masyvas");
        }
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", text, parseError);
        throw new Error(`Nepavyko apdoroti AI atsakymo. Atsakymas: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.error("Error getting category suggestions from Gemini:", error);
      // Re-throw the error so the UI can display it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("AI klaida: " + String(error));
    }
  }
}

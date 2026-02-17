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

    // Use gemini-2.5-flash-lite as recommended by Google AI Studio
    const modelName = "gemini-2.5-flash-lite";
    console.log("Attempting to use Gemini model:", modelName);
    console.log("API Key configured:", import.meta.env.VITE_GEMINI_API_KEY ? "Yes (length: " + import.meta.env.VITE_GEMINI_API_KEY.length + ")" : "No");

    try {
      const genAI = this.getClient();
      const model = genAI.getGenerativeModel({ model: modelName });

      // Sanitize the dish name by escaping special characters
      const sanitizedDishName = dishName.replace(/["\\\n\r]/g, " ").trim();

      // Format prompt similar to Google AI Studio recommendation
      const prompt = `Given the dish "${sanitizedDishName}" and the following categories: ${existingCategories.join(", ")}.
Suggest the most relevant categories for this dish.
Format your response as a JSON array of strings, e.g., ["Category1", "Category2"].
Do not include any other text or explanation outside of the JSON array.`;

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

        const suggestedCategories = JSON.parse(cleanText);
        if (Array.isArray(suggestedCategories)) {
          // Filter to only include categories that actually exist
          const filtered = suggestedCategories.filter((cat) =>
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
      console.error("Error suggesting dish categories:", error);
      // Re-throw the error so the UI can display it
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("AI klaida: " + String(error));
    }
  }
}

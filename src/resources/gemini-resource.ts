import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiResource {
  private static genAI: GoogleGenerativeAI | null = null;
  
  // Model fallback order to handle rate limits
  private static readonly MODEL_FALLBACK_ORDER = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3-flash-preview"
  ];

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
   * Check if an error is a rate limit error (429)
   */
  private static isRateLimitError(error: any): boolean {
    // Check for rate limit error indicators
    if (error?.status === 429) return true;
    if (error?.response?.status === 429) return true;
    
    const errorMessage = error?.message || String(error);
    return errorMessage.toLowerCase().includes("429") || 
           errorMessage.toLowerCase().includes("rate limit");
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

    // Sanitize the dish name by escaping special characters
    const sanitizedDishName = dishName.replace(/["\\\n\r]/g, " ").trim();

    // Format prompt similar to Google AI Studio recommendation
    const prompt = `Given the dish "${sanitizedDishName}" and the following categories: ${existingCategories.join(", ")}.
Suggest the most relevant categories for this dish.
Format your response as a JSON array of strings, e.g., ["Category1", "Category2"].
Do not include any other text or explanation outside of the JSON array.`;

    const genAI = this.getClient();

    // Try each model in the fallback order
    for (let i = 0; i < this.MODEL_FALLBACK_ORDER.length; i++) {
      const modelName = this.MODEL_FALLBACK_ORDER[i];
      const isLastModel = i === this.MODEL_FALLBACK_ORDER.length - 1;
      
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text().trim();

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
            return suggestedCategories.filter((cat) =>
              existingCategories.includes(cat),
            );
          } else {
            throw new Error("AI atsakymas nėra masyvas");
          }
        } catch (parseError) {
          throw new Error(`Nepavyko apdoroti AI atsakymo. Atsakymas: ${text.substring(0, 100)}`);
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error("AI klaida: " + String(error));
        
        // If this is a rate limit error and we have more models to try, continue to next model
        if (this.isRateLimitError(error) && !isLastModel) {
          console.warn(`Rate limit hit for model ${modelName}, trying next model...`);
          continue;
        }
        
        // If it's not a rate limit error or we're out of models, throw
        throw errorObj;
      }
    }

    // This should never be reached due to the throw in the catch block on the last iteration
    throw new Error("AI klaida: nepavyko gauti atsakymo");
  }
}

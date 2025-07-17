import OpenAI from "openai";

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    // Initialize OpenAI client with the API key from environment variables
    this.openai = new OpenAI({
      apiKey: process.env.SECRET_OPENAI_API_KEY,
    });
  }

  /**
   * Rephrases text and corrects grammatical errors using OpenAI
   * @param text The text to rephrase and correct
   * @returns The rephrased and corrected text
   */
  public async rephraseText(text: string): Promise<string> {
    try {
      // Input validation
      if (!text || text.trim() === "") {
        return "Please provide text to rephrase.";
      }

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that rephrases text and corrects grammatical errors. Keep the same meaning but improve clarity and correctness.",
          },
          {
            role: "user",
            content: text,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      // Return the rephrased text
      return response.choices[0].message.content || "Unable to rephrase text.";
    } catch (error) {
      console.error("Error rephrasing text:", error);
      return `Error: Unable to rephrase text. ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  }
}

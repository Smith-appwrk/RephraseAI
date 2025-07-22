import axios from "axios";

export class OpenAIService {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openai.com/v1/chat/completions";
  }

  public async rephraseText(text: string): Promise<string> {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that rephrases and corrects grammar. Return only the rephrased, grammatically correct version as plain text.",
            },
            {
              role: "user",
              content: text,
            },
          ],
          max_tokens: 500,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data.choices[0].message.content.trim();
    } catch (error: any) {
      console.error("OpenAI API error:", error.response?.data || error.message || error);
      throw new Error("Failed to rephrase text.");
    }
  }
}

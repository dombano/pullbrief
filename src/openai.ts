import OpenAI from "openai";

export interface SummaryResult {
  summary: string;
  tokensUsed: number;
}

export async function generateSummary(
  prompt: string,
  apiKey: string,
  model: string = "gpt-4o-mini"
): Promise<SummaryResult> {
  const client = new OpenAI({ apiKey });

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that generates concise, clear pull request summaries for software engineers.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 512,
  });

  const message = response.choices[0]?.message?.content;
  if (!message) {
    throw new Error("OpenAI returned an empty response");
  }

  return {
    summary: message.trim(),
    tokensUsed: response.usage?.total_tokens ?? 0,
  };
}

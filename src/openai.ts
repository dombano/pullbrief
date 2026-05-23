import OpenAI from 'openai';
import * as core from '@actions/core';
import { withRetry } from './retry';

export interface OpenAIOptions {
  apiKey: string;
  model: string;
  maxTokens: number;
}

export async function generateSummary(
  prompt: string,
  options: OpenAIOptions
): Promise<string> {
  const client = new OpenAI({ apiKey: options.apiKey });

  core.debug(`Calling OpenAI model: ${options.model}`);

  const response = await withRetry(
    () =>
      client.chat.completions.create({
        model: options.model,
        max_tokens: options.maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    {
      maxAttempts: 3,
      initialDelayMs: 1000,
      backoffFactor: 2,
    }
  );

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('OpenAI returned an empty response');
  }

  core.debug(`Received summary (${content.length} chars)`);
  return content.trim();
}

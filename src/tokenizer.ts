/**
 * Utilities for estimating token counts to stay within model context limits.
 * Uses a simple approximation: ~4 characters per token (common heuristic for GPT models).
 */

const CHARS_PER_TOKEN = 4;

/**
 * Estimate the number of tokens in a string.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Truncate text to fit within a maximum token budget.
 * Returns the truncated string and whether truncation occurred.
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number
): { text: string; truncated: boolean } {
  if (maxTokens <= 0) {
    return { text: "", truncated: text.length > 0 };
  }

  const maxChars = maxTokens * CHARS_PER_TOKEN;

  if (text.length <= maxChars) {
    return { text, truncated: false };
  }

  return {
    text: text.slice(0, maxChars),
    truncated: true,
  };
}

/**
 * Calculate remaining token budget after accounting for used tokens.
 */
export function remainingTokens(totalBudget: number, usedText: string): number {
  const used = estimateTokens(usedText);
  return Math.max(0, totalBudget - used);
}

/**
 * Split a token budget proportionally across multiple sections.
 */
export function splitTokenBudget(
  totalTokens: number,
  weights: number[]
): number[] {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return weights.map(() => 0);
  return weights.map((w) => Math.floor((w / totalWeight) * totalTokens));
}

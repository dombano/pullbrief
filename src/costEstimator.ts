// Cost estimation for OpenAI API usage

const PRICING: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.000005, output: 0.000015 },
  "gpt-4o-mini": { input: 0.00000015, output: 0.0000006 },
  "gpt-4-turbo": { input: 0.00001, output: 0.00003 },
  "gpt-3.5-turbo": { input: 0.0000005, output: 0.0000015 },
};

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface CostEstimate {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  breakdown: {
    inputCost: number;
    outputCost: number;
  };
}

export function estimateCost(model: string, usage: TokenUsage): CostEstimate {
  const pricing = PRICING[model] ?? PRICING["gpt-4o-mini"];

  const inputCost = usage.promptTokens * pricing.input;
  const outputCost = usage.completionTokens * pricing.output;
  const estimatedCostUsd = inputCost + outputCost;

  return {
    model,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    estimatedCostUsd,
    breakdown: { inputCost, outputCost },
  };
}

export function formatCostEstimate(estimate: CostEstimate): string {
  const { model, totalTokens, estimatedCostUsd, breakdown } = estimate;
  const cost = estimatedCostUsd.toFixed(6);
  const inputCost = breakdown.inputCost.toFixed(6);
  const outputCost = breakdown.outputCost.toFixed(6);
  return (
    `Model: ${model} | Tokens: ${totalTokens} ` +
    `(in: ${estimate.promptTokens}, out: ${estimate.completionTokens}) | ` +
    `Cost: $${cost} (input: $${inputCost}, output: $${outputCost})`
  );
}

export function getSupportedModels(): string[] {
  return Object.keys(PRICING);
}

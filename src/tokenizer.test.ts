import {
  estimateTokens,
  truncateToTokenLimit,
  remainingTokens,
  splitTokenBudget,
} from "./tokenizer";

describe("estimateTokens", () => {
  it("returns 0 for empty string", () => {
    expect(estimateTokens("")).toBe(0);
  });

  it("estimates tokens based on character count", () => {
    // 4 chars per token heuristic
    expect(estimateTokens("abcd")).toBe(1);
    expect(estimateTokens("abcdefgh")).toBe(2);
  });

  it("rounds up partial tokens", () => {
    expect(estimateTokens("abc")).toBe(1); // 3 chars -> ceil(3/4) = 1
    expect(estimateTokens("abcde")).toBe(2); // 5 chars -> ceil(5/4) = 2
  });
});

describe("truncateToTokenLimit", () => {
  it("returns original text when within limit", () => {
    const result = truncateToTokenLimit("hello", 100);
    expect(result.text).toBe("hello");
    expect(result.truncated).toBe(false);
  });

  it("truncates text exceeding token limit", () => {
    const longText = "a".repeat(100);
    const result = truncateToTokenLimit(longText, 10);
    expect(result.text.length).toBe(40); // 10 tokens * 4 chars
    expect(result.truncated).toBe(true);
  });

  it("returns empty string for zero token limit", () => {
    const result = truncateToTokenLimit("some text", 0);
    expect(result.text).toBe("");
    expect(result.truncated).toBe(true);
  });

  it("handles empty input string", () => {
    const result = truncateToTokenLimit("", 50);
    expect(result.text).toBe("");
    expect(result.truncated).toBe(false);
  });
});

describe("remainingTokens", () => {
  it("calculates remaining budget after used text", () => {
    const remaining = remainingTokens(100, "a".repeat(40)); // 40 chars = 10 tokens
    expect(remaining).toBe(90);
  });

  it("returns 0 when budget is exhausted", () => {
    const remaining = remainingTokens(5, "a".repeat(100));
    expect(remaining).toBe(0);
  });
});

describe("splitTokenBudget", () => {
  it("splits budget proportionally", () => {
    const result = splitTokenBudget(100, [1, 1]);
    expect(result).toEqual([50, 50]);
  });

  it("handles unequal weights", () => {
    const result = splitTokenBudget(90, [1, 2]);
    expect(result).toEqual([30, 60]);
  });

  it("returns zeros for empty weights", () => {
    const result = splitTokenBudget(100, [0, 0]);
    expect(result).toEqual([0, 0]);
  });
});

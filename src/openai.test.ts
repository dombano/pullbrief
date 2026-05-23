import { generateSummary, SummaryResult } from "./openai";
import OpenAI from "openai";

jest.mock("openai");

const mockCreate = jest.fn();

(OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(() => ({
  chat: {
    completions: {
      create: mockCreate,
    },
  },
} as unknown as OpenAI));

describe("generateSummary", () => {
  const fakePrompt = "Summarize this PR";
  const fakeApiKey = "sk-test-key";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns summary and token count on success", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "  Adds login feature.  " } }],
      usage: { total_tokens: 42 },
    });

    const result: SummaryResult = await generateSummary(fakePrompt, fakeApiKey);

    expect(result.summary).toBe("Adds login feature.");
    expect(result.tokensUsed).toBe(42);
  });

  it("uses the provided model", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Summary" } }],
      usage: { total_tokens: 10 },
    });

    await generateSummary(fakePrompt, fakeApiKey, "gpt-4o");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ model: "gpt-4o" })
    );
  });

  it("throws when OpenAI returns empty content", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
      usage: { total_tokens: 0 },
    });

    await expect(generateSummary(fakePrompt, fakeApiKey)).rejects.toThrow(
      "OpenAI returned an empty response"
    );
  });

  it("defaults tokensUsed to 0 when usage is absent", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Summary" } }],
      usage: undefined,
    });

    const result = await generateSummary(fakePrompt, fakeApiKey);
    expect(result.tokensUsed).toBe(0);
  });
});

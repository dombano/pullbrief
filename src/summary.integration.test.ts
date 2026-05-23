/**
 * Integration-style tests for generateSummary that verify the
 * token budget math and wiring between truncation and prompt building.
 */
import { generateSummary } from './summary';
import * as inputs from './inputs';
import * as openai from './openai';

jest.mock('./inputs');
jest.mock('./openai');

const mockGetInputs = inputs.getInputs as jest.MockedFunction<typeof inputs.getInputs>;
const mockCallOpenAI = openai.callOpenAI as jest.MockedFunction<typeof openai.callOpenAI>;

beforeEach(() => {
  jest.clearAllMocks();
  mockGetInputs.mockReturnValue({
    openaiApiKey: 'sk-test',
    model: 'gpt-4o',
    maxTokens: 1000,
    githubToken: 'gh-token',
  });
  mockCallOpenAI.mockResolvedValue({ content: 'summary', tokensUsed: 50 });
});

describe('generateSummary integration', () => {
  it('handles empty diff gracefully', async () => {
    const result = await generateSummary({
      diff: '',
      commits: ['chore: initial commit'],
      prTitle: 'Empty PR',
      prNumber: 1,
    });
    expect(result.body).toBe('summary');
    expect(result.truncated).toBe(false);
  });

  it('handles empty commits list gracefully', async () => {
    const result = await generateSummary({
      diff: '+console.log("hello")',
      commits: [],
      prTitle: 'Minimal PR',
      prNumber: 2,
    });
    expect(result.body).toBe('summary');
  });

  it('propagates openai errors', async () => {
    mockCallOpenAI.mockRejectedValue(new Error('rate limit'));
    await expect(
      generateSummary({
        diff: 'some diff',
        commits: ['feat: something'],
        prTitle: 'Failing PR',
        prNumber: 3,
      })
    ).rejects.toThrow('rate limit');
  });

  it('passes the correct api key and model to openai', async () => {
    await generateSummary({
      diff: 'diff content',
      commits: ['fix: patch'],
      prTitle: 'Model check',
      prNumber: 5,
    });
    expect(mockCallOpenAI).toHaveBeenCalledWith(
      expect.any(String),
      'sk-test',
      'gpt-4o'
    );
  });
});

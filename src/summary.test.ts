import { generateSummary, SummaryInput } from './summary';
import * as inputs from './inputs';
import * as openai from './openai';
import * as prompt from './prompt';
import * as truncate from './truncate';

jest.mock('./inputs');
jest.mock('./openai');
jest.mock('./prompt');
jest.mock('./truncate');

const mockGetInputs = inputs.getInputs as jest.MockedFunction<typeof inputs.getInputs>;
const mockCallOpenAI = openai.callOpenAI as jest.MockedFunction<typeof openai.callOpenAI>;
const mockBuildPrompt = prompt.buildPrompt as jest.MockedFunction<typeof prompt.buildPrompt>;
const mockTruncateDiff = truncate.truncateDiff as jest.MockedFunction<typeof truncate.truncateDiff>;
const mockTruncateCommits = truncate.truncateCommits as jest.MockedFunction<typeof truncate.truncateCommits>;

const defaultInputs = {
  openaiApiKey: 'test-key',
  model: 'gpt-4o',
  maxTokens: 4000,
  githubToken: 'gh-token',
};

const sampleInput: SummaryInput = {
  diff: 'diff --git a/foo.ts b/foo.ts\n+added line',
  commits: ['feat: add new feature', 'fix: fix bug'],
  prTitle: 'Add new feature',
  prNumber: 42,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetInputs.mockReturnValue(defaultInputs);
  mockTruncateDiff.mockReturnValue({ diff: sampleInput.diff, wasTruncated: false });
  mockTruncateCommits.mockReturnValue({ commits: sampleInput.commits, wasTruncated: false });
  mockBuildPrompt.mockReturnValue('built prompt');
  mockCallOpenAI.mockResolvedValue({ content: 'PR summary text', tokensUsed: 120 });
});

describe('generateSummary', () => {
  it('returns summary body from openai response', async () => {
    const result = await generateSummary(sampleInput);
    expect(result.body).toBe('PR summary text');
    expect(result.tokensUsed).toBe(120);
  });

  it('sets truncated false when neither diff nor commits were truncated', async () => {
    const result = await generateSummary(sampleInput);
    expect(result.truncated).toBe(false);
  });

  it('sets truncated true when diff was truncated', async () => {
    mockTruncateDiff.mockReturnValue({ diff: 'short diff', wasTruncated: true });
    const result = await generateSummary(sampleInput);
    expect(result.truncated).toBe(true);
  });

  it('sets truncated true when commits were truncated', async () => {
    mockTruncateCommits.mockReturnValue({ commits: ['one commit'], wasTruncated: true });
    const result = await generateSummary(sampleInput);
    expect(result.truncated).toBe(true);
  });

  it('passes prTitle and prNumber to buildPrompt', async () => {
    await generateSummary(sampleInput);
    expect(mockBuildPrompt).toHaveBeenCalledWith(
      expect.objectContaining({ prTitle: 'Add new feature', prNumber: 42 })
    );
  });
});

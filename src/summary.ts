import { getInputs } from './inputs';
import { callOpenAI } from './openai';
import { buildPrompt } from './prompt';
import { formatDiffForPrompt } from './diff';
import { formatCommitsForPrompt } from './commits';
import { truncateDiff, truncateCommits } from './truncate';

export interface SummaryInput {
  diff: string;
  commits: string[];
  prTitle: string;
  prNumber: number;
}

export interface SummaryResult {
  body: string;
  truncated: boolean;
  tokensUsed?: number;
}

export async function generateSummary(
  input: SummaryInput
): Promise<SummaryResult> {
  const inputs = getInputs();

  const maxDiffTokens = Math.floor(inputs.maxTokens * 0.6);
  const maxCommitTokens = Math.floor(inputs.maxTokens * 0.2);

  const { diff: truncatedDiff, wasTruncated: diffTruncated } = truncateDiff(
    input.diff,
    maxDiffTokens
  );

  const { commits: truncatedCommits, wasTruncated: commitsTruncated } =
    truncateCommits(input.commits, maxCommitTokens);

  const formattedDiff = formatDiffForPrompt(truncatedDiff);
  const formattedCommits = formatCommitsForPrompt(truncatedCommits);

  const prompt = buildPrompt({
    diff: formattedDiff,
    commits: formattedCommits,
    prTitle: input.prTitle,
    prNumber: input.prNumber,
    diffTruncated,
    commitsTruncated,
  });

  const response = await callOpenAI(prompt, inputs.openaiApiKey, inputs.model);

  return {
    body: response.content,
    truncated: diffTruncated || commitsTruncated,
    tokensUsed: response.tokensUsed,
  };
}

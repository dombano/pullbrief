/**
 * Builds the LLM prompt used to generate PR summaries.
 * Combines formatted diff and commit messages into a structured prompt.
 */

export interface PromptInput {
  /** Formatted diff string produced by formatDiffForPrompt */
  diff: string;
  /** Formatted commit log produced by formatCommitsForPrompt */
  commits: string;
  /** Optional PR title to give the model additional context */
  prTitle?: string;
}

export interface PromptResult {
  /** The full prompt string ready to send to the LLM */
  prompt: string;
  /** Estimated token count (rough 4-chars-per-token heuristic) */
  estimatedTokens: number;
}

/**
 * Maximum characters allowed in the combined diff + commits section.
 * Keeps prompts within typical LLM context limits (~16k tokens).
 */
const MAX_CONTEXT_CHARS = 48_000;

/**
 * System instruction that tells the model its role and output format.
 */
const SYSTEM_INSTRUCTION = `You are a senior software engineer writing a concise pull request summary.
Your goal is to help reviewers quickly understand what changed and why.

Guidelines:
- Write in plain English, present tense
- Lead with a one-sentence TL;DR
- Follow with a short bullet list of the key changes (max 6 bullets)
- Note any potential risks or areas needing careful review, if applicable
- Do NOT repeat the raw diff or commit messages verbatim
- Keep the total summary under 200 words`;

/**
 * Builds a prompt for the LLM that summarises a pull request.
 *
 * @param input - Diff text, commit messages, and optional PR title
 * @returns The assembled prompt and a rough token estimate
 */
export function buildPrompt(input: PromptInput): PromptResult {
  const { diff, commits, prTitle } = input;

  // Truncate context if it exceeds the safety limit
  const rawContext = `${diff}\n\n${commits}`;
  const context =
    rawContext.length > MAX_CONTEXT_CHARS
      ? rawContext.slice(0, MAX_CONTEXT_CHARS) +
        "\n\n[...context truncated to fit token limit...]"
      : rawContext;

  const titleSection = prTitle
    ? `Pull Request Title: ${prTitle}\n\n`
    : "";

  const prompt = [
    SYSTEM_INSTRUCTION,
    "",
    "---",
    "",
    `${titleSection}${context}`,
    "",
    "---",
    "",
    "Please write the pull request summary now:",
  ].join("\n");

  const estimatedTokens = Math.ceil(prompt.length / 4);

  return { prompt, estimatedTokens };
}

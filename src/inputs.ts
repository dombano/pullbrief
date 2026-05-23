import * as core from '@actions/core';

export interface ActionInputs {
  githubToken: string;
  openaiApiKey: string;
  openaiModel: string;
  maxDiffLines: number;
  maxCommits: number;
}

export function getInputs(): ActionInputs {
  const githubToken = core.getInput('github-token', { required: true });
  const openaiApiKey = core.getInput('openai-api-key', { required: true });
  const openaiModel = core.getInput('openai-model') || 'gpt-4o-mini';

  const rawMaxDiffLines = core.getInput('max-diff-lines');
  const maxDiffLines = rawMaxDiffLines ? parseInt(rawMaxDiffLines, 10) : 500;

  const rawMaxCommits = core.getInput('max-commits');
  const maxCommits = rawMaxCommits ? parseInt(rawMaxCommits, 10) : 50;

  if (isNaN(maxDiffLines) || maxDiffLines <= 0) {
    throw new Error(`Invalid max-diff-lines value: "${rawMaxDiffLines}"`);
  }

  if (isNaN(maxCommits) || maxCommits <= 0) {
    throw new Error(`Invalid max-commits value: "${rawMaxCommits}"`);
  }

  return {
    githubToken,
    openaiApiKey,
    openaiModel,
    maxDiffLines,
    maxCommits,
  };
}

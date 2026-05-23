import * as github from '@actions/github';

export interface DiffSummary {
  filesChanged: number;
  additions: number;
  deletions: number;
  patches: string[];
}

/**
 * Fetches the pull request diff from GitHub and parses it into a summary.
 */
export async function getPullRequestDiff(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<DiffSummary> {
  const { data: files } = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 100,
  });

  const additions = files.reduce((sum, f) => sum + f.additions, 0);
  const deletions = files.reduce((sum, f) => sum + f.deletions, 0);
  const patches = files
    .filter((f) => f.patch !== undefined)
    .map((f) => `### ${f.filename}\n${f.patch}`);

  return {
    filesChanged: files.length,
    additions,
    deletions,
    patches,
  };
}

/**
 * Formats a DiffSummary into a human-readable string for LLM context.
 */
export function formatDiffForPrompt(diff: DiffSummary): string {
  const header = `Files changed: ${diff.filesChanged} | +${diff.additions} -${diff.deletions}\n`;
  const body = diff.patches.slice(0, 20).join('\n\n');
  return header + body;
}

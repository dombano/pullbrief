import * as github from '@actions/github';

export interface CommitInfo {
  sha: string;
  message: string;
  author: string;
}

/**
 * Retrieves commits associated with a pull request.
 */
export async function getPullRequestCommits(
  octokit: ReturnType<typeof github.getOctokit>,
  owner: string,
  repo: string,
  pullNumber: number
): Promise<CommitInfo[]> {
  const { data: commits } = await octokit.rest.pulls.listCommits({
    owner,
    repo,
    pull_number: pullNumber,
    per_page: 50,
  });

  return commits.map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0], // subject line only
    author: c.commit.author?.name ?? 'unknown',
  }));
}

/**
 * Formats commit list into a concise string for LLM context.
 */
export function formatCommitsForPrompt(commits: CommitInfo[]): string {
  if (commits.length === 0) return 'No commits found.';
  return commits
    .map((c) => `- [${c.sha}] ${c.message} (${c.author})`)
    .join('\n');
}

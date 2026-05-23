import * as github from '@actions/github';

export interface PullRequestContext {
  owner: string;
  repo: string;
  pullNumber: number;
  title: string;
  body: string | null;
}

export async function getPullRequestContext(
  token: string
): Promise<PullRequestContext> {
  const octokit = github.getOctokit(token);
  const context = github.context;

  if (!context.payload.pull_request) {
    throw new Error('This action must be run on a pull_request event');
  }

  const { owner, repo } = context.repo;
  const pullNumber = context.payload.pull_request.number;

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: pullNumber,
  });

  return {
    owner,
    repo,
    pullNumber,
    title: pr.title,
    body: pr.body,
  };
}

export async function updatePullRequestBody(
  token: string,
  context: PullRequestContext,
  summary: string
): Promise<void> {
  const octokit = github.getOctokit(token);
  const marker = '<!-- pullbrief -->';
  const block = `${marker}\n## Summary\n${summary}\n${marker}`;

  const existingBody = context.body ?? '';
  const newBody = existingBody.includes(marker)
    ? existingBody.replace(new RegExp(`${marker}[\\s\\S]*?${marker}`), block)
    : `${existingBody}\n\n${block}`.trim();

  const { owner, repo, pullNumber } = context;
  await octokit.rest.pulls.update({
    owner,
    repo,
    pull_number: pullNumber,
    body: newBody,
  });
}

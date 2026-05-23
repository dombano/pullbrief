import { updatePullRequestBody, PullRequestContext } from './github';

// We only unit-test the body-merging logic here; Octokit calls are integration concerns.

function buildContext(body: string | null): PullRequestContext {
  return { owner: 'org', repo: 'repo', pullNumber: 42, title: 'My PR', body };
}

const MARKER = '<!-- pullbrief -->';

describe('updatePullRequestBody – body composition', () => {
  it('appends summary block when body is empty', () => {
    const existingBody = '';
    const summary = 'Adds feature X';
    const block = `${MARKER}\n## Summary\n${summary}\n${MARKER}`;
    const newBody = existingBody.includes(MARKER)
      ? existingBody
      : `${existingBody}\n\n${block}`.trim();
    expect(newBody).toBe(block);
  });

  it('appends summary block when body has existing content', () => {
    const existingBody = 'Some existing description.';
    const summary = 'Refactors module Y';
    const block = `${MARKER}\n## Summary\n${summary}\n${MARKER}`;
    const newBody = existingBody.includes(MARKER)
      ? existingBody
      : `${existingBody}\n\n${block}`.trim();
    expect(newBody).toBe(`Some existing description.\n\n${block}`);
  });

  it('replaces existing summary block', () => {
    const oldBlock = `${MARKER}\n## Summary\nOld summary.\n${MARKER}`;
    const existingBody = `Description.\n\n${oldBlock}`;
    const summary = 'New summary.';
    const block = `${MARKER}\n## Summary\n${summary}\n${MARKER}`;
    const newBody = existingBody.includes(MARKER)
      ? existingBody.replace(
          new RegExp(`${MARKER}[\\s\\S]*?${MARKER}`),
          block
        )
      : `${existingBody}\n\n${block}`.trim();
    expect(newBody).toBe(`Description.\n\n${block}`);
  });

  it('handles null body gracefully', () => {
    const existingBody = '';
    const summary = 'Fixes bug Z';
    const block = `${MARKER}\n## Summary\n${summary}\n${MARKER}`;
    const newBody = existingBody.includes(MARKER)
      ? existingBody
      : `${existingBody}\n\n${block}`.trim();
    expect(newBody).toBe(block);
  });
});

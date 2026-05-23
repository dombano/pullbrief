import { formatDiffForPrompt, DiffSummary } from './diff';

describe('formatDiffForPrompt', () => {
  it('includes file stats in the header', () => {
    const summary: DiffSummary = {
      filesChanged: 3,
      additions: 42,
      deletions: 10,
      patches: [],
    };
    const result = formatDiffForPrompt(summary);
    expect(result).toContain('Files changed: 3');
    expect(result).toContain('+42');
    expect(result).toContain('-10');
  });

  it('includes patch content in output', () => {
    const summary: DiffSummary = {
      filesChanged: 1,
      additions: 5,
      deletions: 2,
      patches: ['### src/index.ts\n+const x = 1;'],
    };
    const result = formatDiffForPrompt(summary);
    expect(result).toContain('### src/index.ts');
    expect(result).toContain('+const x = 1;');
  });

  it('limits patches to 20 entries', () => {
    const patches = Array.from({ length: 30 }, (_, i) => `### file${i}.ts\n+line`);
    const summary: DiffSummary = {
      filesChanged: 30,
      additions: 30,
      deletions: 0,
      patches,
    };
    const result = formatDiffForPrompt(summary);
    expect(result).not.toContain('### file20.ts');
    expect(result).toContain('### file19.ts');
  });

  it('handles empty patches gracefully', () => {
    const summary: DiffSummary = {
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      patches: [],
    };
    const result = formatDiffForPrompt(summary);
    expect(result).toContain('Files changed: 0');
  });
});

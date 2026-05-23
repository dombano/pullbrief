import { buildCacheKey, getCached, setCached, clearCache } from './cache';
import { formatDiffForPrompt } from './diff';
import { formatCommitsForPrompt } from './commits';

const SAMPLE_DIFF = `diff --git a/src/index.ts b/src/index.ts
+++ b/src/index.ts
@@ -1,3 +1,6 @@
+import { foo } from './foo';
+
 export function main() {
+  foo();
 }`;

const SAMPLE_COMMITS = [
  { sha: 'abc123', message: 'feat: add foo integration' },
  { sha: 'def456', message: 'fix: handle edge case in main' },
];

beforeEach(() => {
  clearCache();
});

describe('cache integration with diff and commits formatters', () => {
  it('caches a summary keyed by formatted diff and commits', () => {
    const formattedDiff = formatDiffForPrompt(SAMPLE_DIFF);
    const formattedCommits = formatCommitsForPrompt(SAMPLE_COMMITS);
    const key = buildCacheKey(formattedDiff, formattedCommits);

    expect(getCached(key)).toBeNull();

    const summary = 'Added foo integration and fixed edge case in main.';
    setCached(key, summary);

    expect(getCached(key)).toBe(summary);
  });

  it('produces different cache keys for different diffs', () => {
    const diff1 = formatDiffForPrompt(SAMPLE_DIFF);
    const diff2 = formatDiffForPrompt(SAMPLE_DIFF + '\n+extra line');
    const commits = formatCommitsForPrompt(SAMPLE_COMMITS);

    const key1 = buildCacheKey(diff1, commits);
    const key2 = buildCacheKey(diff2, commits);

    expect(key1).not.toBe(key2);
  });

  it('produces different cache keys for different commit lists', () => {
    const diff = formatDiffForPrompt(SAMPLE_DIFF);
    const commits1 = formatCommitsForPrompt(SAMPLE_COMMITS);
    const commits2 = formatCommitsForPrompt([
      { sha: 'zzz999', message: 'chore: unrelated change' },
    ]);

    const key1 = buildCacheKey(diff, commits1);
    const key2 = buildCacheKey(diff, commits2);

    expect(key1).not.toBe(key2);
  });
});

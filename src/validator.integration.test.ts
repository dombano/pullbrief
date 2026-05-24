/**
 * Integration test: validates a realistic PR scenario end-to-end.
 */
import { validateDiff, validateCommits, validateApiKey, mergeResults } from './validator';

const REALISTIC_DIFF = `
diff --git a/src/index.ts b/src/index.ts
index 1a2b3c4..5d6e7f8 100644
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,10 @@
+import { logger } from './logger';
+
 export function main() {
-  console.log('hello');
+  logger.info('hello');
 }
`;

const REALISTIC_COMMITS = [
  'feat: replace console.log with structured logger',
  'chore: update dependencies',
  'fix: handle null reference in parser',
];

describe('validator integration', () => {
  it('passes a realistic valid PR scenario', () => {
    const diffResult = validateDiff(REALISTIC_DIFF);
    const commitsResult = validateCommits(REALISTIC_COMMITS);
    const keyResult = validateApiKey('sk-testkey123');
    const merged = mergeResults(diffResult, commitsResult, keyResult);

    expect(merged.valid).toBe(true);
    expect(merged.errors).toHaveLength(0);
  });

  it('fails when API key is missing even with valid diff and commits', () => {
    const diffResult = validateDiff(REALISTIC_DIFF);
    const commitsResult = validateCommits(REALISTIC_COMMITS);
    const keyResult = validateApiKey(undefined);
    const merged = mergeResults(diffResult, commitsResult, keyResult);

    expect(merged.valid).toBe(false);
    expect(merged.errors).toContain('OpenAI API key is missing or empty.');
  });

  it('accumulates warnings from multiple sources', () => {
    const diffResult = validateDiff('Binary files a/logo.png and b/logo.png differ\n+change');
    const commitsResult = validateCommits([]);
    const keyResult = validateApiKey('sk-ok');
    const merged = mergeResults(diffResult, commitsResult, keyResult);

    expect(merged.valid).toBe(true);
    expect(merged.warnings.length).toBeGreaterThanOrEqual(2);
  });
});

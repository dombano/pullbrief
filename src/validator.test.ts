import {
  validateDiff,
  validateCommits,
  validateApiKey,
  mergeResults,
} from './validator';

describe('validateDiff', () => {
  it('returns valid for a normal diff', () => {
    const result = validateDiff('diff --git a/foo.ts b/foo.ts\n+const x = 1;');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('returns error for empty diff', () => {
    const result = validateDiff('');
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/empty/i);
  });

  it('returns error when diff exceeds maxBytes', () => {
    const bigDiff = 'x'.repeat(100);
    const result = validateDiff(bigDiff, 50);
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/exceeds/i);
  });

  it('warns about binary files', () => {
    const result = validateDiff('Binary files a/img.png and b/img.png differ');
    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toMatch(/binary/i);
  });
});

describe('validateCommits', () => {
  it('returns valid for a normal list', () => {
    const result = validateCommits(['fix: typo', 'feat: add button']);
    expect(result.valid).toBe(true);
  });

  it('warns on empty commits array', () => {
    const result = validateCommits([]);
    expect(result.valid).toBe(true);
    expect(result.warnings[0]).toMatch(/no commits/i);
  });

  it('warns on very large commit list', () => {
    const commits = Array.from({ length: 501 }, (_, i) => `commit ${i}`);
    const result = validateCommits(commits);
    expect(result.warnings[0]).toMatch(/large number/i);
  });

  it('errors on non-array input', () => {
    const result = validateCommits(null as unknown as string[]);
    expect(result.valid).toBe(false);
  });
});

describe('validateApiKey', () => {
  it('returns valid for a well-formed key', () => {
    const result = validateApiKey('sk-abc123');
    expect(result.valid).toBe(true);
  });

  it('errors on missing key', () => {
    expect(validateApiKey(undefined).valid).toBe(false);
    expect(validateApiKey('').valid).toBe(false);
  });

  it('warns when key does not start with sk-', () => {
    const result = validateApiKey('notavalidkey');
    expect(result.warnings[0]).toMatch(/sk-/i);
  });
});

describe('mergeResults', () => {
  it('combines errors and warnings from multiple results', () => {
    const a = { valid: false, errors: ['err1'], warnings: ['warn1'] };
    const b = { valid: true, errors: [], warnings: ['warn2'] };
    const merged = mergeResults(a, b);
    expect(merged.valid).toBe(false);
    expect(merged.errors).toEqual(['err1']);
    expect(merged.warnings).toEqual(['warn1', 'warn2']);
  });

  it('returns valid when all results are valid', () => {
    const a = { valid: true, errors: [], warnings: [] };
    const b = { valid: true, errors: [], warnings: [] };
    expect(mergeResults(a, b).valid).toBe(true);
  });
});

import {
  sanitizeText,
  sanitizeDiff,
  sanitizeCommits,
  containsSensitiveData,
} from './sanitizer';

describe('sanitizeText', () => {
  it('redacts api_key assignments', () => {
    const input = 'api_key = "sk-abcdefghijklmnop1234"';
    const result = sanitizeText(input);
    expect(result).not.toContain('sk-abcdefghijklmnop1234');
    expect(result).toContain('[REDACTED]');
  });

  it('redacts Bearer tokens', () => {
    const input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload';
    const result = sanitizeText(input);
    expect(result).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });

  it('redacts passwords in URLs', () => {
    const input = 'https://user:supersecretpassword@example.com/repo';
    const result = sanitizeText(input);
    expect(result).not.toContain('supersecretpassword');
  });

  it('returns unchanged text with no secrets', () => {
    const input = 'fix: update README with usage instructions';
    const result = sanitizeText(input);
    expect(result).toBe(input);
  });

  it('handles empty string', () => {
    expect(sanitizeText('')).toBe('');
  });
});

describe('sanitizeDiff', () => {
  it('sanitizes secrets in diff content', () => {
    const diff = `+const token = "ghp_abcdefghijklmnopqrstuvwxyz123456";`;
    const result = sanitizeDiff(diff);
    expect(result).not.toContain('ghp_abcdefghijklmnopqrstuvwxyz123456');
  });

  it('returns empty diff unchanged', () => {
    expect(sanitizeDiff('')).toBe('');
    expect(sanitizeDiff('   ')).toBe('   ');
  });
});

describe('sanitizeCommits', () => {
  it('sanitizes secrets in commit messages', () => {
    const commits = 'fix: remove hardcoded password=myS3cr3tP@ss from config';
    const result = sanitizeCommits(commits);
    expect(result).not.toContain('myS3cr3tP@ss');
  });

  it('returns normal commit messages unchanged', () => {
    const commits = 'feat: add retry logic\nfix: handle null pointer';
    expect(sanitizeCommits(commits)).toBe(commits);
  });
});

describe('containsSensitiveData', () => {
  it('detects api key patterns', () => {
    expect(containsSensitiveData('secret=abcdefghijklmnop')).toBe(true);
  });

  it('returns false for clean content', () => {
    expect(containsSensitiveData('console.log("hello world")')).toBe(false);
  });
});

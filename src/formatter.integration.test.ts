import { describe, it, expect } from 'vitest';
import { formatSummary, formatAsAnnotation, stripMarkdown } from './formatter';

const REALISTIC_SUMMARY = `
## PR Summary

This PR introduces **rate limiting** and **caching** for OpenAI API calls.

### Key Changes
- Added \`createRateLimiter\` to throttle requests per minute
- Implemented \`getCached\` / \`setCached\` for response memoization
- Refactored \`summary.ts\` to use both utilities
- Updated [README](./README.md) with configuration options

### Why
Previous implementation could exceed API quotas on large PRs with many retries.
`.trim();

describe('formatter integration', () => {
  it('formats a realistic summary with header', () => {
    const result = formatSummary(REALISTIC_SUMMARY, { includeHeader: false });
    expect(result).toContain('rate limiting');
    expect(result).toContain('caching');
    expect(result.startsWith('## PR Summary')).toBe(true);
  });

  it('wraps summary with a new header when includeHeader is true', () => {
    const stripped = stripMarkdown(REALISTIC_SUMMARY);
    const result = formatSummary(stripped, { headerText: '## Auto-generated Summary' });
    expect(result.startsWith('## Auto-generated Summary')).toBe(true);
  });

  it('produces a concise annotation from a full summary', () => {
    const annotation = formatAsAnnotation(REALISTIC_SUMMARY, 200);
    expect(annotation.length).toBeLessThanOrEqual(200);
    expect(annotation).not.toContain('\n');
    expect(annotation).not.toContain('**');
    expect(annotation).not.toContain('##');
  });

  it('does not truncate summaries within default limits', () => {
    const short = 'Fixes a bug in the login flow.';
    const result = formatSummary(short, { includeHeader: false });
    expect(result).toBe(short);
  });

  it('gracefully handles empty summary', () => {
    const result = formatSummary('', { includeHeader: true });
    expect(result).toBe('## PR Summary\n\n');
  });
});

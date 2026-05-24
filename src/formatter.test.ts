import { describe, it, expect } from 'vitest';
import {
  truncateSummary,
  formatSummary,
  stripMarkdown,
  formatAsAnnotation,
} from './formatter';

describe('truncateSummary', () => {
  it('returns text unchanged when within limit', () => {
    expect(truncateSummary('short text', 100)).toBe('short text');
  });

  it('truncates and appends ellipsis when over limit', () => {
    const result = truncateSummary('hello world', 8);
    expect(result).toBe('hello...');
    expect(result.length).toBe(8);
  });

  it('uses default max length when not specified', () => {
    const long = 'a'.repeat(2100);
    const result = truncateSummary(long);
    expect(result.length).toBe(2000);
    expect(result.endsWith('...')).toBe(true);
  });
});

describe('formatSummary', () => {
  it('includes default header by default', () => {
    const result = formatSummary('Some changes were made.');
    expect(result).toContain('## PR Summary');
    expect(result).toContain('Some changes were made.');
  });

  it('omits header when includeHeader is false', () => {
    const result = formatSummary('Some changes.', { includeHeader: false });
    expect(result).not.toContain('#');
    expect(result).toBe('Some changes.');
  });

  it('uses custom header text', () => {
    const result = formatSummary('Changes.', { headerText: '## Custom Header' });
    expect(result).toContain('## Custom Header');
  });

  it('trims whitespace from summary', () => {
    const result = formatSummary('  padded  ', { includeHeader: false });
    expect(result).toBe('padded');
  });
});

describe('stripMarkdown', () => {
  it('removes headings', () => {
    expect(stripMarkdown('## Hello')).toBe('Hello');
  });

  it('removes bold and italic markers', () => {
    expect(stripMarkdown('**bold** and _italic_')).toBe('bold and italic');
  });

  it('removes inline code', () => {
    expect(stripMarkdown('use `npm install`')).toBe('use npm install');
  });

  it('removes link syntax', () => {
    expect(stripMarkdown('[click here](https://example.com)')).toBe('click here');
  });
});

describe('formatAsAnnotation', () => {
  it('returns a single line', () => {
    const result = formatAsAnnotation('Line one\nLine two\nLine three');
    expect(result).not.toContain('\n');
  });

  it('respects maxLength', () => {
    const result = formatAsAnnotation('a'.repeat(600), 100);
    expect(result.length).toBe(100);
  });

  it('strips markdown before formatting', () => {
    const result = formatAsAnnotation('## Title\n**bold text**');
    expect(result).not.toContain('#');
    expect(result).not.toContain('**');
  });
});

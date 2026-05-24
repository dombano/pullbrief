/**
 * Formats the generated PR summary for output in various contexts.
 */

export interface FormatOptions {
  maxLength?: number;
  includeHeader?: boolean;
  headerText?: string;
}

const DEFAULT_MAX_LENGTH = 2000;
const DEFAULT_HEADER = '## PR Summary';

/**
 * Truncates text to a maximum length, appending an ellipsis if needed.
 */
export function truncateSummary(text: string, maxLength: number = DEFAULT_MAX_LENGTH): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Wraps the summary with an optional header and formats it for GitHub markdown.
 */
export function formatSummary(summary: string, options: FormatOptions = {}): string {
  const {
    maxLength = DEFAULT_MAX_LENGTH,
    includeHeader = true,
    headerText = DEFAULT_HEADER,
  } = options;

  const trimmed = summary.trim();
  const truncated = truncateSummary(trimmed, maxLength);

  if (!includeHeader) {
    return truncated;
  }

  return `${headerText}\n\n${truncated}`;
}

/**
 * Strips markdown formatting from a summary for plain-text output.
 */
export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[-*+]\s+/gm, '- ')
    .trim();
}

/**
 * Formats the summary as a single-line annotation suitable for GitHub step summaries.
 */
export function formatAsAnnotation(summary: string, maxLength: number = 500): string {
  const stripped = stripMarkdown(summary);
  const singleLine = stripped.replace(/\n+/g, ' ').replace(/\s{2,}/g, ' ');
  return truncateSummary(singleLine, maxLength);
}

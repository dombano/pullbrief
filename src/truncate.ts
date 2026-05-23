/**
 * Utilities for truncating large diffs and commit lists
 * to fit within LLM token/character limits.
 */

export const DEFAULT_MAX_DIFF_CHARS = 12000;
export const DEFAULT_MAX_COMMITS = 50;

/**
 * Truncates a diff string to a maximum number of characters.
 * Appends a notice if truncation occurred.
 */
export function truncateDiff(
  diff: string,
  maxChars: number = DEFAULT_MAX_DIFF_CHARS
): string {
  if (diff.length <= maxChars) {
    return diff;
  }

  const truncated = diff.slice(0, maxChars);
  const lastNewline = truncated.lastIndexOf("\n");
  const cleanCut = lastNewline > 0 ? truncated.slice(0, lastNewline) : truncated;

  return (
    cleanCut +
    `\n\n[... diff truncated: showed ${maxChars} of ${diff.length} characters ...]`
  );
}

/**
 * Truncates a list of commit messages to a maximum count.
 * Keeps the most recent commits (assumes array is ordered newest-first).
 */
export function truncateCommits(
  commits: string[],
  maxCommits: number = DEFAULT_MAX_COMMITS
): { commits: string[]; truncated: boolean; originalCount: number } {
  const originalCount = commits.length;
  if (originalCount <= maxCommits) {
    return { commits, truncated: false, originalCount };
  }

  return {
    commits: commits.slice(0, maxCommits),
    truncated: true,
    originalCount,
  };
}

/**
 * Returns a human-readable summary of truncation applied.
 */
export function truncationNotice(
  diffTruncated: boolean,
  commitsTruncated: boolean,
  originalCommitCount: number,
  maxCommits: number
): string | null {
  const parts: string[] = [];

  if (diffTruncated) {
    parts.push("diff was truncated due to size");
  }
  if (commitsTruncated) {
    parts.push(
      `commits truncated to ${maxCommits} of ${originalCommitCount} total`
    );
  }

  return parts.length > 0 ? `Note: ${parts.join("; ")}.` : null;
}

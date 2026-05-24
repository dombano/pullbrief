/**
 * Sanitizes sensitive data from diffs and commit messages
 * before sending to external APIs.
 */

const SECRET_PATTERNS: RegExp[] = [
  /(?:api[_-]?key|apikey)\s*[:=]\s*['"]?([\w\-]{16,})['"]?/gi,
  /(?:secret|token|password|passwd|pwd)\s*[:=]\s*['"]?([\w\-]{8,})['"]?/gi,
  /Bearer\s+([\w\-\.]{20,})/gi,
  /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g,
  /(?:https?:\/\/)[^:]+:([^@]{6,})@/g,
  /\b[A-Za-z0-9+/]{40,}={0,2}\b/g, // base64-like long strings
];

const REDACTED = '[REDACTED]';

export function sanitizeText(input: string): string {
  let result = input;
  for (const pattern of SECRET_PATTERNS) {
    result = result.replace(pattern, (match, capture) => {
      if (capture) {
        return match.replace(capture, REDACTED);
      }
      return REDACTED;
    });
  }
  return result;
}

export function sanitizeDiff(diff: string): string {
  if (!diff || diff.trim().length === 0) return diff;
  return sanitizeText(diff);
}

export function sanitizeCommits(commits: string): string {
  if (!commits || commits.trim().length === 0) return commits;
  return sanitizeText(commits);
}

export function containsSensitiveData(input: string): boolean {
  return SECRET_PATTERNS.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(input);
  });
}

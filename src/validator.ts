/**
 * Validates inputs and context before generating a PR summary.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateDiff(diff: string, maxBytes = 5_000_000): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!diff || diff.trim().length === 0) {
    errors.push('Diff is empty — nothing to summarize.');
  }

  if (Buffer.byteLength(diff, 'utf8') > maxBytes) {
    errors.push(`Diff exceeds maximum allowed size of ${maxBytes} bytes.`);
  }

  if (diff.includes('Binary files')) {
    warnings.push('Diff contains binary file changes which will be ignored.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateCommits(commits: string[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(commits)) {
    errors.push('Commits must be an array.');
    return { valid: false, errors, warnings };
  }

  if (commits.length === 0) {
    warnings.push('No commits provided; summary will rely solely on the diff.');
  }

  if (commits.length > 500) {
    warnings.push(`Large number of commits (${commits.length}); only the most recent will be used.`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function validateApiKey(apiKey: string | undefined): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!apiKey || apiKey.trim().length === 0) {
    errors.push('OpenAI API key is missing or empty.');
  } else if (!apiKey.startsWith('sk-')) {
    warnings.push('API key does not start with "sk-"; it may be invalid.');
  }

  return { valid: errors.length === 0, errors, warnings };
}

export function mergeResults(...results: ValidationResult[]): ValidationResult {
  const errors = results.flatMap(r => r.errors);
  const warnings = results.flatMap(r => r.warnings);
  return { valid: errors.length === 0, errors, warnings };
}

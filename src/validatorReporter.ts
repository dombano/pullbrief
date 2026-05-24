/**
 * Formats ValidationResult into human-readable output for Action logs.
 */
import { ValidationResult } from './validator';
import { log } from './logger';

export function reportValidation(result: ValidationResult, context = 'Validation'): void {
  if (result.warnings.length > 0) {
    for (const warning of result.warnings) {
      log('warn', `[${context}] ⚠️  ${warning}`);
    }
  }

  if (!result.valid) {
    for (const error of result.errors) {
      log('error', `[${context}] ❌ ${error}`);
    }
  } else {
    log('info', `[${context}] ✅ Passed`);
  }
}

export function formatValidationSummary(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('Errors:');
    result.errors.forEach(e => lines.push(`  - ${e}`));
  }

  if (result.warnings.length > 0) {
    lines.push('Warnings:');
    result.warnings.forEach(w => lines.push(`  - ${w}`));
  }

  if (lines.length === 0) {
    lines.push('All checks passed.');
  }

  return lines.join('\n');
}

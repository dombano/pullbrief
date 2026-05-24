import { formatValidationSummary, reportValidation } from './validatorReporter';
import { clearLogHistory, getLogHistory } from './logger';

beforeEach(() => {
  clearLogHistory();
});

describe('formatValidationSummary', () => {
  it('returns all-clear message when no errors or warnings', () => {
    const result = { valid: true, errors: [], warnings: [] };
    expect(formatValidationSummary(result)).toBe('All checks passed.');
  });

  it('lists errors when present', () => {
    const result = { valid: false, errors: ['Missing API key'], warnings: [] };
    const summary = formatValidationSummary(result);
    expect(summary).toContain('Errors:');
    expect(summary).toContain('Missing API key');
  });

  it('lists warnings when present', () => {
    const result = { valid: true, errors: [], warnings: ['Binary files detected'] };
    const summary = formatValidationSummary(result);
    expect(summary).toContain('Warnings:');
    expect(summary).toContain('Binary files detected');
  });

  it('lists both errors and warnings', () => {
    const result = {
      valid: false,
      errors: ['err1'],
      warnings: ['warn1'],
    };
    const summary = formatValidationSummary(result);
    expect(summary).toContain('Errors:');
    expect(summary).toContain('Warnings:');
  });
});

describe('reportValidation', () => {
  it('logs a pass message for valid result', () => {
    reportValidation({ valid: true, errors: [], warnings: [] }, 'Diff');
    const history = getLogHistory();
    expect(history.some(e => e.message.includes('✅') && e.message.includes('Diff'))).toBe(true);
  });

  it('logs error entries for invalid result', () => {
    reportValidation({ valid: false, errors: ['bad key'], warnings: [] }, 'API');
    const history = getLogHistory();
    expect(history.some(e => e.level === 'error' && e.message.includes('bad key'))).toBe(true);
  });

  it('logs warning entries', () => {
    reportValidation({ valid: true, errors: [], warnings: ['watch out'] }, 'Commits');
    const history = getLogHistory();
    expect(history.some(e => e.level === 'warn' && e.message.includes('watch out'))).toBe(true);
  });
});

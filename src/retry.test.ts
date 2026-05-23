import { withRetry, isRetryableError, RetryOptions } from './retry';

describe('isRetryableError', () => {
  it('returns true for rate limit errors', () => {
    expect(isRetryableError(new Error('Rate limit exceeded'))).toBe(true);
  });

  it('returns true for timeout errors', () => {
    expect(isRetryableError(new Error('Request timeout'))).toBe(true);
  });

  it('returns true for 503 errors', () => {
    expect(isRetryableError(new Error('503 Service Unavailable'))).toBe(true);
  });

  it('returns false for non-retryable errors', () => {
    expect(isRetryableError(new Error('Invalid API key'))).toBe(false);
  });

  it('returns false for non-Error values', () => {
    expect(isRetryableError('some string')).toBe(false);
    expect(isRetryableError(null)).toBe(false);
  });
});

describe('withRetry', () => {
  const fastOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelayMs: 0,
    backoffFactor: 1,
  };

  it('returns result immediately on success', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors and eventually succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('rate limit'))
      .mockRejectedValueOnce(new Error('rate limit'))
      .mockResolvedValue('success');

    const result = await withRetry(fn, fastOptions);
    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws immediately on non-retryable error', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Invalid API key'));
    await expect(withRetry(fn, fastOptions)).rejects.toThrow('Invalid API key');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting all attempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('rate limit'));
    await expect(withRetry(fn, fastOptions)).rejects.toThrow('rate limit');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects custom shouldRetry predicate', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('custom error'));
    const opts: RetryOptions = { ...fastOptions, shouldRetry: () => false };
    await expect(withRetry(fn, opts)).rejects.toThrow('custom error');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

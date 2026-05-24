import {
  setLogLevel,
  getLogHistory,
  clearLogHistory,
  debug,
  info,
  warn,
  error,
} from './logger';

describe('logger', () => {
  beforeEach(() => {
    clearLogHistory();
    setLogLevel('debug');
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('logs debug messages when level is debug', () => {
    debug('test debug message');
    const history = getLogHistory();
    expect(history).toHaveLength(1);
    expect(history[0].level).toBe('debug');
    expect(history[0].message).toBe('test debug message');
  });

  it('suppresses debug messages when level is info', () => {
    setLogLevel('info');
    debug('should be suppressed');
    expect(getLogHistory()).toHaveLength(0);
  });

  it('logs info with optional data', () => {
    info('processing PR', { pr: 42 });
    const entry = getLogHistory()[0];
    expect(entry.level).toBe('info');
    expect(entry.data).toEqual({ pr: 42 });
  });

  it('logs warn and error to console.error', () => {
    warn('rate limit approaching');
    error('openai request failed');
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('includes a timestamp in each entry', () => {
    info('timestamped entry');
    const entry = getLogHistory()[0];
    expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('clearLogHistory empties the history', () => {
    info('one');
    info('two');
    clearLogHistory();
    expect(getLogHistory()).toHaveLength(0);
  });

  it('getLogHistory returns a copy, not the original array', () => {
    info('entry');
    const history = getLogHistory();
    history.pop();
    expect(getLogHistory()).toHaveLength(1);
  });
});

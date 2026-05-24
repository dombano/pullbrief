type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

let currentLevel: LogLevel = 'info';
const logHistory: LogEntry[] = [];

export function setLogLevel(level: LogLevel): void {
  currentLevel = level;
}

export function getLogHistory(): LogEntry[] {
  return [...logHistory];
}

export function clearLogHistory(): void {
  logHistory.length = 0;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    data,
  };
}

function emit(entry: LogEntry): void {
  logHistory.push(entry);
  const prefix = `[pullbrief] [${entry.level.toUpperCase()}]`;
  const line = entry.data
    ? `${prefix} ${entry.message} ${JSON.stringify(entry.data)}`
    : `${prefix} ${entry.message}`;

  if (entry.level === 'error' || entry.level === 'warn') {
    console.error(line);
  } else {
    console.log(line);
  }
}

export function debug(message: string, data?: unknown): void {
  if (!shouldLog('debug')) return;
  emit(formatEntry('debug', message, data));
}

export function info(message: string, data?: unknown): void {
  if (!shouldLog('info')) return;
  emit(formatEntry('info', message, data));
}

export function warn(message: string, data?: unknown): void {
  if (!shouldLog('warn')) return;
  emit(formatEntry('warn', message, data));
}

export function error(message: string, data?: unknown): void {
  if (!shouldLog('error')) return;
  emit(formatEntry('error', message, data));
}

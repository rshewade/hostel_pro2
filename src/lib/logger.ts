type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function fmt(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
  const ts = new Date().toISOString();
  const m = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${ts}] [${level.toUpperCase()}] ${message}${m}`;
}

export const logger = {
  debug(message: string, meta?: Record<string, unknown>) { if (shouldLog('debug')) console.debug(fmt('debug', message, meta)); },
  info(message: string, meta?: Record<string, unknown>) { if (shouldLog('info')) console.info(fmt('info', message, meta)); },
  warn(message: string, meta?: Record<string, unknown>) { if (shouldLog('warn')) console.warn(fmt('warn', message, meta)); },
  error(message: string, meta?: Record<string, unknown>) { if (shouldLog('error')) console.error(fmt('error', message, meta)); },
};

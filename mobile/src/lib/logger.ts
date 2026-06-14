type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process?.env?.NODE_ENV as LogLevel) === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) console.debug('[DBG]', ...args);
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) console.info('[INF]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) console.warn('[WRN]', ...args);
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) console.error('[ERR]', ...args);
  },
};

export default logger;

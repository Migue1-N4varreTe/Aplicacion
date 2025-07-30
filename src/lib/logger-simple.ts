/**
 * Simplified logger that doesn't cause errors
 */

class SimpleLogger {
  debug(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.debug('[DEBUG]', message, context);
    }
  }

  info(message: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[INFO]', message, context);
    }
  }

  warn(message: string, context?: Record<string, any>) {
    console.warn('[WARN]', message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    console.error('[ERROR]', message, error, context);
  }

  userAction(action: string, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[USER]', action, context);
    }
  }

  apiError(endpoint: string, error: Error, context?: Record<string, any>) {
    console.error('[API ERROR]', endpoint, error, context);
  }

  performanceMetric(metric: string, value: number, context?: Record<string, any>) {
    if (process.env.NODE_ENV === 'development') {
      console.info('[PERF]', metric, value, context);
    }
  }

  getLogs() {
    return [];
  }

  clearLogs() {
    // No-op
  }
}

export const logger = new SimpleLogger();

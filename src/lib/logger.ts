/**
 * Sistema de logging centralizado para La Económica
 * Maneja diferentes niveles de logging y envío a servicios externos
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private sessionId: string;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      error,
      sessionId: this.sessionId,
    };

    // En desarrollo, siempre mostrar en consola
    if (this.isDevelopment) {
      this.logToConsole(entry);
    }

    // En producción, enviar errores críticos a servicios externos
    if (level >= LogLevel.ERROR && !this.isDevelopment) {
      this.logToExternalService(entry);
    }

    // Almacenar en localStorage para debugging
    this.logToLocalStorage(entry);
  }

  private logToConsole(entry: LogEntry) {
    const { level, message, context, error } = entry;
    const prefix = `[${this.getLogLevelName(level)}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, context, error);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, context);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, context);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, context, error);
        break;
    }
  }

  private logToLocalStorage(entry: LogEntry) {
    try {
      const logs = this.getStoredLogs();
      logs.push(entry);
      
      // Mantener solo los últimos 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('la_economica_logs', JSON.stringify(logs));
    } catch (error) {
      // Si falla localStorage, no hacer nada
    }
  }

  private async logToExternalService(entry: LogEntry) {
    try {
      // Aquí se podría integrar con Sentry, LogRocket, etc.
      // Por ahora, solo preparamos la estructura
      const payload = {
        ...entry,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: entry.timestamp.toISOString(),
      };

      // En el futuro se puede enviar a /api/logs o servicios externos
      console.warn('Log entry ready for external service:', payload);
    } catch (error) {
      // Fallar silenciosamente en el logging
    }
  }

  private getLogLevelName(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return 'DEBUG';
      case LogLevel.INFO: return 'INFO';
      case LogLevel.WARN: return 'WARN';
      case LogLevel.ERROR: return 'ERROR';
      default: return 'UNKNOWN';
    }
  }

  private getStoredLogs(): LogEntry[] {
    try {
      const stored = localStorage.getItem('la_economica_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Métodos públicos
  debug(message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Métodos especializados para casos comunes
  userAction(action: string, context?: Record<string, any>) {
    this.info(`User action: ${action}`, context);
  }

  apiError(endpoint: string, error: Error, context?: Record<string, any>) {
    this.error(`API Error: ${endpoint}`, error, context);
  }

  performanceMetric(metric: string, value: number, context?: Record<string, any>) {
    this.info(`Performance: ${metric}`, { ...context, value, unit: 'ms' });
  }

  // Obtener logs para debugging
  getLogs(): LogEntry[] {
    return this.getStoredLogs();
  }

  clearLogs() {
    localStorage.removeItem('la_economica_logs');
  }
}

// Instancia singleton
export const logger = new Logger();

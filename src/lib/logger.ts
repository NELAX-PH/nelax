type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogData {
  message: string;
  data?: Record<string, unknown>;
  error?: Error;
  timestamp?: string;
}

class Logger {
  private isProduction = process.env.NODE_ENV === 'production';
  private minLogLevel: LogLevel = (process.env.NEXT_PUBLIC_LOG_LEVEL || 'info') as LogLevel;

  private logLevels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.logLevels[level] <= this.logLevels[this.minLogLevel];
  }

  private formatLog(logData: LogData, level: LogLevel): string {
    const timestamp = logData.timestamp || new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    let message = `${prefix} ${logData.message}`;

    if (logData.data) {
      message += ` | Data: ${JSON.stringify(logData.data)}`;
    }

    if (logData.error) {
      message += ` | Error: ${logData.error.message}${logData.error.stack ? '\n' + logData.error.stack : ''}`;
    }

    return message;
  }

  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'error':
        return console.error;
      case 'warn':
        return console.warn;
      case 'info':
        return console.info;
      case 'debug':
        return console.debug;
    }
  }

  private redactSensitive(logData: LogData): LogData {
    const redacted = { ...logData };

    // Redact sensitive data from logs
    if (redacted.data) {
      const data = { ...redacted.data };

      // Common sensitive fields
      const sensitiveFields = [
        'password',
        'apiKey',
        'secret',
        'token',
        'creditCard',
        'ssn',
        'socialSecurityNumber',
      ];

      sensitiveFields.forEach(field => {
        if (field.toLowerCase() in data) {
          data[field as keyof typeof data] = '[REDACTED]' as unknown;
        }
      });

      redacted.data = data;
    }

    return redacted;
  }

  error(message: string, data?: Record<string, unknown>, error?: Error) {
    const logData = this.redactSensitive({ message, data, error });
    if (this.shouldLog('error')) {
      this.getConsoleMethod('error')(this.formatLog(logData, 'error'));
    }
    // Send to error tracking service if in production
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendToErrorTracking('error', logData);
    }
  }

  warn(message: string, data?: Record<string, unknown>) {
    const logData = this.redactSensitive({ message, data });
    if (this.shouldLog('warn')) {
      this.getConsoleMethod('warn')(this.formatLog(logData, 'warn'));
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    const logData = this.redactSensitive({ message, data });
    if (this.shouldLog('info')) {
      this.getConsoleMethod('info')(this.formatLog(logData, 'info'));
    }
  }

  debug(message: string, data?: Record<string, unknown>) {
    const logData = this.redactSensitive({ message, data });
    if (this.shouldLog('debug')) {
      this.getConsoleMethod('debug')(this.formatLog(logData, 'debug'));
    }
  }

  private sendToErrorTracking(level: LogLevel, logData: LogData) {
    // This would integrate with Sentry or similar service
    if (level === 'error' && logData.error) {
      // Initialize Sentry and send error if available
      try {
        // @ts-ignore - Sentry will be installed separately
        if (typeof Sentry !== 'undefined') {
          // @ts-ignore
          Sentry.captureException(logData.error, {
            extra: logData.data,
            tags: { source: 'nelax-logger' },
          });
        }
      } catch (err) {
        console.warn('Failed to send to error tracking:', err);
      }
    }
  }

  // Audit logger for user actions
  audit(userId: string, action: string, details?: Record<string, unknown>) {
    const logData = {
      message: `User Audit: ${action}`,
      data: {
        userId,
        action,
        ...details,
      },
    };

    this.info(logData.message, logData.data);
  }

  // Performance logger for metrics
  performance(metric: string, value: number, details?: Record<string, unknown>) {
    const logData = {
      message: `Performance: ${metric}`,
      data: {
        metric,
        value,
        ...details,
      },
    };

    this.info(logData.message, logData.data);
  }
}

export const logger = new Logger();

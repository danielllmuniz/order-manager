import { ILogger } from '../../application/services/logger.interface';

export class ConsoleLogger implements ILogger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = this.getTimestamp();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage('DEBUG', message, context));
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(this.formatMessage('INFO', message, context));
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.formatMessage('WARN', message, context));
  }

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const errorStr = error instanceof Error ? error.message : String(error);
    const errorMessage = error ? `${message}: ${errorStr}` : message;
    console.error(this.formatMessage('ERROR', errorMessage, context));

    // Print stack trace if available
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

export const logger = new ConsoleLogger();

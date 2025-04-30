import chalk from 'chalk';

export interface LoggerOptions {
  timestamp?: boolean;
  level?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
  context?: string;
}

export class Logger {
  private static isTesting = process.env.NODE_ENV === 'test';
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static error(message: string, options?: LoggerOptions): void {
    if (Logger.isTesting) return;
    console.error(Logger.formatMessage(chalk.red('ERROR'), message, options));
  }

  static warn(message: string, options?: LoggerOptions): void {
    if (Logger.isTesting) return;
    console.warn(Logger.formatMessage(chalk.yellow('WARN'), message, options));
  }

  static info(message: string, options?: LoggerOptions): void {
    if (Logger.isTesting) return;
    console.info(Logger.formatMessage(chalk.blue('INFO'), message, options));
  }

  static debug(message: string, options?: LoggerOptions): void {
    if (Logger.isTesting || !Logger.isDevelopment) return;
    console.debug(Logger.formatMessage(chalk.magenta('DEBUG'), message, options));
  }

  static trace(message: string, options?: LoggerOptions): void {
    if (Logger.isTesting || !Logger.isDevelopment) return;
    console.trace(Logger.formatMessage(chalk.gray('TRACE'), message, options));
  }

  private static formatMessage(
    level: string,
    message: string,
    options?: LoggerOptions
  ): string {
    const timestamp = options?.timestamp !== false ? new Date().toISOString() : '';
    const context = options?.context ? `[${options.context}]` : '';
    return `${timestamp} ${level}${context}: ${message}`;
  }
}

export const logger = Logger;
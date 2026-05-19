import * as fs from 'fs';
import * as path from 'path';

const LOG_DIR = path.join(process.env.APPDATA || process.env.HOME || '/', '.xrtl-terminal/logs');

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private logs: string[] = [];
  private maxLogs = 1000;
  private logFile: string;

  constructor(private name: string) {
    this.logFile = path.join(LOG_DIR, `${this.getDateString()}.log`);
    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private getTimeString(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
  }

  private formatMessage(level: LogLevel, message: string, ...args: unknown[]): string {
    const time = this.getTimeString();
    let formatted = `[${time}] [${level.toUpperCase()}] [${this.name}] ${message}`;
    
    if (args.length > 0) {
      try {
        formatted += ' ' + JSON.stringify(args);
      } catch {
        formatted += ' ' + args.map(a => String(a)).join(' ');
      }
    }
    
    return formatted;
  }

  debug(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage('debug', message, ...args);
    this.logs.push(formatted);
    this.trimLogs();
    this.writeToFile(formatted);
  }

  info(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage('info', message, ...args);
    this.logs.push(formatted);
    this.trimLogs();
    this.writeToFile(formatted);
  }

  warn(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage('warn', message, ...args);
    this.logs.push(formatted);
    this.trimLogs();
    this.writeToFile(formatted);
  }

  error(message: string, ...args: unknown[]): void {
    const formatted = this.formatMessage('error', message, ...args);
    this.logs.push(formatted);
    this.trimLogs();
    this.writeToFile(formatted);
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  private writeToFile(message: string): void {
    fs.appendFileSync(this.logFile, message + '\n');
  }

  getLogs(): string[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = new Logger('XRTL Terminal');

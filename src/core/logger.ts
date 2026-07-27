import type { LogEntry, RequestLog, ResponseLog } from './types.js';

export class Logger {
  private logs: LogEntry[] = [];

  logRequest(data: RequestLog): void {
    this.logs.push({
      type: 'request',
      data,
      timestamp: Date.now(),
    });
  }

  logResponse(data: ResponseLog): void {
    this.logs.push({
      type: 'response',
      data,
      timestamp: Date.now(),
    });
  }

  logBrowser(data: unknown): void {
    this.logs.push({
      type: 'browser',
      data,
      timestamp: Date.now(),
    });
  }

  logConsole(data: unknown): void {
    this.logs.push({
      type: 'console',
      data,
      timestamp: Date.now(),
    });
  }

  logError(data: unknown): void {
    this.logs.push({
      type: 'error',
      data,
      timestamp: Date.now(),
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export interface LogEntry {
  type: 'request' | 'response' | 'error';
  data: unknown;
  timestamp: number;
}

export interface TestResult {
  title: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: Error;
}

export interface ReporterConfig {
  verbose?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

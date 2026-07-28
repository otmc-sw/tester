/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { IReporter } from '../types/api.js';

export class Reporter implements IReporter {
  private logs: Array<{
    type: 'request' | 'response' | 'error';
    data: unknown;
    timestamp: number;
  }> = [];
  private testResults: Array<{
    title: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: Error;
  }> = [];

  logRequest(data: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    timestamp: number;
  }): void {
    this.logs.push({
      type: 'request',
      data,
      timestamp: data.timestamp,
    });
  }

  logResponse(data: {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
    duration: number;
    timestamp: number;
  }): void {
    this.logs.push({
      type: 'response',
      data,
      timestamp: data.timestamp,
    });
  }

  logError(error: Error, diagnostics?: Record<string, unknown>): void {
    this.logs.push({
      type: 'error',
      data: {
        error: error.message,
        stack: error.stack,
        diagnostics,
      },
      timestamp: Date.now(),
    });
  }

  onTestComplete(result: {
    title: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: Error;
  }): void {
    this.testResults.push(result);
  }

  onSuiteComplete(): void {
    // Hook for suite completion - can be used for final reporting
  }

  getLogs(): Array<{
    type: 'request' | 'response' | 'error';
    data: unknown;
    timestamp: number;
  }> {
    return this.logs;
  }

  getTestResults(): Array<{
    title: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: Error;
  }> {
    return this.testResults;
  }

  // Legacy methods for backward compatibility
  addResult(result: { name: string; status: 'passed' | 'failed' | 'skipped'; duration: number; error?: Error }): void {
    this.testResults.push({
      title: result.name,
      status: result.status === 'skipped' ? 'failed' : result.status,
      duration: result.duration,
      error: result.error,
    });
  }

  async generate(): Promise<void> {
    // Legacy method - now just a no-op since Playwright handles reporting
    // Future: can be used to generate custom reports from logs and testResults
  }
}

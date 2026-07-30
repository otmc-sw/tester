/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext, APIResponse } from 'playwright';

export interface NormalizedTestCase {
  title: string;
  method: string;
  url: string;
  request?: unknown;
  response?: new () => object;
  status?: number;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  auth?: unknown;
}

export interface IRequestBuilder {
  build(testCase: NormalizedTestCase): {
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  };
}

export interface IResponseParser {
  parse(response: APIResponse): Promise<unknown>;
}

export interface IEnvelopeProcessor {
  process<T>(response: unknown): {
    data: T;
    isError: boolean;
    errorDetail?: unknown;
    validationErrors?: Array<{ path: string; message: string }>;
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{ path: string; message: string; expected?: unknown; actual?: unknown }>;
}

export interface IValidator {
  validate(value: unknown, schema: unknown): ValidationResult;
}

export interface IReporter {
  logRequest(data: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    timestamp: number;
  }): void;

  logResponse(data: {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
    duration: number;
    timestamp: number;
  }): void;

  logError(error: Error, diagnostics?: Record<string, unknown>): void;

  onTestComplete?(result: {
    title: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: Error;
  }): void;

  onSuiteComplete?(): void;

  setCurrentTest?(title: string): void;

  clearCurrentTest?(): void;
}

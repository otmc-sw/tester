/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export class TesterError extends Error {
  public readonly request?: unknown;
  public readonly response?: unknown;
  public readonly status?: number;
  public readonly headers?: Record<string, string>;
  public readonly duration?: number;
  public readonly diagnostics?: Record<string, unknown>;

  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.request = options.request;
    this.response = options.response;
    this.status = options.status;
    this.headers = options.headers;
    this.duration = options.duration;
    this.diagnostics = options.diagnostics;
  }
}

export class ApiError extends TesterError {
  public readonly code?: number;
  public readonly key?: string;
  public readonly type?: string;
  public readonly summary?: string;
  public readonly detail?: string;
  public readonly file?: string;
  public readonly line?: number;
  public readonly function?: string;
  public readonly timestamp?: string;

  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
      code?: number;
      key?: string;
      type?: string;
      summary?: string;
      detail?: string;
      file?: string;
      line?: number;
      function?: string;
      timestamp?: string;
    } = {}
  ) {
    super(message, options);
    this.name = 'ApiError';
    this.code = options.code;
    this.key = options.key;
    this.type = options.type;
    this.summary = options.summary;
    this.detail = options.detail;
    this.file = options.file;
    this.line = options.line;
    this.function = options.function;
    this.timestamp = options.timestamp;
  }
}

export class StatusValidationError extends TesterError {
  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
      expected?: number | number[];
      actual?: number;
    } = {}
  ) {
    const mergedDiagnostics = {
      ...options.diagnostics,
      ...(options.expected !== undefined || options.actual !== undefined ? {
        expected: options.expected,
        actual: options.actual,
      } : {}),
    };
    super(message, { ...options, diagnostics: mergedDiagnostics });
    this.name = 'StatusValidationError';
  }
}

export class ResponseValidationError extends TesterError {
  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
      path?: string;
      expected?: unknown;
      actual?: unknown;
    } = {}
  ) {
    const mergedDiagnostics = {
      ...options.diagnostics,
      ...(options.path !== undefined || options.expected !== undefined || options.actual !== undefined ? {
        path: options.path,
        expected: options.expected,
        actual: options.actual,
      } : {}),
    };
    super(message, { ...options, diagnostics: mergedDiagnostics });
    this.name = 'ResponseValidationError';
  }
}

export class EnvelopeValidationError extends TesterError {
  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
      field?: string;
      reason?: string;
    } = {}
  ) {
    const mergedDiagnostics = {
      ...options.diagnostics,
      ...(options.field !== undefined || options.reason !== undefined ? {
        field: options.field,
        reason: options.reason,
      } : {}),
    };
    super(message, { ...options, diagnostics: mergedDiagnostics });
    this.name = 'EnvelopeValidationError';
  }
}

export class ContentTypeError extends TesterError {
  constructor(
    message: string,
    options: {
      request?: unknown;
      response?: unknown;
      status?: number;
      headers?: Record<string, string>;
      duration?: number;
      diagnostics?: Record<string, unknown>;
      expected?: string;
      actual?: string;
    } = {}
  ) {
    const mergedDiagnostics = {
      ...options.diagnostics,
      ...(options.expected !== undefined || options.actual !== undefined ? {
        expected: options.expected,
        actual: options.actual,
      } : {}),
    };
    super(message, { ...options, diagnostics: mergedDiagnostics });
    this.name = 'ContentTypeError';
  }
}

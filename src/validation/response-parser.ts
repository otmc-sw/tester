/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIResponse } from 'playwright';
import type { TestExpectations, ValidationError, ValidationResult, ResponseContract } from '../core/types.js';
import { ClassValidator } from './validator.js';
import { ModelMapper } from './model-mapper.js';
import { ResponseEnvelopeProcessor } from './envelope-processor.js';

export interface ParsedResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  duration: number;
  validationErrors: ValidationError[];
}

export class ResponseParser {
  private envelopeProcessor: ResponseEnvelopeProcessor;

  constructor(responseContract?: ResponseContract) {
    this.envelopeProcessor = new ResponseEnvelopeProcessor(responseContract);
  }

  async parse<T extends object>(
    response: APIResponse,
    ModelClass: new () => T,
    expectations?: TestExpectations,
    duration?: number
  ): Promise<ParsedResponse<T>> {
    const status = response.status();
    const headers = response.headers();
    const contentType = headers['content-type'] || '';
    const validationErrors: ValidationError[] = [];

    if (expectations?.status !== undefined && status !== expectations.status) {
      validationErrors.push({
        path: 'status',
        message: `Expected status ${expectations.status}, got ${status}`,
        expected: expectations.status,
        actual: status,
      });
    }

    if (expectations?.contentType !== undefined && !contentType.includes(expectations.contentType)) {
      validationErrors.push({
        path: 'headers.content-type',
        message: `Expected Content-Type to include '${expectations.contentType}', got '${contentType}'`,
        expected: expectations.contentType,
        actual: contentType,
      });
    } else if (!contentType.includes('application/json')) {
      validationErrors.push({
        path: 'headers.content-type',
        message: `Expected Content-Type to be 'application/json', got '${contentType}'`,
        expected: 'application/json',
        actual: contentType,
      });
    }

    if (expectations?.responseTime !== undefined && duration !== undefined && duration > expectations.responseTime) {
      validationErrors.push({
        path: 'responseTime',
        message: `Response time ${duration}ms exceeded expected ${expectations.responseTime}ms`,
        expected: expectations.responseTime,
        actual: duration,
      });
    }

    if (expectations?.headers) {
      for (const [key, expectedValue] of Object.entries(expectations.headers)) {
        const actualValue = headers[key.toLowerCase()];
        if (actualValue !== expectedValue) {
          validationErrors.push({
            path: `headers.${key}`,
            message: `Expected header '${key}' to be '${expectedValue}', got '${actualValue}'`,
            expected: expectedValue,
            actual: actualValue,
          });
        }
      }
    }

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch (error) {
      validationErrors.push({
        path: 'body',
        message: 'Failed to parse response as JSON',
      });
      throw new Error('Response is not valid JSON');
    }

    if (responseBody === null || responseBody === undefined) {
      validationErrors.push({
        path: 'body',
        message: 'Response body is null or undefined',
      });
    }

    const envelopeResult = this.envelopeProcessor.process<unknown>(responseBody);
    
    if (envelopeResult.validationErrors) {
      validationErrors.push(...envelopeResult.validationErrors);
    }

    if (envelopeResult.isError) {
      const error = new Error('API returned error response') as Error & { 
        status: number; 
        url: string; 
        headers: Record<string, string>; 
        request?: unknown; 
        response?: unknown; 
        duration: number;
        validationErrors?: ValidationError[];
        code?: number;
        key?: string;
        type?: string;
        summary?: string;
        detail?: string;
        file?: string;
        line?: number;
        function?: string;
        timestamp?: string;
      };
      error.name = 'ApiError';
      error.status = status;
      error.url = response.url();
      error.headers = headers;
      error.duration = duration || 0;
      error.validationErrors = validationErrors;
      error.response = responseBody;
      if (envelopeResult.errorDetail) {
        error.code = envelopeResult.errorDetail.code;
        error.key = envelopeResult.errorDetail.key;
        error.type = envelopeResult.errorDetail.type;
        error.summary = envelopeResult.errorDetail.summary;
        error.detail = envelopeResult.errorDetail.detail;
        error.file = envelopeResult.errorDetail.file;
        error.line = envelopeResult.errorDetail.line;
        error.function = envelopeResult.errorDetail.function;
        error.timestamp = envelopeResult.errorDetail.timestamp;
      }
      throw error;
    }

    const validator = new ClassValidator(ModelClass as new () => Record<string, unknown>);
    const validationResult: ValidationResult = validator.validate(envelopeResult.data);
    
    if (!validationResult.isValid) {
      validationErrors.push(...validationResult.errors);
    }

    const data = ModelMapper.map(envelopeResult.data, ModelClass as new () => Record<string, unknown>) as T;

    return {
      data,
      status,
      headers,
      duration: duration || 0,
      validationErrors,
    };
  }
}

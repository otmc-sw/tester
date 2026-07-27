import type { APIResponse } from 'playwright';
import type { TestExpectations, ValidationError, ValidationResult } from '../core/types.js';
import { ClassValidator } from './validator.js';
import { ModelMapper } from './model-mapper.js';

export interface ParsedResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  duration: number;
  validationErrors: ValidationError[];
}

export class ResponseParser {
  static async parse<T extends object>(
    response: APIResponse,
    ModelClass: new () => T,
    expectations?: TestExpectations,
    duration?: number
  ): Promise<ParsedResponse<T>> {
    const status = response.status();
    const headers = response.headers();
    const contentType = headers['content-type'] || '';
    const validationErrors: ValidationError[] = [];

    // Validate status
    if (expectations?.status !== undefined && status !== expectations.status) {
      validationErrors.push({
        path: 'status',
        message: `Expected status ${expectations.status}, got ${status}`,
        expected: expectations.status,
        actual: status,
      });
    }

    // Validate Content-Type
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

    // Validate response time
    if (expectations?.responseTime !== undefined && duration !== undefined && duration > expectations.responseTime) {
      validationErrors.push({
        path: 'responseTime',
        message: `Response time ${duration}ms exceeded expected ${expectations.responseTime}ms`,
        expected: expectations.responseTime,
        actual: duration,
      });
    }

    // Validate headers
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

    // Parse JSON
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

    // Validate empty response
    if (responseBody === null || responseBody === undefined) {
      validationErrors.push({
        path: 'body',
        message: 'Response body is null or undefined',
      });
    }

    // Validate model
    const validator = new ClassValidator(ModelClass as new () => Record<string, unknown>);
    const validationResult: ValidationResult = validator.validate(responseBody);
    
    if (!validationResult.isValid) {
      validationErrors.push(...validationResult.errors);
    }

    // Map to class
    const data = ModelMapper.mapToClass(responseBody, ModelClass as new () => Record<string, unknown>) as T;

    return {
      data,
      status,
      headers,
      duration: duration || 0,
      validationErrors,
    };
  }
}

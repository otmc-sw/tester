/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { IValidator, ValidationResult } from '../types/api.js';
import { StatusValidationError, ResponseValidationError, ContentTypeError } from '../errors/index.js';

export class ResponseValidator implements IValidator {
  validate(value: unknown, schema: unknown): ValidationResult {
    const errors: Array<{ path: string; message: string; expected?: unknown; actual?: unknown }> = [];
    
    if (schema === null || schema === undefined) {
      return { isValid: true, errors: [] };
    }
    
    if (typeof schema === 'object' && schema !== null) {
      const schemaObj = schema as Record<string, unknown>;
      const valueObj = value as Record<string, unknown> || {};
      
      for (const key in schemaObj) {
        if (key in valueObj) {
          const expectedType = typeof schemaObj[key];
          const actualType = typeof valueObj[key];
          
          if (expectedType !== actualType && valueObj[key] !== null) {
            errors.push({
              path: key,
              message: `Expected type ${expectedType}, got ${actualType}`,
              expected: expectedType,
              actual: actualType,
            });
          }
        } else {
          errors.push({
            path: key,
            message: `Missing required field: ${key}`,
            expected: schemaObj[key],
            actual: undefined,
          });
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateStatus(actual: number, expected?: number | number[]): void {
    if (expected === undefined) {
      return;
    }

    const expectedStatuses = Array.isArray(expected) ? expected : [expected];

    if (!expectedStatuses.includes(actual)) {
      const expectedLabel = expectedStatuses.length === 1
        ? String(expectedStatuses[0])
        : `[${expectedStatuses.join(', ')}]`;

      throw new StatusValidationError(`Expected status ${expectedLabel}, got ${actual}`, {
        status: actual,
        expected: expectedStatuses,
        actual,
      });
    }
  }

  validateContentType(contentType: string, expected: string = 'application/json'): void {
    if (!contentType.includes(expected)) {
      throw new ContentTypeError(`Expected content-type ${expected}, got ${contentType}`, {
        expected,
        actual: contentType,
      });
    }
  }
}

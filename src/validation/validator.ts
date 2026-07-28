/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { ValidationResult, ValidationError } from '../core/types.js';

export interface Validator<T> {
  validate(data: unknown): ValidationResult;
}

export class ClassValidator<T extends object> implements Validator<T> {
  constructor(private ModelClass: new () => T) {}

  validate(data: unknown): ValidationResult {
    const errors: ValidationError[] = [];

    if (data === null || data === undefined) {
      errors.push({
        path: '',
        message: 'Response is null or undefined',
      });
      return { isValid: false, errors };
    }

    if (Array.isArray(data)) {
      for (let i = 0; i < data.length; i++) {
        const validationResult = this.validateObject(data[i], i);
        errors.push(...validationResult.errors);
      }
      return {
        isValid: errors.length === 0,
        errors,
      };
    }

    return this.validateObject(data);
  }

  private validateObject(data: unknown, index?: number): ValidationResult {
    const errors: ValidationError[] = [];
    const prefix = index !== undefined ? `[${index}].` : '';

    if (typeof data !== 'object') {
      errors.push({
        path: prefix,
        message: 'Response must be an object',
        expected: 'object',
        actual: typeof data,
      });
      return { isValid: false, errors };
    }

    const instance = new this.ModelClass();
    const expectedKeys = Object.keys(instance) as Array<keyof T>;
    const dataObj = data as Partial<T>;

    for (const key of expectedKeys) {
      if (!(key in dataObj)) {
        errors.push({
          path: prefix + String(key),
          message: `Required field '${String(key)}' is missing`,
        });
        continue;
      }

      const expectedType = typeof instance[key];
      const actualValue = dataObj[key];
      const actualType = typeof actualValue;

      if (expectedType === 'undefined') {
        continue;
      }

      if (
        actualValue !== null &&
        actualValue !== undefined &&
        actualType !== expectedType
      ) {
        errors.push({
          path: prefix + String(key),
          message: `Field '${String(key)}' has incorrect type`,
          expected: expectedType,
          actual: actualType,
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export class ZodValidator<T> implements Validator<T> {
  constructor(private schema: { parse: (data: unknown) => T }) {}

  validate(data: unknown): ValidationResult {
    try {
      this.schema.parse(data);
      return { isValid: true, errors: [] };
    } catch (error) {
      const errors: ValidationError[] = [];
      
      if (error instanceof Error && 'issues' in error) {
        const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
        for (const issue of issues) {
          errors.push({
            path: issue.path.join('.'),
            message: issue.message,
          });
        }
      } else {
        errors.push({
          path: '',
          message: error instanceof Error ? error.message : 'Validation failed',
        });
      }

      return { isValid: false, errors };
    }
  }
}

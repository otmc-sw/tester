import type { Logger } from '../core/logger.js';

export class Expectation<T> {
  private value: T;
  private logger: Logger;

  constructor(value: T, logger: Logger) {
    this.value = value;
    this.logger = logger;
  }

  status(expectedStatus: number): this {
    if (typeof this.value === 'object' && this.value !== null && 'status' in this.value) {
      const actual = (this.value as { status: number }).status;
      if (actual !== expectedStatus) {
        throw new Error(`Expected status ${expectedStatus}, got ${actual}`);
      }
    }
    return this;
  }

  schema(schema: unknown): this {
    // Zod schema validation would go here
    // For now, we'll do basic type checking
    if (typeof this.value !== 'object' || this.value === null) {
      throw new Error('Value must be an object for schema validation');
    }
    return this;
  }

  header(name: string, expectedValue: string): this {
    if (typeof this.value === 'object' && this.value !== null && 'headers' in this.value) {
      const headers = (this.value as { headers: Record<string, string> }).headers;
      const actual = headers[name];
      if (actual !== expectedValue) {
        throw new Error(`Expected header ${name} to be ${expectedValue}, got ${actual}`);
      }
    }
    return this;
  }

  responseTime(maxMs: number): this {
    if (typeof this.value === 'object' && this.value !== null && 'duration' in this.value) {
      const duration = (this.value as { duration: number }).duration;
      if (duration > maxMs) {
        throw new Error(`Response time ${duration}ms exceeded maximum ${maxMs}ms`);
      }
    }
    return this;
  }

  toEqual(expected: T): this {
    if (JSON.stringify(this.value) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(this.value)}`);
    }
    return this;
  }

  toContain(expected: string): this {
    if (typeof this.value === 'string' && !this.value.includes(expected)) {
      throw new Error(`Expected value to contain "${expected}"`);
    }
    return this;
  }

  toBeTruthy(): this {
    if (!this.value) {
      throw new Error('Expected value to be truthy');
    }
    return this;
  }

  toBeFalsy(): this {
    if (this.value) {
      throw new Error('Expected value to be falsy');
    }
    return this;
  }

  toBeDefined(): this {
    if (this.value === undefined) {
      throw new Error('Expected value to be defined');
    }
    return this;
  }

  toBeNull(): this {
    if (this.value !== null) {
      throw new Error('Expected value to be null');
    }
    return this;
  }

  toBeGreaterThan(expected: number): this {
    if (typeof this.value !== 'number' || this.value <= expected) {
      throw new Error(`Expected ${this.value} to be greater than ${expected}`);
    }
    return this;
  }

  toBeLessThan(expected: number): this {
    if (typeof this.value !== 'number' || this.value >= expected) {
      throw new Error(`Expected ${this.value} to be less than ${expected}`);
    }
    return this;
  }

  toHaveLength(expected: number): this {
    if (Array.isArray(this.value) && this.value.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${this.value.length}`);
    }
    if (typeof this.value === 'string' && this.value.length !== expected) {
      throw new Error(`Expected length ${expected}, got ${this.value.length}`);
    }
    return this;
  }

  toMatch(regex: RegExp): this {
    if (typeof this.value === 'string' && !regex.test(this.value)) {
      throw new Error(`Expected "${this.value}" to match ${regex}`);
    }
    return this;
  }
}

let currentLogger: Logger | null = null;

export function setLogger(logger: Logger): void {
  currentLogger = logger;
}

export function expect<T>(value: T): Expectation<T> {
  if (!currentLogger) {
    throw new Error('Logger not initialized');
  }
  return new Expectation<T>(value, currentLogger);
}

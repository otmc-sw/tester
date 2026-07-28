/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APITestCase } from './types.js';

export function defineAPIs<TRequest = unknown, TResponse extends object = object>(
  testCases: APITestCase<TRequest, TResponse>[]
): APITestCase<TRequest, TResponse>[] {
  return testCases;
}

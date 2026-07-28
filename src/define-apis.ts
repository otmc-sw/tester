/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APITestCase, APISuite, ProjectConfig } from './types/config.js';

export function defineAPIs<TRequest = unknown, TResponse extends object = object>(
  testCases: APITestCase<TRequest, TResponse>[],
  config?: ProjectConfig
): APISuite<TRequest, TResponse> {
  return {
    config: config || { baseURL: '' },
    tests: testCases
  };
}

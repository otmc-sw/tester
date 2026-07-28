/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APITestCase, APISuite, ProjectConfig } from './types/config.js';

export { defineConfig } from './config/config.js';

export function defineAPIs(
  testCases: APITestCase<any, any>[],
  config?: ProjectConfig
): APISuite<any, any> {
  return {
    config: config || { baseURL: '' },
    tests: testCases
  };
}

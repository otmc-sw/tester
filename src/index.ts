/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
export { createTester, Tester } from './core/tester.js';
export { defineConfig } from './core/config.js';
export { defineAPIs } from './core/api-definition.js';
export { generateTests } from './core/test-generator.js';
export { ResponseEnvelopeProcessor } from './validation/envelope-processor.js';
export { api } from './api/api.js';
export { ui, uiWait, uiKeyboard, uiNavigation, uiExpect } from './ui/ui.js';
export { test, apiTest } from './test/test.js';
export { expect } from './validation/expect.js';
export { PageObject } from './ui/client.js';
export { generateOpenApiClient } from './openapi/generator.js';
export type { 
  TesterConfig,
  AuthConfig,
  ApiError,
  UiError,
  TestResult,
  ResourceApi,
  TestConfig,
  ValidationError,
  TestExpectations,
  HttpMethod,
  TestContract,
  ShorthandTestContract,
  ValidationResult,
  ErrorDetail,
  DefaultSuccessEnvelope,
  DefaultErrorEnvelope,
  ResponseContractConfig,
  ResponseContract,
  APITestCase,
  ProjectConfig
} from './core/types.js';

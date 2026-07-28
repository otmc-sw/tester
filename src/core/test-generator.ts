/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APITestCase, ProjectConfig } from './types.js';
import { ResponseEnvelopeProcessor } from '../validation/envelope-processor.js';

export class TestGenerator {
  private config: ProjectConfig;

  constructor(config: ProjectConfig) {
    this.config = config;
  }

  generate(testCases: APITestCase[]): string {
    const imports = this.generateImports();
    const setup = this.generateSetup();
    const tests = testCases.map(tc => this.generateTest(tc)).join('\n\n');
    
    return `${imports}

${setup}

${tests}
`;
  }

  private generateImports(): string {
    return `import { test, expect } from '@playwright/test';
import { ResponseEnvelopeProcessor } from '@otmc/tester';`;
  }

  private generateSetup(): string {
    const contractConfig = this.config.response ? JSON.stringify(this.config.response, null, 2) : 'undefined';
    
    return `const baseURL = '${this.config.baseURL}';
const envelopeProcessor = new ResponseEnvelopeProcessor(${contractConfig});`;
  }

  private generateTest(testCase: APITestCase): string {
    const method = this.extractMethod(testCase);
    const url = this.extractUrl(testCase);
    const hasRequestBody = testCase.request !== undefined;
    const hasResponseModel = testCase.response !== undefined;
    const hasExpectedStatus = testCase.status !== undefined;
    const hasHeaders = testCase.headers !== undefined;
    const hasQuery = testCase.query !== undefined;

    let testBody = `test("${testCase.title}", async ({ request }) => {
  const response = await request.${method.toLowerCase()}("${url}"`;

    if (hasQuery) {
      testBody += this.generateQueryParams(testCase.query!);
    }

    if (hasRequestBody) {
      testBody += `, ${JSON.stringify(testCase.request)}`;
    }

    if (hasHeaders) {
      testBody += this.generateHeaders(testCase.headers!);
    }

    testBody += `);

  const status = response.status();
  ${hasExpectedStatus ? `expect(status).toBe(${testCase.status});` : `expect(status).toBeGreaterThanOrEqual(200); expect(status).toBeLessThan(300);`}

  const contentType = response.headers()['content-type'];
  expect(contentType).toMatch(/application\\/json/);

  const json = await response.json();`;

    if (hasResponseModel) {
      testBody += `

  const envelopeResult = envelopeProcessor.process(json);
  
  if (envelopeResult.isError) {
    const error = envelopeResult.errorDetail;
    throw new Error(\`ApiError\\nStatus : \${status}\\nKey : \${error?.key}\\nSummary : \${error?.summary}\\nDetail : \${error?.detail}\`);
  }

  if (envelopeResult.validationErrors && envelopeResult.validationErrors.length > 0) {
    throw new Error(\`Validation failed: \${JSON.stringify(envelopeResult.validationErrors)}\`);
  }

  return envelopeResult.data;`;
    }

    testBody += `
});`;

    return testBody;
  }

  private extractMethod(testCase: APITestCase): string {
    if (testCase.GET) return 'GET';
    if (testCase.POST) return 'POST';
    if (testCase.PUT) return 'PUT';
    if (testCase.PATCH) return 'PATCH';
    if (testCase.DELETE) return 'DELETE';
    if (testCase.HEAD) return 'HEAD';
    if (testCase.OPTIONS) return 'OPTIONS';
    return 'GET';
  }

  private extractUrl(testCase: APITestCase): string {
    if (testCase.GET) return testCase.GET;
    if (testCase.POST) return testCase.POST;
    if (testCase.PUT) return testCase.PUT;
    if (testCase.PATCH) return testCase.PATCH;
    if (testCase.DELETE) return testCase.DELETE;
    if (testCase.HEAD) return testCase.HEAD;
    if (testCase.OPTIONS) return testCase.OPTIONS;
    return '';
  }

  private generateQueryParams(query: Record<string, string>): string {
    const params = new URLSearchParams(query).toString();
    return `?${params}`;
  }

  private generateHeaders(headers: Record<string, string>): string {
    const headerStr = JSON.stringify(headers);
    return `, { headers: ${headerStr} }`;
  }
}

export function generateTests(config: ProjectConfig, testCases: APITestCase[]): string {
  const generator = new TestGenerator(config);
  return generator.generate(testCases);
}

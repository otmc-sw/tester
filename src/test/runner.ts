import type { TestResult, TestConfig } from '../core/types.js';
import type { Reporter } from '../core/reporter.js';
import type { ApiClient } from '../api/client.js';

export class TestRunner {
  private reporter: Reporter;
  private apiClient?: ApiClient;

  constructor(reporter: Reporter) {
    this.reporter = reporter;
  }

  setApiClient(client: ApiClient): void {
    this.apiClient = client;
  }

  async runTest(name: string, fn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    try {
      await fn();
      const result: TestResult = {
        name,
        status: 'passed',
        duration: Date.now() - startTime,
      };
      this.reporter.addResult(result);
      return result;
    } catch (error) {
      const result: TestResult = {
        name,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      this.reporter.addResult(result);
      return result;
    }
  }

  async runApiTest(config: TestConfig): Promise<TestResult> {
    if (!this.apiClient) {
      throw new Error('API client not initialized');
    }

    const startTime = Date.now();
    try {
      let response: unknown;

      switch (config.method) {
        case 'GET':
          response = await this.apiClient.GET(config.url, config.headers);
          break;
        case 'POST':
          response = await this.apiClient.POST(config.url, config.body, config.headers);
          break;
        case 'PUT':
          response = await this.apiClient.PUT(config.url, config.body, config.headers);
          break;
        case 'PATCH':
          response = await this.apiClient.PATCH(config.url, config.body, config.headers);
          break;
        case 'DELETE':
          response = await this.apiClient.DELETE(config.url, config.headers);
          break;
        case 'HEAD':
          await this.apiClient.HEAD(config.url, config.headers);
          break;
        case 'OPTIONS':
          await this.apiClient.OPTIONS(config.url, config.headers);
          break;
      }

      if (config.expect?.status) {
        // Status validation would be done here
      }

      const result: TestResult = {
        name: config.name,
        status: 'passed',
        duration: Date.now() - startTime,
      };
      this.reporter.addResult(result);
      return result;
    } catch (error) {
      const result: TestResult = {
        name: config.name,
        status: 'failed',
        duration: Date.now() - startTime,
        error: error instanceof Error ? error : new Error(String(error)),
      };
      this.reporter.addResult(result);
      return result;
    }
  }
}

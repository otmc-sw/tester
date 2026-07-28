/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from '@playwright/test';
import type { APISuite } from '../types/config.js';
import { Executor } from './executor.js';
import { Reporter } from './reporter.js';
import { normalize } from './normalizer.js';

export interface Location {
  file: string;
  line: number;
  column: number;
}

export type TestContext = { request: APIRequestContext };
export type TestFunction = (
  title: string,
  fn: (ctx: TestContext) => Promise<void>,
  options?: { location?: Location }
) => void;

/**
 * Khởi tạo Executor và Reporter từ API Suite config.
 */
export function createExecutor(suite: APISuite): { executor: Executor; reporter: Reporter } {
  const reporter = new Reporter();
  const executor = new Executor(reporter, suite.config.response);
  return { executor, reporter };
}

/**
 * Helper thực thi 1 test case, đo thời gian bằng `performance.now()` và báo cáo kết quả.
 */
async function executeTestCase(
  executor: Executor,
  reporter: Reporter,
  normalizedTc: ReturnType<typeof normalize>,
  request: APIRequestContext
): Promise<void> {
  const startTime = performance.now();
  try {
    await executor.execute(request, normalizedTc);
    reporter.onTestComplete({
      title: normalizedTc.title,
      status: 'passed',
      duration: Math.round(performance.now() - startTime),
    });
  } catch (error) {
    reporter.onTestComplete({
      title: normalizedTc.title,
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      error: error as Error,
    });
    throw error;
  }
}

/**
 * Tạo danh sách test cases sử dụng trong Playwright spec files.
 *
 * @example
 * import { test } from '@playwright/test';
 * import { defineAPIs, createTestCases } from '../../src/index.js';
 *
 * const suite = defineAPIs([...], config);
 *
 * test.describe('Products', () => {
 * const { setup, testCases } = createTestCases(suite);
 * setup(test);
 * for (const tc of testCases) {
 * test(tc.title, async ({ request }) => {
 * await tc.execute(request);
 * });
 * }
 * });
 */
export function createTestCases(suite: APISuite) {
  const { executor, reporter } = createExecutor(suite);

  const setup = (testFn: TestFunction): void => {
    testFn('Setup: Reset database', async ({ request }) => {
      await request.post(`${suite.config.baseURL}/reset-db`);
    });
  };

  const testCases = suite.tests.map((tc) => {
    const normalized = normalize(tc);
    return {
      title: normalized.title,
      execute: (request: APIRequestContext) =>
        executeTestCase(executor, reporter, normalized, request),
    };
  });

  return {
    setup,
    testCases,
    getReporter: () => reporter,
  };
}


/**
 * Trích xuất vị trí gọi hàm từ Stack trace (bỏ qua các file runner nội bộ).
 */
function getCallerLocation(): Location {
  const stack = new Error().stack;
  if (!stack) return { file: '', line: 0, column: 0 };

  const STACK_REGEX = /\((.*?):(\d+):(\d+)\)|at (.*?):(\d+):(\d+)/;
  const lines = stack.split('\n');

  for (let i = 3; i < lines.length; i++) {
    const match = lines[i].match(STACK_REGEX);
    if (match) {
      const file = match[1] || match[4] || '';
      if (file && !file.includes('runner.ts')) {
        return {
          file,
          line: parseInt(match[2] || match[5], 10),
          column: parseInt(match[3] || match[6], 10),
        };
      }
    }
  }

  return { file: '', line: 0, column: 0 };
}

function runTests(
  suite: APISuite,
  executor: Executor,
  reporter: Reporter,
  testFn: TestFunction,
  callerLocation?: Location
): void {
  const location = callerLocation || getCallerLocation();

  // Reset database
  testFn(
    'Setup: Reset database',
    async ({ request }) => {
      await request.post(`${suite.config.baseURL}/reset-db`);
    },
    { location }
  );

  // Chạy từng test case
  for (const testCase of suite.tests) {
    const normalized = normalize(testCase);
    testFn(
      normalized.title,
      async ({ request }) => {
        await executeTestCase(executor, reporter, normalized, request);
      },
      { location }
    );
  }

  reporter.onSuiteComplete();
}

/**
 * @deprecated Sử dụng `createTestRunner()` hoặc `createTestCases()` để đảm bảo
 * hiển thị chính xác vị trí file trong Playwright report.
 */
export function run(
  suite: APISuite,
  testFn: TestFunction,
  describeFn?: (title: string, fn: () => void) => void,
  suiteName?: string
): void {
  const { executor, reporter } = createExecutor(suite);
  const callerLocation = getCallerLocation();

  if (describeFn) {
    describeFn(suiteName || 'API Tests', () => {
      runTests(suite, executor, reporter, testFn, callerLocation);
    });
  } else {
    runTests(suite, executor, reporter, testFn, callerLocation);
  }
}
/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from '@playwright/test';
import type { APISuite, TestPhase } from '../types/config.js';
import { Executor } from './executor.js';
import { Reporter } from './reporter.js';
import { normalize } from './normalizer.js';
import { pathToFileURL } from "node:url";

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

export function createExecutor(suite: APISuite): { executor: Executor; reporter: Reporter } {
  const reporter = new Reporter();
  const executor = new Executor(reporter, suite.config.response);
  return { executor, reporter };
}

async function executeTestCase(
  executor: Executor,
  reporter: Reporter,
  normalizedTc: ReturnType<typeof normalize>,
  request: APIRequestContext
): Promise<void> {
  const startTime = performance.now();
  reporter.setCurrentTest(normalizedTc.title);
  try {
    await executor.execute(request, normalizedTc);
    reporter.onTestComplete({
      title: normalizedTc.title,
      status: 'passed',
      duration: Math.round(performance.now() - startTime),
    });
  } catch (error) {
    const logPath = reporter.onTestComplete({
      title: normalizedTc.title,
      status: 'failed',
      duration: Math.round(performance.now() - startTime),
      error: error as Error,
    });
    (error as Error).message += `\n📄 Log file: ${pathToFileURL(logPath).href}`;
    throw error;
  } finally {
    reporter.clearCurrentTest();
  }
}

export function createTestCases(suite: APISuite) {
  const { executor, reporter } = createExecutor(suite);

  const sortedTests = sortTestsByPhase(suite.tests);
  const testCases = sortedTests.map((tc) => {
    const normalized = normalize(tc);
    return {
      title: normalized.title,
      execute: (request: APIRequestContext) =>
        executeTestCase(executor, reporter, normalized, request),
    };
  });

  return {
    testCases,
    getReporter: () => reporter,
  };
}


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

  const sortedTests = sortTestsByPhase(suite.tests);

  for (const testCase of sortedTests) {
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

function sortTestsByPhase(tests: APISuite['tests']): APISuite['tests'] {
  const phaseOrder: Record<TestPhase | string, number> = {
    'Pre': 0,
    'Main': 1,
    'Post': 2
  };

  return [...tests].sort((a, b) => {
    const phaseA = a.phase || 'Main';
    const phaseB = b.phase || 'Main';
    return (phaseOrder[phaseA] || 1) - (phaseOrder[phaseB] || 1);
  });
}

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
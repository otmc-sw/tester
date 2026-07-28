/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APISuite } from './types.js';
import { Executor } from './executor.js';
import { Reporter } from './reporter.js';
import { normalize } from './normalizer.js';

export function createExecutor(suite: APISuite): { executor: Executor; reporter: Reporter } {
  const reporter = new Reporter();
  const executor = new Executor(reporter, suite.config.response);
  return { executor, reporter };
}

export function run(
  suite: APISuite,
  testFn: (title: string, fn: (context: { request: any }) => Promise<void>) => void
): void {
  const { executor, reporter } = createExecutor(suite);

  for (const testCase of suite.tests) {
    const normalized = normalize(testCase);
    
    testFn(normalized.title, async ({ request }: { request: any }) => {
      const startTime = Date.now();
      try {
        await executor.execute(request, normalized);
        reporter.onTestComplete({
          title: normalized.title,
          status: 'passed',
          duration: Date.now() - startTime,
        });
      } catch (error) {
        reporter.onTestComplete({
          title: normalized.title,
          status: 'failed',
          duration: Date.now() - startTime,
          error: error as Error,
        });
        throw error;
      }
    });
  }

  reporter.onSuiteComplete();
}

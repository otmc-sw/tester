import { TestRunner } from './runner.js';

let currentRunner: TestRunner | null = null;

export function setRunner(runner: TestRunner): void {
  currentRunner = runner;
}

export async function test(name: string, fn: () => Promise<void>): Promise<void> {
  if (!currentRunner) {
    throw new Error('Test runner not initialized');
  }
  await currentRunner.runTest(name, fn);
}

export async function apiTest(config: {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  expect?: {
    status?: number;
    schema?: unknown;
    headers?: Record<string, string>;
    responseTime?: number;
  };
}): Promise<void> {
  if (!currentRunner) {
    throw new Error('Test runner not initialized');
  }
  await currentRunner.runApiTest(config);
}

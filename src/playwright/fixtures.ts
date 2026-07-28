/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from 'playwright';

export interface TesterFixtures {
  request: APIRequestContext;
}

// Note: This is a placeholder for future Playwright test integration
// The actual test() function would come from @playwright/test when used in test files
export function createFixtures(request: APIRequestContext): TesterFixtures {
  return { request };
}

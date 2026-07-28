/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from 'playwright';

export interface TesterFixtures {
  request: APIRequestContext;
}

export function createFixtures(request: APIRequestContext): TesterFixtures {
  return { request };
}

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APITestCase, TestPhase } from '../types/config.js';
import type { NormalizedTestCase } from '../types/api.js';

export function normalize(testCase: APITestCase): NormalizedTestCase {
  const method = extractMethod(testCase);
  const url = extractUrl(testCase);

  return {
    title: testCase.title,
    method,
    url,
    request: testCase.request,
    response: testCase.response,
    status: testCase.status,
    headers: testCase.headers,
    query: testCase.query,
    auth: testCase.auth,
    phase: testCase.phase,
  };
}

function extractMethod(testCase: APITestCase): string {
  if (testCase.GET) return 'GET';
  if (testCase.POST) return 'POST';
  if (testCase.PUT) return 'PUT';
  if (testCase.PATCH) return 'PATCH';
  if (testCase.DELETE) return 'DELETE';
  if (testCase.HEAD) return 'HEAD';
  if (testCase.OPTIONS) return 'OPTIONS';
  return 'GET';
}

function extractUrl(testCase: APITestCase): string {
  if (testCase.GET) return testCase.GET;
  if (testCase.POST) return testCase.POST;
  if (testCase.PUT) return testCase.PUT;
  if (testCase.PATCH) return testCase.PATCH;
  if (testCase.DELETE) return testCase.DELETE;
  if (testCase.HEAD) return testCase.HEAD;
  if (testCase.OPTIONS) return testCase.OPTIONS;
  return '';
}

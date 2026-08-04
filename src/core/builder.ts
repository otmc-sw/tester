/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { IRequestBuilder, NormalizedTestCase } from '../types/api.js';
import { GetAccessToken } from '../utils/api.js';

export class RequestBuilder implements IRequestBuilder {
  build(testCase: NormalizedTestCase): {
    method: string;
    data?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  } {
    const options: {
      method: string;
      data?: unknown;
      headers?: Record<string, string>;
      params?: Record<string, string>;
    } = {
      method: testCase.method,
    };

    if (testCase.request !== undefined) {
      options.data = testCase.request;
    }

    if (testCase.headers !== undefined) {
      options.headers = testCase.headers;
    }

    if (testCase.query !== undefined) {
      options.params = testCase.query;
    }

    const accessToken = GetAccessToken();
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      };
    }

    return options;
  }
}

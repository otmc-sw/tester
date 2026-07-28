/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext, APIResponse } from 'playwright';

export interface RequestOptions {
  method?: string;
  data?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string>;
  baseURL?: string;
}

export async function makeRequest(
  request: APIRequestContext,
  url: string,
  options: RequestOptions = {}
): Promise<APIResponse> {
  const { baseURL, ...requestOptions } = options;
  const fullURL = baseURL ? `${baseURL}${url}` : url;
  return await request.fetch(fullURL, requestOptions);
}

export function setAuthHeader(
  headers: Record<string, string>,
  token: string,
  type: 'bearer' | 'apikey' = 'bearer'
): Record<string, string> {
  if (type === 'bearer') {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  if (type === 'apikey') {
    return { ...headers, 'X-API-Key': token };
  }
  return headers;
}

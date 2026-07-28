/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { ApiClient } from './client.js';
import type { TestContract, ShorthandTestContract } from '../core/types.js';

let currentClient: ApiClient | null = null;

export function setClient(client: ApiClient): void {
  currentClient = client;
}

export const api = {
  GET: <T>(url: string, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.GET<T>(url, headers);
  },
  POST: <TRequest, TResponse>(url: string, body: TRequest, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.POST<TRequest, TResponse>(url, body, headers);
  },
  PUT: <TRequest, TResponse>(url: string, body: TRequest, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.PUT<TRequest, TResponse>(url, body, headers);
  },
  PATCH: <TRequest, TResponse>(url: string, body: TRequest, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.PATCH<TRequest, TResponse>(url, body, headers);
  },
  DELETE: <T>(url: string, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.DELETE<T>(url, headers);
  },
  HEAD: (url: string, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.HEAD(url, headers);
  },
  OPTIONS: (url: string, headers?: Record<string, string>) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.OPTIONS(url, headers);
  },
  resource: <T>(basePath: string) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.resource<T>(basePath);
  },
  login: (credentials: { username: string; password: string }) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.login(credentials);
  },
  setAuthToken: (token: string) => {
    if (!currentClient) throw new Error('API client not initialized');
    currentClient.setAuthToken(token);
  },
  test: <TRequest, TResponse extends Record<string, unknown>>(
    contract: TestContract<TRequest, TResponse> | ShorthandTestContract<TRequest, TResponse>
  ) => {
    if (!currentClient) throw new Error('API client not initialized');
    return currentClient.test<TRequest, TResponse>(contract);
  },
};

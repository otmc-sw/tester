/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { Browser, BrowserContext, Page, APIRequestContext } from 'playwright';

export interface TesterConfig {
  baseURL: string;
  response?: ResponseContractConfig;
  browser?: 'chromium' | 'firefox' | 'webkit';
  timeout?: number;
  retries?: number;
  headless?: boolean;
  auth?: AuthConfig;
  viewport?: { width: number; height: number };
  userAgent?: string;
  locale?: string;
  timezoneId?: string;
}

export interface AuthConfig {
  type: 'jwt' | 'bearer' | 'basic' | 'oauth2' | 'apikey';
  credentials?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    clientId?: string;
    clientSecret?: string;
  };
  loginUrl?: string;
  tokenUrl?: string;
}

export interface ValidationError {
  path: string;
  message: string;
  expected?: unknown;
  actual?: unknown;
}

export interface ApiError extends Error {
  status: number;
  url: string;
  headers: Record<string, string>;
  request?: unknown;
  response?: unknown;
  duration: number;
  validationErrors?: ValidationError[];
  code?: number;
  key?: string;
  type?: string;
  summary?: string;
  detail?: string;
  file?: string;
  line?: number;
  function?: string;
  timestamp?: string;
}

export interface UiError extends Error {
  selector?: string;
  action: string;
  screenshot?: string;
  video?: string;
}

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: Error;
  metadata?: Record<string, unknown>;
}

export interface RequestLog {
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: unknown;
  timestamp: number;
}

export interface ResponseLog {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
  duration: number;
  timestamp: number;
}

export interface LogEntry {
  type: 'request' | 'response' | 'browser' | 'console' | 'error';
  data: RequestLog | ResponseLog | unknown;
  timestamp: number;
}

export interface ResourceApi<T> {
  list(): Promise<T[]>;
  get(id: string): Promise<T>;
  create(body: Partial<T>): Promise<T>;
  update(id: string, body: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface TestConfig {
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
}

export interface TestExpectations {
  status?: number;
  responseTime?: number;
  headers?: Record<string, string>;
  contentType?: string;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface TestContract<TRequest = unknown, TResponse extends object = object> {
  method?: HttpMethod;
  url?: string;
  request?: TRequest;
  response: new () => TResponse;
  expect?: TestExpectations;
}

export interface ShorthandTestContract<TRequest = unknown, TResponse extends object = object> {
  GET?: string;
  POST?: string;
  PUT?: string;
  PATCH?: string;
  DELETE?: string;
  HEAD?: string;
  OPTIONS?: string;
  request?: TRequest;
  response: new () => TResponse;
  expect?: TestExpectations;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ErrorDetail {
  code?: number;
  key?: string;
  type?: string;
  summary?: string;
  detail?: string;
  file?: string;
  line?: number;
  function?: string;
  timestamp?: string;
}

export interface DefaultSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface DefaultErrorEnvelope {
  success: false;
  message: string;
  error: ErrorDetail;
}

export interface ResponseContractConfig {
  success?: {
    successField?: string;
    messageField?: string;
    dataField?: string;
  };
  error?: {
    successField?: string;
    messageField?: string;
    errorField?: string;
  };
}

export type ResponseContract = ResponseContractConfig | false;

export interface APITestCase<TRequest = unknown, TResponse extends object = object> {
  title: string;
  GET?: string;
  POST?: string;
  PUT?: string;
  PATCH?: string;
  DELETE?: string;
  HEAD?: string;
  OPTIONS?: string;
  request?: TRequest;
  response?: new () => TResponse;
  success?: new () => TResponse;
  error?: new () => object;
  status?: number;
  headers?: Record<string, string>;
  query?: Record<string, string>;
  auth?: AuthConfig;
}

export interface ProjectConfig {
  baseURL: string;
  response?: ResponseContractConfig;
}

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export interface ResponseFieldConfig {
  name: string;
  required?: boolean;
}

export type ResponseField = string | ResponseFieldConfig;

export interface NormalizedResponseField {
  name: string;
  required: boolean;
}

export interface ResponseContractConfig {
  success?: {
    successField?: ResponseField;
    messageField?: ResponseField;
    dataField?: ResponseField;
  };
  error?: {
    successField?: ResponseField;
    messageField?: ResponseField;
    errorField?: ResponseField;
  };
}

export interface AuthConfig {
  type: 'jwt' | 'bearer' | 'basic' | 'oauth2' | 'apikey';
  loginUrl?: string;
  token?: string;
  username?: string;
  password?: string;
  clientId?: string;
  clientSecret?: string;
  apiKey?: string;
  apiKeyHeader?: string;
}

export type TestPhase = 'Pre' | 'Post' | 'Main';

export interface APITestCase<TRequest = unknown, TResponse extends object = object> {
  title: string;
  phase?: TestPhase;
  GET?: string;
  POST?: string;
  PUT?: string;
  PATCH?: string;
  DELETE?: string;
  HEAD?: string;
  OPTIONS?: string;
  request?: TRequest;
  response?: new () => TResponse;
  status?: number | number[];
  headers?: Record<string, string>;
  query?: Record<string, string>;
  auth?: AuthConfig;
}

export interface ProjectConfig {
  baseURL: string;
  response?: ResponseContractConfig;
}

export interface APISuite<TRequest = unknown, TResponse extends object = object> {
  config: ProjectConfig;
  tests: APITestCase<TRequest, TResponse>[];
}

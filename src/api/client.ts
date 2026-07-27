import type { APIRequestContext, APIResponse } from 'playwright';
import { request } from 'playwright';
import type { TesterConfig, ApiError, RequestLog, ResponseLog, TestContract, ShorthandTestContract, TestExpectations } from '../core/types.js';
import type { Logger } from '../core/logger.js';
import { AuthenticationManager } from './auth.js';
import { RequestBuilder } from '../validation/request-builder.js';
import { ResponseParser } from '../validation/response-parser.js';

export class ApiClient {
  private config: TesterConfig;
  private logger: Logger;
  private context?: APIRequestContext;
  private auth: AuthenticationManager;
  private responseParser: ResponseParser;

  constructor(config: TesterConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.auth = new AuthenticationManager(config, logger);
    this.responseParser = new ResponseParser(config.responseContract);
  }

  async initialize(): Promise<APIRequestContext> {
    this.context = await request.newContext({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout ?? 30000,
      ignoreHTTPSErrors: true,
    });
    // Set environment variable to ignore SSL errors for Node.js
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    return this.context;
  }

  async cleanup(): Promise<void> {
    if (this.context) {
      await this.context.dispose();
    }
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    if (!this.context) {
      throw new Error('API client not initialized');
    }

    const startTime = Date.now();
    const authHeaders = this.auth.getHeaders();
    const mergedHeaders = { ...authHeaders, ...headers };

    this.logger.logRequest({
      method,
      url: this.config.baseURL + url,
      headers: mergedHeaders,
      body,
      timestamp: startTime,
    });

    try {
      const response = await this.context.fetch(url, {
        method,
        headers: mergedHeaders,
        data: body,
      });

      const duration = Date.now() - startTime;
      const responseBody = await response.json().catch(() => null);

      this.logger.logResponse({
        status: response.status(),
        headers: response.headers() as Record<string, string>,
        body: responseBody,
        duration,
        timestamp: Date.now(),
      });

      if (!response.ok()) {
        const error: ApiError = {
          name: 'ApiError',
          message: `Request failed with status ${response.status()}`,
          status: response.status(),
          url: this.config.baseURL + url,
          headers: response.headers() as Record<string, string>,
          request: body,
          response: responseBody,
          duration,
        };
        throw error;
      }

      return responseBody as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      const apiError: ApiError = {
        name: 'ApiError',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        url: this.config.baseURL + url,
        headers: mergedHeaders,
        request: body,
        duration,
      };
      console.error('Request failed:', error);
      throw apiError;
    }
  }

  async GET<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', url, undefined, headers);
  }

  async POST<TRequest, TResponse>(
    url: string,
    body: TRequest,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.makeRequest<TResponse>('POST', url, body, headers);
  }

  async PUT<TRequest, TResponse>(
    url: string,
    body: TRequest,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.makeRequest<TResponse>('PUT', url, body, headers);
  }

  async PATCH<TRequest, TResponse>(
    url: string,
    body: TRequest,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.makeRequest<TResponse>('PATCH', url, body, headers);
  }

  async DELETE<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('DELETE', url, undefined, headers);
  }

  async HEAD(url: string, headers?: Record<string, string>): Promise<void> {
    await this.makeRequest<void>('HEAD', url, undefined, headers);
  }

  async OPTIONS(url: string, headers?: Record<string, string>): Promise<void> {
    await this.makeRequest<void>('OPTIONS', url, undefined, headers);
  }

  resource<T>(basePath: string): ResourceApi<T> {
    return new ResourceApi<T>(basePath, this);
  }

  async login(credentials: { username: string; password: string }): Promise<void> {
    await this.auth.login(credentials);
  }

  setAuthToken(token: string): void {
    this.auth.setToken(token);
  }

  async test<TRequest, TResponse extends object>(
    contract: TestContract<TRequest, TResponse>
  ): Promise<TResponse>;
  async test<TRequest, TResponse extends object>(
    contract: ShorthandTestContract<TRequest, TResponse>
  ): Promise<TResponse>;
  async test<TRequest, TResponse extends object>(
    contract: TestContract<TRequest, TResponse> | ShorthandTestContract<TRequest, TResponse>
  ): Promise<TResponse> {
    if (!this.context) {
      throw new Error('API client not initialized');
    }

    // Determine if shorthand or regular contract
    const isShorthand = 'GET' in contract || 'POST' in contract || 'PUT' in contract || 
                        'PATCH' in contract || 'DELETE' in contract || 'HEAD' in contract || 
                        'OPTIONS' in contract;

    const builtRequest = isShorthand 
      ? RequestBuilder.buildFromShorthand(contract as ShorthandTestContract<TRequest, TResponse>)
      : RequestBuilder.build(contract as TestContract<TRequest, TResponse>);

    const { method, url, body } = builtRequest;
    const ModelClass = contract.response;
    const expectations = contract.expect;

    // Infer default status if not provided
    const finalExpectations: TestExpectations = {
      ...expectations,
      status: expectations?.status ?? RequestBuilder.inferExpectedStatus(method),
    };

    const startTime = Date.now();
    const authHeaders = this.auth.getHeaders();

    this.logger.logRequest({
      method,
      url: this.config.baseURL + url,
      headers: authHeaders,
      body,
      timestamp: startTime,
    });

    try {
      const response = await this.context.fetch(url, {
        method,
        headers: authHeaders,
        data: body,
      });

      const duration = Date.now() - startTime;
      const responseBody = await response.json().catch(() => null);

      this.logger.logResponse({
        status: response.status(),
        headers: response.headers() as Record<string, string>,
        body: responseBody,
        duration,
        timestamp: Date.now(),
      });

      // Parse and validate response
      const parsed = await this.responseParser.parse(response, ModelClass, finalExpectations, duration);

      // If there are validation errors, throw ApiError
      if (parsed.validationErrors.length > 0) {
        const error: ApiError = {
          name: 'ApiError',
          message: 'Response validation failed',
          status: parsed.status,
          url: this.config.baseURL + url,
          headers: parsed.headers,
          request: body,
          response: responseBody,
          duration: parsed.duration,
          validationErrors: parsed.validationErrors,
        };
        throw error;
      }

      return parsed.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      if (error instanceof Error && 'status' in error) {
        throw error;
      }
      const apiError: ApiError = {
        name: 'ApiError',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 0,
        url: this.config.baseURL + url,
        headers: authHeaders,
        request: body,
        duration,
      };
      throw apiError;
    }
  }
}

export class ResourceApi<T> {
  private basePath: string;
  private client: ApiClient;

  constructor(basePath: string, client: ApiClient) {
    this.basePath = basePath;
    this.client = client;
  }

  async list(): Promise<T[]> {
    return this.client.GET<T[]>(this.basePath);
  }

  async get(id: string): Promise<T> {
    return this.client.GET<T>(`${this.basePath}/${id}`);
  }

  async create(body: Partial<T>): Promise<T> {
    return this.client.POST<Partial<T>, T>(this.basePath, body);
  }

  async update(id: string, body: Partial<T>): Promise<T> {
    return this.client.PUT<Partial<T>, T>(`${this.basePath}/${id}`, body);
  }

  async delete(id: string): Promise<void> {
    await this.client.DELETE<void>(`${this.basePath}/${id}`);
  }
}

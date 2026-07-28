import type { APIRequestContext } from 'playwright';
import { request } from 'playwright';
import type {
  TesterConfig,
  ApiError,
  TestContract,
  ShorthandTestContract,
  TestExpectations,
} from '../core/types.js';
import type { Logger } from '../core/logger.js';
import { AuthenticationManager } from './auth.js';
import { RequestBuilder } from '../validation/request-builder.js';
import { ResponseParser } from '../validation/response-parser.js';

interface RequestOptions {
  method: string;
  url: string;
  body?: unknown;
  headers?: Record<string, string>;
  contractResponseModel?: any;
  expectations?: TestExpectations;
}

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
    return this.context;
  }

  async cleanup(): Promise<void> {
    await this.context?.dispose();
    this.context = undefined;
  }

  /**
   * Hàm core thực thi HTTP request, tính toán duration, log thông tin và xử lý lỗi tập trung.
   */
  private async executeRequest<T>(options: RequestOptions): Promise<T> {
    if (!this.context) {
      const err = new Error('API client not initialized. Call initialize() first.');
      this.logger.logError(`[ApiClient Error] ${err.message}`);
      throw err;
    }

    const { method, url, body, headers, contractResponseModel, expectations } = options;
    const fullUrl = this.config.baseURL + url;
    const startTime = Date.now();
    const mergedHeaders = { ...this.auth.getHeaders(), ...headers };

    // Log Request
    this.logger.logRequest({
      method,
      url: fullUrl,
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
      const responseHeaders = response.headers() as Record<string, string>;
      const responseBody = await response.json().catch(() => null);

      // Log Response
      this.logger.logResponse({
        status: response.status(),
        headers: responseHeaders,
        body: responseBody,
        duration,
        timestamp: Date.now(),
      });

      // Kiểm tra validation với ResponseParser nếu có Contract
      if (contractResponseModel || expectations) {
        const parsed = await this.responseParser.parse(
          response,
          contractResponseModel,
          expectations,
          duration
        );

        if (parsed.validationErrors.length > 0) {
          const apiError: ApiError = {
            name: 'ApiError',
            message: `Response validation failed for [${method}] ${fullUrl}`,
            status: parsed.status,
            url: fullUrl,
            headers: parsed.headers,
            request: body,
            response: responseBody,
            duration: parsed.duration,
            validationErrors: parsed.validationErrors,
          };

          this.printError('Validation Failure', apiError);
          throw apiError;
        }

        return parsed.data as T;
      }

      // Xử lý request thông thường không có contract
      if (!response.ok()) {
        const apiError: ApiError = {
          name: 'ApiError',
          message: `Request failed with status ${response.status()} [${method}] ${fullUrl}`,
          status: response.status(),
          url: fullUrl,
          headers: responseHeaders,
          request: body,
          response: responseBody,
          duration,
        };

        this.printError('HTTP Request Error', apiError);
        throw apiError;
      }

      return responseBody as T;
    } catch (error) {
      const duration = Date.now() - startTime;

      if (error instanceof Error && 'status' in error) {
        throw error;
      }

      const raw = (error as any) ?? {};
      const rawText = raw?.message ?? raw?.text ?? raw?.errorText ?? raw;
      const reason = typeof rawText === 'string' ? rawText : undefined;
      const apiError: ApiError = {
        name: 'ApiError',
        message: reason || 'Unknown Network/System Error',
        status: (raw as any).status ?? 0,
        url: fullUrl,
        headers: mergedHeaders,
        request: body,
        duration,
      };

      this.printError('Execution Error', apiError);
      throw apiError;
    }
  }

  /**
   * Helper in chi tiết lỗi ra Logger/Console để debug nhanh chóng.
   */
  private printError(type: string, error: ApiError): void {
    const errorDetails = [
      `==================== [ API CLIENT ERROR ] ====================`,
      `Type:        ${type}`,
      `Message:     ${error.message}`,
      `URL:         ${error.url}`,
      `Status:      ${error.status}`,
      `Duration:    ${error.duration}ms`,
      `Request:     ${JSON.stringify(error.request ?? null, null, 2)}`,
      `Response:    ${JSON.stringify(error.response ?? null, null, 2)}`,
      error.validationErrors?.length
        ? `Validation Errors:\n${JSON.stringify(error.validationErrors, null, 2)}`
        : null,
      `==============================================================`,
    ]
      .filter(Boolean)
      .join('\n');

    if (typeof this.logger.logError === 'function') {
      this.logger.logError(errorDetails);
    } else {
      console.error(errorDetails);
    }
  }

  private makeRequest<T>(
    method: string,
    url: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<T> {
    return this.executeRequest<T>({ method, url, body, headers });
  }

  // --- HTTP Methods Shortcut ---
  async GET<T>(url: string, headers?: Record<string, string>): Promise<T> {
    return this.makeRequest<T>('GET', url, undefined, headers);
  }

  async POST<TReq, TRes>(url: string, body: TReq, headers?: Record<string, string>): Promise<TRes> {
    return this.makeRequest<TRes>('POST', url, body, headers);
  }

  async PUT<TReq, TRes>(url: string, body: TReq, headers?: Record<string, string>): Promise<TRes> {
    return this.makeRequest<TRes>('PUT', url, body, headers);
  }

  async PATCH<TReq, TRes>(url: string, body: TReq, headers?: Record<string, string>): Promise<TRes> {
    return this.makeRequest<TRes>('PATCH', url, body, headers);
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

  // --- Auth & Resource ---
  resource<T>(basePath: string): ResourceApi<T> {
    return new ResourceApi<T>(basePath, this);
  }

  async login(credentials: { username: string; password: string }): Promise<void> {
    await this.auth.login(credentials);
  }

  setAuthToken(token: string): void {
    this.auth.setToken(token);
  }

  // --- Contract Test API ---
  async test<TReq, TRes extends object>(contract: TestContract<TReq, TRes>): Promise<TRes>;
  async test<TReq, TRes extends object>(contract: ShorthandTestContract<TReq, TRes>): Promise<TRes>;
  async test<TReq, TRes extends object>(
    contract: TestContract<TReq, TRes> | ShorthandTestContract<TReq, TRes>
  ): Promise<TRes> {
    const isShorthand =
      'GET' in contract ||
      'POST' in contract ||
      'PUT' in contract ||
      'PATCH' in contract ||
      'DELETE' in contract ||
      'HEAD' in contract ||
      'OPTIONS' in contract;

    const builtRequest = isShorthand
      ? RequestBuilder.buildFromShorthand(contract as ShorthandTestContract<TReq, TRes>)
      : RequestBuilder.build(contract as TestContract<TReq, TRes>);

    const { method, url, body } = builtRequest;
    const expectations: TestExpectations = {
      ...contract.expect,
      status: contract.expect?.status ?? RequestBuilder.inferExpectedStatus(method),
    };

    return this.executeRequest<TRes>({
      method,
      url,
      body,
      contractResponseModel: contract.response,
      expectations,
    });
  }
}

export class ResourceApi<T> {
  constructor(
    private readonly basePath: string,
    private readonly client: ApiClient
  ) {}

  list = (): Promise<T[]> => this.client.GET<T[]>(this.basePath);
  get = (id: string): Promise<T> => this.client.GET<T>(`${this.basePath}/${id}`);
  create = (body: Partial<T>): Promise<T> => this.client.POST<Partial<T>, T>(this.basePath, body);
  update = (id: string, body: Partial<T>): Promise<T> => this.client.PUT<Partial<T>, T>(`${this.basePath}/${id}`, body);
  delete = (id: string): Promise<void> => this.client.DELETE<void>(`${this.basePath}/${id}`);
}
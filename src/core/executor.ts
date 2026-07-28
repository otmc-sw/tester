/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from 'playwright';
import type { NormalizedTestCase } from './interfaces.js';
import { RequestBuilder } from './request-builder.js';
import { ResponseParser } from './response-parser.js';
import { ResponseEnvelopeProcessor } from '../validation/envelope-processor.js';
import { ResponseValidator } from './response-validator.js';
import { ResponseMapper } from './response-mapper.js';
import { Reporter } from './reporter.js';
import { StatusValidationError, ApiError } from './errors.js';

export class Executor {
  private requestBuilder: RequestBuilder;
  private responseParser: ResponseParser;
  private envelopeProcessor: ResponseEnvelopeProcessor;
  private responseValidator: ResponseValidator;
  private responseMapper: ResponseMapper;
  private reporter: Reporter;

  constructor(reporter: Reporter, responseContract?: any) {
    this.requestBuilder = new RequestBuilder();
    this.responseParser = new ResponseParser();
    this.envelopeProcessor = new ResponseEnvelopeProcessor(responseContract);
    this.responseValidator = new ResponseValidator();
    this.responseMapper = new ResponseMapper();
    this.reporter = reporter;
  }

  async execute<T>(request: APIRequestContext, testCase: NormalizedTestCase): Promise<T> {
    const startTime = Date.now();

    try {
      const requestOptions = this.requestBuilder.build(testCase);
      
      this.reporter.logRequest({
        method: testCase.method,
        url: testCase.url,
        headers: requestOptions.headers || {},
        body: requestOptions.data,
        timestamp: startTime,
      });

      const response = await request.fetch(testCase.url, requestOptions);
      const duration = Date.now() - startTime;

      this.reporter.logResponse({
        status: response.status(),
        headers: response.headers() as Record<string, string>,
        duration,
        timestamp: Date.now(),
      });

      this.responseValidator.validateStatus(response.status(), testCase.status);
      this.responseValidator.validateContentType(response.headers()['content-type'] || '');

      const parsed = await this.responseParser.parse(response);
      
      if (testCase.response) {
        const envelopeResult = this.envelopeProcessor.process<T>(parsed);

        if (envelopeResult.isError) {
          const error = envelopeResult.errorDetail as any;
          throw new ApiError(
            `API Error: ${error?.summary || 'Unknown error'}`,
            {
              status: response.status(),
              headers: response.headers() as Record<string, string>,
              duration,
              code: error?.code,
              key: error?.key,
              type: error?.type,
              summary: error?.summary,
              detail: error?.detail,
            }
          );
        }

        if (envelopeResult.validationErrors && envelopeResult.validationErrors.length > 0) {
          throw new StatusValidationError(
            `Envelope validation failed`,
            {
              status: response.status(),
              headers: response.headers() as Record<string, string>,
              duration,
              diagnostics: { errors: envelopeResult.validationErrors },
            }
          );
        }

        return this.responseMapper.map<T>(envelopeResult.data, testCase.response as new () => T);
      }

      return parsed as T;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.logError(error as Error, { duration });
      throw error;
    }
  }
}

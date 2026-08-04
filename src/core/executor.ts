/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIRequestContext } from 'playwright';
import type { NormalizedTestCase } from '../types/api.js';
import { RequestBuilder } from './builder.js';
import { ResponseParser } from './parser.js';
import { ResponseEnvelopeProcessor } from './envelope.js';
import { ResponseValidator } from './validator.js';
import { ResponseMapper } from './mapper.js';
import { Reporter } from './reporter.js';
import { StatusValidationError, ApiError } from '../errors/index.js';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';

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

  private async saveResponse(saveKey: string, data: unknown): Promise<void> {
    const saveDir = join(process.cwd(), 'data');
    const savePath = join(saveDir, `${saveKey}.json`);
    
    try {
      await mkdir(saveDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
    
    await writeFile(savePath, JSON.stringify(data, null, 2), 'utf-8');
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

      let responseBody: unknown = undefined;
      if (response.status() !== 204) {
        try {
          responseBody = await this.responseParser.parse(response);
        } catch {
        }
      }

      this.reporter.logResponse({
        status: response.status(),
        headers: response.headers() as Record<string, string>,
        body: responseBody,
        duration,
        timestamp: Date.now(),
      });

      this.responseValidator.validateStatus(response.status(), testCase.status);
      if (response.status() !== 204) {
        this.responseValidator.validateContentType(response.headers()['content-type'] || '');
      }

      let result: T;
      if (testCase.response) {
        const envelopeResult = this.envelopeProcessor.process<T>(responseBody);

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

        result = this.responseMapper.map<T>(envelopeResult.data, testCase.response as new () => T);
      } else {
        result = responseBody as T;
      }

      if (testCase.save) {
        await this.saveResponse(testCase.save, result);
      }

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.reporter.logError(error as Error, { duration });
      throw error;
    }
  }
}

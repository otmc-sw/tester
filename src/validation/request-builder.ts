/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { HttpMethod, TestContract, ShorthandTestContract } from '../core/types.js';

export interface BuiltRequest {
  method: HttpMethod;
  url: string;
  body?: unknown;
}

export class RequestBuilder {
  static build<TRequest, TResponse extends object>(
    contract: TestContract<TRequest, TResponse>
  ): BuiltRequest {
    const { method, url, request } = contract;

    if (!method) {
      throw new Error('HTTP method is required');
    }

    if (!url) {
      throw new Error('URL is required');
    }

    return {
      method,
      url,
      body: request,
    };
  }

  static buildFromShorthand<TRequest, TResponse extends object>(
    contract: ShorthandTestContract<TRequest, TResponse>
  ): BuiltRequest {
    const { GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS, request } = contract;

    const methodEntries: Array<[HttpMethod, string | undefined]> = [
      ['GET', GET],
      ['POST', POST],
      ['PUT', PUT],
      ['PATCH', PATCH],
      ['DELETE', DELETE],
      ['HEAD', HEAD],
      ['OPTIONS', OPTIONS],
    ];

    const methodEntry = methodEntries.find(([, url]) => url !== undefined);

    if (!methodEntry) {
      throw new Error('One of GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS must be specified');
    }

    const [method, url] = methodEntry;

    return {
      method,
      url: url!,
      body: request,
    };
  }

  static inferExpectedStatus(method: HttpMethod): number {
    switch (method) {
      case 'POST':
        return 201;
      case 'DELETE':
        return 204;
      default:
        return 200;
    }
  }
}

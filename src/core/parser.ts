/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { APIResponse } from 'playwright';
import type { IResponseParser } from '../types/api.js';
import { ContentTypeError } from '../errors/index.js';

export class ResponseParser implements IResponseParser {
  async parse(response: APIResponse): Promise<unknown> {
    const contentType = response.headers()['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      return await this.parseJSON(response);
    }
    
    if (contentType.includes('text/')) {
      return await this.parseText(response);
    }
    
    return await this.parseBinary(response);
  }

  private async parseJSON(response: APIResponse): Promise<unknown> {
    try {
      return await response.json();
    } catch (error) {
      throw new ContentTypeError('Failed to parse JSON response', {
        status: response.status(),
        headers: response.headers() as Record<string, string>,
      });
    }
  }

  private async parseText(response: APIResponse): Promise<string> {
    return await response.text();
  }

  private async parseBinary(response: APIResponse): Promise<Buffer> {
    return await response.body();
  }
}

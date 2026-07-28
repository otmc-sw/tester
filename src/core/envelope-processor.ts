/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { ResponseContractConfig } from './types.js';

export class ResponseEnvelopeProcessor {
  private contract: ResponseContractConfig | false;

  constructor(contract?: ResponseContractConfig | false) {
    this.contract = contract !== undefined ? contract : {
      success: {
        successField: 'success',
        messageField: 'message',
        dataField: 'data',
      },
      error: {
        successField: 'success',
        messageField: 'message',
        errorField: 'error',
      },
    };
  }

  process<T>(response: unknown): EnvelopeResult<T> {
    if (this.contract === false) {
      return { data: response as T, isError: false };
    }

    const responseObj = response as Record<string, unknown>;
    const successConfig = this.contract.success;
    const errorConfig = this.contract.error;
    const hasCustomSuccessConfig = successConfig !== undefined;
    const hasCustomErrorConfig = errorConfig !== undefined;

    const successField = hasCustomSuccessConfig && successConfig.successField ? successConfig.successField : 'success';
    const successValue = responseObj[successField];

    if (typeof successValue !== 'boolean') {
      return {
        data: response as T,
        isError: false,
        validationErrors: [{
          path: successField,
          message: `Expected boolean, got ${typeof successValue}`,
        }],
      };
    }

    if (successValue === false) {
      return this.processErrorEnvelope(responseObj, errorConfig, hasCustomErrorConfig);
    }

    if (successValue === true) {
      return this.processSuccessEnvelope<T>(responseObj, successConfig, hasCustomSuccessConfig);
    }

    return { data: response as T, isError: false };
  }

  private processSuccessEnvelope<T>(
    response: Record<string, unknown>,
    config?: { successField?: string; messageField?: string; dataField?: string },
    hasCustomConfig = false
  ): EnvelopeResult<T> {
    const validationErrors: Array<{ path: string; message: string }> = [];
    const successField = config?.successField || 'success';
    const messageField = config?.messageField || 'message';
    const dataField = config?.dataField || 'data';

    if (!(messageField in response)) {
      validationErrors.push({
        path: messageField,
        message: `Required field missing: ${messageField}`,
      });
    }

    if (!(dataField in response)) {
      validationErrors.push({
        path: dataField,
        message: `Required field missing: ${dataField}`,
      });
    }

    if (validationErrors.length > 0) {
      return {
        data: (response[dataField] || response) as T,
        isError: false,
        validationErrors,
      };
    }

    return {
      data: response[dataField] as T,
      isError: false,
    };
  }

  private processErrorEnvelope(
    response: Record<string, unknown>,
    config?: { successField?: string; messageField?: string; errorField?: string },
    hasCustomConfig = false
  ): EnvelopeResult<never> {
    const validationErrors: Array<{ path: string; message: string }> = [];
    const messageField = config?.messageField || 'message';
    const errorField = config?.errorField || 'error';

    if (!(messageField in response)) {
      validationErrors.push({
        path: messageField,
        message: `Required field missing: ${messageField}`,
      });
    }

    if (!(errorField in response)) {
      validationErrors.push({
        path: errorField,
        message: `Required field missing: ${errorField}`,
      });
    }

    return {
      data: undefined as never,
      isError: true,
      errorDetail: response[errorField],
      validationErrors,
    };
  }
}

export interface EnvelopeResult<T> {
  data: T;
  isError: boolean;
  errorDetail?: unknown;
  validationErrors?: Array<{ path: string; message: string }>;
}

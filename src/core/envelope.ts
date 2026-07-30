/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { ResponseContractConfig, ResponseField, NormalizedResponseField } from '../types/config.js';

function normalizeField(field: ResponseField | undefined, defaultName: string): NormalizedResponseField {
  if (field === undefined || field === null) {
    return { name: defaultName, required: true };
  }

  if (typeof field === 'string') {
    return { name: field, required: true };
  }

  return {
    name: field.name,
    required: field.required !== false,
  };
}

interface NormalizedSuccessConfig {
  successField: NormalizedResponseField;
  messageField: NormalizedResponseField;
  dataField: NormalizedResponseField;
}

interface NormalizedErrorConfig {
  successField: NormalizedResponseField;
  messageField: NormalizedResponseField;
  errorField: NormalizedResponseField;
}

interface NormalizedContract {
  success: NormalizedSuccessConfig;
  error: NormalizedErrorConfig;
}

export class ResponseEnvelopeProcessor {
  private contract: NormalizedContract | false;

  constructor(contract?: ResponseContractConfig | false) {
    if (contract === false) {
      this.contract = false;
      return;
    }

    const rawConfig = contract || {};

    this.contract = {
      success: {
        successField: normalizeField(rawConfig.success?.successField, 'success'),
        messageField: normalizeField(rawConfig.success?.messageField, 'message'),
        dataField: normalizeField(rawConfig.success?.dataField, 'data'),
      },
      error: {
        successField: normalizeField(rawConfig.error?.successField, 'success'),
        messageField: normalizeField(rawConfig.error?.messageField, 'message'),
        errorField: normalizeField(rawConfig.error?.errorField, 'error'),
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

    const successField = successConfig.successField;
    const successValue = responseObj[successField.name];

    if (typeof successValue !== 'boolean') {
      return {
        data: response as T,
        isError: false,
        validationErrors: [{
          path: successField.name,
          message: `Expected boolean, got ${typeof successValue}`,
        }],
      };
    }

    if (successValue === false) {
      return this.processErrorEnvelope(responseObj, errorConfig);
    }

    if (successValue === true) {
      return this.processSuccessEnvelope<T>(responseObj, successConfig);
    }

    return { data: response as T, isError: false };
  }

  private checkRequiredField(
    response: Record<string, unknown>,
    field: NormalizedResponseField,
    errors: Array<{ path: string; message: string }>
  ): boolean {
    const exists = field.name in response;
    
    if (!exists) {
      if (field.required) {
        errors.push({
          path: field.name,
          message: `Required field missing: ${field.name}`,
        });
        return false;
      }
      return false;
    }

    return true;
  }

  private processSuccessEnvelope<T>(
    response: Record<string, unknown>,
    config: NormalizedSuccessConfig
  ): EnvelopeResult<T> {
    const validationErrors: Array<{ path: string; message: string }> = [];

    this.checkRequiredField(response, config.messageField, validationErrors);

    const dataExists = this.checkRequiredField(response, config.dataField, validationErrors);
    const dataFieldName = config.dataField.name;

    if (validationErrors.length > 0) {
      return {
        data: (dataExists ? response[dataFieldName] : response) as T,
        isError: false,
        validationErrors,
      };
    }

    return {
      data: response[dataFieldName] as T,
      isError: false,
    };
  }

  private processErrorEnvelope(
    response: Record<string, unknown>,
    config: NormalizedErrorConfig
  ): EnvelopeResult<never> {
    const validationErrors: Array<{ path: string; message: string }> = [];

    this.checkRequiredField(response, config.messageField, validationErrors);

    const errorExists = this.checkRequiredField(response, config.errorField, validationErrors);
    const errorFieldName = config.errorField.name;

    return {
      data: undefined as never,
      isError: true,
      errorDetail: errorExists ? response[errorFieldName] : undefined,
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
import type { ResponseContract, ResponseContractConfig, ErrorDetail, ValidationError } from '../core/types.js';

export interface EnvelopeResult<T> {
  data: T;
  isError: boolean;
  errorDetail?: ErrorDetail;
  validationErrors?: ValidationError[];
}

export class ResponseEnvelopeProcessor {
  private contract: ResponseContractConfig | false;

  constructor(contract?: ResponseContract) {
    this.contract = contract === false ? false : contract || this.getDefaultContract();
  }

  private getDefaultContract(): ResponseContractConfig {
    return {
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
      // Envelope disabled, return response as-is
      return { data: response as T, isError: false };
    }

    if (typeof response !== 'object' || response === null) {
      return {
        data: response as T,
        isError: false,
        validationErrors: [{
          path: '',
          message: 'Response is not an object',
        }],
      };
    }

    const responseObj = response as Record<string, unknown>;
    const successConfig = this.contract.success || this.getDefaultContract().success!;
    const errorConfig = this.contract.error || this.getDefaultContract().error!;

    // Check if this is an error response
    const successField = successConfig.successField || 'success';
    const successValue = responseObj[successField];
    
    if (successValue === false) {
      return this.processErrorEnvelope(responseObj, errorConfig);
    }

    if (successValue === true) {
      return this.processSuccessEnvelope<T>(responseObj, successConfig);
    }

    // If success field is missing or has unexpected value, treat as plain response
    return { data: response as T, isError: false };
  }

  private processSuccessEnvelope<T>(
    response: Record<string, unknown>,
    config: { successField?: string; messageField?: string; dataField?: string }
  ): EnvelopeResult<T> {
    const successField = config.successField || 'success';
    const messageField = config.messageField || 'message';
    const dataField = config.dataField || 'data';
    const validationErrors: ValidationError[] = [];

    // Validate success field
    if (response[successField] !== true) {
      validationErrors.push({
        path: successField,
        message: `Expected success field to be true, got ${response[successField]}`,
        expected: true,
        actual: response[successField],
      });
    }

    // Validate message field exists
    if (!(messageField in response)) {
      validationErrors.push({
        path: messageField,
        message: `Message field '${messageField}' is missing`,
      });
    }

    // Validate data field exists
    if (!(dataField in response)) {
      validationErrors.push({
        path: dataField,
        message: `Data field '${dataField}' is missing`,
      });
    }

    const data = response[dataField] as T;

    return {
      data,
      isError: false,
      validationErrors,
    };
  }

  private processErrorEnvelope(
    response: Record<string, unknown>,
    config: { successField?: string;  messageField?: string; errorField?: string }
  ): EnvelopeResult<never> {
    const successField = config.successField || 'success';
    const messageField = config.messageField || 'message';
    const errorField = config.errorField || 'error';
    const validationErrors: ValidationError[] = [];

    // Validate success field
    if (response[successField] !== false) {
      validationErrors.push({
        path: successField,
        message: `Expected success field to be false, got ${response[successField]}`,
        expected: false,
        actual: response[successField],
      });
    }

    // Validate message field exists
    if (!(messageField in response)) {
      validationErrors.push({
        path: messageField,
        message: `Message field '${messageField}' is missing`,
      });
    }

    // Validate error field exists
    if (!(errorField in response)) {
      validationErrors.push({
        path: errorField,
        message: `Error field '${errorField}' is missing`,
      });
    }

    const errorObj = response[errorField] as Record<string, unknown>;

    // Extract error detail fields
    const errorDetail: ErrorDetail = {
      code: typeof errorObj.code === 'number' ? errorObj.code : undefined,
      key: typeof errorObj.key === 'string' ? errorObj.key : undefined,
      type: typeof errorObj.type === 'string' ? errorObj.type : undefined,
      summary: typeof errorObj.summary === 'string' ? errorObj.summary : undefined,
      detail: typeof errorObj.detail === 'string' ? errorObj.detail : undefined,
      file: typeof errorObj.file === 'string' ? errorObj.file : undefined,
      line: typeof errorObj.line === 'number' ? errorObj.line : undefined,
      function: typeof errorObj.function === 'string' ? errorObj.function : undefined,
      timestamp: typeof errorObj.timestamp === 'string' ? errorObj.timestamp : undefined,
    };

    return {
      data: undefined as never,
      isError: true,
      errorDetail,
      validationErrors,
    };
  }
}

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export interface SuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorEnvelope {
  success: false;
  message: string;
  error: {
    code?: number;
    key?: string;
    type?: string;
    summary?: string;
    detail?: string;
  };
}

export type Envelope<T> = SuccessEnvelope<T> | ErrorEnvelope;

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    path: string;
    message: string;
    expected?: unknown;
    actual?: unknown;
  }>;
}

export interface ValidationSchema {
  [key: string]: unknown;
}

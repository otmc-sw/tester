/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 *
 * Response field configuration supports two formats:
 *
 * 1. String shorthand (backward compatible):
 *      successField: 'success'
 *    → { name: 'success', required: true }
 *
 * 2. Object config:
 *      successField: { name: 'success', required: false }
 *    → The field is optional; if absent, validation is skipped.
 *
 *    If required is not specified, it defaults to true.
 **/
import { defineConfig } from '../src/index.js';

export default defineConfig({
  baseURL: 'http://localhost:3000',
  response: {
    success: {
      successField: 'success',
      messageField: { name: 'message', required: false },
      dataField: 'data'
    },
    error: {
      successField: 'success',
      messageField: { name: 'message', required: false },
      errorField: 'error'
    }
  }
});

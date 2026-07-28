/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { defineConfig } from '../src/index.js';

export default defineConfig({
  baseURL: 'http://localhost:3000',
  response: {
    success: {
      successField: 'success',
      messageField: 'message',
      dataField: 'data'
    },
    error: {
      successField: 'success',
      messageField: 'message',
      errorField: 'error'
    }
  }
});

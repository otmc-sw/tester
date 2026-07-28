/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { defineConfig } from '@otmc/tester';

export default defineConfig({
  baseURL: 'https://dns.c',
  response: {
    success: {
      successField: 'success',
      dataField: 'data',
    },
    error: {
      successField: 'success',
      messageField: 'message',
      errorField: 'error',
    },
  },
});

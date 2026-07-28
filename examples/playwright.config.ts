/**
 * @License OTMC License
 * @Copyright (c) 2026 OTMC Softwares. All rights reserved.
 * @Contributors Nguyen Van Trung, OTMC Authors.
**/
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

});

export const apiConfig = defineConfig({
  testDir: './api',
});

export const uiConfig = defineConfig({
  testDir: './ui',
});
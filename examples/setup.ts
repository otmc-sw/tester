/**
 * @License OTMC License
 * @Copyright (c) 2026 OTMC Softwares. All rights reserved.
 * @Contributors Nguyen Van Trung, OTMC Authors.
**/

import { request, FullConfig } from '@playwright/test';
import { GlobalSetup } from './utils/prepare.js';
import { InitializeTestData } from './utils/initializer.js';

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;
  console.log(`🔍 Testing connection to ${baseURL}...`);

  try {
    const context = await request.newContext({ baseURL });
    const response = await context.get('/users', { timeout: 5000 });

    if (response.status() < 500) {
      console.log(`✅ Server is reachable at ${baseURL} (status: ${response.status()})`);
      await GlobalSetup(context);
      await InitializeTestData(context);
      await context.dispose();
      return;
    }

    throw new Error(`❌ Server returned error status: ${response.status()}`);
  } catch (error) {
    console.error(`❌ Failed to setup test environment at ${baseURL}`);
    console.error(`   Error: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

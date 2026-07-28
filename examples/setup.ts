/**
 * @License OTMC License
 * @Copyright (c) 2026 OTMC Softwares. All rights reserved.
 * @Contributors Nguyen Van Trung, OTMC Authors.
**/
import { request, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000';
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Reset database from template
  const templatePath = path.join(process.cwd(), 'db.template.json');
  const dbPath = path.join(dataDir, 'data.json');
  
  console.log('🔄 Resetting database from template...');
  fs.copyFileSync(templatePath, dbPath);
  console.log('✅ Database reset complete');
  
  console.log(`🔍 Testing connection to ${baseURL}...`);

  try {
    const context = await request.newContext({ baseURL });
    const response = await context.get('/users', { timeout: 5000 });

    if (response.status() < 500) {
      console.log(`✅ Server is reachable at ${baseURL} (status: ${response.status()})`);
      return;
    }

    throw new Error(`❌ Server returned error status: ${response.status()}`);
  } catch (error) {
    console.error(`❌ Cannot connect to server at ${baseURL}`);
    console.error(`   Error: ${error instanceof Error ? error.message : error}`);
    throw error;
  }
}

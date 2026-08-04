/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { GetObject, Login } from '../../src/index.js';
import fs from 'fs';
import path from 'path';

function ResetDatabase() {
  const templatePath = path.join(process.cwd(), 'db.template.json');
  const dbPath = path.join(process.cwd(), 'data', 'data.json');
  
  console.log('🔄 Resetting database from template...');
  fs.copyFileSync(templatePath, dbPath);
  console.log('✅ Database reset complete');
}

export async function GlobalSetup(context: any ): Promise<void> {
  console.log('🚀 Starting global setup...');

  try {
    ResetDatabase();

    console.log('🔐 Logging in...');
    Login(context, '/login', {username: 'admin_user', password: 'SecurePass123!'});

  } catch (error) {
    console.warn(`⚠️ Could not create test user: ${error instanceof Error ? error.message : error}`);
  }
}

export function GetTestUserId(): string {
  return GetObject('user');
}

export function GetTestProductId(): string {
  return GetObject('product');
}

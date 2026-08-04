import { CreateObject, GetObject, Login } from '../../src/index.js';
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
    
    console.log('📋 Creating test user...');
    await CreateObject(context, 'user', '/users', {
      username: `test_user_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'TestPass123!',
      role: 'user'
    });

    console.log('📋 Creating test product...');
    await CreateObject(context, 'product', '/products', {
      name: `test_product_${Date.now()}`,
      price: 100,
      category: 'test'
    });

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

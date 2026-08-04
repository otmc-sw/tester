import { CreateObject, GetObject, Login } from '../../src/index.js';

export async function GlobalSetup(context: any ): Promise<void> {
  console.log('🚀 Starting global setup...');

  try {
    console.log('🔐 Logging in...');
    Login(context, '/login', {username: 'admin', password: 'admin'});
    
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

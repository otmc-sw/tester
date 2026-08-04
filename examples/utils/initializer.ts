/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { type APIRequestContext } from '@playwright/test';
import { defineAPIs, createTestCases } from '../../src/index.js';
import { User, CreateUserRequest, Product, CreateProductRequest } from '../types.js';
import config from '../config.js';

export async function InitializeTestData(request: APIRequestContext): Promise<void> {
  console.log('🔧 Initializing test data...');

  const suite = defineAPIs([
    {
      title: "Create User - Create admin user",
      POST: "/users",
      save: "user",
      request: {
        username: "admin_user",
        email: "admin@example.com",
        password: "SecurePass123!",
        role: "admin"
      } as CreateUserRequest,
      response: User,
      status: 201
    },

    {
      title: "Create Product",
      POST: "/products",
      save: "product",
      request: {
        name: "Test Product",
        price: 100
      } as CreateProductRequest,
      response: Product,
      status: 201
    }
  ], config);

  const { testCases } = createTestCases(suite);
  
  for (const tc of testCases) {
    await tc.execute(request);
  }

  console.log('✅ Test data initialization complete');
}

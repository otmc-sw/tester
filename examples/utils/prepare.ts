


import fs from 'fs';
import path from 'path';
import { request } from '@playwright/test';
import config from '../config.js';

export const TEST_USER_ID = '999999';
export const TEST_USER_PATH = path.join(process.cwd(), 'data', 'test-user.json');

export async function CreateUser(): Promise<string> {
  const baseURL = config.baseURL;

  try {
    const context = await request.newContext({ baseURL });
    const response = await context.post('/users', {
      data: {
        username: `test_user_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPass123!',
        role: 'user'
      }
    });

    if (response.status() === 201) {
      const body = await response.json();
      const userId = body.data.id;

      const dataDir = path.dirname(TEST_USER_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      fs.writeFileSync(TEST_USER_PATH, JSON.stringify(body.data, null, 2));
      console.log(`✅ Test user created with ID: ${userId}`);
      await context.dispose();
      return userId;
    }

    console.warn(`⚠️ Could not create test user (status: ${response.status()})`);
    await context.dispose();
    return TEST_USER_ID;
  } catch (error) {
    console.warn(`⚠️ Could not create test user: ${error instanceof Error ? error.message : error}`);
    return TEST_USER_ID;
  }
}

export function GetTestUserId(): string {
  const testUserPath = TEST_USER_PATH;
  try {
    if (fs.existsSync(testUserPath)) {
      const data = JSON.parse(fs.readFileSync(testUserPath, 'utf8'));
      if (data.id) {
        return data.id;
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not read test user ID: ${error instanceof Error ? error.message : error}`);
  }
  return TEST_USER_ID;
}
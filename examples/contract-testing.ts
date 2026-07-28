/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { createTester, api } from '@otmc/tester';

class User {
  id!: string;
  username!: string;
  email!: string;
  createdAt!: string;
  [key: string]: unknown;
}

class CreateUserRequest {
  username!: string;
  email!: string;
  password!: string;
  [key: string]: unknown;
}

class UpdateUserRequest {
  email?: string;
  username?: string;
  [key: string]: unknown;
}

async function main() {
  const tester = createTester({
    baseURL: 'https://dns.c',
  });

  await tester.initialize();

  try {
    const user1 = await api.test({
      method: 'POST',
      url: '/users',
      request: {
        username: 'john',
        email: 'john@example.com',
        password: 'secret123',
      },
      response: User,
    });

    console.log('Created user:', user1.username);

    const user2 = await api.test({
      POST: '/users',
      request: {
        username: 'jane',
        email: 'jane@example.com',
        password: 'secret456',
      },
      response: User,
    });

    console.log('Created user:', user2.username);

    const user3 = await api.test({
      POST: '/users',
      request: {
        username: 'bob',
        email: 'bob@example.com',
        password: 'secret789',
      },
      response: User,
      expect: {
        status: 201,
        responseTime: 1000,
        headers: {
          'cache-control': 'no-store',
        },
      },
    });

    console.log('Created user:', user3.username);

    const users = await api.test({
      GET: '/users',
      response: User,
    });

    console.log('Fetched users:', users.length);

    const updatedUser = await api.test({
      PUT: '/users/1',
      request: {
        email: 'newemail@example.com',
      },
      response: User,
      expect: {
        status: 200,
      },
    });

    console.log('Updated user:', updatedUser.email);

    await api.test({
      DELETE: '/users/1',
      response: class Empty { [key: string]: unknown },
      expect: {
        status: 204,
      },
    });

    console.log('Deleted user');
  } catch (error) {
    if (error instanceof Error && 'name' in error && error.name === 'ApiError') {
      const apiError = error as unknown as { status: number; url: string; validationErrors?: Array<{ path: string; message: string }> };
      console.error('API Error:');
      console.error('Status:', apiError.status);
      console.error('URL:', apiError.url);
      
      if (apiError.validationErrors) {
        console.error('Validation Errors:');
        for (const err of apiError.validationErrors) {
          console.error(`  ${err.path}: ${err.message}`);
        }
      }
    } else {
      console.error('Error:', error);
    }
  } finally {
    await tester.cleanup();
  }
}

main();

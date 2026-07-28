# Hướng dẫn Test API với @otmc/tester

Tài liệu này hướng dẫn cách sử dụng @otmc/tester để test API một cách hiệu quả và type-safe.

## Cài đặt

```bash
npm install @otmc/tester
```

## Khởi tạo Tester

```typescript
import { createTester } from '@otmc/tester';

const tester = createTester({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  auth: {
    type: 'jwt',
    loginUrl: '/auth/login',
  },
});

await tester.initialize();
```

## Các Phương thức HTTP

### GET - Lấy dữ liệu

```typescript
import { api } from '@otmc/tester';

// Lấy danh sách users
const users = await api.GET<User[]>('/users');

// Lấy user theo ID
const user = await api.GET<User>('/users/123');

// Với headers tùy chỉnh
const data = await api.GET<Data>('/data', {
  'X-Custom-Header': 'value',
});
```

### POST - Tạo mới

```typescript
interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const newUser = await api.POST<CreateUserRequest, User>('/users', {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secure123',
});
```

### PUT - Cập nhật toàn bộ

```typescript
interface UpdateUserRequest {
  username: string;
  email: string;
}

const updated = await api.PUT<UpdateUserRequest, User>('/users/123', {
  username: 'john_updated',
  email: 'john.updated@example.com',
});
```

### PATCH - Cập nhật một phần

```typescript
interface PatchUserRequest {
  email?: string;
}

const patched = await api.PATCH<PatchUserRequest, User>('/users/123', {
  email: 'newemail@example.com',
});
```

### DELETE - Xóa

```typescript
await api.DELETE('/users/123');

// Hoặc nhận response
const result = await api.DELETE<{ message: string }>('/users/123');
```

### HEAD và OPTIONS

```typescript
// Kiểm tra headers
await api.HEAD('/users/123');

// Kiểm tra methods được hỗ trợ
await api.OPTIONS('/users');
```

## Resource API

Resource API cung cấp các thao tác CRUD tự động cho REST resources.

```typescript
import { api } from '@otmc/tester';

interface User {
  id: string;
  username: string;
  email: string;
}

// Tạo resource API
const Users = api.resource<User>('/users');

// Liệt kê tất cả
const allUsers = await Users.list();

// Lấy theo ID
const user = await Users.get('123');

// Tạo mới
const created = await Users.create({
  username: 'john',
  email: 'john@example.com',
});

// Cập nhật
const updated = await Users.update('123', {
  email: 'updated@example.com',
});

// Xóa
await Users.delete('123');
```

## Authentication

### Cấu hình Authentication

```typescript
const tester = createTester({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'jwt', // 'jwt' | 'bearer' | 'basic' | 'oauth2' | 'apikey'
    loginUrl: '/auth/login',
  },
});
```

### Login

```typescript
await api.login({
  username: 'admin',
  password: 'password123',
});
```

### Set Token trực tiếp

```typescript
api.setAuthToken('your-jwt-token-here');
```

### Các loại Authentication

#### JWT / Bearer Token

```typescript
auth: {
  type: 'jwt',
  credentials: {
    token: 'your-token',
  },
}
```

#### Basic Auth

```typescript
auth: {
  type: 'basic',
  credentials: {
    username: 'admin',
    password: 'password',
  },
}
```

#### API Key

```typescript
auth: {
  type: 'apikey',
  credentials: {
    apiKey: 'your-api-key',
  },
}
```

#### OAuth2

```typescript
auth: {
  type: 'oauth2',
  tokenUrl: '/oauth/token',
  credentials: {
    clientId: 'client-id',
    clientSecret: 'client-secret',
  },
}
```

## Validation

### Kiểm tra Status Code

```typescript
import { expect } from '@otmc/tester';

const response = await api.POST('/users', body);

await expect(response).status(201);
```

### Kiểm tra Headers

```typescript
await expect(response)
  .header('content-type', 'application/json')
  .header('x-rate-limit', '100');
```

### Kiểm tra Response Time

```typescript
await expect(response).responseTime(1000); // tối đa 1000ms
```

### Kiểm tra Schema (Zod)

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
});

await expect(response).schema(UserSchema);
```

### Các Assertion khác

```typescript
// Kiểm tra bằng
await expect(data).toEqual(expected);

// Kiểm tra chứa
await expect(text).toContain('substring');

// Kiểm tra true/false
await expect(value).toBeTruthy();
await expect(value).falsy();

// Kiểm tra defined/null
await expect(value).toBeDefined();
await expect(value).toBeNull();

// Kiểm tra số
await expect(count).toBeGreaterThan(10);
await expect(count).toBeLessThan(100);

// Kiểm tra độ dài
await expect(array).toHaveLength(5);

// Kiểm tra regex
await expect(text).toMatch(/pattern/);
```

## Xử lý Error

```typescript
import { api } from '@otmc/tester';

try {
  await api.POST('/users', body);
} catch (error) {
  if (error.name === 'ApiError') {
    console.error('Status:', error.status);
    console.error('URL:', error.url);
    console.error('Headers:', error.headers);
    console.error('Request:', error.request);
    console.error('Response:', error.response);
    console.error('Duration:', error.duration);
  }
}
```

## Test API với Config

```typescript
import { apiTest } from '@otmc/tester';

await apiTest({
  name: 'Create User',
  method: 'POST',
  url: '/users',
  body: {
    username: 'john',
    email: 'john@example.com',
  },
  headers: {
    'X-Custom-Header': 'value',
  },
  expect: {
    status: 201,
    responseTime: 1000,
  },
});
```

## Ví dụ Hoàn chỉnh

### Test CRUD API

```typescript
import { createTester, api, test, expect } from '@otmc/tester';

interface User {
  id: string;
  username: string;
  email: string;
}

const tester = createTester({
  baseURL: 'https://api.example.com',
});

await tester.initialize();

// Test: Create User
await test('Create User', async () => {
  const user = await api.POST('/users', {
    username: 'john_doe',
    email: 'john@example.com',
  });
  
  await expect(user).toBeDefined();
  await expect(user.username).toEqual('john_doe');
});

// Test: Get User
await test('Get User', async () => {
  const user = await api.GET<User>('/users/123');
  
  await expect(user).toBeDefined();
  await expect(user.id).toEqual('123');
});

// Test: Update User
await test('Update User', async () => {
  const updated = await api.PUT('/users/123', {
    username: 'john_updated',
  });
  
  await expect(updated.username).toEqual('john_updated');
});

// Test: Delete User
await test('Delete User', async () => {
  await api.DELETE('/users/123');
});

await tester.cleanup();
```

### Test với Authentication

```typescript
const tester = createTester({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'jwt',
    loginUrl: '/auth/login',
  },
});

await tester.initialize();

// Login
await api.login({
  username: 'admin',
  password: 'password',
});

// Gọi API authenticated
const profile = await api.GET('/profile');

await tester.cleanup();
```

### Test với Resource API

```typescript
const Users = api.resource<User>('/users');

await test('User CRUD', async () => {
  // Create
  const created = await Users.create({
    username: 'john',
    email: 'john@example.com',
  });
  
  // Read
  const read = await Users.get(created.id);
  await expect(read.username).toEqual('john');
  
  // Update
  const updated = await Users.update(created.id, {
    email: 'new@example.com',
  });
  await expect(updated.email).toEqual('new@example.com');
  
  // Delete
  await Users.delete(created.id);
});
```

## Best Practices

1. **Sử dụng TypeScript interfaces** cho request và response
2. **Group tests theo resource** để dễ quản lý
3. **Sử dụng Resource API** cho CRUD operations
4. **Xử lý errors properly** với try-catch
5. **Sử dụng validation** để đảm bảo response đúng format
6. **Cleanup tester** sau khi chạy xong tests
7. **Sử dụng environment variables** cho baseURL và credentials

## Tips

- Sử dụng `api.resource<T>()` cho RESTful APIs
- Authentication tự động được apply cho tất cả requests sau khi login
- Logs tự động được collect và có trong report
- Reports được generate tự động trong `test-results/` directory
- Sử dụng generics để có type safety: `api.POST<Request, Response>()`

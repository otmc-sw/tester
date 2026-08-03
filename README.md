# @otmc/tester

`@otmc/tester` is **NOT** a replacement for Playwright.

Playwright remains responsible for:

- HTTP transport
- Browser automation
- Parallel execution
- Retry
- Fixtures
- Reporting
- Trace
- Screenshots

`@otmc/tester` only provides a clean, type-safe DSL for defining API test cases.

The developer should describe **what** to test.

The framework should decide **how** to execute it.

## 📚 Hướng dẫn sử dụng

### 📦 Cài đặt

```bash
npm install @otmc/tester
```

### ⚙️ Cấu hình dự án

Tạo file `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: './examples/setup.ts',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

Tạo file cấu hình tester (`examples/config.ts`):

```typescript
import { defineConfig } from '@otmc/tester';

export default defineConfig({
  baseURL: 'http://localhost:3000',
  response: {
    success: {
      successField: 'success',
      messageField: { name: 'message', required: false },
      dataField: 'data'
    },
    error: {
      successField: 'success',
      messageField: { name: 'message', required: false },
      errorField: 'error'
    }
  }
});
```

### 📝 Định nghĩa Types

Tạo file `examples/types.ts` để định nghĩa các types:

```typescript
export class User {
  id!: string;
  username!: string;
  email!: string;
  role!: 'admin' | 'user' | 'moderator';
  createdAt!: string;
  updatedAt!: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'moderator';
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: 'admin' | 'user' | 'moderator';
}
```

### 🎯 Viết Test Cases

Tạo file test (`examples/api/user.spec.ts`):

```typescript
import { test } from '@playwright/test';
import { defineAPIs, createTestCases } from '@otmc/tester';
import { User, CreateUserRequest, UpdateUserRequest } from '../types.js';
import config from '../config.js';

const suite = defineAPIs([
  {
    title: "List Users - Get all users",
    GET: "/users",
    response: User,
    status: 200
  },

  {
    title: "Create User - Create admin user",
    POST: "/users",
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
    title: "Get User - By ID",
    GET: "/users/1",
    response: User,
    status: 200
  },

  {
    title: "Update User - Partial update - Email only",
    PATCH: "/users/1",
    request: {
      email: "new_email@example.com"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  {
    title: "Delete User - Non-existent user",
    DELETE: "/users/99999",
    status: 404
  }
], config);

test.describe('Users', () => {
  const { testCases } = createTestCases(suite);
  for (const tc of testCases) {
    test(tc.title, async ({ request }) => {
      await tc.execute(request);
    });
  }
});
```

### 🚀 Chạy Tests

```bash
# Chạy tất cả tests
npx playwright test

# Chạy tests với UI mode
npx playwright test --ui

# Chạy tests với report chi tiết
npx playwright test --reporter=html
```

### 🎨 Các loại HTTP Methods

Hỗ trợ đầy đủ các HTTP methods:

**1. GET - Lấy dữ liệu**
```typescript
{
  title: "Get User by ID",
  GET: "/users/1",
  response: User,
  status: 200
}
```

**2. POST - Tạo mới**
```typescript
{
  title: "Create User",
  POST: "/users",
  request: {
    username: "new_user",
    email: "new@example.com",
    password: "password123"
  },
  response: User,
  status: 201
}
```

**3. PUT - Cập nhật toàn bộ**
```typescript
{
  title: "Update User",
  PUT: "/users/1",
  request: {
    username: "updated_user",
    email: "updated@example.com",
    password: "newpassword"
  },
  response: User,
  status: 200
}
```

**4. PATCH - Cập nhật một phần**
```typescript
{
  title: "Update User Email",
  PATCH: "/users/1",
  request: {
    email: "newemail@example.com"
  },
  response: User,
  status: 200
}
```

**5. DELETE - Xóa**
```typescript
{
  title: "Delete User",
  DELETE: "/users/1",
  status: 204
}
```

### 🔧 Các tùy chọn nâng cao

**Query Parameters**
```typescript
{
  title: "List Users with pagination",
  GET: "/users?page=1&limit=10",
  response: User,
  status: 200
}
```

**Custom Headers**
```typescript
{
  title: "Get with Auth",
  GET: "/users/me",
  headers: {
    'Authorization': 'Bearer token123'
  },
  response: User,
  status: 200
}
```

**Error Testing**
```typescript
{
  title: "Invalid credentials",
  POST: "/auth/login",
  request: {
    username: "wrong",
    password: "wrong"
  },
  status: 401  // Chỉ kiểm tra status, không cần response type
}
```

**Multiple Status Codes**
```typescript
// Chấp nhận một status code
{
  title: "List all products",
  GET: "/products",
  response: Product,
  status: 200
}

// Chấp nhận một status code (dạng mảng)
{
  title: "List all products",
  GET: "/products",
  response: Product,
  status: [200]
}

// Chấp nhận nhiều status code
{
  title: "List all products",
  GET: "/products",
  response: Product,
  status: [200, 201]
}
```

**Response với Envelope**
```typescript
{
  title: "Get User with envelope",
  GET: "/users/1",
  response: User,
  status: 200,
  envelope: {
    successField: 'success',
    dataField: 'data'
  }
}
```

### 💡 Ví dụ thực tế

**1. Testing với Pagination**
```typescript
const suite = defineAPIs([
  {
    title: "Page 1",
    GET: "/users?page=1&limit=10",
    response: User,
    status: 200
  },
  {
    title: "Page 2",
    GET: "/users?page=2&limit=10",
    response: User,
    status: 200
  }
]);
```

**2. Testing với Filters**
```typescript
{
  title: "Filter by role",
  GET: "/users?role=admin",
  response: User,
  status: 200
}
```

**3. Testing các trường hợp lỗi**
```typescript
{
  title: "Invalid email format",
  POST: "/users",
  request: {
    username: "bad_user",
    email: "invalid-email",
    password: "Pass123!"
  },
  status: 400
}

{
  title: "Missing required fields",
  POST: "/users",
  request: {
    username: "incomplete_user"
  },
  status: 400
}

{
  title: "Non-existent user",
  GET: "/users/99999",
  status: 404
}
```

### 📊 Validation

@otmc/tester tự động validate:

✅ **HTTP Status** - Status code khớp với expected  
✅ **Content-Type** - Đảm bảo response là JSON  
✅ **JSON Parsing** - Parse JSON thành TypeScript object  
✅ **Success/Error Contract** - Validate cấu trúc envelope  
✅ **Required Fields** - Kiểm tra các trường bắt buộc  
✅ **Field Types** - Validate kiểu dữ liệu  
✅ **Response Mapping** - Unwrap response envelope tự động

### 🏗️ Kiến trúc

```
defineConfig() → Cấu hình toàn cục
       ↓
defineAPIs() → Định nghĩa test cases
       ↓
normalize() → Chuẩn hóa format
       ↓
run() → Chạy tests
       ↓
Executor → Điều phối
       ↓
RequestBuilder → Tạo request
       ↓
Playwright APIRequestContext → Thực thi HTTP
       ↓
ResponseParser → Parse response
       ↓
EnvelopeProcessor → Xử lý envelope
       ↓
ResponseValidator → Validate response
       ↓
ResponseMapper → Map dữ liệu
       ↓
Reporter → Báo cáo kết quả
```

### 🔍 Best Practices

1. **Tách types ra file riêng** - Dễ maintain và reuse
2. **Đặt tên test rõ ràng** - Mô tả đúng mục đích của test
3. **Test happy path trước** - Sau đó đến error cases
4. **Sử dụng constants** cho URLs và test data
5. **Setup test data** trong globalSetup hoặc beforeEach
6. **Cleanup** sau khi test nếu cần

### 📚 Resources

- 📖 [Playwright Documentation](https://playwright.dev)
- 💻 [GitHub Repository](https://github.com/otmc-sw/tester)
- 📝 [API Reference](./docs/)

## 📜 License

* Apache License 2.0
* Copyright (c) 2026 OTMC Softwares.

## ✨ Contributors

* 🌿 Nguyen Van Trung
* 🌿 Nguyen Thi Hoai
* 🌿 OTMC Contributors



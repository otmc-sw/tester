# @otmc/tester Examples

This directory contains comprehensive examples demonstrating real-world usage of `@otmc/tester` for API testing in production environments.

## 📁 Structure

```
examples/
├── types.ts                          # Shared TypeScript interfaces for all test suites
├── config.ts                         # Project configuration with defineConfig
├── api/                              # API test suites
│   ├── api-runtime-example.spec.ts  # Basic example from README
│   ├── user-management.spec.ts      # Complete CRUD operations for User resource
│   ├── authentication.spec.ts       # Authentication & authorization tests
│   └── product-management.spec.ts    # Product management with complex scenarios
└── README.md                         # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install @otmc/tester playwright @playwright/test
npx playwright install
```

### 2. Configure Your API

Edit `config.ts` to set your API base URL:

```typescript
export default defineConfig({
  baseURL: 'https://your-api.example.com',
  response: {
    success: {
      successField: 'success',
      messageField: 'message',
      dataField: 'data'
    },
    error: {
      successField: 'success',
      messageField: 'message',
      errorField: 'error'
    }
  }
});
```

### 3. Run Tests

```bash
# Run all example tests
npx playwright test

# Run specific test suite
npx playwright test api/user-management.spec.ts
npx playwright test api/authentication.spec.ts
npx playwright test api/product-management.spec.ts

# Run in headed mode (with browser UI)
npx playwright test --ui

# Run with debug mode
npx playwright test --debug
```

## 📚 Example Descriptions

### types.ts

Contains shared TypeScript interfaces used across all test suites:

- **User**: User entity with id, username, email, role, timestamps
- **CreateUserRequest**: DTO for creating users
- **UpdateUserRequest**: DTO for updating users (partial)
- **LoginRequest/Response**: Authentication types
- **Product**: Product entity with pricing, stock, category
- **CreateProductRequest/UpdateProductRequest**: Product DTOs
- **Order**: Order entity with items and status
- **SuccessResponse/ErrorResponse**: API envelope types

### config.ts

Project-wide configuration using `defineConfig`:

- Sets base URL for all API calls
- Configures response envelope structure (success/error format)
- Can be extended with timeout, headers, authentication defaults

### api/user-management.spec.ts

Comprehensive CRUD test suite for User management:

**Features:**
- List users with pagination and filtering
- Create users with different roles (admin, user, moderator)
- Validation tests (invalid email, missing fields)
- Get user by ID
- Full update (PUT) and partial update (PATCH)
- Delete operations
- Error handling for non-existent resources

**Test Cases:** 14 test cases covering all CRUD operations and edge cases

### api/authentication.spec.ts

Authentication and authorization test suite:

**Features:**
- Login with valid/invalid credentials
- Token refresh flow
- Logout functionality
- Password reset request and confirmation
- Get current user profile
- Various error scenarios (wrong password, expired tokens, etc.)

**Test Cases:** 13 test cases covering complete auth flow

### api/product-management.spec.ts

Product management with complex business scenarios:

**Features:**
- List products with advanced filtering (category, price range, search, active status)
- Create products with validation (negative price, missing fields, zero stock)
- Full and partial updates
- Product activation/deactivation
- Bulk stock operations
- Product statistics endpoint

**Test Cases:** 20 test cases covering product lifecycle and business logic

## 🎯 Best Practices Demonstrated

### 1. Type Safety

All test suites use TypeScript interfaces for request/response:

```typescript
const suite = defineAPIs([
  {
    title: "Create User",
    POST: "/users",
    request: { username: "admin", email: "admin@test.com" } as CreateUserRequest,
    response: User,
    status: 201
  }
]);
```

### 2. Test Organization

- **Group by resource**: Each file tests one resource (users, auth, products)
- **Descriptive titles**: Clear test names like "Create User - Invalid email format"
- **Logical ordering**: List → Create → Read → Update → Delete

### 3. Edge Case Coverage

Each suite includes:
- Happy path (successful operations)
- Validation errors (invalid data, missing fields)
- Not found scenarios (non-existent resources)
- Business logic validation (negative prices, zero stock)

### 4. Configuration Reuse

Shared `config.ts` ensures consistent settings across all test suites:

```typescript
import config from './config.js';

const suite = defineAPIs(testCases, config);
```

### 5. Type Reuse

Shared `types.ts` prevents duplication and ensures consistency:

```typescript
import { User, CreateUserRequest } from './types.js';
```

## 🔧 Customization for Your Project

### 1. Update Types

Modify `types.ts` to match your API's data structures:

```typescript
export interface YourEntity {
  id: string;
  // your fields
}
```

### 2. Update Configuration

Modify `config.ts` with your API's envelope structure:

```typescript
export default defineConfig({
  baseURL: 'https://your-api.com',
  response: {
    success: {
      successField: 'success',  // or 'ok', 'status', etc.
      messageField: 'message',  // or 'msg', etc.
      dataField: 'data'         // or 'result', 'payload', etc.
    }
  }
});
```

### 3. Create Your Test Suites

Copy existing test files and adapt for your resources:

```typescript
import { test } from '@playwright/test';
import { defineAPIs, run } from '@otmc/tester';
import { YourEntity } from '../types.js';
import config from '../config.js';

const suite = defineAPIs([
  {
    title: "List Your Entities",
    GET: "/your-endpoint",
    response: YourEntity,
    status: 200
  }
], config);

run(suite, test);
```

## 📊 Running in CI/CD

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test examples/
```

### Environment Variables

Use environment variables for different environments:

```typescript
export default defineConfig({
  baseURL: process.env.API_BASE_URL || 'http://localhost:3000'
});
```

```bash
# Development
API_BASE_URL=http://localhost:3000 npx playwright test

# Staging
API_BASE_URL=https://staging-api.example.com npx playwright test

# Production
API_BASE_URL=https://api.example.com npx playwright test
```

## 🐛 Debugging

### View Detailed Output

```bash
npx playwright test --reporter=list
```

### Debug Specific Test

```bash
npx playwright test --debug "Create User - Create admin user"
```

### Run with Trace

```bash
npx playwright test --trace on
```

## 📈 Advanced Usage

### Custom Headers

Add custom headers in individual test cases:

```typescript
{
  title: "Get User with Custom Header",
  GET: "/users/1",
  headers: {
    'X-Custom-Header': 'value'
  },
  response: User,
  status: 200
}
```

### Query Parameters

Include query parameters in the URL:

```typescript
{
  title: "List Users with Filters",
  GET: "/users?role=admin&page=1&limit=10",
  response: User,
  status: 200
}
```

### Expected Status Codes

Test different HTTP status codes:

```typescript
{ status: 200 }  // OK
{ status: 201 }  // Created
{ status: 204 }  // No Content
{ status: 400 }  // Bad Request
{ status: 401 }  // Unauthorized
{ status: 404 }  // Not Found
{ status: 500 }  // Server Error
```

## 🤝 Contributing

When adding new examples:

1. Add types to `types.ts` if needed
2. Create a new `.spec.ts` file following the naming convention
3. Use descriptive test titles
4. Include both happy path and error cases
5. Update this README with your new example

## 📝 License

Apache License 2.0 - See LICENSE file for details

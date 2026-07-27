# @otmc/tester

A modern, type-safe testing library built on top of Playwright that provides a clean developer experience for API and UI testing.

## Features

- **Type-safe**: Full TypeScript support with generics for request/response types
- **Minimal API**: Clean, intuitive interface that hides Playwright complexity
- **Zero Boilerplate**: Convention over configuration - focus on business logic
- **API Testing**: Support for all HTTP methods, authentication, validation
- **UI Testing**: Simplified browser automation with page objects
- **Resource API**: Automatic CRUD operations for REST resources
- **Authentication**: Built-in support for JWT, Bearer, Basic, OAuth2, API Key
- **Validation**: Status codes, schemas, headers, response time
- **Reporting**: Automatic HTML, JSON, and JUnit report generation
- **Logging**: Comprehensive request/response/browser logging

## Installation

```bash
npm install @otmc/tester
```

## Quick Start

```typescript
import { createTester, api, ui, test, expect } from '@otmc/tester';

const tester = createTester({
  baseURL: 'https://api.example.com',
  browser: 'chromium',
  headless: true,
});

await tester.initialize();

// API Testing
const user = await api.POST<CreateUserRequest, User>('/users', {
  username: 'john',
  password: 'secret',
});

// UI Testing
await ui.goto('/login');
await ui.input('#username', 'admin');
await ui.input('#password', '123456');
await ui.click('Login');

await tester.cleanup();
```

## API Testing

### Contract-Based Testing

The framework supports contract-based testing where you define the expected response model and the framework automatically handles validation, deserialization, and error reporting.

```typescript
class User {
  id!: string;
  username!: string;
  email!: string;
}

// Regular syntax
const user = await api.test({
  method: 'POST',
  url: '/users',
  request: {
    username: 'john',
    email: 'john@example.com',
  },
  response: User,
});

// Shorthand syntax
const user = await api.test({
  POST: '/users',
  request: {
    username: 'john',
    email: 'john@example.com',
  },
  response: User,
});

// With custom expectations
const user = await api.test({
  POST: '/users',
  request: body,
  response: User,
  expect: {
    status: 201,
    responseTime: 500,
    headers: {
      'cache-control': 'no-store',
    },
  },
});

console.log(user.username); // Fully typed
```

The framework automatically:
- Validates HTTP status (defaults: 200 for GET/PUT/PATCH, 201 for POST, 204 for DELETE)
- Validates Content-Type header
- Parses JSON response
- Deserializes into the expected model
- Validates required fields and types
- Measures response time
- Logs request/response
- Throws descriptive `ApiError` with validation details on failure

### Response Envelopes

Most REST APIs wrap responses in a success/error envelope. The framework automatically handles unwrapping these envelopes.

**Default Envelope**

By default, the framework expects this structure:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": { ... }
}
```

The framework automatically:
- Validates `success == true`
- Validates `message` exists
- Validates `data` exists
- Unwraps and deserializes `data` into your model

You receive only the business object, not the envelope.

**Custom Envelope**

Configure a custom envelope structure:

```typescript
const tester = createTester({
  baseURL: 'https://api.example.com',
  responseContract: {
    success: {
      successField: 'ok',
      messageField: 'message',
      dataField: 'result',
    },
    error: {
      successField: 'ok',
      messageField: 'message',
      errorField: 'exception',
    },
  },
});
```

**Disable Envelope**

For APIs that return plain JSON:

```typescript
const tester = createTester({
  baseURL: 'https://api.example.com',
  responseContract: false,
});
```

**Error Handling**

Error responses are automatically parsed and thrown as `ApiError` with detailed fields:

```typescript
try {
  await api.test({ POST: '/users', request: body, response: User });
} catch (error) {
  if (error instanceof Error && error.name === 'ApiError') {
    console.error(error.code);      // Error code
    console.error(error.key);       // Error key
    console.error(error.type);      // Error type
    console.error(error.summary);   // Error summary
    console.error(error.detail);    // Error detail
    console.error(error.file);      // Source file
    console.error(error.line);      // Source line
    console.error(error.function); // Source function
    console.error(error.timestamp); // Error timestamp
  }
}
```

### HTTP Methods

```typescript
// GET
const users = await api.GET<User[]>('/users');

// POST
const user = await api.POST<CreateUserRequest, User>('/users', body);

// PUT
const updated = await api.PUT<UpdateUserRequest, User>('/users/1', body);

// PATCH
const patched = await api.PATCH<PatchUserRequest, User>('/users/1', body);

// DELETE
await api.DELETE('/users/1');

// HEAD
await api.HEAD('/users/1');

// OPTIONS
await api.OPTIONS('/users');
```

### Resource API

```typescript
const Users = api.resource<User>('/users');

// Automatically provides CRUD operations
await Users.list();
await Users.get('1');
await Users.create(body);
await Users.update('1', body);
await Users.delete('1');
```

### Authentication

```typescript
// Configure authentication
const tester = createTester({
  baseURL: 'https://api.example.com',
  auth: {
    type: 'jwt',
    loginUrl: '/auth/login',
  },
});

// Login
await api.login({
  username: 'admin',
  password: 'password',
});

// Set token directly
api.setAuthToken('your-jwt-token');
```

### Validation

```typescript
const response = await api.POST('/users', body);

await expect(response)
  .status(201)
  .header('content-type', 'application/json')
  .responseTime(1000);
```

## UI Testing

### Basic Actions

```typescript
// Navigation
await ui.goto('/dashboard');

// Interactions
await ui.click('#submit');
await ui.input('#email', 'test@example.com');
await ui.hover('#menu');
await ui.select('#country', 'US');
await ui.check('#agree');
await ui.uncheck('#subscribe');

// File Upload
await ui.upload('#file', '/path/to/file.pdf');

// Screenshots
await ui.screenshot('/path/to/screenshot.png');
```

### Assertions

```typescript
// Text assertions
await uiExpect.text('#welcome', 'Welcome back');

// Visibility
await uiExpect.visible('#dashboard');
await uiExpect.hidden('#loading');

// Get element text
const text = await ui.text('#title');
```

### Waiting

```typescript
// Wait for selector
await uiWait.for('#results', 5000);

// Wait for text
await uiWait.forText('Success', 5000);

// Wait for URL
await uiWait.forUrl('/dashboard', 5000);
```

### Keyboard & Navigation

```typescript
// Keyboard
await uiKeyboard.press('Enter');
await uiKeyboard.type('#search', 'query', 100);

// Navigation
await uiNavigation.reload();
await uiNavigation.back();
await uiNavigation.forward();
```

## Page Objects

```typescript
import { PageObject } from '@otmc/tester';

class LoginPage extends PageObject {
  async login(username: string, password: string) {
    await this.ui.input('#username', username);
    await this.ui.input('#password', password);
    await this.ui.click('#login');
  }

  async isLoggedIn() {
    return await this.ui.isVisible('#dashboard');
  }
}

// Usage
const login = ui.page(LoginPage);
await login.login('admin', 'password');
```

## Test API

### Function-based Tests

```typescript
await test('Create User', async () => {
  const user = await api.POST('/users', body);
  await expect(user).toBeDefined();
});
```

### Config-based Tests

```typescript
await apiTest({
  name: 'Create User',
  method: 'POST',
  url: '/users',
  body,
  expect: {
    status: 201,
    responseTime: 1000,
  },
});
```

## Configuration

```typescript
const tester = createTester({
  baseURL: 'https://api.example.com',
  browser: 'chromium', // 'chromium' | 'firefox' | 'webkit'
  timeout: 30000,
  retries: 3,
  headless: true,
  viewport: { width: 1280, height: 720 },
  userAgent: 'Custom User Agent',
  locale: 'en-US',
  timezoneId: 'America/New_York',
  auth: {
    type: 'jwt',
    loginUrl: '/auth/login',
  },
});
```

## OpenAPI Client Generation

```typescript
import { generateOpenApiClient } from '@otmc/tester';

await generateOpenApiClient({
  input: './openapi.yaml',
  output: './generated',
  clientName: 'MyApiClient',
});
```

## Lifecycle

```typescript
const tester = createTester(config);

// Initialize browser and API context
await tester.initialize();

// Run tests
await test('My Test', async () => {
  // test code
});

// Cleanup and generate reports
await tester.cleanup();
```

## Reports

Test reports are automatically generated in the `test-results` directory:

- `report.html` - Interactive HTML report
- `report.json` - Machine-readable JSON report
- `junit.xml` - JUnit-compatible XML report

## Error Handling

All errors are wrapped with meaningful context:

```typescript
try {
  await api.POST('/users', body);
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.status);
    console.error(error.url);
    console.error(error.headers);
    console.error(error.request);
    console.error(error.response);
    console.error(error.duration);
  }
}
```

## License

Apache-2.0
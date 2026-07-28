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

## Architecture

```
defineConfig()
        │
defineAPIs()
        │
normalize()
        │
run()
        │
Executor
        │
RequestBuilder
        │
Playwright APIRequestContext
        │
ResponseParser
        │
EnvelopeProcessor
        │
ResponseValidator
        │
ResponseMapper
        │
Reporter
```

Every layer has only one responsibility.

## Features

- **Type-safe**: Full TypeScript support with generics for request/response types
- **Minimal API**: Clean, intuitive interface that hides Playwright complexity
- **Zero Boilerplate**: Convention over configuration - focus on business logic
- **Runtime Execution**: No code generation - direct Playwright integration
- **Layered Architecture**: Replaceable components with clear interfaces
- **Automatic Validation**: HTTP Status, JSON parsing, Success/Error Response Contract, Content-Type, Required fields, Field types, Missing properties, Response mapping
- **Response Mapping**: Automatic unwrapping of response envelopes
- **Error Handling**: Dedicated error classes with detailed diagnostics
- **Extensibility**: All major components are replaceable via interfaces

## Installation

```bash
npm install @otmc/tester
```

## Quick Start

### Define API Test Cases

```typescript
import { test } from '@playwright/test';
import { defineAPIs, run } from '@otmc/tester';

class User {
  id!: string;
  username!: string;
  email!: string;
}

const suite = defineAPIs([
  {
    title: "List Users",
    GET: "/users",
    response: User
  },
  {
    title: "Create User",
    POST: "/users",
    request: {
      username: "admin",
      email: "admin@test.com",
      password: "123456"
    },
    response: User,
    status: 201
  },
  {
    title: "Get User",
    GET: "/users/1",
    response: User
  },
  {
    title: "Delete User",
    DELETE: "/users/1",
    status: 204
  }
]);

run(suite, test);
```

Running:

```bash
npx playwright test
```

will automatically execute every API test case through Playwright.

## Components

### defineConfig()

Stores project-wide configuration.

```typescript
import { defineConfig } from '@otmc/tester';

export default defineConfig({
  baseURL: 'http://localhost:5004',
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

### defineAPIs()

Returns metadata only. Does not execute requests or generate code.

```typescript
const suite = defineAPIs([
  {
    title: "Create User",
    POST: "/users",
    request: { username: "admin" },
    response: User,
    status: 201
  }
]);
```

### normalize()

Converts user DSL into a unified internal format.

```typescript
// User writes:
{ GET: "/users" }

// Normalizes to:
{ method: "GET", url: "/users" }
```

### run()

Registers Playwright tests. No code generation.

```typescript
run(suite, test);
```

### Executor

Orchestrator that coordinates:
- RequestBuilder
- ResponseParser
- EnvelopeProcessor
- Validator
- Mapper
- Reporter

### Error Classes

Dedicated error classes with detailed diagnostics:

- `TesterError` - Base error class
- `ApiError` - API errors with code, key, summary, detail
- `StatusValidationError` - HTTP status validation errors
- `ResponseValidationError` - Response validation errors
- `EnvelopeValidationError` - Response envelope validation errors
- `ContentTypeError` - Content-Type validation errors

## Execution Flow

```
API Definition
        │
        ▼
normalize()
        │
        ▼
run()
        │
        ▼
Executor
        │
        ▼
RequestBuilder
        │
        ▼
Playwright APIRequestContext
        │
        ▼
ResponseParser
        │
        ▼
EnvelopeProcessor
        │
        ▼
ResponseValidator
        │
        ▼
ResponseMapper
        │
        ▼
Reporter
```

## License

Apache-2.0
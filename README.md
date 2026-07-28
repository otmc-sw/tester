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

## Features

- **Type-safe**: Full TypeScript support with generics for request/response types
- **Minimal API**: Clean, intuitive interface that hides Playwright complexity
- **Zero Boilerplate**: Convention over configuration - focus on business logic
- **API Testing**: Support for all HTTP methods, authentication, validation
- **Automatic Validation**: HTTP Status, JSON parsing, Success/Error Response Contract, Content-Type, Required fields, Field types, Missing properties, Response mapping
- **Response Mapping**: Automatic unwrapping of response envelopes
- **Error Handling**: Typed ApiError with detailed error information

## Installation

```bash
npm install @otmc/tester
```

## Quick Start

### Project Configuration

Every project configures the response contract only once.

```typescript
import { defineConfig } from "@otmc/tester";

export default defineConfig({
    baseURL: "http://localhost:5004",
    response: {
        success: {
            successField: "success",
            messageField: "message",
            dataField: "data"
        },
        error: {
            successField: "success",
            messageField: "message",
            errorField: "error"
        }
    }
});
```

The above configuration is also the default.

Therefore most projects only need:

```typescript
export default defineConfig({
    baseURL: "http://localhost:5004"
});
```

### Default Success Response

```json
{
    "success": true,
    "message": "Created successfully.",
    "data": {

    }
}
```

The framework automatically:

- verify success == true
- verify message exists
- verify data exists
- unwrap data
- map data into the expected response model

### Default Error Response

```json
{
    "success": false,
    "message": "Request failed.",
    "error": {

        "code": 400,

        "key": "BAD_REQUEST",

        "type": "Bad Request",

        "summary": "Request Failed",

        "detail": "sql: no rows in result set",

        "file": "base.go",

        "line": 66,

        "function": "GetObjectByID",

        "timestamp": "2026-07-24T11:43:34+07:00"

    }
}
```

The framework automatically parses the error response and throws a typed `ApiError`.

## API Test Case Definition

Developers define API test cases only.

```typescript
import { defineAPIs } from "@otmc/tester";

export default defineAPIs([

    {

        title: "Create User",

        POST: "/users",

        request: {

            username: "admin",

            password: "123456"

        },

        response: User

    },

    {

        title: "Get User",

        GET: "/users/1",

        response: User

    },

    {

        title: "Delete User",

        DELETE: "/users/1"

    }

]);
```

No Playwright code is required.

### Test Case Properties

Required:

- title
- method (or GET, POST, PUT, PATCH, DELETE)
- url

Optional:

- request
- response
- success
- error
- status
- headers
- query
- auth

### Example

```typescript
{

    title: "Create User",

    POST: "/users",

    request: {

        username: "admin",

        password: "123456"

    },

    response: User,

    status: 201

}
```

### Response Mapping

Suppose the server returns:

```json
{
    "success": true,
    "message": "Created",
    "data": {

        "id": "1",

        "username": "admin"

    }
}
```

The framework automatically returns:

```typescript
User
```

instead of:

```typescript
response.data
```

### Automatic Validation

The framework automatically validates:

- HTTP Status
- JSON parsing
- Success Response Contract
- Error Response Contract
- Content-Type
- Required fields
- Field types
- Missing properties
- Response mapping

Developers should not manually write:

```typescript
expect(response.status()).toBe(201);
```

or:

```typescript
const json = await response.json();
```

### Generated Playwright Test

The previous API definition is internally transformed into:

```typescript
test("Create User", async ({ request }) => {

    const response = await request.post(...);

    ...

});
```

Developers never see this code.

Playwright remains the execution engine.

### Error Handling

If an API returns:

```json
{

    "success": false,

    "message": "Request Failed",

    "error": {

        "code": 400,

        "key": "BAD_REQUEST",

        "detail": "sql: no rows in result set"

    }

}
```

The framework automatically throws:

```text
ApiError

Status : 400

Key : BAD_REQUEST

Summary : Request Failed

Detail : sql: no rows in result set
```

Developers do not need to inspect JSON manually.

### Execution Flow

```
API Definition

        │

        ▼

Build HTTP Request

        │

        ▼

Playwright APIRequestContext

        │

        ▼

Receive Response

        │

        ▼

Validate Response Contract

        │

        ▼

Deserialize Response

        │

        ▼

Validate Model

        │

        ▼

Return Typed Object

        │

        ▼

Generate Logs & Report
```

## Complete Example

```typescript
import { defineAPIs } from "@otmc/tester";

class User {

    id!: string;

    username!: string;

    email!: string;

}

export default defineAPIs([

    {

        title: "List Users",

        GET: "/users",

        response: User[]

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
```

Running:

```bash
npx playwright test
```

will automatically execute every API test case.

No HTTP request code.

No response parsing.

No manual validation.

No response unwrapping.

Developers only describe the API contract.

Playwright performs the execution.

`@otmc/tester` performs the mapping, validation, diagnostics, and reporting.

## License

Apache-2.0
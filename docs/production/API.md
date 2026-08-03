# Generate Playwright API Test Definitions

## Goal

Generate **Playwright API test definitions** from the APIs registered in `main.go`.

Only generate **success test cases**.

The output should be placed under:

```
playwright/api/
```

One spec file per resource, for example:

```
playwright/api/user.spec.ts
playwright/api/project.spec.ts
playwright/api/auth.spec.ts
```

---

## Step 1. Read APIs

Read `main.go` and identify every registered HTTP endpoint.

Collect:

* HTTP method
* URL path
* Request body type (if any)
* Response type (if known)
* Success HTTP status code

Examples:

```
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
PATCH  /users/:id
DELETE /users/:id
```

---

## Step 2. Generate Success Cases Only

Generate only successful scenarios.

Do **NOT** generate:

* invalid input
* validation errors
* authentication failures
* authorization failures
* 400
* 401
* 403
* 404
* 409
* 422
* 500
* timeout tests

---

### Install latest version

```bash
cd tests/playwright
npm install @otmc-sw/tester@latest
```

---

config.ts

```ts
import { defineConfig } from '../src/index.js';

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

types.ts

```ts
export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: number;
    key: string;
    type: string;
    summary: string;
    detail: string;
    file: string;
    line: number;
    function: string;
    timestamp: string;
  };
}

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

api/example.spec.ts

```ts
import { test } from '@playwright/test';
import { defineAPIs, createTestCases } from '@otmc-sw/tester';
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

## Step 3. Generate Typical Success Cases

### GET collection

Generate:

```
GET /resources
```

If pagination/filter/query parameters are supported, generate additional success cases such as:

```
GET /resources?page=1&limit=10
GET /resources?status=active
GET /resources?sort=name
```

Only include parameters actually supported by the API.

---

### GET by ID

Generate

```
GET /resources/1
```

Use a valid sample ID.

---

### POST

Generate one or more successful create requests.

Use realistic sample data.

Example:

```
POST /users
```

```
{
  username,
  email,
  password,
  ...
}
```

Status:

```
201
```

or the actual success status defined by the API.

---

### PUT

Generate a complete update request.

---

### PATCH

Generate one or more partial updates.

Examples:

* update name
* update email
* update status

Only include fields that actually exist.

---

### DELETE

Generate only successful deletion.

Example:

```
DELETE /users/1
```

Expected:

```
204
```

or

```
200
```

depending on the API.

---

## Step 4. Use Existing Types

Always import request/response types from

```
../types.js
```

Example:

```ts
import {
    User,
    CreateUserRequest,
    UpdateUserRequest
} from "../types.js";
```

Do not redefine interfaces.

---

## Step 5. Use defineAPIs()

Generate definitions using

```ts
const suite = defineAPIs([
    ...
], config);
```

Each API definition should contain:

```
title
HTTP method
request (if needed)
response (if available)
status
```

Example:

```ts
{
    title: "Create User",
    POST: "/users",
    request: {
        ...
    } as CreateUserRequest,
    response: User,
    status: 201
}
```

---

## Step 6. Generate Test Runner

Always generate

```ts
test.describe('Users', () => {
    const { testCases } = createTestCases(suite);

    for (const tc of testCases) {
        test(tc.title, async ({ request }) => {
            await tc.execute(request);
        });
    }
});
```

---

## Step 7. File Header

Always include

```ts
/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
```

---

## Generation Rules

* Read every API registered in `main.go`.
* Generate one `.spec.ts` file per resource.
* Only generate success cases.
* Use realistic sample values.
* Use the correct request/response types.
* Preserve the same endpoint paths defined in `main.go`.
* Do not invent endpoints.
* Do not invent request fields.
* Do not generate negative test cases.
* Do not generate edge-case tests.
* Do not generate performance tests.
* Do not generate security tests.
* Output complete compilable TypeScript files.

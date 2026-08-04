/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, createTestCases } from '../../src/index.js';
import { User, CreateUserRequest, UpdateUserRequest } from '../types.js';
import config from '../config.js';
import { GetTestUserId } from '../utils/prepare.js';

const userId = GetTestUserId();

const suite = defineAPIs([
  {
    title: "List Users - Get all users",
    GET: "/users",
    response: User,
    status: 200
  },

  {
    title: "List Users - With pagination",
    GET: "/users?page=1&limit=10",
    response: User,
    status: 200
  },

  {
    title: "List Users - Filter by role",
    GET: "/users?role=admin",
    response: User,
    status: 200
  },

  {
    title: "This should be failed",
    GET: "/users/999999",
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
    title: "Create User - Create regular user",
    POST: "/users",
    request: {
      username: "regular_user",
      email: "user@example.com",
      password: "UserPass123!",
      role: "user"
    } as CreateUserRequest,
    response: User,
    status: 201
  },

  {
    title: "Create User - Invalid email format",
    POST: "/users",
    request: {
      username: "bad_user",
      email: "invalid-email",
      password: "Pass123!"
    } as CreateUserRequest,
    status: 400
  },

  {
    title: "Create User - Missing required fields",
    POST: "/users",
    request: {
      username: "incomplete_user"
    } as CreateUserRequest,
    status: 400
  },

  {
    title: "Get User - By ID",
    GET: `/users/${userId}`,
    response: User,
    status: 200
  },

  {
    title: "Get User - Non-existent user",
    GET: "/users/99999",
    status: 404
  },

  {
    title: "Update User - Full update",
    PUT: `/users/${userId}`,
    request: {
      username: "updated_admin",
      email: "updated_admin@example.com",
      password: "UpdatedPass123!",
      role: "admin"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  {
    title: "Update User - Partial update - Email only",
    PATCH: `/users/${userId}`,
    request: {
      email: "new_email@example.com"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  {
    title: "Update User - Partial update - Role only",
    PATCH: `/users/${userId}`,
    request: {
      role: "moderator"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  {
    title: "Delete User - Existing user",
    phase: 'Post',
    DELETE: `/users/${userId}`,
    status: 204
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
/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, createTestCases } from '../../src/index.js';
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
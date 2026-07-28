/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, run } from '../../src/index.js';
import { User, CreateUserRequest, UpdateUserRequest } from '../types.js';
import config from '../config.js';

const suite = defineAPIs([
  // GET - List all users
  {
    title: "List Users - Get all users",
    GET: "/users",
    response: User,
    status: 200
  },

  // GET - List users with pagination
  {
    title: "List Users - With pagination",
    GET: "/users?page=1&limit=10",
    response: User,
    status: 200
  },

  // GET - List users filtered by role
  {
    title: "List Users - Filter by role",
    GET: "/users?role=admin",
    response: User,
    status: 200
  },

  // POST - Create new user
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

  // POST - Create user with invalid data (should fail)
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

  // GET - Get user by ID
  {
    title: "Get User - By ID",
    GET: "/users/1",
    response: User,
    status: 200
  },

  {
    title: "Get User - Non-existent user",
    GET: "/users/99999",
    status: 404
  },

  // PUT - Update user completely
  {
    title: "Update User - Full update",
    PUT: "/users/1",
    request: {
      username: "updated_admin",
      email: "updated_admin@example.com",
      role: "admin"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  // PATCH - Update user partially
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
    title: "Update User - Partial update - Role only",
    PATCH: "/users/1",
    request: {
      role: "moderator"
    } as UpdateUserRequest,
    response: User,
    status: 200
  },

  // DELETE - Delete user
  {
    title: "Delete User - Soft delete",
    DELETE: "/users/2",
    status: 204
  },

  {
    title: "Delete User - Non-existent user",
    DELETE: "/users/99999",
    status: 404
  }
], config);

run(suite, test);

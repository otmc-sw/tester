/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
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

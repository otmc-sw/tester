/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { test } from '@playwright/test';
import { defineAPIs, run } from '@otmc/tester';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types.js';
import config from '../config.js';

const suite = defineAPIs([
  // POST - Login with valid credentials
  {
    title: "Authentication - Login with valid credentials",
    POST: "/auth/login",
    request: {
      username: "admin",
      password: "admin123"
    } as LoginRequest,
    response: LoginResponse,
    status: 200
  },

  // POST - Login with invalid username
  {
    title: "Authentication - Login with invalid username",
    POST: "/auth/login",
    request: {
      username: "nonexistent_user",
      password: "password123"
    } as LoginRequest,
    status: 401
  },

  // POST - Login with invalid password
  {
    title: "Authentication - Login with invalid password",
    POST: "/auth/login",
    request: {
      username: "admin",
      password: "wrong_password"
    } as LoginRequest,
    status: 401
  },

  // POST - Login with missing credentials
  {
    title: "Authentication - Login with missing username",
    POST: "/auth/login",
    request: {
      password: "password123"
    } as LoginRequest,
    status: 400
  },

  {
    title: "Authentication - Login with missing password",
    POST: "/auth/login",
    request: {
      username: "admin"
    } as LoginRequest,
    status: 400
  },

  // POST - Refresh token with valid refresh token
  {
    title: "Authentication - Refresh token with valid token",
    POST: "/auth/refresh",
    request: {
      refreshToken: "valid_refresh_token_here"
    } as RefreshTokenRequest,
    response: RefreshTokenResponse,
    status: 200
  },

  // POST - Refresh token with invalid refresh token
  {
    title: "Authentication - Refresh token with invalid token",
    POST: "/auth/refresh",
    request: {
      refreshToken: "invalid_refresh_token"
    } as RefreshTokenRequest,
    status: 401
  },

  // POST - Refresh token with expired refresh token
  {
    title: "Authentication - Refresh token with expired token",
    POST: "/auth/refresh",
    request: {
      refreshToken: "expired_refresh_token"
    } as RefreshTokenRequest,
    status: 401
  },

  // POST - Logout
  {
    title: "Authentication - Logout successfully",
    POST: "/auth/logout",
    status: 204
  },

  // GET - Get current user profile (authenticated)
  {
    title: "Authentication - Get current user profile",
    GET: "/auth/me",
    status: 200
  },

  // POST - Request password reset
  {
    title: "Authentication - Request password reset",
    POST: "/auth/password-reset/request",
    request: {
      email: "user@example.com"
    },
    status: 200
  },

  // POST - Reset password with valid token
  {
    title: "Authentication - Reset password with valid token",
    POST: "/auth/password-reset/confirm",
    request: {
      token: "valid_reset_token",
      newPassword: "NewSecurePass123!"
    },
    status: 200
  },

  // POST - Reset password with invalid token
  {
    title: "Authentication - Reset password with invalid token",
    POST: "/auth/password-reset/confirm",
    request: {
      token: "invalid_token",
      newPassword: "NewSecurePass123!"
    },
    status: 400
  }
], config);

run(suite, test);

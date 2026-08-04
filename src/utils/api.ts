/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import fs from 'fs';
import path from 'path';
import type { APIRequestContext, APIResponse } from 'playwright';

async function parseResponse(response: APIResponse): Promise<unknown> {
  const contentType = response.headers()['content-type'] || '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      throw new Error('Failed to parse JSON response');
    }
  }

  if (contentType.includes('text/')) {
    return await response.text();
  }

  return await response.body();
}

export async function Login(
  request: APIRequestContext,
  url: string,
  req: { username: string; password: string }
): Promise<string> {
  const startTime = Date.now();

  try {
    const response = await request.fetch(url, {
      method: 'POST',
      data: req,
    });
    const duration = Date.now() - startTime;

    const status = response.status();
    const validStatuses = [200, 201];
    if (!validStatuses.includes(status)) {
      const errorMessage = `Unexpected status: ${status}`;
      console.log(`❌ Login failed: ${errorMessage}`);
      return `Error: ${errorMessage}`;
    }

    let responseBody: unknown;
    if (status !== 204) {
      try {
        responseBody = await parseResponse(response);
      } catch (error) {
        const parseError = error instanceof Error ? error.message : 'Parse error';
        console.log(`❌ Failed to parse login response: ${parseError}`);
        return `Error: ${parseError}`;
      }
    }

    if (responseBody === undefined) {
      return 'Error: Empty or invalid response body';
    }

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, 'login.json');
    fs.writeFileSync(filePath, JSON.stringify(responseBody, null, 2));
    console.log(`✅ Saved login response to: ${filePath}`);

    return 'OK';
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`❌ Login failed: ${errorMessage}`);
    return `Error: ${errorMessage}`;
  }
}

export function GetObject(name: string): object {
  try {
    const filePath = path.join(process.cwd(), 'data', `${name}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.warn(`⚠️ Could not read ${name}: ${error instanceof Error ? error.message : error}`);
  }
  return {};
}

export function GetObjectProperty(objectType: string, propertyName: string): any {
  try {
    const filePath = path.join(process.cwd(), 'data', `${objectType}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const createdData = typeof data === 'object' && data !== null && !Array.isArray(data)
        ? (data as Record<string, unknown>).data || data
        : data;
      
      if (typeof createdData === 'object' && createdData !== null && propertyName in createdData) {
        return (createdData as Record<string, unknown>)[propertyName];
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not read ${objectType}.${propertyName}: ${error instanceof Error ? error.message : error}`);
  }
  return undefined;
}

export function GetId(objectType: string): string {
  try {
    const filePath = path.join(process.cwd(), 'data', `${objectType}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const idKeywords = ['id', 'ID', 'Id', '_id', 'ID', 'identifier', 'objectId', 'recordId'];
      const createdData = typeof data === 'object' && data !== null && !Array.isArray(data)
        ? (data as Record<string, unknown>).data || data
        : data;
      
      if (typeof createdData === 'object' && createdData !== null) {
        for (const keyword of idKeywords) {
          if (keyword in createdData && (createdData as Record<string, unknown>)[keyword]) {
            return (createdData as Record<string, unknown>)[keyword]!.toString();
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not read ${objectType} ID: ${error instanceof Error ? error.message : error}`);
  }
  return 'UnknownID';
}

export function GetAccessToken(): string {
  try {
    const filePath = path.join(process.cwd(), 'data', 'login.json');
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const nestedData = typeof data === 'object' && data !== null && !Array.isArray(data)
        ? (data as Record<string, unknown>).data
        : undefined;
      
      const searchTarget = typeof nestedData === 'object' && nestedData !== null && !Array.isArray(nestedData)
        ? nestedData as Record<string, unknown>
        : (typeof data === 'object' && data !== null && !Array.isArray(data)
          ? data as Record<string, unknown>
          : null);
      
      if (searchTarget) {
        const tokenKeywords = [
          'token', 'Token', 'TOKEN',
          'access_token', 'accessToken', 'AccessToken', 'ACCESS_TOKEN',
          'accesstoken', 'access-token',
          'jwt', 'JWT',
          'bearer', 'Bearer',
          'auth_token', 'authToken', 'auth',
          'session_token', 'sessionToken', 'session',
          'api_key', 'apiKey', 'apikey'
        ];
        
        for (const keyword of tokenKeywords) {
          if (keyword in searchTarget && searchTarget[keyword]) {
            const value = searchTarget[keyword];
            if (typeof value === 'string') {
              return value;
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Could not read access token: ${error instanceof Error ? error.message : error}`);
  }
  return '';
}

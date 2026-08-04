/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import fs from 'fs';
import path from 'path';
import type { APIRequestContext } from 'playwright';
import type { NormalizedTestCase } from '../types/api.js';
import { Executor } from '../core/executor.js';
import { Reporter } from '../core/reporter.js';

export interface CreateObjectOptions {
  data: Record<string, unknown>;
}

export interface CreateObjectResult {
  success: boolean;
  id?: string;
  error?: string;
}

export async function CreateObject(
  request: APIRequestContext,
  objectType: string,
  url: string,
  reqData: Record<string, unknown>,
): Promise<CreateObjectResult> {
  const reporter = new Reporter();
  const executor = new Executor(reporter);

  const testCase: NormalizedTestCase = {
    title: `Create ${objectType}`,
    method: 'POST',
    url,
    request: reqData,
    status: [200, 201]
  };

  try {
    const responseBody = await executor.execute<unknown>(request, testCase);

    if (responseBody === undefined) {
      return {
        success: false,
        error: 'Empty or invalid response body'
      };
    }

    const createdData = typeof responseBody === 'object' && responseBody !== null && !Array.isArray(responseBody)
      ? (responseBody as Record<string, unknown>).data || responseBody
      : responseBody;

    const objectId = typeof createdData === 'object' && createdData !== null && 'id' in createdData
      ? (createdData as Record<string, unknown>).id?.toString()
      : undefined;

    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const filePath = path.join(dataDir, `${objectType}.json`);
    fs.writeFileSync(filePath, JSON.stringify(createdData, null, 2));
    console.log(`[Tester] ✅ Saved '${objectType}' to: ${filePath}`);

    return {
      success: true,
      id: objectId
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.log(`[Tester] ❌ Failed to create ${objectType}: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage
    };
  }
}

export function GetObject(objectType: string): string {
  try {
    const filePath = path.join(process.cwd(), 'data', `${objectType}.json`);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (data.id) {
        return data.id;
      }
    }
  } catch (error) {
    console.warn(`[Tester] ⚠️ Could not read ${objectType} ID: ${error instanceof Error ? error.message : error}`);
  }
  return '999999';
}

/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import fs from 'fs';
import path from 'path';
import type { APIRequestContext } from 'playwright';

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
  try {
    const response = await request.post(url, {
      data: reqData
    });

    if (response.status() === 201 || response.status() === 200) {
      const body = await response.json();
      const createdData = body.data || body;
      const objectId = createdData.id?.toString();

      // Save to data/<object>.json
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const filePath = path.join(dataDir, `${objectType}.json`);
      fs.writeFileSync(filePath, JSON.stringify(createdData, null, 2));

      return {
        success: true,
        id: objectId
      };
    }

    return {
      success: false,
      error: `Failed with status ${response.status()}`
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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
    console.warn(`⚠️ Could not read ${objectType} ID: ${error instanceof Error ? error.message : error}`);
  }
  return '999999';
}

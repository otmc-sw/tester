/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { writeFileSync } from 'fs';
import { join } from 'path';
import type { OpenAPIV3 } from 'openapi-types';

export interface GeneratorConfig {
  input: string;
  output: string;
  clientName?: string;
}

export class OpenApiGenerator {
  private config: GeneratorConfig;

  constructor(config: GeneratorConfig) {
    this.config = config;
  }

  async generate(): Promise<void> {
    
    const clientCode = this.generateClientCode();
    const outputPath = join(process.cwd(), this.config.output, 'api-client.ts');
    writeFileSync(outputPath, clientCode);
  }

  private generateClientCode(): string {
    const clientName = this.config.clientName || 'ApiClient';
    
    return `
import { api } from '@otmc/tester';

export class ${clientName} {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  
}`;
  }
}

export async function generateOpenApiClient(config: GeneratorConfig): Promise<void> {
  const generator = new OpenApiGenerator(config);
  await generator.generate();
}

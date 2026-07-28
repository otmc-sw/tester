/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { Logger } from './logger.js';
import type { TestResult } from './types.js';

export class Reporter {
  private results: TestResult[] = [];
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  addResult(result: TestResult): void {
    this.results.push(result);
  }

  async generate(): Promise<void> {
    const outputDir = join(process.cwd(), 'test-results');
    mkdirSync(outputDir, { recursive: true });

    this.generateJson(outputDir);
    this.generateHtml(outputDir);
    this.generateJUnit(outputDir);
  }

  private generateJson(outputDir: string): void {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.results,
      logs: this.logger.getLogs(),
    };
    writeFileSync(
      join(outputDir, 'report.json'),
      JSON.stringify(report, null, 2)
    );
  }

  private generateHtml(outputDir: string): void {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .summary { display: flex; gap: 20px; margin-bottom: 20px; }
    .summary-item { padding: 10px 20px; border-radius: 5px; color: white; }
    .passed { background: #4caf50; }
    .failed { background: #f44336; }
    .skipped { background: #ff9800; }
    .test { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    .test.passed { border-left: 4px solid #4caf50; }
    .test.failed { border-left: 4px solid #f44336; }
    .error { color: #f44336; margin-top: 10px; }
  </style>
</head>
<body>
  <h1>Test Report</h1>
  <div class="summary">
    <div class="summary-item passed">Passed: ${passed}</div>
    <div class="summary-item failed">Failed: ${failed}</div>
    <div class="summary-item skipped">Skipped: ${skipped}</div>
  </div>
  ${this.results.map(result => `
    <div class="test ${result.status}">
      <h3>${result.name}</h3>
      <p>Status: ${result.status}</p>
      <p>Duration: ${result.duration}ms</p>
      ${result.error ? `<div class="error">${result.error.message}</div>` : ''}
    </div>
  `).join('')}
</body>
</html>`;
    writeFileSync(join(outputDir, 'report.html'), html);
  }

  private generateJUnit(outputDir: string): void {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites>
  <testsuite name="@otmc/tester" tests="${this.results.length}" failures="${this.results.filter(r => r.status === 'failed').length}">
    ${this.results.map(result => `
    <testcase name="${result.name}" time="${result.duration / 1000}">
      ${result.error ? `<failure message="${result.error.message}">${result.error.stack}</failure>` : ''}
    </testcase>`).join('')}
  </testsuite>
</testsuites>`;
    writeFileSync(join(outputDir, 'junit.xml'), xml);
  }
}

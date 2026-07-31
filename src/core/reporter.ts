/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import * as fs from 'fs';
import * as path from 'path';
import type { IReporter } from '../types/api.js';

export interface LogEntry {
  type: 'request' | 'response' | 'error';
  testTitle: string;
  data: unknown;
  timestamp: number;
}

export interface TestResultEntry {
  title: string;
  status: 'passed' | 'failed';
  duration: number;
  error?: Error;
}

export class Reporter implements IReporter {
  private logs: LogEntry[] = [];
  private testResults: TestResultEntry[] = [];
  private currentTestTitle: string | null = null;
  private logsDir: string;

  constructor(logsDir?: string) {
    this.logsDir = logsDir || 'data/logs';
  }

  setCurrentTest(title: string): void {
    this.currentTestTitle = title;
  }

  clearCurrentTest(): void {
    this.currentTestTitle = null;
  }

  logRequest(data: {
    method: string;
    url: string;
    headers: Record<string, string>;
    body?: unknown;
    timestamp: number;
  }): void {
    if (!this.currentTestTitle) return;
    this.logs.push({
      type: 'request',
      testTitle: this.currentTestTitle,
      data,
      timestamp: data.timestamp,
    });
  }

  logResponse(data: {
    status: number;
    headers: Record<string, string>;
    body?: unknown;
    duration: number;
    timestamp: number;
  }): void {
    if (!this.currentTestTitle) return;
    this.logs.push({
      type: 'response',
      testTitle: this.currentTestTitle,
      data,
      timestamp: data.timestamp,
    });
  }

  logError(error: Error, diagnostics?: Record<string, unknown>): void {
    if (!this.currentTestTitle) return;
    this.logs.push({
      type: 'error',
      testTitle: this.currentTestTitle,
      data: {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        diagnostics,
      },
      timestamp: Date.now(),
    });
  }

  onTestComplete(result: {
    title: string;
    status: 'passed' | 'failed';
    duration: number;
    error?: Error;
  }): void {
    const entry: TestResultEntry = {
      title: result.title,
      status: result.status,
      duration: result.duration,
      error: result.error,
    };
    this.testResults.push(entry);
    this.writeLogFile(entry);
  }

  onSuiteComplete(): void {
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getTestResults(): TestResultEntry[] {
    return this.testResults;
  }

  addResult(result: { name: string; status: 'passed' | 'failed' | 'skipped'; duration: number; error?: Error }): void {
    this.testResults.push({
      title: result.name,
      status: result.status === 'skipped' ? 'failed' : result.status,
      duration: result.duration,
      error: result.error,
    });
  }

  generate(): void {
    const logsDir = path.resolve(this.logsDir);
    fs.mkdirSync(logsDir, { recursive: true });

    for (const result of this.testResults) {
      const testLogs = this.logs.filter(l => l.testTitle === result.title);
      const markdown = this.buildMarkdown(result, testLogs);
      const fileName = this.sanitizeFileName(result.title) + '.md';
      const filePath = path.join(logsDir, fileName);
      fs.writeFileSync(filePath, markdown, 'utf-8');
    }
  }

  private writeLogFile(result: TestResultEntry): void {
    const logsDir = path.resolve(this.logsDir);
    fs.mkdirSync(logsDir, { recursive: true });
    const testLogs = this.logs.filter(l => l.testTitle === result.title);
    const markdown = this.buildMarkdown(result, testLogs);
    const fileName = this.sanitizeFileName(result.title) + '.md';
    const filePath = path.join(logsDir, fileName);
    fs.writeFileSync(filePath, markdown, 'utf-8');
  }

  private buildMarkdown(result: TestResultEntry, logs: LogEntry[]): string {
    const requestLog = logs.find(l => l.type === 'request');
    const responseLog = logs.find(l => l.type === 'response');
    const errorLog = logs.find(l => l.type === 'error');

    let md = `# 📋 ${result.title}\n\n`;

    if (requestLog) {
      const reqData = requestLog.data as { method: string; url: string };
      md += `## 🔗 URL\n\`${reqData.method} ${reqData.url}\`\n\n`;
    }

    md += `## 📤 Request\n\n`;
    if (requestLog) {
      const reqData = requestLog.data as {
        method: string;
        url: string;
        headers: Record<string, string>;
        body?: unknown;
      };
      md += `**🔧 Method:** \`${reqData.method}\`\n\n`;
      if (reqData.headers && Object.keys(reqData.headers).length > 0) {
        md += `**📑 Headers:**\n\`\`\`json\n${JSON.stringify(reqData.headers, null, 2)}\n\`\`\`\n\n`;
      }
      if (reqData.body !== undefined) {
        md += `**📦 Body:**\n\`\`\`json\n${JSON.stringify(reqData.body, null, 2)}\n\`\`\`\n\n`;
      } else {
        md += `**📦 Body:** _(none)_\n\n`;
      }
    } else {
      md += `_⚠️ No request data recorded._\n\n`;
    }

    md += `## 📥 Response\n\n`;
    if (responseLog) {
      const resData = responseLog.data as {
        status: number;
        headers: Record<string, string>;
        body?: unknown;
        duration: number;
      };
      md += `**🔢 Status:** \`${resData.status}\`\n\n`;
      if (resData.headers && Object.keys(resData.headers).length > 0) {
        md += `**📑 Headers:**\n\`\`\`json\n${JSON.stringify(resData.headers, null, 2)}\n\`\`\`\n\n`;
      }
      if (resData.body !== undefined) {
        md += `**📦 Body:**\n\`\`\`json\n${JSON.stringify(resData.body, null, 2)}\n\`\`\`\n\n`;
      } else {
        md += `**📦 Body:** _(none)_\n\n`;
      }
      md += `**⏱️ Duration:** ${resData.duration}ms\n\n`;
    } else {
      md += `_⚠️ No response data recorded._\n\n`;
    }

    md += `## ✅ Validation Result\n\n`;
    if (result.status === 'passed') {
      md += `**Status:** ✅ Passed\n`;
    } else {
      md += `**Status:** ❌ Failed\n`;
      if (result.error) {
        md += `\n**🚨 Error:** ${result.error.message}\n\n`;
        const err = result.error as any;
        if (err.diagnostics) {
          md += `**🔍 Diagnostics:**\n\`\`\`json\n${JSON.stringify(err.diagnostics, null, 2)}\n\`\`\`\n\n`;
        }
        if (err.detail) {
          md += `**📝 Detail:** ${err.detail}\n\n`;
        }
        if (err.summary) {
          md += `**📊 Summary:** ${err.summary}\n\n`;
        }
        if (err.expected !== undefined || err.actual !== undefined) {
          md += `| 🏷️ Field | ✅ Expected | ❌ Actual |\n`;
          md += `|-------|----------|--------|\n`;
          md += `| - | \`${JSON.stringify(err.expected)}\` | \`${JSON.stringify(err.actual)}\` |\n\n`;
        }
        if (err.stack) {
          md += `**🧩 Stack Trace:**\n\`\`\`\n${err.stack}\n\`\`\`\n`;
        }
      }
      if (errorLog) {
        const errData = errorLog.data as { error: { message: string; name: string }; diagnostics?: Record<string, unknown> };
        if (!result.error) {
          md += `**🚨 Error:** ${errData.error.message}\n\n`;
        }
        if (errData.diagnostics) {
          md += `**🔍 Diagnostics:**\n\`\`\`json\n${JSON.stringify(errData.diagnostics, null, 2)}\n\`\`\`\n\n`;
        }
      }
    }

    return md;
  }

  private sanitizeFileName(title: string): string {
    return title.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim();
  }
}
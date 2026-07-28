/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import type { BrowserContext, Page } from 'playwright';
import type { TesterConfig, UiError } from '../core/types.js';
import type { Logger } from '../core/logger.js';

export class UiClient {
  private config: TesterConfig;
  private logger: Logger;
  private context?: BrowserContext;
  private currentPage?: Page;

  constructor(config: TesterConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  setContext(context: BrowserContext): void {
    this.context = context;
  }

  private async getPage(): Promise<Page> {
    if (!this.context) {
      throw new Error('Browser context not initialized');
    }
    if (!this.currentPage) {
      this.currentPage = await this.context.newPage();
      this.setupPageLogging();
    }
    return this.currentPage;
  }

  private setupPageLogging(): void {
    if (!this.currentPage) return;

    this.currentPage.on('console', (msg: any) => {
      this.logger.logConsole({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
      });
    });

    this.currentPage.on('pageerror', (error: any) => {
      this.logger.logError({
        message: error.message,
        stack: error.stack,
      });
    });
  }

  async goto(path: string): Promise<void> {
    const page = await this.getPage();
    const url = this.config.baseURL + path;
    await page.goto(url);
    this.logger.logBrowser({ action: 'goto', url });
  }

  async click(selector: string): Promise<void> {
    const page = await this.getPage();
    await page.click(selector);
    this.logger.logBrowser({ action: 'click', selector });
  }

  async input(selector: string, value: string): Promise<void> {
    const page = await this.getPage();
    await page.fill(selector, value);
    this.logger.logBrowser({ action: 'input', selector, value });
  }

  async hover(selector: string): Promise<void> {
    const page = await this.getPage();
    await page.hover(selector);
    this.logger.logBrowser({ action: 'hover', selector });
  }

  async select(selector: string, value: string): Promise<void> {
    const page = await this.getPage();
    await page.selectOption(selector, value);
    this.logger.logBrowser({ action: 'select', selector, value });
  }

  async check(selector: string): Promise<void> {
    const page = await this.getPage();
    await page.check(selector);
    this.logger.logBrowser({ action: 'check', selector });
  }

  async uncheck(selector: string): Promise<void> {
    const page = await this.getPage();
    await page.uncheck(selector);
    this.logger.logBrowser({ action: 'uncheck', selector });
  }

  async upload(selector: string, filePath: string): Promise<void> {
    const page = await this.getPage();
    await page.setInputFiles(selector, filePath);
    this.logger.logBrowser({ action: 'upload', selector, filePath });
  }

  async screenshot(path?: string): Promise<Uint8Array> {
    const page = await this.getPage();
    const screenshot = await page.screenshot({ path });
    this.logger.logBrowser({ action: 'screenshot', path });
    return screenshot;
  }

  async text(selector: string): Promise<string> {
    const page = await this.getPage();
    return await page.textContent(selector) || '';
  }

  async isVisible(selector: string): Promise<boolean> {
    const page = await this.getPage();
    return await page.isVisible(selector);
  }

  async isHidden(selector: string): Promise<boolean> {
    const page = await this.getPage();
    return await page.isHidden(selector);
  }

  async isEnabled(selector: string): Promise<boolean> {
    const page = await this.getPage();
    return await page.isEnabled(selector);
  }

  async isDisabled(selector: string): Promise<boolean> {
    const page = await this.getPage();
    return await page.isDisabled(selector);
  }

  async waitFor(selector: string, timeout?: number): Promise<void> {
    const page = await this.getPage();
    await page.waitForSelector(selector, { timeout: timeout || this.config.timeout });
  }

  async waitForText(text: string, timeout?: number): Promise<void> {
    const page = await this.getPage();
    await page.waitForFunction(`document.body.textContent.includes('${text}')`, { timeout: timeout || this.config.timeout });
  }

  async waitForUrl(url: string, timeout?: number): Promise<void> {
    const page = await this.getPage();
    await page.waitForURL(url, { timeout: timeout || this.config.timeout });
  }

  async press(key: string): Promise<void> {
    const page = await this.getPage();
    await page.keyboard.press(key);
    this.logger.logBrowser({ action: 'press', key });
  }

  async type(selector: string, text: string, delay?: number): Promise<void> {
    const page = await this.getPage();
    await page.type(selector, text, { delay });
    this.logger.logBrowser({ action: 'type', selector, text, delay });
  }

  async reload(): Promise<void> {
    const page = await this.getPage();
    await page.reload();
    this.logger.logBrowser({ action: 'reload' });
  }

  async back(): Promise<void> {
    const page = await this.getPage();
    await page.goBack();
    this.logger.logBrowser({ action: 'back' });
  }

  async forward(): Promise<void> {
    const page = await this.getPage();
    await page.goForward();
    this.logger.logBrowser({ action: 'forward' });
  }

  async close(): Promise<void> {
    if (this.currentPage) {
      await this.currentPage.close();
      this.currentPage = undefined;
    }
  }

  createPage<T extends PageObject>(PageClass: new (ui: UiClient) => T): T {
    return new PageClass(this);
  }
}

export abstract class PageObject {
  protected ui: UiClient;

  constructor(ui: UiClient) {
    this.ui = ui;
  }
}

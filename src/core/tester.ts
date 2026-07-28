/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { chromium, type Browser, type BrowserContext, type APIRequestContext } from 'playwright';
import type { TesterConfig } from './types.js';
import { ApiClient } from '../api/client.js';
import { UiClient } from '../ui/client.js';
import { TestRunner } from '../test/runner.js';
import { Logger } from './logger.js';
import { Reporter } from './reporter.js';
import { setClient as setApiClient } from '../api/api.js';
import { setClient as setUiClient } from '../ui/ui.js';
import { setRunner } from '../test/test.js';
import { setLogger as setExpectLogger } from '../validation/expect.js';

export class Tester {
  private config: TesterConfig;
  private browser?: Browser;
  private context?: BrowserContext;
  private apiRequestContext?: APIRequestContext;
  private api: ApiClient;
  private ui: UiClient;
  private logger: Logger;
  private reporter: Reporter;
  private testRunner: TestRunner;

  constructor(config: TesterConfig) {
    this.config = config;
    this.logger = new Logger();
    this.reporter = new Reporter(this.logger);
    this.api = new ApiClient(config, this.logger);
    this.ui = new UiClient(config, this.logger);
    this.testRunner = new TestRunner(this.reporter);
  }

  async initialize(): Promise<void> {
    if (this.config.browser) {
      this.browser = await chromium.launch({
        headless: this.config.headless ?? true,
      });
      
      this.context = await this.browser.newContext({
        viewport: this.config.viewport,
        userAgent: this.config.userAgent,
        locale: this.config.locale,
        timezoneId: this.config.timezoneId,
      });

      this.ui.setContext(this.context);
    }

    this.apiRequestContext = await this.api.initialize();
    
    setApiClient(this.api);
    setUiClient(this.ui);
    setRunner(this.testRunner);
    setExpectLogger(this.logger);
    this.testRunner.setApiClient(this.api);
  }

  async cleanup(): Promise<void> {
    await this.api.cleanup();
    if (this.context) {
      await this.context.close();
    }
    if (this.browser) {
      await this.browser.close();
    }
    await this.reporter.generate();
  }

  getApi(): ApiClient {
    return this.api;
  }

  getUi(): UiClient {
    return this.ui;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getReporter(): Reporter {
    return this.reporter;
  }

  getTestRunner(): TestRunner {
    return this.testRunner;
  }
}

export function createTester(config: TesterConfig): Tester {
  return new Tester(config);
}

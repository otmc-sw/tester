import { UiClient, PageObject } from './client.js';

let currentClient: UiClient | null = null;

export function setClient(client: UiClient): void {
  currentClient = client;
}

export const ui = {
  goto: (path: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.goto(path);
  },
  click: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.click(selector);
  },
  input: (selector: string, value: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.input(selector, value);
  },
  hover: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.hover(selector);
  },
  select: (selector: string, value: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.select(selector, value);
  },
  check: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.check(selector);
  },
  uncheck: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.uncheck(selector);
  },
  upload: (selector: string, filePath: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.upload(selector, filePath);
  },
  screenshot: (path?: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.screenshot(path);
  },
  text: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.text(selector);
  },
  isVisible: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.isVisible(selector);
  },
  isHidden: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.isHidden(selector);
  },
  isEnabled: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.isEnabled(selector);
  },
  page: <T extends PageObject>(PageClass: new (ui: UiClient) => T) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.createPage(PageClass);
  },
};

export const uiWait = {
  for: (selector: string, timeout?: number) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.waitFor(selector, timeout);
  },
  forText: (text: string, timeout?: number) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.waitForText(text, timeout);
  },
  forUrl: (url: string, timeout?: number) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.waitForUrl(url, timeout);
  },
};

export const uiKeyboard = {
  press: (key: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.press(key);
  },
  type: (selector: string, text: string, delay?: number) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.type(selector, text, delay);
  },
};

export const uiNavigation = {
  reload: () => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.reload();
  },
  back: () => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.back();
  },
  forward: () => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.forward();
  },
};

export const uiExpect = {
  text: (selector: string, expectedText: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.text(selector).then(actual => {
      if (actual !== expectedText) {
        throw new Error(`Expected text "${expectedText}", got "${actual}"`);
      }
    });
  },
  visible: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.isVisible(selector).then(isVisible => {
      if (!isVisible) {
        throw new Error(`Expected element "${selector}" to be visible`);
      }
    });
  },
  hidden: (selector: string) => {
    if (!currentClient) throw new Error('UI client not initialized');
    return currentClient.isHidden(selector).then(isHidden => {
      if (!isHidden) {
        throw new Error(`Expected element "${selector}" to be hidden`);
      }
    });
  },
};

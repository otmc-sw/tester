import type { TesterConfig, AuthConfig } from '../core/types.js';
import type { Logger } from '../core/logger.js';

export class AuthenticationManager {
  private config: TesterConfig;
  private logger: Logger;
  private token?: string;
  private authConfig?: AuthConfig;

  constructor(config: TesterConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.authConfig = config.auth;
  }

  async login(credentials: { username: string; password: string }): Promise<void> {
    if (!this.authConfig?.loginUrl) {
      throw new Error('Login URL not configured');
    }

    const response = await fetch(this.config.baseURL + this.authConfig.loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }

    const data = await response.json() as { token?: string; access_token?: string; accessToken?: string };
    
    if (this.authConfig.type === 'jwt' || this.authConfig.type === 'bearer') {
      this.token = data.token || data.access_token || data.accessToken;
    }
  }

  setToken(token: string): void {
    this.token = token;
  }

  getHeaders(): Record<string, string> {
    if (!this.authConfig || !this.token) {
      return {};
    }

    switch (this.authConfig.type) {
      case 'jwt':
      case 'bearer':
        return { Authorization: `Bearer ${this.token}` };
      case 'basic':
        const { username, password } = this.authConfig.credentials || {};
        if (username && password) {
          const encoded = Buffer.from(`${username}:${password}`).toString('base64');
          return { Authorization: `Basic ${encoded}` };
        }
        return {};
      case 'apikey':
        return { 'X-API-Key': this.authConfig.credentials?.apiKey || this.token };
      case 'oauth2':
        return { Authorization: `Bearer ${this.token}` };
      default:
        return {};
    }
  }
}

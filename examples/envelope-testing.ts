import { createTester, api } from '@otmc/tester';

// Define response model based on the actual API response
class Route {
  id!: number;
  domain!: string;
  target!: string;
  dns_id!: number;
  enabled!: boolean;
  status!: string;
  created_at!: string;
  updated_at!: string;
  [key: string]: unknown;
}

async function main() {
  console.log('Starting test...');

  const tester1 = createTester({
    baseURL: 'https://dns.c',
    responseContract: false,
  });

  console.log('Tester created, initializing...');
  await tester1.initialize();
  console.log('Tester initialized');

  try {
    console.log('Calling api.GET()...');
    const routes = await api.GET('/api/routes');

    console.log('Routes count:', (routes as any).length);
    console.log('First route:', (routes as any)[0]?.domain, '->', (routes as any)[0]?.target);
    console.log('All routes:');
    for (const route of (routes as any)) {
      console.log(`  ${route.domain} -> ${route.target} (${route.status})`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await tester1.cleanup();
  }
}

main();

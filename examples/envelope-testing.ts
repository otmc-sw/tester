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
  // Example 1: Default envelope (success/data structure)
  const tester1 = createTester({
    baseURL: 'http://dns.c', // Use HTTP instead of HTTPS to avoid SSL issues
    // Default envelope is used automatically
    // Response structure:
    // {
    //   "success": true,
    //   "data": [ ... ]
    // }
  });

  await tester1.initialize();

  try {
    const routes = await api.test({
      GET: '/api/routes',
      response: Route as any, // API returns array, framework handles it
    });

    // routes is automatically unwrapped from response.data
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

  // Example 2: Custom envelope configuration (if API uses different field names)
  const tester2 = createTester({
    baseURL: 'http://dns.c',
    responseContract: {
      success: {
        successField: 'success',
        messageField: 'message',
        dataField: 'data',
      },
      error: {
        successField: 'success',
        messageField: 'message',
        errorField: 'error',
      },
    },
  });

  await tester2.initialize();

  try {
    const routes = await api.test({
      GET: '/api/routes',
      response: Route as any,
    });

    // routes is unwrapped from response.data
    console.log('Routes count:', (routes as any).length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await tester2.cleanup();
  }

  // Example 3: Disable envelope (if API returns plain JSON array)
  const tester3 = createTester({
    baseURL: 'http://dns.c',
    responseContract: false,
  });

  await tester3.initialize();

  try {
    const routes = await api.test({
      GET: '/api/routes',
      response: Route as any,
    });

    // routes is the direct response, no unwrapping
    console.log('Routes count:', (routes as any).length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await tester3.cleanup();
  }

  // Example 4: Error response handling
  const tester4 = createTester({
    baseURL: 'http://dns.c',
  });

  await tester4.initialize();

  try {
    // Try to access a non-existent endpoint to trigger error
    await api.test({
      GET: '/api/nonexistent',
      response: Route,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiError') {
      const apiError = error as unknown as {
        status: number;
        code?: number;
        key?: string;
        type?: string;
        summary?: string;
        detail?: string;
        file?: string;
        line?: number;
        function?: string;
        timestamp?: string;
      };
      
      console.error('API Error Details:');
      console.error('Status:', apiError.status);
      console.error('Code:', apiError.code);
      console.error('Key:', apiError.key);
      console.error('Type:', apiError.type);
      console.error('Summary:', apiError.summary);
      console.error('Detail:', apiError.detail);
      console.error('File:', apiError.file);
      console.error('Line:', apiError.line);
      console.error('Function:', apiError.function);
      console.error('Timestamp:', apiError.timestamp);
    }
  } finally {
    await tester4.cleanup();
  }
}

main();

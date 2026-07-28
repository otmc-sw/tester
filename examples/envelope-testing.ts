/**
 * @License Apache License 2.0
 * @Copyright (c) 2026 OTMC Softwares.
 * @Contributors Nguyen Van Trung, OTMC Contributors.
 **/
import { createTester, api } from '@otmc/tester';

class Route {
  id: number = 0;
  domain: string = '';
  target: string = '';
  dns_id: number = 0;
  enabled: boolean = false;
  status: string = '';
  created_at: string = '';
  updated_at: string = '';
  [key: string]: unknown;
}

class DNSRecord {
  id: number = 0;
  domain: string = '';
  ip: string = '';
  created_at: string = '';
  updated_at: string = '';
  [key: string]: unknown;
}

async function main() {
  const tester1 = createTester({
    baseURL: 'https://dns.c',
    responseContract: {
      success: {
        successField: 'success',
        dataField: 'data',
      },
      error: {
        successField: 'success',
        messageField: 'message',
        errorField: 'error',
      },
    },
  });
  await tester1.initialize();

  const routes = await api.test({
    GET: '/api/routes',
    response: Route,
  });
  console.log(routes);

  const dnsRecords = await api.test({
    GET: '/api/dns',
    response: DNSRecord,
  });
  console.log(dnsRecords);
}

main().catch(console.error);

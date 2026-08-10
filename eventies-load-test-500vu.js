import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'https://main-company.vercel.app';

const status200 = new Counter('status_200');
const status403 = new Counter('status_403');
const status429 = new Counter('status_429');
const status5xx = new Counter('status_5xx');
const successRate = new Rate('successful_responses');

export const options = {
  scenarios: {
    eventies_500_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 100 },
        { duration: '30s', target: 250 },
        { duration: '1m',  target: 500 },
        { duration: '2m',  target: 500 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
    successful_responses: ['rate>0.99'],
  },
};

const pages = ['/', '/products', '/gallery'];

export default function () {
  const path = pages[Math.floor(Math.random() * pages.length)];
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { page: path },
    timeout: '10s',
  });

  if (response.status === 200) status200.add(1);
  if (response.status === 403) status403.add(1);
  if (response.status === 429) status429.add(1);
  if (response.status >= 500) status5xx.add(1);

  check(response, {
    'HTTP status is 200': (r) => r.status === 200,
    'response time is below 1.5 seconds': (r) => r.timings.duration < 1500,
    'response body is not empty': (r) => !!r.body && r.body.length > 0,
  });

  successRate.add(response.status === 200);
  sleep(Math.random() * 2 + 1);
}

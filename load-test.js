import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1500'],
  },
};

export default function () {
const res = http.get('https://main-company.vercel.app/products');

  check(res, {
    'homepage status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
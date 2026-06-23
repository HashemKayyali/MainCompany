import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const apiLatency = new Trend('api_latency', true);
const errorRate = new Rate('custom_errors');
const BASE_URL = 'https://main-company.vercel.app';

export const options = {
  scenarios: {
    realistic_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 250 },
        { duration: '3m', target: 250 },  // ثبات
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000', 'p(99)<3000'],
  },
};

export default function () {
  // نضرب على الصفحات الموجودة فعلاً فقط
  const res = http.get(`${BASE_URL}/`);
  apiLatency.add(res.timings.duration);
  const ok = check(res, {
    'status is 200': (r) => r.status === 200,
    'response < 2s': (r) => r.timings.duration < 2000,
    'body not empty': (r) => r.body && r.body.length > 0,
  });
  errorRate.add(!ok);
  sleep(Math.random() * 2 + 1);
}

export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
import http from 'k6/http';
import { check, sleep } from 'k6';

const SUPABASE_URL = __ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY;
const TEST_EMAIL = __ENV.TEST_EMAIL;
const TEST_PASSWORD = __ENV.TEST_PASSWORD;

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 100 },

    { duration: '1m', target: 250 },
    { duration: '2m', target: 250 },

    { duration: '1m', target: 500 },
    { duration: '2m', target: 500 },

    { duration: '2m', target: 1000 },
    { duration: '3m', target: 1000 },

    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<2000'],
  },
};

export function setup() {
  const loginUrl = `${SUPABASE_URL}/auth/v1/token?grant_type=password`;

  const payload = JSON.stringify({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  };

  const res = http.post(loginUrl, payload, params);

  check(res, {
    'setup login status is 200': (r) => r.status === 200,
    'setup has access token': (r) => Boolean(r.json('access_token')),
  });

  return {
    accessToken: res.json('access_token'),
  };
}

export default function (data) {
  const res = http.get(`${SUPABASE_URL}/rest/v1/profiles?select=id,name,email,role&limit=1`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  check(res, {
    'profiles status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

//k6 run login-test.js
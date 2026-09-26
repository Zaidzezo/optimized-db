import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m',  target: 200 },
    { duration: '30s', target: 500 },
  ],
};

export default function () {
  http.get('http://localhost:3000/api/articles');
  sleep(1);
}
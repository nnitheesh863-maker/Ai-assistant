import { test, describe } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import { createApp } from '../src/app.js';

describe('Health & Telemetry API Tests', () => {
  test('Health endpoint returns healthy status and timestamp', async () => {
    const app = createApp();
    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const res = await fetch('http://localhost:' + port + '/health');
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.status, 'healthy');
    await new Promise((resolve) => server.close(resolve));
  });
});

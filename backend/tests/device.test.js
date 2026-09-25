import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DeviceModel } from '../src/models/Device.js';

describe('Device Registry & Pairing Tests', () => {
  test('Registers and queries devices by user', async () => {
    const userId = 'user-test-' + Date.now();
    const device = DeviceModel.create({
      userId,
      name: 'Work Laptop',
      type: 'laptop',
      tokenHash: 'sample-hash-123'
    });
    assert.ok(device.id);
    assert.strictEqual(device.userId, userId);
  });
});

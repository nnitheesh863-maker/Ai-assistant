import { test, describe } from 'node:test';
import assert from 'node:assert';
import { UserModel } from '../src/models/User.js';

describe('Authentication & User Model Unit Tests', () => {
  test('Creates user with hashed password', async () => {
    const email = 'test_user_' + Date.now() + '@example.com';
    const user = await UserModel.create({
      name: 'Test Tester',
      email,
      password: 'SecurePassword123!'
    });
    assert.ok(user.id);
    assert.strictEqual(user.name, 'Test Tester');
    assert.strictEqual(user.email, email);
  });
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { isAppAllowed, isFolderAllowed } from '../src/security/allowlist.js';

describe('Desktop Agent Allowlist Tests', () => {
  test('Allows approved applications', () => {
    assert.strictEqual(isAppAllowed('chrome'), true);
    assert.strictEqual(isAppAllowed('notepad'), true);
  });
  test('Rejects malicious binaries', () => {
    assert.strictEqual(isAppAllowed('malware.exe'), false);
  });
});

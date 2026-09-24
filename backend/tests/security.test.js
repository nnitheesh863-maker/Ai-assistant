import test from 'node:test';
import assert from 'node:assert/strict';
import { CommandValidator } from '../src/services/commandValidator.js';
import { INTENTS } from '../../shared/constants.js';

test('Security - Rejects arbitrary command injection attempts in OPEN_APP', () => {
  const payloads = [
    'chrome & rm -rf /',
    'notepad.exe; format c:',
    'powershell.exe -enc AAAAA',
    '`whoami`',
    '$(shutdown /s /t 0)'
  ];

  for (const payload of payloads) {
    const result = CommandValidator.validate({
      intent: INTENTS.OPEN_APP,
      device: 'laptop',
      target: payload
    });
    assert.equal(result.isValid, false, `Expected payload "${payload}" to be rejected`);
  }
});

test('Security - Rejects arbitrary path traversal in folder opening', () => {
  const maliciousFolders = [
    '../../Windows/System32',
    'C:\\Windows\\System32',
    '..\\..\\..\\sensitive',
    '/etc/passwd'
  ];

  for (const folder of maliciousFolders) {
    const result = CommandValidator.validate({
      intent: INTENTS.OPEN_FOLDER,
      device: 'laptop',
      target: folder
    });
    assert.equal(result.isValid, false, `Expected malicious folder "${folder}" to be rejected`);
  }
});

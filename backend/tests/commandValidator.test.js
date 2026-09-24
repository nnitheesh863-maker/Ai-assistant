import test from 'node:test';
import assert from 'node:assert/strict';
import { CommandValidator } from '../src/services/commandValidator.js';
import { INTENTS } from '../../shared/constants.js';

test('CommandValidator - Validates allowed Laptop application', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.OPEN_APP,
    device: 'laptop',
    target: 'chrome'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedCommand.target, 'chrome');
  assert.equal(result.normalizedCommand.requires_confirmation, false);
});

test('CommandValidator - Validates allowed Mobile application', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.OPEN_APP,
    device: 'phone',
    target: 'whatsapp'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedCommand.target, 'com.whatsapp');
});

test('CommandValidator - Rejects unauthorized application', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.OPEN_APP,
    device: 'laptop',
    target: 'malicious_ransomware.exe'
  });

  assert.equal(result.isValid, false);
  assert.match(result.error, /not in the laptop allowlist/i);
});

test('CommandValidator - Validates allowed laptop folders and normalizes path', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.OPEN_FOLDER,
    device: 'laptop',
    target: 'downloads'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedCommand.target, 'USERPROFILE\\Downloads');
});

test('CommandValidator - Flags sensitive action with confirmation requirement', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.LOCK_DEVICE,
    device: 'laptop',
    target: 'lock'
  });

  assert.equal(result.isValid, true);
  assert.equal(result.normalizedCommand.requires_confirmation, true);
});

test('CommandValidator - Rejects non-HTTP URLs', () => {
  const result = CommandValidator.validate({
    intent: INTENTS.OPEN_WEBSITE,
    device: 'laptop',
    target: 'file:///C:/Windows/System32/cmd.exe'
  });

  assert.equal(result.isValid, false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateTommoApiKey,
  validateTommoApiKey,
  maskTommoApiKey,
  TOMMO_API_KEY_REGEX,
} from './tommoApiKey.ts';

test('Tommo API Key: generated key matches tmm-xxxxxxxxxxxxxxxxxxxx format', () => {
  const key = generateTommoApiKey();
  assert.equal(typeof key, 'string');
  assert.ok(key.startsWith('tmm-'), 'Key must start with tmm-');
  assert.equal(key.length, 24, 'Total length must be 24 (4 for tmm- + 20 chars)');
  assert.match(key, TOMMO_API_KEY_REGEX);
});

test('Tommo API Key: generates unique keys on each invocation', () => {
  const key1 = generateTommoApiKey();
  const key2 = generateTommoApiKey();
  assert.notEqual(key1, key2);
});

test('Tommo API Key: validates correct and rejects malformed keys', () => {
  // Valid
  assert.equal(validateTommoApiKey('tmm-Ab1Cd2Ef3Gh4Ij5Kl6Mn'), true);
  assert.equal(validateTommoApiKey('tmm-0123456789ABCDEFGHIJ'), true);
  assert.equal(validateTommoApiKey('tmm-abcdefghijklmnopqrst'), true);

  // Invalid: wrong prefix
  assert.equal(validateTommoApiKey('sk-Ab1Cd2Ef3Gh4Ij5Kl6Mn'), false);
  assert.equal(validateTommoApiKey('tm-Ab1Cd2Ef3Gh4Ij5Kl6Mn'), false);

  // Invalid: wrong length (less than 20 after prefix)
  assert.equal(validateTommoApiKey('tmm-Ab1Cd2Ef3Gh4'), false);

  // Invalid: wrong length (more than 20 after prefix)
  assert.equal(validateTommoApiKey('tmm-Ab1Cd2Ef3Gh4Ij5Kl6MnXyz'), false);

  // Invalid: special characters
  assert.equal(validateTommoApiKey('tmm-Ab1Cd2Ef3Gh4Ij5Kl6M!'), false);
  assert.equal(validateTommoApiKey('tmm-Ab1Cd2Ef3Gh4Ij5Kl6M_'), false);

  // Invalid: null / empty
  assert.equal(validateTommoApiKey(''), false);
  assert.equal(validateTommoApiKey(null), false);
  assert.equal(validateTommoApiKey(undefined), false);
});

test('Tommo API Key: maskTommoApiKey masks middle characters safely', () => {
  const key = 'tmm-Ab1Cd2Ef3Gh4Ij5Kl6Mn';
  const masked = maskTommoApiKey(key);
  assert.ok(masked.startsWith('tmm-Ab1C'));
  assert.ok(masked.endsWith('l6Mn'));
  assert.ok(masked.includes('••••••••••••'));
});

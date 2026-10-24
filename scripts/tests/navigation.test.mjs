import test from 'node:test';
import assert from 'node:assert/strict';
import { isChatPath, rememberChatPath, returnToChatPath } from '../../frontend/src/utils/chat/navigation.js';

test('settings returns to the last conversation across settings pages', () => {
  const values = new Map();
  globalThis.sessionStorage = { setItem: (k,v) => values.set(k,v), getItem: k => values.get(k) };
  const conversation = '/workspace/example/t/conversation-1';
  rememberChatPath(conversation);
  rememberChatPath('/settings/interface');
  rememberChatPath('/workspace/example/settings/general-appearance');
  assert.equal(returnToChatPath(), conversation);
  rememberChatPath('/');
  assert.equal(returnToChatPath(), '/');
  delete globalThis.sessionStorage;
});

test('invalid destinations and unavailable browser storage fall back to home', () => {
  for (const path of ['//example.com', 'https://example.com', '/settings/llm-preference', '/workspace/a/t/b/extra', null]) {
    assert.equal(isChatPath(path), false);
  }
  globalThis.sessionStorage = { getItem: () => 'https://example.com' };
  assert.equal(returnToChatPath(), '/');
  globalThis.sessionStorage = { getItem: () => { throw new Error('disabled'); }, setItem: () => { throw new Error('disabled'); } };
  assert.doesNotThrow(() => rememberChatPath('/workspace/a'));
  assert.equal(returnToChatPath(), '/');
  delete globalThis.sessionStorage;
});

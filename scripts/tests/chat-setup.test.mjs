import { test } from 'node:test';
import assert from 'node:assert/strict';
import { chatSetupState } from '../../frontend/src/utils/chat/setup.js';

test('missing cloud credentials are identified before chat', () => {
  assert.equal(chatSetupState({LLMProvider:'deepseek',DeepSeekApiKey:false}).missing,true);
  assert.equal(chatSetupState({LLMProvider:'deepseek',DeepSeekApiKey:true}).missing,false);
});
test('workspace provider overrides global provider, including local services', () => {
  const settings={LLMProvider:'deepseek',DeepSeekApiKey:false,OpenAiKey:true};
  assert.equal(chatSetupState(settings,{chatProvider:'openai'}).missing,false);
  assert.equal(chatSetupState(settings,{chatProvider:'ollama'}).missing,false);
  assert.equal(chatSetupState(settings,{chatProvider:'anythingllm-router'}).missing,false);
  assert.equal(chatSetupState(settings,{chatProvider:null}).missing,true);
});
test('unknown settings and optional local credentials are never marked missing', () => {
  assert.equal(chatSetupState(null).missing,false);
  assert.equal(chatSetupState({LLMProvider:'generic-openai',GenericOpenAiKey:false}).missing,false);
  assert.equal(chatSetupState({LLMProvider:'openai'}).missing,false);
  assert.equal(chatSetupState({LLMProvider:null}).missing,true);
});

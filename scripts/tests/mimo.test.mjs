import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mimoPreset,isMiMoEndpoint} from '../../frontend/src/utils/chat/mimo.js';
import {chatSetupState} from '../../frontend/src/utils/chat/setup.js';
const require=createRequire(import.meta.url);
const {genericMaxTokensKey}=require('../../server/utils/AiProviders/genericOpenAi/requestOptions.js');
test('MiMo supports official standard and regional plan endpoints only',()=>{
 for(const url of ['https://api.xiaomimimo.com/v1','https://token-plan-cn.xiaomimimo.com/v1']) {
  assert.equal(isMiMoEndpoint(url),true);assert.equal(genericMaxTokensKey(url),'max_completion_tokens');
  assert.equal(chatSetupState({LLMProvider:'generic-openai',GenericOpenAiBasePath:url,GenericOpenAiKey:false}).missing,true);
 }
 for(const url of ['http://localhost:1234/v1','https://api.xiaomimimo.com.evil.example/v1','invalid']) {
  assert.equal(isMiMoEndpoint(url),false);assert.equal(genericMaxTokensKey(url),'max_tokens');
 }
 assert.equal(genericMaxTokensKey('https://api.xiaomimimo.com/v1','custom_budget'),'custom_budget');
});
test('switching to MiMo never reuses an unrelated saved credential',()=>{
 const preset=mimoPreset({GenericOpenAiBasePath:'https://another.example/v1',GenericOpenAiKey:true});
 assert.equal(preset.GenericOpenAiKey,false);assert.equal(preset.GenericOpenAiModelPref,'mimo-v2.6-flash');
 const existing={GenericOpenAiBasePath:'https://token-plan-sgp.xiaomimimo.com/v1',GenericOpenAiKey:true,GenericOpenAiModelPref:'mimo-v2.6-pro'};
 assert.equal(mimoPreset(existing).GenericOpenAiKey,true);assert.equal(mimoPreset(existing).GenericOpenAiBasePath,existing.GenericOpenAiBasePath);
 assert.equal(mimoPreset(existing).GenericOpenAiModelPref,existing.GenericOpenAiModelPref);
});

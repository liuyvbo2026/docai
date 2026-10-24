const {test}=require('node:test');
const assert=require('node:assert/strict');
const calls=[];
const workspaces=[{slug:'a',name:'\u793a\u4f8b\u77e5\u8bc6\u5e93'},{slug:'b',name:'HR'}];
const Workspace={where:async()=>{calls.push(['all']);return workspaces;},whereWithUser:async(user)=>{calls.push(['user',user]);return [workspaces[0]];}};
const WorkspaceThread={where:async(...args)=>{calls.push(['threads',...args]);return [{slug:'c',name:'\u4f1a\u8bae\u7b14\u8bb0',workspace:workspaces[0]}];}};
require.cache[require.resolve('../../server/models/workspace')]={exports:{Workspace}};
require.cache[require.resolve('../../server/models/workspaceThread')]={exports:{WorkspaceThread}};
const {searchWorkspaceAndThreads}=require('../../server/utils/helpers/search');
test('two-character Chinese names match without unrelated fuzzy matches',async()=>{
 assert.deepEqual((await searchWorkspaceAndThreads('\u793a\u4f8b')).workspaces.map(x=>x.slug),['a']);
 assert.deepEqual((await searchWorkspaceAndThreads('\u4f1a\u8bae')).threads.map(x=>x.slug),['c']);
 assert.deepEqual((await searchWorkspaceAndThreads('zz')).workspaces,[]);
});
test('short searches preserve user scoping',async()=>{
 calls.length=0;const user={id:7};await searchWorkspaceAndThreads('\u793a\u4f8b',user);
 assert.equal(calls.some(c=>c[0]==='all'),false);
 assert.deepEqual(calls.find(c=>c[0]==='user'),['user',user]);
 assert.deepEqual(calls.find(c=>c[0]==='threads')[1],{user_id:7});
});
test('empty queries do not query the database',async()=>{
 calls.length=0;assert.deepEqual(await searchWorkspaceAndThreads('  '),{workspaces:[],threads:[]});assert.equal(calls.length,0);
});

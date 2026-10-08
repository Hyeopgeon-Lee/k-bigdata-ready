import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const sampleStudents = [
  { student_id:'1', name:'학생1', active:true },
  { student_id:'2', name:'학생2', active:true },
  { student_id:'3', name:'학생3', active:true }
];
const today = new Date().toISOString().slice(0,10);
const checks = [
  {student_id:'1', checked_at:today, check_status:'FAILED'},
  {student_id:'2', checked_at:'2020-01-01', check_status:'SUCCESS'}
];
const seen = {github:[],notion:[],portfolio:[]};
const ctx=vm.createContext({
  READY:{TZ:'Asia/Seoul',BATCH_SIZE:2,CHECK_COOLDOWN_MINUTES:10},
  Utilities:{formatDate:(date)=>date.toISOString().slice(0,10)},
  CacheService:{getScriptCache:()=>({
    get:key=>cache.get(key)||null,
    put:(key,val)=>cache.set(key,val),
    remove:key=>cache.delete(key)
  })},
  LockService:{getScriptLock:()=>({waitLock:()=>{},releaseLock:()=>{}})},
  UrlFetchApp:{fetch:url=>({getResponseCode:()=>url.includes('broken')?404:200})},
  Date,JSON,Set,Map,
  now:()=>new Date().toISOString(),
  rows:name=>name==='GITHUB_CHECK'?checks:[],
  active:name=>name==='STUDENTS'?sampleStudents:[],
  id:prefix=>prefix+'_id',
  append:()=>{},
  checkStudent:s=>{seen.github.push(s.student_id);return{check_status:'SUCCESS'}},
  updateNotionCheck:s=>seen.notion.push(s.student_id),
  updatePublicPortfolioCheck:s=>seen.portfolio.push(s.student_id)
});
const cache=new Map();
const execute=code=>vm.runInContext(code,ctx);

vm.runInContext(fs.readFileSync('apps-script/CheckService.gs','utf8'),ctx,{filename:'CheckService.gs'});
assert.deepEqual(Array.from(execute('selectBatch()'),x=>x.student_id),['3','2'], 'Unvisited students must be processed before failed same-day retries');
const batch=execute('scheduledBatchCheck()');
assert.equal(batch.target_count,2);
assert.deepEqual(seen.github,['3','2']);
assert.deepEqual(seen.notion,['3','2'], 'Notion checks should use same batch');
assert.deepEqual(seen.portfolio,['3','2'], 'Portfolio checks should use same batch');

vm.runInContext(fs.readFileSync('apps-script/PortfolioService.gs','utf8'),ctx,{filename:'PortfolioService.gs'});
const portfolio=execute("checkPublicPortfolio({student_id:'2',portfolio_url:'https://broken.example',blog_url:'https://working.example',github_pages_url:'https://working.example'})");
const urls=JSON.parse(portfolio.url_results);
assert.equal(urls.length,2, 'Repeated URLs must be deduplicated');
assert.equal(portfolio.site_available,true, 'An accessible second URL must not be skipped');
assert.equal(portfolio.check_status,'SUCCESS');
assert.equal(urls[0].available,false);
assert.equal(urls[1].available,true);

ctx.props=()=>({getProperty:()=> 'mock-salt'});
vm.runInContext(fs.readFileSync('apps-script/Auth.gs','utf8'),ctx,{filename:'Auth.gs'});
ctx.hashPin=x=>'mock-key-'+x;
for(let i=0;i<5;i++)assert.throws(()=>execute("verifyLoginAttempt('student','123',false)"),/학번 또는 PIN/);
assert.throws(()=>execute("verifyLoginAttempt('student','123',true)"),/15분/, 'Fifth failed attempt locks identity');
assert.doesNotThrow(()=>execute("verifyLoginAttempt('student','124',true)"), 'Different identity is not locked');

console.log('Peer progress integration checks passed');

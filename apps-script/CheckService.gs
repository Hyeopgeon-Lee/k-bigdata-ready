function today(){return Utilities.formatDate(new Date(),READY.TZ,'yyyy-MM-dd')}
function runMyCheck(s){const key='cooldown:'+s.student_id,cache=CacheService.getScriptCache();if(cache.get(key))throw publicError('COOLDOWN','즉시 점검은 10분에 한 번 이용할 수 있습니다.');const student=active('STUDENTS').find(x=>String(x.student_id)===String(s.student_id));const result=checkStudent(student);updateNotionCheck(student);updatePublicPortfolioCheck(student);cache.put(key,'1',READY.CHECK_COOLDOWN_MINUTES*60);return result}
function selectBatch(){
  const students=active('STUDENTS'), checks=rows('GITHUB_CHECK');
  const byStudent=Object.fromEntries(checks.map(c=>[String(c.student_id),c]));
  const pending=[],retry=[];
  students.forEach(s=>{
    const c=byStudent[String(s.student_id)]||{};
    const checkedToday=String(c.checked_at||'').startsWith(today());
    if(!checkedToday)pending.push(s);
    else if(['FAILED','PARTIAL'].includes(String(c.check_status||'')))retry.push(s);
  });
  const oldestFirst=(a,b)=>String((byStudent[String(a.student_id)]||{}).checked_at||'').localeCompare(String((byStudent[String(b.student_id)]||{}).checked_at||''));
  pending.sort(oldestFirst);retry.sort(oldestFirst);
  // Complete previously unchecked students before spending quota on same-day retries.
  return pending.concat(retry).slice(0,READY.BATCH_SIZE)
}
function runBatchCheck(){const batch=id('batch'),start=now(),targets=selectBatch();let ok=0,fail=0,errors=[];targets.forEach(s=>{try{const g=checkStudent(s);if(g.check_status==='PARTIAL'){fail++;errors.push(s.student_id+': '+(g.error_message||'일부 Repository 점검 실패'))}else ok++}catch(e){fail++;errors.push(s.student_id+': '+(e.technical||e.message))}});append('CHECK_LOG',{log_id:id('log'),batch_id:batch,started_at:start,finished_at:now(),target_count:targets.length,success_count:ok,failed_count:fail,status:fail?'PARTIAL':'SUCCESS',error_message:errors.join(' | ')});return{batch_id:batch,student_ids:targets.map(s=>String(s.student_id)),target_count:targets.length,success_count:ok,failed_count:fail}}
function scheduledBatchCheck(){const result=runBatchCheck();const targets=new Set(result.student_ids);active('STUDENTS').filter(s=>targets.has(String(s.student_id))).forEach(s=>{try{updateNotionCheck(s)}catch(e){upsert('NOTION_CHECK','student_id',{student_id:s.student_id,checked_at:now(),check_status:'FAILED',error_message:e.message})}try{updatePublicPortfolioCheck(s)}catch(e){upsert('PORTFOLIO_CHECK','student_id',{student_id:s.student_id,checked_at:now(),site_available:false,check_status:'FAILED',error_message:e.message})}});return result}
function runTestCheck(studentId){const s=active('STUDENTS').find(x=>String(x.student_id)===String(studentId));if(!s)throw new Error('Student not found');const github=checkStudent(s),notion=updateNotionCheck(s),portfolio=updatePublicPortfolioCheck(s);return{github:github,notion:notion,portfolio:portfolio}}
function migrateReadinessBatch(){const students=active('STUDENTS').sort((a,b)=>String(a.student_id).localeCompare(String(b.student_id))),store=props(),offset=Number(store.getProperty('READY_MIGRATION_CURSOR')||0),targets=students.slice(offset,offset+5),errors=[];targets.forEach(s=>{try{checkStudent(s)}catch(e){errors.push(String(s.student_id)+': '+String(e.message||e))}try{updateNotionCheck(s)}catch(e){errors.push(String(s.student_id)+': Notion '+String(e.message||e))}try{updatePublicPortfolioCheck(s)}catch(e){errors.push(String(s.student_id)+': portfolio '+String(e.message||e))}});const next=offset+targets.length;store.setProperty('READY_MIGRATION_CURSOR',String(next));const result={processed:targets.length,next:next,total:students.length,errors:errors};console.log(JSON.stringify(result));return result}

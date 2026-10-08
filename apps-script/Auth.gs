function hashPin(pin){const salt=props().getProperty('PIN_SALT');if(!salt)throw publicError('CONFIG_ERROR','인증 설정이 필요합니다.');return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+String(pin),Utilities.Charset.UTF_8).map(b=>(b+256)%256).map(b=>('0'+b.toString(16)).slice(-2)).join('')}
function secureEq(a,b){a=String(a||'');b=String(b||'');let diff=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)diff|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return diff===0}
// Limit PIN guesses per student or administrator. No IP address is available to Apps Script Web Apps.
function verifyLoginAttempt(kind,identity,valid){
  const cache=CacheService.getScriptCache(), key='login:'+kind+':'+hashPin(String(identity)).slice(0,32);
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
    const failures=Number(cache.get(key)||0);
    if(failures>=5)throw publicError('TOO_MANY_ATTEMPTS','로그인 시도가 많습니다. 15분 뒤 다시 시도해 주세요.');
    if(!valid){
      cache.put(key,String(failures+1),900);
      throw publicError('INVALID_CREDENTIALS',kind==='admin'?'관리자 PIN을 확인해 주세요.':'학번 또는 PIN을 확인해 주세요.');
    }
    cache.remove(key);
  }finally{lock.releaseLock()}
}
function newSession(role,studentId){const token=Utilities.getUuid()+Utilities.getUuid();CacheService.getScriptCache().put('session:'+token,JSON.stringify({role:role,student_id:studentId||'',created_at:now()}),READY.SESSION_HOURS*3600);return token}
function requireSession(token,role){const raw=token&&CacheService.getScriptCache().get('session:'+token);if(!raw)throw publicError('AUTH_REQUIRED','다시 로그인해 주세요.');const s=JSON.parse(raw);if(s.role!==role)throw publicError('FORBIDDEN','이 작업을 수행할 권한이 없습니다.');return s}
function logout(token){if(token)CacheService.getScriptCache().remove('session:'+token);return{loggedOut:true}}
function studentLogin(req){const s=active('STUDENTS').find(x=>String(x.student_id)===String(req.student_id));verifyLoginAttempt('student',req.student_id||'',Boolean(s&&secureEq(s.pin_hash,hashPin(req.pin))));return{token:newSession('STUDENT',s.student_id),student:{student_id:s.student_id,name:s.name}}}
function adminLogin(req){verifyLoginAttempt('admin','READY_ADMIN',secureEq(props().getProperty('ADMIN_PIN_HASH'),hashPin(req.pin)));return{token:newSession('ADMIN'),role:'ADMIN'}}

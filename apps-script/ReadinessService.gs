// One backend definition supplies both the checklist and every actionable warning.
const READINESS_RULES=[
  {code:'github_days',title:'최근 7일 GitHub 활동',criterion:'최근 7일 중 커밋한 날짜 3일 이상 권장 (하루 여러 커밋은 1일)',how:'등록한 GitHub Repository에서 코드를 수정하고 커밋하세요. 하루에 몰아서 커밋해도 활동일은 1일입니다.'},
  {code:'github_inactive',title:'GitHub 장기 미활동',criterion:'마지막 본인 커밋 이후 14일 이상이면 보완 안내',how:'GitHub의 등록된 Repository에서 작업한 코드를 커밋하세요. 점검 대상은 등록된 프로젝트의 기본 브랜치에 확인된 본인 커밋입니다.'},
  {code:'repository_missing',title:'Repository 등록',criterion:'본인 GitHub 프로젝트 Repository 1개 이상 등록',how:'READY 로그인 → 내 정보 수정 → Repository 추가에서 프로젝트 주소를 등록하세요.'},
  {code:'readme_quality',title:'README 9개 항목',criterion:'소개·목적·기능·기술스택·아키텍처·실행 안내·실행 화면·본인 역할·트러블슈팅 확인 (핵심 7개 충족)',how:'GitHub → 대표 Repository → README.md → 연필(편집)에서 누락된 제목과 해당 프로젝트의 구체적인 내용을 작성하세요. 역할·문제 해결 과정은 특히 자세히 작성하세요.'},
  {code:'source_missing',title:'프로젝트 소스코드',criterion:'등록 Repository에서 소스 파일 확인 (참고 항목)',how:'실제로 작성한 프로젝트 소스를 Repository에 올려 주세요. 소스 구조가 특수한 경우에는 이 항목만으로 감점하지 않습니다.'},
  {code:'broken_links',title:'README 문서 링크',criterion:'README의 Repository 내부 이미지·파일 연결 확인 (참고 항목)',how:'GitHub → README.md 편집에서 표시된 잘못된 상대경로를 실제 파일 위치에 맞게 고치세요. 외부 URL은 여기서 검사하지 않습니다.'},
  {code:'repository_quality',title:'Repository 소개 정보',criterion:'Description 및 Topic 등록 권장',how:'GitHub → Repository 오른쪽 About의 톱니바퀴에서 Description과 Topics를 작성하세요. .gitignore는 기존의 단순 존재 확인만 제공합니다.'},
  {code:'portfolio_update',title:'포트폴리오',criterion:'Notion 최근 수정 또는 공개 포트폴리오 URL 접속 확인',how:'READY → 내 정보 수정에서 포트폴리오 URL을 확인하고, 공개 접근이 가능하도록 설정하세요.'},
  {code:'resume',title:'2학년 이력서',criterion:'이력서 1차 완성 이상 (준비 우수는 최종 완성)',how:'이력서를 작성한 후 READY → 내 정보 수정 → 이력서 상태를 실제 준비 단계에 맞게 수정하세요.'},
  {code:'cover',title:'2학년 자기소개서',criterion:'자기소개서 기본본 완성 이상 (준비 우수는 기업 지원 가능)',how:'자기소개서 기본본을 작성한 후 READY → 내 정보 수정 → 자기소개서 상태를 실제 준비 단계에 맞게 수정하세요.'}
];
function readinessGuide(){return READINESS_RULES.map(r=>Object.assign({},r))}
function readinessIssue(code){
  if(code==='readme_missing')code='readme_quality';
  if(code==='portfolio_missing')code='portfolio_update';
  if(code==='license')code='repository_quality';
  const rule=READINESS_RULES.find(r=>r.code===code);
  if(rule)return{why:rule.criterion,how:rule.how,area:rule.title};
  if(code==='github_stale'||code==='github_check_failed'||code==='github_partial'||code==='readme_unchecked')
    return{why:'점검이 아직 완료되지 않아 활동 부족으로 확정할 수 없습니다.',how:'다음 정기 점검 후 확인하거나 내 현황에서 지금 점검하기를 눌러 주세요.',area:'점검 상태'};
  return{why:'등록 또는 점검된 정보를 다시 확인해 주세요.',how:'READY → 내 정보 수정에서 등록 정보를 확인해 주세요.',area:'기타 점검'};
}
function recentReadyCheck(c){
  const time=Date.parse(String(c&&c.checked_at||''));
  return Number.isFinite(time)&&time<=Date.now()+300000&&Date.now()-time<=36*3600000;
}
function evaluateStudentReadiness(student,checks){const g=checks.github||{},repo=checks.repository||{},readme=checks.readme||{},notion=checks.notion||{},count=Number(checks.repositoryCount||0),second=String(student.grade)==='2',issues=[];
  const add=(code,label,priority,required=true,evidence='')=>issues.push(Object.assign({code,label,priority,required,level:required?'action':'suggestion',evidence},readinessIssue(code)));
  const days=Number(g.active_days_7d||0),githubFresh=recentReadyCheck(g),githubChecked=githubFresh&&['SUCCESS','PARTIAL'].includes(String(g.check_status||'')),githubComplete=githubFresh&&g.check_status==='SUCCESS',githubOK=githubChecked&&days>=3,repositoryOK=count>0,readmeFresh=recentReadyCheck(readme)&&readme.check_status==='SUCCESS',readmeOK=readmeFresh&&readme.readme_status==='README 양호',portfolioRegistered=Boolean(student.notion_url||student.portfolio_url||student.github_pages_url||student.blog_url),notionOK=Boolean(student.notion_url&&recentReadyCheck(notion)&&notion.check_status==='SUCCESS'&&notion.activity_status==='최근 업데이트'),otherPortfolioOK=Boolean(checks.publicPortfolio&&recentReadyCheck(checks.publicPortfolio)&&checks.publicPortfolio.check_status==='SUCCESS'&&String(checks.publicPortfolio.site_available).toLowerCase()==='true'),portfolioOK=portfolioRegistered&&Boolean(notionOK||otherPortfolioOK),resumeGood=['1차 완성','최종 완성'].includes(student.resume_status),resumeExcellent=student.resume_status==='최종 완성',coverGood=['기본본 완성','기업 지원 가능'].includes(student.cover_letter_status),coverExcellent=student.cover_letter_status==='기업 지원 가능',inactive14=githubComplete&&g.inactive_days!==''&&Number(g.inactive_days)>=14;
  if(inactive14)add('github_inactive','GitHub 14일 이상 미활동',1,true,'마지막 확인된 본인 커밋 이후 '+g.inactive_days+'일');
  else if(githubComplete&&!githubOK)add('github_days','최근 7일 GitHub 활동 '+days+'일 · 권장 3일',6,true,'확인된 활동 '+days+'일 / 권장 3일');
  if(!githubFresh&&count>0)add('github_stale','GitHub 점검 결과 확인 필요',48,false,'마지막 점검 '+(g.checked_at||'없음'));
  else if(g.check_status==='FAILED')add('github_check_failed','GitHub 자동점검 실패',50,false,'API 점검 실패');
  else if(g.check_status==='PARTIAL')add('github_partial','일부 Repository 자동점검 실패',51,false,'일부 프로젝트만 확인됨');
  if(!repositoryOK)add('repository_missing','Repository 미등록',2);
  if(second&&!resumeGood)add('resume','이력서 미완성',3);
  if(second&&!coverGood)add('cover','자기소개서 미완성',4);
  if(repositoryOK){
    if(readmeFresh){
      if(readme.readme_status==='README 미작성')add('readme_missing','README 미작성',5,true,'대표 Repository에 README.md가 없습니다.');
      else if(!readmeOK){const missing=String(readme.missing_items||'').split(',').filter(Boolean),names={introduction:'프로젝트 소개',purpose:'개발 목적',features:'주요 기능',tech_stack:'기술 스택',architecture:'아키텍처',run_guide:'설치·실행 안내',screenshots:'실행 화면',role:'본인 역할',troubleshooting:'트러블슈팅'};const detail=missing.map(k=>names[k]||k);add('readme_quality','README 보완 필요 · '+(detail.slice(0,2).join(' · ')||readme.readme_status),5,true,'누락 또는 내용 부족: '+(detail.join(', ')||readme.readme_status))}
      if(readme.broken_links_count!==''&&Number(readme.broken_links_count)>0)add('broken_links','README 내부 링크 경로 확인',21,false,'파일 확인 필요: '+(readme.broken_link_samples||readme.broken_links_count+'개'));
    }else add('readme_unchecked','README 점검 결과 확인 필요',49,false,'최근에 확인된 README 점검 결과가 없습니다.');
  }
  if(!portfolioRegistered)add('portfolio_missing','포트폴리오 미등록',7);
  else if(!portfolioOK)add('portfolio_update',notion.activity_status==='장기 미업데이트'?'포트폴리오 장기 미수정':'포트폴리오 접근·업데이트 확인 필요',7);
  if(repositoryOK&&recentReadyCheck(repo)&&repo.check_status==='SUCCESS'){const quality=[];if(!repo.description_exists)quality.push('Description');if(!Number(repo.topics_count||0))quality.push('Topic');if(!repo.gitignore_exists)quality.push('.gitignore');if(quality.length)add('repository_quality','Repository 기본정보 보완 · '+quality.join(' · '),20,false);if(!repo.license_exists)add('license','LICENSE 미등록',90,false);if(repo.source_exists===false||String(repo.source_exists).toLowerCase()==='false')add('source_missing','소스 파일 위치 확인 필요',22,false,'등록 Repository에서 일반적인 확장자 소스 파일을 찾지 못했습니다.')}
  const core=[githubOK,repositoryOK,readmeOK,portfolioOK],coreMet=core.filter(Boolean).length;let status;
  if(second){const excellent=core.every(Boolean)&&resumeExcellent&&coverExcellent,good=githubOK&&repositoryOK&&coreMet>=3&&resumeGood&&coverGood;status=excellent?'준비 우수':good?'준비 양호':(coreMet>0||resumeGood||coverGood)?'준비 중':'관심 필요'}
  else{const excellent=core.every(Boolean),good=githubOK&&repositoryOK&&coreMet>=3;status=excellent?'준비 우수':good?'준비 양호':coreMet>0?'준비 중':'관심 필요'}
  issues.sort((a,b)=>a.priority-b.priority);
  return{status:status,guide_version:2,github_fresh:githubFresh,github_checked_at:g.checked_at||'',status_explanation:!githubFresh&&repositoryOK?'GitHub 최신 점검 결과가 없어 이전 준비상태를 확정할 수 없습니다.':'',github:{active_days_7d:days,active_days_14d:Number(g.active_days_14d||0),activity_status:g.activity_status||'미점검',inactive_days:g.inactive_days,check_status:g.check_status||'미점검'},repository:{count:count,push_status:repo.push_status||'미점검'},readme:{status:readme.readme_status||'미점검'},portfolio:{registered:portfolioRegistered,status:!portfolioRegistered?'미등록':notionOK?'최근 업데이트':portfolioOK?'정상 접근 가능':notion.activity_status||'등록됨'},documents:second?{resume:student.resume_status||'미작성',cover_letter:student.cover_letter_status||'미작성'}:null,issues:issues,priorityIssues:issues.filter(x=>x.required).slice(0,3)}
}
function readinessContext(){return{github:latestMap('GITHUB_CHECK','student_id'),repository:latestMap('REPOSITORY_CHECK','repo_id'),readme:latestMap('README_CHECK','repo_id'),notion:latestMap('NOTION_CHECK','student_id'),portfolio:latestMap('PORTFOLIO_CHECK','student_id'),blog:latestMap('BLOG_CHECK','student_id'),repos:active('REPOSITORIES'),certs:active('CERTIFICATES')}}
function evaluatedStudent(s,c){const sid=String(s.student_id),repos=c.repos.filter(r=>String(r.student_id)===sid).sort((a,b)=>Number(String(b.is_primary).toLowerCase()==='true')-Number(String(a.is_primary).toLowerCase()==='true')||Number(a.display_order||99)-Number(b.display_order||99)),primary=repos[0]||{},github=c.github[sid]||{},repo=c.repository[String(primary.repo_id)]||{},readme=c.readme[String(primary.repo_id)]||{},notion=c.notion[sid]||{},blog=c.blog[sid]||{},portfolio=c.portfolio[sid]||{},evaluation=evaluateStudentReadiness(s,{github:github,repository:repo,readme:readme,notion:notion,blog:blog,publicPortfolio:portfolio,repositoryCount:repos.length});return{student:s,github:github,repository:repo,readme:readme,notion:notion,blog:blog,repositories:repos,evaluation:evaluation,certificateCount:c.certs.filter(x=>String(x.student_id)===sid&&x.status==='취득').length,portfolioCheck:portfolio}}

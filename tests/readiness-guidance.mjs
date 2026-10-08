import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const sandbox=vm.createContext({Date,JSON,Set,Map,Utilities:{formatDate:d=>d.toISOString().slice(0,10)},READY:{TZ:'Asia/Seoul'}});
for(const file of ['ReadmeService','GithubService','ReadinessService']){
  vm.runInContext(fs.readFileSync('apps-script/'+file+'.gs','utf8'),sandbox,{filename:file+'.gs'});
}
const run=expression=>vm.runInContext(expression,sandbox);
const goodDate=new Date().toISOString();
const oldDate='2020-01-01T00:00:00Z';
const intro='이 프로젝트는 학생의 포트폴리오를 점검하고 취업 준비 내용을 정리합니다.';
sandbox.example='## Issues\n배포를 개선하고 점검 문제를 해결한 경험이 기록되어 있습니다.';
assert.equal(run('analyzeReadme(example).troubleshooting'),false,'Generic Issues header must not pass as troubleshooting');
sandbox.example='## About\n프로젝트를 설명하려는 일반 제목으로 작성한 페이지입니다.';
assert.equal(run('analyzeReadme(example).introduction'),false,'Broad About header must not pass');
sandbox.example='## 트러블슈팅\n문제 원인을 조사하여 로그와 API 응답을 비교했고 적합한 예외 처리를 구현했습니다.';
assert.equal(run('analyzeReadme(example).troubleshooting'),true);
sandbox.example='## 실행 화면\n![시연](images/missing.png)';
sandbox.files=['README.md','src/Main.java'];
assert.equal(run("analyzeReadme(example,files).broken_links_count"),1);
sandbox.files=['README.md','src/Main.java','images/missing.png'];
assert.equal(run("analyzeReadme(example,files).broken_links_count"),0);
sandbox.files=['README.md','src/Main.java'];
assert.equal(run('repoSourcePresent(files)'),true);
sandbox.files=['README.md','docs/info.md'];
assert.equal(run('repoSourcePresent(files)'),false);
function sample(last){
  return {
    student:{grade:'1',portfolio_url:'https://example.com'},
    checks:{
      github:{checked_at:last,check_status:'SUCCESS',active_days_7d:0,inactive_days:25},
      repository:{checked_at:goodDate,check_status:'SUCCESS',description_exists:true,topics_count:1,gitignore_exists:true,license_exists:true,source_exists:true},
      readme:{checked_at:goodDate,check_status:'SUCCESS',readme_status:'README 양호',readme_exists:true,role:true,troubleshooting:true,broken_links_count:0},
      notion:{},publicPortfolio:{checked_at:goodDate,check_status:'SUCCESS',site_available:true},
      repositoryCount:1
    }
  };
}
sandbox.fixture=sample(oldDate);
assert.equal(run("evaluateStudentReadiness(fixture.student,fixture.checks).github_fresh"),false);
let issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(issues.some(x=>x.code==='github_stale'&&!x.required));
assert.ok(!issues.some(x=>x.code==='github_days'||x.code==='github_inactive'));
sandbox.fixture=sample(goodDate);
issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(issues.some(x=>x.code==='github_inactive'&&x.required));
sandbox.fixture.checks.github.active_days_7d=2;
sandbox.fixture.checks.github.inactive_days=1;
issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(issues.some(x=>x.code==='github_days'&&x.evidence.includes('2일')));
sandbox.fixture.checks.github.check_status='PARTIAL';
issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(issues.some(x=>x.code==='github_partial'&&!x.required));
assert.ok(!issues.some(x=>x.code==='github_days'||x.code==='github_inactive'));
sandbox.fixture.checks.github.check_status='FAILED';
issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(!issues.some(x=>x.code==='github_days'||x.code==='github_inactive'));
sandbox.fixture.checks.github.check_status='SUCCESS';
sandbox.fixture.checks.readme.checked_at=oldDate;
issues=Array.from(run('evaluateStudentReadiness(fixture.student,fixture.checks).issues'));
assert.ok(issues.some(x=>x.code==='readme_unchecked'&&!x.required));
assert.ok(!issues.some(x=>x.code==='readme_quality'));
const guide=Array.from(run('readinessGuide()'));
assert.ok(guide.some(x=>x.code==='github_days'&&x.criterion&&x.how));
assert.ok(guide.some(x=>x.code==='readme_quality'&&x.how));
const ui=fs.readFileSync('assets/js/readiness-ui.js','utf8');
for(const wording of ['빨간 경고가 뜨는 이유','왜 표시되나요?','어떻게 고치나요?','README에 필요한 9가지 설명','미점검'])
  assert.ok(ui.includes(wording),'Student UI is missing: '+wording);
console.log('Readiness guidance checks passed');

const README_AREAS={
  introduction:/프로젝트\s*소개|overview|introduction|about/i,
  purpose:/개발\s*(목적|배경)|문제\s*정의|why|motivation|problem\s*(statement|definition)/i,
  features:/주요\s*기능|features?|main\s*features?/i,
  tech_stack:/기술\s*스택|tech\s*stack|technolog(?:y|ies)|사용\s*기술/i,
  architecture:/시스템\s*구조|아키텍처|architecture|system\s*design/i,
  run_guide:/실행\s*방법|설치|installation|getting\s*started|how\s*to\s*run|usage/i,
  screenshots:/실행\s*화면|결과\s*(이미지|화면|설명)|screenshots?|results?|demo/i,
  role:/담당\s*역할|나의\s*역할|내\s*역할|my\s*role|contributions?|역할/i,
  troubleshooting:/트러블\s*슈팅|문제\s*해결|trouble\s*shooting|issues?|problem\s*solving/i
};
function readmeSections(markdown){const out=[];let current={heading:'',body:[]};String(markdown||'').replace(/\r/g,'').split('\n').forEach(line=>{const heading=line.match(/^#{1,6}\s+(.+)/);if(heading){out.push(current);current={heading:heading[1].trim(),body:[]}}else current.body.push(line)});out.push(current);return out}
function meaningfulReadmeText(value){return String(value||'').replace(/!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>|\[[^\]]+\]\([^)]*\)|[`*_#>|\-]/g,' ').replace(/\s+/g,' ').trim()}
function analyzeReadme(markdown){const text=String(markdown||''),sections=readmeSections(text),result={};Object.keys(README_AREAS).forEach(key=>{const section=sections.find(s=>README_AREAS[key].test(s.heading));const body=section?meaningfulReadmeText(section.body.join(' ')):'';const image=section&&/!\[[^\]]*\]\([^)]*\)|<img\b/i.test(section.body.join(' '));const min=key==='role'||key==='troubleshooting'?35:18;result[key]=Boolean(section&&(body.length>=min||(key==='screenshots'&&image)))});if(!result.screenshots&&/!\[[^\]]*\]\([^)]*\)|<img\b/i.test(text))result.screenshots=true;const missing=Object.keys(result).filter(k=>!result[k]);const core=['introduction','purpose','features','tech_stack','run_guide','role','troubleshooting'];const coreMissing=core.filter(k=>!result[k]);result.readme_status=!text.trim()?'README 미작성':meaningfulReadmeText(text).length<100?'README 내용 부족':coreMissing.length?'README 보완 필요':missing.length>2?'README 보완 필요':'README 양호';result.missing_items=missing.join(',');return result}

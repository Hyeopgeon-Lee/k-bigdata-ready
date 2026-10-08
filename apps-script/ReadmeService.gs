// Rules are structural and do not claim to grade technical correctness.
const README_AREAS={
  introduction:/^(?:프로젝트\s*(?:소개|개요)|개요|overview|introduction|about(?:\s+(?:this|the)\s+project)?)$/i,
  purpose:/^(?:개발\s*(?:목적|배경)|문제\s*정의|why|motivation|problem\s*(?:statement|definition)|목표)$/i,
  features:/^(?:주요\s*기능|기능\s*소개|features?|main\s*features?)$/i,
  tech_stack:/^(?:기술\s*스택|사용\s*기술|tech\s*stack|technolog(?:y|ies))$/i,
  architecture:/^(?:시스템\s*구조|아키텍처|architecture|system\s*design)$/i,
  run_guide:/^(?:실행\s*방법|설치(?:\s*및\s*실행)?|installation|getting\s*started|how\s*to\s*run|usage|실행\s*가이드)$/i,
  screenshots:/^(?:실행\s*화면|결과\s*(?:이미지|화면|설명)|screenshots?|results?|demo|시연\s*화면)$/i,
  role:/^(?:담당\s*역할|나의\s*역할|내\s*역할|my\s*role|contributions?|역할\s*및\s*기여)$/i,
  troubleshooting:/^(?:트러블\s*슈팅|문제\s*해결|troubleshooting|trouble\s*shooting|problem\s*solving|장애\s*대응)$/i
};
const README_CORE=['introduction','purpose','features','tech_stack','run_guide','role','troubleshooting'];
function readmeSections(markdown){
  const out=[];let current={heading:'',body:[]};
  String(markdown||'').replace(/\r/g,'').split('\n').forEach(line=>{
    const heading=line.match(/^#{1,6}\s+(.+)/);
    if(heading){out.push(current);current={heading:heading[1].replace(/\s+#+\s*$/,'').trim(),body:[]}}
    else current.body.push(line);
  });out.push(current);return out;
}
function meaningfulReadmeText(value){
  return String(value||'')
    .replace(/\x60{3}[\s\S]*?\x60{3}/g,' ')
    .replace(/!\[[^\]]*\]\([^)]*\)|<img\b[^>]*>/gi,' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g,'$1')
    .replace(/[\x60*_#>|\-]/g,' ').replace(/\s+/g,' ').trim();
}
function usefulReadmeBody(raw,min){
  const text=meaningfulReadmeText(raw);
  if(text.length<min)return false;
  if(/^(?:todo|tbd|추후\s*작성|작성\s*중|내용\s*입력|coming\s*soon|준비\s*중)[\s.!]*$/i.test(text))return false;
  // A repeated short phrase is not a substantial description.
  const words=text.split(/[\s,.;:!?()]+/).filter(Boolean);
  if(words.length>7&&new Set(words.map(x=>x.toLowerCase())).size<4)return false;
  return true;
}
function localReadmeLinks(markdown,files,readmePath){
  if(!Array.isArray(files))return {broken_links_count:'',broken_link_samples:''};
  const known=new Set(files.map(f=>String(f).replace(/^\/+/,'')));
  const folder=String(readmePath||'README.md').split('/').slice(0,-1);
  const broken=[];
  const re=/!?\[[^\]]*\]\((<?[^)\s]+>?)(?:\s+["'][^)]*["'])?\)/g;
  let match;
  while((match=re.exec(String(markdown||'')))!==null){
    let link=match[1].replace(/^<|>$/g,'');
    if(!link||/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(link))continue;
    link=link.split(/[?#]/)[0];
    try{link=decodeURIComponent(link)}catch(e){}
    const parts=link.startsWith('/')?[]:folder.slice();
    link.split('/').forEach(x=>{if(!x||x==='.')return;if(x==='..')parts.pop();else parts.push(x)});
    const target=parts.join('/');
    if(target&&!known.has(target)&&!Array.from(known).some(f=>f.startsWith(target.replace(/\/?$/,'/'))))broken.push(target);
  }
  return {broken_links_count:broken.length,broken_link_samples:broken.slice(0,3).join(' | ')};
}
function analyzeReadme(markdown,files,readmePath){
  const text=String(markdown||''),sections=readmeSections(text),result={rule_version:2};
  Object.keys(README_AREAS).forEach(key=>{
    const matching=sections.filter(s=>README_AREAS[key].test(s.heading));
    const min=key==='role'||key==='troubleshooting'?35:18;
    result[key]=matching.some(section=>{
      const raw=section.body.join('\n');
      const image=/!\[[^\]]*\]\([^)]*\)|<img\b/i.test(raw);
      return usefulReadmeBody(raw,min)||(key==='screenshots'&&image);
    });
  });
  if(!result.screenshots&&/!\[[^\]]*\]\([^)]*\)|<img\b/i.test(text))result.screenshots=true;
  const missing=Object.keys(README_AREAS).filter(k=>!result[k]);
  const coreMissing=README_CORE.filter(k=>!result[k]);
  result.readme_status=!text.trim()?'README 미작성':meaningfulReadmeText(text).length<100?'README 내용 부족':coreMissing.length?'README 보완 필요':'README 양호';
  result.missing_items=missing.join(',');
  Object.assign(result,localReadmeLinks(text,files,readmePath));
  return result;
}

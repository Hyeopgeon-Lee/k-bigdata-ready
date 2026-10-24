// Static, read-only student README example. Keep Markdown as the single source of truth.
const headings=["프로젝트 소개","개발 목적","주요 기능","기술 스택","시스템 구조","설치 및 실행","실행 화면","담당 역할","트러블슈팅"];
const messages=["무엇을 만든 프로젝트인지, 대상 사용자와 범위를 설명합니다.","어떤 문제를 해결하려 했고 왜 시작했는지 작성합니다.","실제로 구현한 기능을 사용자 관점으로 정리합니다.","사용한 언어·프레임워크·DB와 선택 이유를 기록합니다.","요청 흐름, 서버 구성, 데이터 저장 구조를 보여 줍니다.","준비물·설치 명령·실행 순서·환경변수를 안내합니다.","직접 캡처한 화면과 확인한 실행 결과를 제시합니다.","팀 전체가 아닌 본인이 담당한 기능과 근거를 적습니다.","발생한 문제, 원인, 해결, 검증을 구체적으로 기록합니다."];
const root=()=>document.querySelector("#app");
function headingSections(source){
  const matches=[...source.matchAll(/^## (.+)$/gm)];
  return matches.map((match,i)=>({title:match[1].trim(),body:source.slice(match.index+match[0].length,i+1<matches.length?matches[i+1].index:source.length).trim()}));
}
export async function readyReadmeExample(){
  const container=root();
  container.innerHTML='<div class="loading">샘플 README를 불러오는 중…</div>';
  try{
    const response=await fetch("examples/README.sample.md",{cache:"no-cache"});
    if(!response.ok)throw new Error("샘플 README 파일을 가져오지 못했습니다.");
    const markdown=await response.text();
    if(!container.isConnected)return;
    const sections=headingSections(markdown);
    if(sections.length!==headings.length||sections.some((x,i)=>x.title!==headings[i]))throw new Error("README 예시 항목을 확인할 수 없습니다.");
    container.innerHTML='<section class="todo-page readme-sample-page">'+
      '<div class="todo-hero"><p class="eyebrow">README GUIDE</p><h1>샘플 README</h1>'+
      '<p>학과 취업 준비 점검 기준에 맞춘 9개 항목의 작성 예시입니다. 가상 프로젝트이므로 실제 구현 내용으로 바꿔 제출하세요.</p>'+
      '<div class="readme-sample-actions"><button type="button" id="readme-copy">전체 Markdown 복사</button>'+
      '<button type="button" class="secondary" id="readme-download">README.md 파일 저장</button>'+
      '<a href="#/" class="btn secondary">준비 현황으로 돌아가기</a></div>'+
      '<p id="readme-copy-status" class="guide-neutral" role="status" aria-live="polite"></p></div>'+
      '<section class="todo-section"><h2>작성할 9개 항목</h2><nav class="readme-sample-index" aria-label="샘플 README 목차"></nav></section>'+
      '<section class="readme-sample-sections" id="readme-sample-sections" aria-label="README 항목별 예시"></section>'+
      '<section class="todo-section"><details class="guide-full"><summary>전체 README.md 원문 펼쳐 보기</summary><pre class="readme-sample-pre" id="readme-source"></pre></details></section></section>';
    const index=container.querySelector(".readme-sample-index");
    const list=container.querySelector("#readme-sample-sections");
    sections.forEach((section,i)=>{
      const id="sample-section-"+(i+1);
      const a=document.createElement("a");a.href="#/readme-example";a.textContent=(i+1)+". "+section.title;a.addEventListener("click",e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});});index.append(a);
      const article=document.createElement("article");article.className="todo-section readme-sample-section";article.id=id;
      const h=document.createElement("h2");h.textContent=(i+1)+". "+section.title;article.append(h);
      const p=document.createElement("p");p.className="readme-sample-tip";p.textContent=messages[i];article.append(p);
      const pre=document.createElement("pre");pre.className="readme-sample-pre";pre.textContent=section.body;article.append(pre);
      list.append(article);
    });
    container.querySelector("#readme-source").textContent=markdown;
    const status=container.querySelector("#readme-copy-status");
    container.querySelector("#readme-copy").addEventListener("click",async()=>{
      try{await navigator.clipboard.writeText(markdown);status.textContent="전체 README Markdown을 복사했습니다.";}
      catch{status.textContent="자동 복사가 허용되지 않았습니다. 아래 전체 원문을 열어 직접 복사해 주세요.";}
    });
    container.querySelector("#readme-download").addEventListener("click",()=>{
      const blob=new Blob([markdown],{type:"text/markdown;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download="README.md";a.click();
      URL.revokeObjectURL(url);
      status.textContent="README.md 예시 파일 저장을 요청했습니다.";
    });
  }catch(error){
    if(container.isConnected)container.innerHTML='<section class="todo-page"><h1>샘플 README</h1><p class="notice error">샘플을 표시하지 못했습니다. 잠시 후 다시 시도해 주세요.</p><a href="#/">홈으로 돌아가기</a></section>';
  }
}

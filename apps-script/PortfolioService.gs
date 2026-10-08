function checkPublicPortfolio(student){
  const sources=[
    {type:'개인 포트폴리오',url:student.portfolio_url},
    {type:'기술블로그',url:student.blog_url},
    {type:'GitHub Pages',url:student.github_pages_url}
  ].filter(x=>x.url);
  const seen=new Set(),checks=[];
  sources.forEach(({type,url})=>{
    if(seen.has(url))return;
    seen.add(url);
    const detail={type:type,url:String(url),available:false,http_status:'',error:''};
    try{
      const response=UrlFetchApp.fetch(url,{
        muteHttpExceptions:true,followRedirects:true,
        headers:{'User-Agent':'READY-portfolio-monitor'}
      });
      detail.http_status=response.getResponseCode();
      detail.available=detail.http_status>=200&&detail.http_status<400;
      if(!detail.available)detail.error='HTTP '+detail.http_status;
    }catch(e){detail.error=String(e.message||e).slice(0,200)}
    checks.push(detail);
  });
  const available=checks.some(x=>x.available),failed=checks.filter(x=>!x.available);
  return{
    student_id:student.student_id,checked_at:now(),
    url:checks.length?checks[0].url:'',site_available:available,
    check_status:checks.length&&!available?'FAILED':'SUCCESS',
    error_message:failed.map(x=>x.type+': '+x.error).join(' | ').slice(0,500),
    url_results:JSON.stringify(checks)
  };
}
function updatePublicPortfolioCheck(student){
  const result=checkPublicPortfolio(student);
  upsert('PORTFOLIO_CHECK','student_id',result);
  return result;
}

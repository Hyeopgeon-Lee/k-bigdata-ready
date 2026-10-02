function notionPageId(url){
  const match=String(url||'').match(/([0-9a-fA-F]{32})(?:[?#]|$)/);
  return match?match[1].replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/,'$1-$2-$3-$4-$5'):'';
}

function checkNotion(student){
  const checked=now(),token=props().getProperty('NOTION_TOKEN'),pageId=notionPageId(student.notion_url);
  if(!student.notion_url)return{student_id:student.student_id,checked_at:checked,page_id:'',last_edited_at:'',inactive_days:'',activity_status:'미등록',check_status:'SUCCESS',error_message:''};
  if(!token)return{student_id:student.student_id,checked_at:checked,page_id:pageId,last_edited_at:'',inactive_days:'',activity_status:'설정 필요',check_status:'NOT_CONFIGURED',error_message:'NOTION_TOKEN 설정이 필요합니다.'};
  if(!pageId)return{student_id:student.student_id,checked_at:checked,page_id:'',last_edited_at:'',inactive_days:'',activity_status:'확인 필요',check_status:'FAILED',error_message:'Notion 페이지 ID를 URL에서 확인할 수 없습니다.'};
  const response=UrlFetchApp.fetch('https://api.notion.com/v1/pages/'+pageId,{headers:{Authorization:'Bearer '+token,'Notion-Version':'2022-06-28'},muteHttpExceptions:true});
  const code=response.getResponseCode();
  if(code<200||code>=300)return{student_id:student.student_id,checked_at:checked,page_id:pageId,last_edited_at:'',inactive_days:'',activity_status:'확인 필요',check_status:'FAILED',error_message:'Notion HTTP '+code+' '+response.getContentText().slice(0,250)};
  const data=JSON.parse(response.getContentText()),last=data.last_edited_time||'',inactive=last?Math.floor((Date.now()-new Date(last).getTime())/86400000):'',status=inactive===''?'확인 필요':inactive<30?'최근 업데이트':inactive<60?'업데이트 필요':'장기 미업데이트';
  return{student_id:student.student_id,checked_at:checked,page_id:pageId,last_edited_at:last,inactive_days:inactive,activity_status:status,check_status:'SUCCESS',error_message:''};
}

function updateNotionCheck(student){const result=checkNotion(student);upsert('NOTION_CHECK','student_id',result);return result}

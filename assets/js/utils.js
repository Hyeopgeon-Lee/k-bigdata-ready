export const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const fmt=v=>v?new Date(v).toLocaleString('ko-KR'):'없음';
export const badge=v=>{const c=v==='정상'||v==='SUCCESS'?'ok':v==='관심'?'warn':v==='점검 필요'||v==='FAILED'?'bad':'';return `<span class="badge ${c}">${esc(v||'미등록')}</span>`};
export function toast(msg){const x=document.querySelector('#toast');x.textContent=msg;x.classList.add('show');setTimeout(()=>x.classList.remove('show'),2600)}
export const formData=f=>Object.fromEntries(new FormData(f).entries());

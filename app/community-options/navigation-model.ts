// Shared content identities, separate device navigation.
export function deviceDestination(id:string,query:string,device:string){
 const q=new URLSearchParams(query);
 if(['app-input','app-task','app-result'].includes(id)){id='app';q.delete('state');q.delete('task');}
 if(device==='pc'&&id==='community'){id=q.get('tab')==='talk'?'discussion':q.get('tab')==='tutorials'?'tutorials':'aigc';q.delete('tab');}
 else if(device!=='pc'&&['aigc','discussion','tutorials'].includes(id)){q.set('tab',id==='discussion'?'talk':id==='tutorials'?'tutorials':'works');id='community';}
 return {id,query:q.toString()};
}
export function readerVisible(id:string,device:string){return device==='pc'?id!=='community':!['aigc','discussion','tutorials'].includes(id);}
export function readerGroup(section:string,page:{id:string;module:string},device:string){
 if(section!=='c')return page.module;
 if(page.id==='login')return '登录';
 if(device==='pc'){
  if(['aigc','work','community'].includes(page.id))return 'AIGC';
  if(['circles','circle','discussion','post','tutorials','tutorial'].includes(page.id))return '圈子';
 }else if(['community','post','circles','circle','tutorials','tutorial','aigc','discussion'].includes(page.id))return '社区';
 if(['个人管理','账号与通知','积分与任务'].includes(page.module))return '我的';
 if(['作品详情','搜索与作者','资源与跨端'].includes(page.module))return '共用页面';
 return page.module;
}

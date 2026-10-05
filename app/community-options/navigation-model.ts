// Shared content identities, separate device navigation.
export const minePanels:Record<string,string>={'my-content':'content',drafts:'drafts',records:'records',favorites:'favorites',submissions:'submissions','publish-status':'content'};
export function deviceDestination(id:string,query:string,device:string){
 const q=new URLSearchParams(query);
 if(device==='pc'&&['my-relations','my-circles','my-fans'].includes(id)){q.set('panel',({'my-relations':'following','my-circles':'circles','my-fans':'fans'} as Record<string,string>)[id]);id='mine';}
 else if(device!=='pc'&&id==='mine'&&['following','circles','fans'].includes(q.get('panel')||'')){id=({following:'my-relations',circles:'my-circles',fans:'my-fans'} as Record<string,string>)[q.get('panel')!];q.delete('panel');}
 if(id==='resource'){id='app';q.set('item','restore');q.delete('id');q.delete('state');}
 if(device==='pc'&&id==='creation-entry'){id='create';q.delete('state');}
 if(device!=='pc'&&id==='discover-circles')id='circles';
 if(id==='pc-handoff'){id='app';if(!q.has('item'))q.set('item','video');q.delete('state');}
 if(['account-link','return-result'].includes(id)){id='apps';q.delete('state');q.delete('item');}
 if(minePanels[id]){q.set('panel',minePanels[id]);id='mine';}
 if(['app-input','app-task','app-result'].includes(id)){id='app';q.delete('state');q.delete('task');}
 if(device==='pc'&&id==='community'){id=q.get('tab')==='talk'?'discussion':q.get('tab')==='tutorials'?'tutorials':'aigc';q.delete('tab');}
 else if(device!=='pc'&&['aigc','discussion','tutorials'].includes(id)){q.set('tab',id==='discussion'?'talk':id==='tutorials'?'tutorials':'works');id='community';}
 if(device==='pc'&&['discussion','circle'].includes(id))id='circles';
 return {id,query:q.toString()};
}
export function readerVisible(id:string,device:string){return device==='pc'?!['community','discussion','circle','creation-entry','my-relations','my-circles','my-fans'].includes(id):!['aigc','discussion','tutorials','discover-circles','create-result'].includes(id);}
export function readerGroup(section:string,page:{id:string;module:string},device:string){
 if(section!=='c')return page.module;
 if(page.id==='login')return '登录';
 if(device==='pc'){
  if(['aigc','work','community'].includes(page.id))return 'AIGC';
  if(['tutorials','tutorial'].includes(page.id))return '教程';
  if(['circles','discover-circles','circle','discussion','post'].includes(page.id))return '圈子';
 }else if(['work','community','post','circles','circle','tutorials','tutorial','aigc','discussion'].includes(page.id))return '社区';
 if(['个人管理','账号与通知','积分与任务'].includes(page.module))return '我的';
 if(['作品详情','搜索与作者','资源与跨端'].includes(page.module))return '共用页面';
 return page.module;
}

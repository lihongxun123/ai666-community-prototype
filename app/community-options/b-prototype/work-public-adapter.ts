import {readAdminWorks} from './work-management';
import type {BStore,Content,Draft} from './store';
export function mergeAdminWorks(db:BStore):BStore {
 const mapped=readAdminWorks().map(record=>{
 const work=record.status!=='已下架'&&record.publicSnapshot?record.publicSnapshot:record;
 const visible=record.status==='已公开'||(record.status!=='已下架'&&!!record.publicSnapshot);
 const draft:Draft={title:work.title,summary:work.summary,body:work.textBody?[{id:'work-text',type:'段落',text:work.textBody}]:[],cover:work.images[0]||'',author:work.author,owner:'',source:work.official?'官方原创':'用户原创',license:'',conditions:'',refs:[],version:'1.0',device:'手机与电脑',entry:'',permission:'',inputs:'',outputs:work.mediaType,change:'说明更新',review:work.status==='已公开'?'通过':work.status==='已拒绝'?'退回':work.status==='待审核'?'待审':'草稿',verified:true,note:work.prompt,core:work.mediaType==='视频'?work.video||'':work.mediaType==='文本'?work.textBody||'':work.images[0]||'',attachments:[]};
 const safeDraft:Draft=visible?draft:{...draft,title:'',summary:'',body:[],cover:'',author:'',source:'',note:'',core:'',inputs:'',outputs:''};
 return {id:work.id,kind:'work',category:visible?work.category:'',firstPublishedAt:visible?(work.publicAt||work.created):undefined,publicStatus:visible?'公开':record.status==='已下架'?'下架':'私有',runtime:'可用',public:visible?draft:null,draft:safeDraft,revision:work.logs.length,publishedRevision:Math.max(2,work.logs.length),authorized:work.official,recommended:work.hot&&work.status==='已公开',reason:'',history:[],adminWork:visible?{...work,logs:[],publicSnapshot:undefined}:undefined} as Content;
 });
 const ids=new Set(mapped.map(row=>row.id));return {...db,records:[...db.records.filter(row=>!ids.has(row.id)),...mapped]};
}

import type {ContentModel} from './content-model';
import type {BStore,Content,Draft} from './store';

/** Consumer snapshots omit unpublished inputs and moderation metadata. */
export function mergeManagedContent(base:BStore,model:ContentModel):BStore{
 const managed=model.records;
 const records=base.records.filter(r=>!['post','app','tutorial'].includes(r.kind));
 // Missing managed IDs are tombstones, never a fallback to an older public fixture.
 for(const previous of base.records.filter(r=>['post','app','tutorial'].includes(r.kind)&&!managed.some(m=>m.id===r.id)))records.push({...previous,publicStatus:'已删除',public:null,draft:{...previous.draft,title:'',summary:'',body:[],inputs:'',outputs:'',entry:'',cover:''},managed:true});
 for(const item of managed){
  const previous=base.records.find(r=>r.id===item.id),published=item.visibility==='已公开'?item.published:null;
  const value:Draft={title:published?.title||'',summary:published?.summary||'',body:published?(item.kind==='post'?[{id:'body',type:'段落',text:published.body},...(published.media?published.media.split('|').filter(Boolean).map((media,index)=>({id:'media-'+index,type:/\.(mp4|webm|mov)(\?|$)/i.test(media)||media.startsWith('data:video/')?'视频' as const:'图片' as const,text:media})):[])]:published.blocks):[],cover:published?.cover||'',author:item.author,owner:item.maintainer,source:published?.source||'',license:published?.license||'',conditions:item.kind==='tutorial'?published?.preparation||'':'',refs:published?.refs||[],version:'1.0',device:published?.device||'',entry:published?.entry||'',permission:'',inputs:published?.inputs||'',outputs:published?.outputs||'',change:'说明更新',review:'通过',verified:false,note:'',core:published?.media||'',attachments:[]};
  const record:Content={id:item.id,kind:item.kind,publicStatus:item.visibility==='已下架'?'下架':item.visibility==='已公开'&&published?'公开':'私有',runtime:item.runtime,public:published?value:null,draft:structuredClone(value),revision:item.revision,publishedRevision:item.revision,authorized:true,recommended:previous?.recommended||false,reason:'',history:[],managed:true,firstPublishedAt:item.firstPublishedAt||undefined,circle:published?.circle||'',circleId:published?.circleId,media:published?.media||'',category:published?.category||''};
  records.push(record);
 }
 return {...base,records};
}

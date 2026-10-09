'use client';
import {useEffect,useSyncExternalStore} from 'react';
import type {AppEditorial} from '../app-editorial';
import {readContentModel} from './content-model';
import {mergeManagedContent} from './content-consumer-adapter';
import {mergeAdminWorks} from './work-public-adapter';
export type Kind='work'|'post'|'tutorial'|'app'|'resource';
export type Block={id:string;type:'Markdown'|'段落'|'标题'|'图片'|'视频'|'表格'|'可复制示例'|'链接'|'资源引用';text:string};
export type Draft=AppEditorial&{title:string;summary:string;body:Block[];cover:string;author:string;owner:string;source:string;license:string;conditions:string;refs:string[];version:string;device:string;entry:string;permission:string;inputs:string;outputs:string;change:'说明更新'|'执行更新';review:'草稿'|'待审'|'通过'|'退回';verified:boolean;note:string;core:string;attachments:string[]};
export type Content={adminWork?:import('./work-management').Work;managed?:boolean;firstPublishedAt?:string;circle?:string;circleId?:string;media?:string;category?:string;id:string;kind:Kind;publicStatus:'私有'|'公开'|'下架'|'已删除';runtime:'可用'|'待核验'|'暂停';public:Draft|null;draft:Draft;revision:number;publishedRevision:number;authorized:boolean;recommended:boolean;reason:string;history:{at:string;action:string;detail:string}[]};
export type BStore={records:Content[];active:string};
export const kindLabels:Record<Kind,string>={work:'作品',post:'帖子',tutorial:'教程',app:'AI 应用',resource:'资源'};
export const kinds=Object.keys(kindLabels) as Kind[];
export const makeNowAppHandoff='/community-options/cross-prototype?page=app&item=copy';
export function blank(kind:Kind):Draft{return {title:'',summary:'',body:[{id:'b1',type:'段落',text:''}],cover:'',author:'',owner:'内容编辑',source:kind==='tutorial'?'官方原创':'',license:'',conditions:'',refs:[],version:'1.0',device:'电脑端',entry:'',permission:'允许查看与复制',inputs:'',outputs:kind==='app'?'':'图片',change:'说明更新',review:'草稿',verified:false,note:'',core:'',attachments:[]};}
const titles:Record<Kind,string>={work:'旧照修复练习',post:'给旧照片修复时，我先做了这三件事',tutorial:'旧照片修复：从判断破损到复查',app:'文案改写',resource:'旧照修复参考工程'};
function seed():BStore{
 const base:BStore={active:'tutorial-1',records:kinds.map(kind=>{const d:Draft={...blank(kind),author:'林间',title:titles[kind],summary:kind==='app'?'把已有文字改得更清楚，适合发布和分享。':kind==='tutorial'?'先观察破损，再逐处修复并复查。':'用于展示创作结果与方法。',body:[{id:'b1',type:'标题',text:kind==='app'?'适合用来':'准备材料'},{id:'b2',type:'段落',text:kind==='app'?'整理产品介绍、调整社交文案、改写日常表达。':'保留未经修改的原图，观察划痕与细节，先完成小范围处理，再与原图对照。'}],conditions:kind==='app'?'':'准备原图副本；精细操作在电脑端完成。',cover:kind==='app'?'writing':'restore',core:kind==='work'?'/home-prototype/restore.png':'',license:'原作者已授权展示与按许可复用',entry:kind==='app'?makeNowAppHandoff:kind==='resource'?'MakeNow / 旧照修复参考工程':'',inputs:kind==='app'?'原文，以及用途和语气要求。':'原图副本；在电脑端使用 MakeNow 项目',outputs:kind==='app'?'一份可继续编辑的改写文案。':'图片',device:kind==='app'?'手机与电脑':'电脑端',review:'通过',verified:kind!=='app',source:kind==='work'||kind==='post'?'用户原创':'官方原创',refs:kind==='tutorial'?['resource-1']:[]};return {id:kind+'-1',kind,publicStatus:'公开',runtime:kind==='app'||kind==='resource'?'可用':'待核验',public:structuredClone(d),draft:structuredClone(d),revision:1,publishedRevision:1,authorized:kind!=='post',recommended:true,reason:'',history:[{at:'2026-09-26 09:00',action:'首次公开',detail:'保留原作者与对象身份'}]};})};
 const tutorial=base.records.find(r=>r.id==='tutorial-1')!;
 const work=base.records.find(r=>r.id==='work-1')!;
 for(const [id,title,author,core] of [['work-sea','日落之前','陈屿','/home-prototype/sea.png'],['work-perfume','一瓶夏日晴光','鹿与光','/home-prototype/perfume.png']] as const){const published={...structuredClone(work.draft),title,author,core};base.records.push({...structuredClone(work),id,public:structuredClone(published),draft:structuredClone(published)});}
 base.records.push({...structuredClone(tutorial),id:'tutorial-2',publicStatus:'私有',public:null,draft:{...structuredClone(tutorial.draft),title:'',body:[{id:'b1',type:'段落',text:''}],license:'',review:'草稿'},revision:0,publishedRevision:0,recommended:false,history:[]});
 base.records.push({...structuredClone(tutorial),id:'tutorial-3',publicStatus:'私有',public:null,draft:{...structuredClone(tutorial.draft),title:'旧照片修复步骤',review:'退回',note:'请补充原作者授权与资源使用条件'},revision:1,publishedRevision:0,recommended:false,history:[{at:'2026-09-25 14:00',action:'审核退回',detail:'待补充材料'}]});
 base.records.push({...structuredClone(tutorial),id:'tutorial-4',draft:{...structuredClone(tutorial.draft),title:'旧照片修复：进阶复查',review:'待审'},revision:2,publishedRevision:1,recommended:false,history:[...tutorial.history,{at:'2026-09-26 10:00',action:'提交审核',detail:'公开旧版本继续展示'}]});
 const post=base.records.find(r=>r.id==='post-1')!;
 base.records.push({...structuredClone(post),id:'post-2',publicStatus:'私有',public:null,draft:{...structuredClone(post.draft),title:'修复失败后我改了哪些步骤',review:'待审'},revision:1,publishedRevision:0,recommended:false,history:[{at:'2026-09-26 10:30',action:'提交审核',detail:'等待审核'}]});
 return base;
}
let fallback='';function emptySnapshot(){if(!fallback)fallback=JSON.stringify(seed());return fallback;}
function storageKey(){if(typeof window==='undefined')return 'b-prototype';const q=new URLSearchParams(location.search);return q.has('embed')?'b-prototype-review:'+q.get('page')+':'+q.get('state'):'b-prototype';}
const subscribe=(cb:()=>void)=>{window.addEventListener('b-prototype-change',cb);window.addEventListener('storage',cb);window.addEventListener('ai666-content-model-change',cb);window.addEventListener('ai666-work-admin-change',cb);return ()=>{window.removeEventListener('b-prototype-change',cb);window.removeEventListener('storage',cb);window.removeEventListener('ai666-content-model-change',cb);window.removeEventListener('ai666-work-admin-change',cb);};};
function readString(){const raw=typeof window==='undefined'?emptySnapshot():localStorage.getItem(storageKey()) || emptySnapshot();if(typeof window==='undefined')return raw;try{return JSON.stringify(mergeAdminWorks(mergeManagedContent(JSON.parse(raw),readContentModel())));}catch{return raw;}}
export function readB():BStore{try{return JSON.parse(readString());}catch{return seed();}}
function upgradeLegacyApp(data:BStore){
 const app=data.records.find(r=>r.id==='app-1'&&r.kind==='app');
 if(!app)return false;
 const current=seed().records.find(r=>r.id==='app-1')!.draft;
 let changed=false;
 const replace=(d:Draft|null)=>{
  if(!d)return;
  const legacy:Partial<Record<keyof Draft,string>>={entry:'社区文案改写',summary:'按用途调整文字的语气与结构。',conditions:'准备需要改写的原文。生成前确认本次积分。',inputs:'原文、用途与语气',outputs:'文字'};
  for(const key of Object.keys(legacy) as (keyof typeof legacy)[]){if(d[key]===legacy[key]){(d as unknown as Record<string,unknown>)[key]=current[key];changed=true;}}
  const previousSummary={"了解文案改写的适用场景、准备材料与输出；使用时前往 MakeNow。":"把已有文字改得更清楚，适合发布和分享。","待改写的原文；具体材料以 MakeNow 目标页为准":"原文，以及用途和语气要求。","改写后的文字；以 MakeNow 实际结果为准":"一份可继续编辑的改写文案。","使用 MakeNow 前请核对目标页说明与账号条件。":""};
  for(const key of ['summary','inputs','outputs','conditions'] as const){if(Object.hasOwn(previousSummary,d[key])){d[key]=(previousSummary as Record<string,string>)[d[key]];changed=true;}}
  if(d.body?.length===2&&d.body[0].text==='使用说明'&&d.body[1].text==='准备原文，先阅读用途与输出说明；实际操作在 MakeNow 中完成。'){d.body=structuredClone(current.body);changed=true;}
  if(d.body?.length===2&&d.body[0].text==='输入要求'&&d.body[1].text==='粘贴原文，选择用途与语气，生成后逐句检查内容。'){d.body=structuredClone(current.body);changed=true;}
 };
 replace(app.draft);replace(app.public);
 return changed;
}
function mergeSeed(){if(typeof window==='undefined')return;try{const key=storageKey(),raw=localStorage.getItem(key);if(!raw)return;const data=JSON.parse(raw) as BStore;if(!Array.isArray(data.records))return;const additions=seed().records.filter(r=>['work-sea','work-perfume','tutorial-2','tutorial-3','tutorial-4','post-2'].includes(r.id)&&!data.records.some(x=>x.id===r.id));const upgraded=upgradeLegacyApp(data);if(!additions.length&&!upgraded)return;data.records.push(...additions);localStorage.setItem(key,JSON.stringify(data));window.dispatchEvent(new Event('b-prototype-change'));}catch{/* retain current prototype data */}}
export function useB(){useEffect(()=>{mergeSeed();},[]);const raw=useSyncExternalStore(subscribe,readString,emptySnapshot);return JSON.parse(raw) as BStore;}
export function writeB(data:BStore){localStorage.setItem(storageKey(),JSON.stringify(data));try{const raw=new URLSearchParams(location.search).has('embed')?null:localStorage.getItem('bp-published-features');if(raw){const feeds=JSON.parse(raw) as {works:string[];posts:string[]};const eligible=(id:string)=>data.records.some(r=>r.id===id&&r.publicStatus==='公开'&&r.recommended);const next={works:(feeds.works||[]).filter(eligible),posts:(feeds.posts||[]).filter(eligible)};if(next.works.length!==feeds.works?.length||next.posts.length!==feeds.posts?.length){localStorage.setItem('bp-published-features',JSON.stringify(next));window.dispatchEvent(new Event('bp-operations-change'));}}}catch{/* local prototype storage */}window.dispatchEvent(new Event('b-prototype-change'));}
export function changeRecord(id:string,action:string,detail:string,change:(r:Content)=>Content){const db=readB();db.records=db.records.map(r=>r.id===id?{...change(structuredClone(r)),history:[...r.history,{at:new Date().toLocaleString('zh-CN',{hour12:false}),action,detail}]}:r);writeB(db);}
export function getPublished(kind:Kind){if(typeof window==='undefined')return null;try{const db=JSON.parse(localStorage.getItem('b-prototype')||'null') as BStore|null;return db?.records.find(r=>r.id===kind+'-1') || null;}catch{return null;}}
export function newRecord(kind:Kind){const db=readB();const id=kind+'-'+Date.now().toString(36);db.records.unshift({id,kind,publicStatus:'私有',runtime:'待核验',public:null,draft:blank(kind),revision:0,publishedRevision:0,authorized:true,recommended:false,reason:'',history:[]});db.active=id;writeB(db);return id;}




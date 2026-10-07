import type {Content} from '../b-prototype/store';

export type TutorialCard={id:string;title:string;cover:string;topic:string;views:number;sections:string[][];target?:string};
export const tutorialRecordId=(item:string)=>item.startsWith('tutorial-')?item:'tutorial-'+(item==='restore'?'1':item);
export const tutorialImage=(cover:string)=>/^(\/|https?:|blob:|data:)/.test(cover)?cover:'/home-prototype/'+(cover||'restore')+'.png';

// Keep the established sample composition until a matching managed tutorial exists.
export function publicTutorialRows(records:Content[],samples:TutorialCard[]):TutorialCard[]{
 const represented=new Set(samples.map(t=>tutorialRecordId(t.id)));
 const rows=samples.flatMap(t=>{
  const record=records.find(r=>r.kind==='tutorial'&&r.id===tutorialRecordId(t.id));
  if(!record)return t.id==='restore'?[]:[{...t,target:'tutorial?item='+t.id}];
  if(record.publicStatus!=='公开'||!record.public)return [];
  const d=record.public;
  return [{...t,title:d.title,cover:d.cover||t.cover,topic:record.category||d.source||t.topic,target:'tutorial?id='+record.id}];
 });
 for(const r of records){
  if(r.kind!=='tutorial'||represented.has(r.id)||r.publicStatus!=='公开'||!r.public)continue;
  rows.push({id:r.id,title:r.public.title,cover:r.public.cover||'restore',topic:r.category||r.public.source||'创作教程',views:0,sections:[],target:'tutorial?id='+r.id});
 }
 return rows;
}

import type { DeepDive, Source } from './research-types';
export const source=(title:string,url:string,date:string,note:string,type='官方'):Source=>({title,url,date,note,type});
export const route=(items:[string,string][])=>items.map(([behavior,friction],i)=>({stage:['发现与进入','第一次做成','再次使用','贡献给别人'][i],behavior,friction}));
export const deep=(value:Omit<DeepDive,'images'>):DeepDive=>({...value,images:[]});

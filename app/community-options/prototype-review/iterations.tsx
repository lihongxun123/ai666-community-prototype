import {AppHandoff} from './app-handoff-view';
import {ResultHandoff} from './result-handoff-view';
import data from './iterations.json';
export const iterations=[{id:1,title:'社区改版',status:'已完成'},{id:2,title:'MakeNow 互通',status:'进行中'}];
export const features=data.features;
export function pageIterations(section:string,page:string){return [...new Set(features.filter(f=>f.section===section&&f.page===page).map(f=>f.iteration))];}
export function iterationScope(iteration:number,section:string,page:string){return features.filter(f=>f.iteration===iteration&&f.section===section&&f.page===page);}
export function IterationScope({iteration,section,page}:{iteration:number;section:string;page:string}){const rows=iterationScope(iteration,section,page);if(section==='cross')return <section className="rv-iteration-scope"><strong>历史跨产品方案 · 非本次定稿范围</strong><p>保留追溯，不纳入第二期已确认范围。</p></section>;return <section className="rv-iteration-scope" aria-label="本期范围"><strong>{iterations[iteration-1].status} · 第{iteration}期</strong>{rows.map(f=><p key={f.id}>{f.scope}</p>)}</section>;}
export function DeepIntegration({chain,mode}:{chain:string;mode:string}){return chain==='makenow-result'?<ResultHandoff mode={mode}/>:<AppHandoff mode={mode}/>;}

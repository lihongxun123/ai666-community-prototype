import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { comparisonMetric, comparisonDomain } from './lib/public-data-helpers.ts';
import { publicDataMethod } from './lib/public-data-method.ts';
import { publicDataInsights } from './lib/public-data-insights.ts';

const root=import.meta.dirname;
const output=path.resolve(root,'../v4');
const filename=path.join(root,'lib/public-data.json');
const data=JSON.parse(fs.readFileSync(filename,'utf8'));
const expected=['liblib','runninghub','tusi','civitai','seaart','openart','nightcafe','jimeng','kling','midjourney','leonardo','runway','waytoagi','datawhale','huggingface','modelscope','linuxdo','dify'];
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message);};
check(JSON.stringify(data.map(profile=>profile.id))===JSON.stringify(expected),'18-profile scope/order changed');
for(const profile of data){
  for(const key of ['id','name','summary'])check(typeof profile[key]==='string'&&profile[key].trim(),`${profile.id}: missing ${key}`);
  for(const key of ['domains','observations','interpretations','gaps','sources'])check(Array.isArray(profile[key])&&profile[key].length,`${profile.id}: empty ${key}`);
  const ids=profile.sources.map(source=>source.id);
  check(new Set(ids).size===ids.length,`${profile.id}: repeated source ID`);
  for(const source of profile.sources){
    for(const key of ['id','title','url','publisher','accessedAt','accessNote'])check(typeof source[key]==='string'&&source[key].trim(),`${profile.id}/${source.id}: missing ${key}`);
    check(source.publishedAt===null||typeof source.publishedAt==='string',`${source.id}: invalid publication date`);
    try{check(new URL(source.url).protocol==='https:',`${source.id}: non-HTTPS source`);}catch{errors.push(`${source.id}: invalid URL`);}
  }
  for(const item of profile.observations){
    const name=`${profile.id}/${item.sourceId}/${item.key}/${item.period}`;
    for(const key of ['key','metric','value','unit','period','scope','provider','sourceId','limitation'])check(typeof item[key]==='string'&&item[key].trim(),`${name}: missing ${key}`);
    check(item.domain===null||profile.domains.includes(item.domain)||(item.provider==='GitHub'&&item.domain.startsWith('github.com')),`${name}: domain outside profile`);
    check(['page','search-index','unavailable'].includes(item.evidenceStatus),`${name}: invalid evidence status`);
    check(ids.includes(item.sourceId),`${name}: unresolved source`);
    check(item.numericValue===null||Number.isFinite(item.numericValue),`${name}: invalid numeric value`);
    if(item.evidenceStatus==='unavailable')check(item.numericValue===null,`${name}: unavailable must not have a number`);
    if(item.numericValue!==null&&item.key.endsWith('_pct')&&!item.key.endsWith('mom_pct'))check(item.numericValue>=0&&item.numericValue<=100,`${name}: percentage out of range`);
    if(item.key==='app_mau')check(item.domain===null,`${name}: App MAU assigned to website`);
  }
  for(const key of ['visits','mom_pct','duration_seconds','pages_per_visit','bounce_pct','direct_pct']){
    const metric=comparisonMetric(profile,key);
    if(metric)check(metric.domain===comparisonDomain(profile)&&metric.provider==='Semrush'&&metric.period==='2026-07'&&metric.evidenceStatus==='page'&&metric.numericValue!==null,`${profile.id}: mixed comparison scope`);
  }
  const content=JSON.stringify(profile);
  check(!/主线程|Internal Error|source-excerpts|turn\d+(?:view|search)\d+|Bearer\s|BEGIN PRIVATE KEY|appgprj_|[?&](?:auth_token|access_token|gclid)=/.test(content),`${profile.id}: internal/private marker`);
  check(!/AI666/i.test(content),`${profile.id}: old brand in public text`);
}
const july=data.filter(profile=>comparisonMetric(profile,'visits'));
check(july.length===13,'Expected 13 July Semrush primary domains');
for(const id of ['liblib','seaart','jimeng','datawhale','dify'])check(!comparisonMetric(data.find(profile=>profile.id===id),'visits'),`${id}: unavailable/other-source metric entered July table`);
for(const [id,value] of [['runninghub',1380000],['civitai',12830000],['midjourney',11090000],['huggingface',46290000],['linuxdo',9260000]])check(comparisonMetric(data.find(profile=>profile.id===id),'visits')?.numericValue===value,`${id}: July value changed`);
for(const essay of [...publicDataMethod,...publicDataInsights])check(essay.title&&essay.paragraphs.length&&(essay.refs.length||essay.title==='这一轮数据对团队选择的影响'),`Uncited essay: ${essay.title}`);
const sourceRecords=data.flatMap(profile=>profile.sources);
const validation={checkedAt:new Date().toISOString(),status:errors.length?'failed':'passed',profileCount:data.length,observationCount:data.reduce((sum,profile)=>sum+profile.observations.length,0),sourceRecords:sourceRecords.length,uniqueSourceUrls:new Set(sourceRecords.map(source=>source.url)).size,comparison:{provider:'Semrush',month:'2026-07',coverage:july.length,domainScope:'One specified domain per dossier; Direct is desktop, other table metrics all devices',missing:data.filter(profile=>!comparisonMetric(profile,'visits')).map(profile=>profile.id)},dataSha256:crypto.createHash('sha256').update(fs.readFileSync(filename)).digest('hex'),profiles:data.map(profile=>({id:profile.id,observations:profile.observations.length,sources:profile.sources.length,hasJulyComparison:!!comparisonMetric(profile,'visits')})),errors,boundary:'Structural and scope validation; does not independently verify provider estimates, actual users, revenue or retention.'};
fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(output,'research-validation.json'),JSON.stringify(validation,null,2)+'\n');
if(errors.length){console.error(JSON.stringify(validation,null,2));process.exit(1);}
const md=['# 多元拾光：18 个 AI 社区公开数据补充研究','','核验截至 2026-09-09。来源包括 Semrush、Similarweb、AICPB、官网活动统计及开源组织页。访问次数为第三方估计，与真实用户、月活、支付、收入和留存分别讨论。','','## 同月比较范围','',`${july.length}/18 家取得指定域名的 Semrush 2026 年 7 月 Visits。其余缺口不按零计算，其他月份或供应商不拼入同一曲线。`,''];
for(const essay of [...publicDataInsights,...publicDataMethod]){md.push(`## ${essay.title}`,'',...essay.paragraphs.flatMap(paragraph=>[paragraph,'']),essay.refs.map(ref=>`[${ref.title}](${ref.url})`).join('；'),'');}
for(const profile of data){
  md.push(`## ${profile.name}`,'',profile.summary,'',`观察域名：${profile.domains.join('、')}`,'','### 数据支持的判断','',...profile.interpretations.flatMap(text=>[text,'']),'### 逐项数据','');
  for(const source of profile.sources){
    const records=profile.observations.filter(observation=>observation.sourceId===source.id);
    md.push(`#### ${source.publisher}：${source.title}`,'',`[来源原页](${source.url})；发布日期：${source.publishedAt??'未标注'}；查阅：${source.accessedAt}。${source.accessNote}`,'');
    for(const observation of records)md.push(`- **${observation.metric}：${observation.value}**。${observation.period}；${observation.domain??'App 指标'}；${observation.scope}。${observation.limitation}`);
    md.push('');
  }
  md.push('### 仍缺少什么','',...profile.gaps.map(gap=>`- ${gap}`),'');
}
fs.writeFileSync(path.join(output,'report-source.md'),md.join('\n'));
fs.writeFileSync(path.join(output,'claim-source-ledger.json'),JSON.stringify({checkedAt:validation.checkedAt,data,insights:publicDataInsights,method:publicDataMethod},null,2)+'\n');
console.log(JSON.stringify({status:validation.status,profiles:validation.profileCount,observations:validation.observationCount,sources:validation.sourceRecords,uniqueSources:validation.uniqueSourceUrls,comparableJuly:july.length},null,2));

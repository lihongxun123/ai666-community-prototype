import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const base=import.meta.dirname;
const out=path.resolve(base,'../v2');
const cache=new Map();
function load(name){
 const filename=path.resolve(base,'lib',name.endsWith('.ts')?name:`${name}.ts`);
 if(cache.has(filename))return cache.get(filename);
 const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};cache.set(filename,module.exports);
 new Function('exports','require','module',code)(module.exports,id=>load(id),module);
 return module.exports;
}
const {profiles}=load('profiles');
const {synthesis,evidence}=load('synthesis');
const errors=[];
const expected=['liblib','runninghub','tusi','civitai','seaart','openart','nightcafe','jimeng','kling','midjourney','leonardo','runway','waytoagi','datawhale','huggingface','modelscope','linuxdo','dify'];
if(JSON.stringify(profiles.map(p=>p.id))!==JSON.stringify(expected))errors.push('Profile membership or order differs from 18-profile scope.');
const markers=/turn\d+(?:view|search)\d+|appgprj_|BEGIN PRIVATE KEY|Bearer\s+[A-Za-z0-9]|studio_token=|siwc_bypass|[?&](?:workspace|teamId|auth_token|gclid)=/i;
function checkText(value,key=''){
 if(typeof value==='string'){
  if(markers.test(value))errors.push('Sensitive/internal marker in content: '+key);
  if(!['url','website','file'].includes(key)&&/AI666|私人团队|UI[／/]UX.{0,5}团队/.test(value))errors.push('Obsolete visible copy in '+key+': '+value.slice(0,70));
 } else if(Array.isArray(value))value.forEach(v=>checkText(v,key));
 else if(value&&typeof value==='object')for(const [k,v]of Object.entries(value))checkText(v,k);
}
checkText(profiles);checkText(synthesis);checkText(evidence);
const images=[];
const coverage=profiles.map(p=>{
 if(!p.deep||!p.deep.website||!p.access)errors.push(p.id+': missing dossier fields');
 if(p.sections.length<5||p.sources.length<4)errors.push(p.id+': insufficient coverage');
 if(p.deep.ux.length<2||p.deep.tradeoffs.length<2||p.deep.route.length!==4)errors.push(p.id+': missing experience / tradeoffs / journey');
 if(!p.deep.images.length)errors.push(p.id+': no valid research screenshot');
 for(const s of p.sources){try{if(new URL(s.url).protocol!=='https:')errors.push(p.id+': non-HTTPS source');}catch{errors.push(p.id+': malformed URL');}if(!s.title||!s.date||!s.note)errors.push(p.id+': incomplete source metadata');}
 for(const s of p.sections){if(['事实','历史'].includes(s.status)&&!s.refs?.length)errors.push(p.id+': factual section has no source');for(const n of s.refs||[])if(!Number.isInteger(n)||n<1||n>p.sources.length)errors.push(p.id+': invalid source ref '+n);}
 for(const t of p.deep.tradeoffs)for(const k of ['title','action','reason','cost','signal'])if(!t[k])errors.push(p.id+': missing tradeoff '+k);
 if(p.deep.task&&(!Number.isInteger(p.deep.task.attempts)||p.deep.task.attempts<0||p.deep.task.attempts>3))errors.push(p.id+': generation cap not respected');
 for(const img of p.deep.images){
  const local=path.join(base,'public',img.file);
  if(!fs.existsSync(local)){errors.push(p.id+': missing '+img.file);continue;}
  const bytes=fs.readFileSync(local);
  const format=bytes.subarray(1,4).toString()==='PNG'?'png':bytes[0]===0xff&&bytes[1]===0xd8?'jpg':'unknown';
  if(bytes.length<3000||format==='unknown'||!img.file.endsWith('.'+format))errors.push(p.id+': image format / extension mismatch');
  images.push({profile:p.id,...img,format,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),review:'Root visually inspected source or final crop; account areas excluded. Native screenshot encoding retained. Not a browser QA of this report.'});
 }
 return {id:p.id,name:p.name,sections:p.sections.length,sources:p.sources.length,images:p.deep.images.length,taskRecorded:!!p.deep.task,receivedGenerations:p.deep.task?.attempts||0,chineseCharacters:(JSON.stringify(p).match(/[\u3400-\u9fff]/g)||[]).length,access:p.access};
});
const page=fs.readFileSync(path.join(base,'components/research.tsx'),'utf8');
for(const match of page.matchAll(/navigate\('([^']+)'\)/g))if(![...expected,'overview','matrix','strategy','evidence'].includes(match[1]))errors.push('Invalid navigation '+match[1]);
if(!page.includes("raw==='tensor'?'tusi':raw"))errors.push('Missing historical Tensor anchor alias');
if(/21 个|\/ 21|className="application"|私人团队/.test(page))errors.push('Obsolete UI copy / duplicate action section');
const received=coverage.reduce((n,p)=>n+p.receivedGenerations,0);
if(received!==5)errors.push('Generation ledger no longer matches the five observed accepted jobs.');
fs.mkdirSync(out,{recursive:true});
const validation={checkedAt:new Date().toISOString(),status:errors.length?'failed':'passed',edition:2,profileCount:profiles.length,sourceRecordCount:profiles.reduce((n,p)=>n+p.sources.length,0),uniqueSourceUrls:new Set(profiles.flatMap(p=>p.sources.map(s=>s.url))).size,imageCount:images.length,imageCoverage:new Set(images.map(i=>i.profile)).size,receivedGenerations:received,successfulImagePlatforms:['tusi','openart','jimeng','kling'],referenceImageContinuation:'OpenArt: 2 accepted and successful image jobs, second used saved first image as reference.',coverage,errors,checks:{sourceReferenceIndexes:true,scopeAndAlias:true,visibleBrandAndInternalMarkerScan:true,screenshotFilesAndHashes:true,taskSubmissionLimit:true,reportBrowserQA:'Not performed; no explicit request for QA of the report Site. Competitor-page screenshots are separate evidence.'}};
fs.writeFileSync(path.join(out,'research-validation.json'),JSON.stringify(validation,null,2)+'\n');
console.log(JSON.stringify({status:validation.status,profiles:validation.profileCount,sources:validation.sourceRecordCount,uniqueSources:validation.uniqueSourceUrls,images:validation.imageCount,imageCoverage:validation.imageCoverage,receivedGenerations:received,errors},null,2));
if(errors.length)process.exit(1);
if(!process.argv.includes('--finalize'))process.exit(0);
const canonical=path.join(out,'report-source.md');
if(fs.existsSync(canonical))throw Error('The canonical V2 report already exists; do not silently regenerate it.');
const lines=['# 多元拾光｜18 个 AI 社区深度调研（第二轮）','','研究基准：2026 年 9 月 8–9 日。适用对象：多元拾光产品、运营与经营决策者。','吐司与 Tensor.Art 合并，移除飞桨 AI Studio 与 Coze；LINUX DO 只做公开研究。','结论：先以一位合作作者、4–5 位有近期重复任务的使用者验证一种方法，再决定扩大哪类社区供给。',''];
function essay(s,level='##',p){lines.push(`${level} ${s.title}（${s.status}）`,'',...s.paragraphs.flatMap(t=>[t,'']));if(s.refs?.length&&p)lines.push('依据：'+s.refs.map(n=>`[${p.sources[n-1].title}](${p.sources[n-1].url})`).join('；'),'');}
synthesis.forEach(s=>essay(s));
for(const p of profiles){
 lines.push(`## ${p.name}`,'',`官网：[${p.name}](${p.deep.website})`+(p.id==='tusi'?'；[Tensor.Art](https://tensor.art/)':''),'',p.thesis,'',`服务任务：${p.job}`,`核心内容：${p.object}`,`使用路径（非全部实测）：${p.first}`,`供给与商业：${p.supply}；${p.business}`,`复访推断：${p.repeat}`,'',`核验范围：${p.access}`,'',`追问：${p.deep.question}`,'','### 页面证据','');
 for(const i of p.deep.images)lines.push(`![${i.title}](../site/public${i.file})`,'',`${i.kind}；${i.date}；[原页](${i.url})。${i.observation} ${i.limitation}`,'');
 if(p.deep.task){const t=p.deep.task;lines.push('### 本轮实际操作','',t.scope,'',...t.steps.map((s,i)=>`${i+1}. ${s}`),'',`结果：${t.result}`,`接收生成任务：${t.attempts} 次。${t.limit}`,'');}
 lines.push('### 从发现到再次使用（路径分析）','',...p.deep.route.map(r=>`- ${r.stage}：${r.behavior} 可能阻塞：${r.friction}`),'');
 p.sections.forEach(s=>essay(s,'###',p));
 lines.push('### 界面与操作体验（观察与分析）','',...p.deep.ux.flatMap(t=>[t,'']),'### 四人团队怎样取舍（建议）','');
 for(const t of p.deep.tradeoffs)lines.push(`#### ${t.title}`,'',`先做什么：${t.action}`,'',`为什么：${t.reason}`,'',`需要付出：${t.cost}`,'',`何时扩大或调整：${t.signal}`,'');
 lines.push('### 待验证假设与资料不足','',...p.gaps.map(g=>`- ${g}`),'','### 来源与时间边界','');p.sources.forEach((s,i)=>lines.push(`${i+1}. [${s.title}](${s.url}) — ${s.type}；${s.date}。${s.note}`));lines.push('');
}
evidence.forEach(s=>essay(s));
fs.writeFileSync(canonical,lines.join('\n'));
const previous=JSON.parse(fs.readFileSync(path.resolve(base,'../claim-source-ledger.json'),'utf8'));
const native=Object.fromEntries(Object.entries(previous.nativeReferenceGroups).filter(([k])=>expected.includes(k)||k==='tensor'));
native.midjourney.push('turn168view0');native.leonardo.push('turn168view1');native.dify.push('turn168view3');native.datawhale.push('turn123view0','turn143view0','turn148view0','turn143view1','turn148view1','turn143view2','turn148view2');native.waytoagi.push('turn148view3');native.linuxdo.push('turn123view2');
const ledger={edition:2,canonical:'report-source.md',researchDate:'2026-09-09',sha256:crypto.createHash('sha256').update(fs.readFileSync(canonical)).digest('hex'),sources:profiles.flatMap(p=>p.sources.map((s,i)=>({id:`${p.id}-${i+1}`,profile:p.id,...s,access:p.access}))),claims:profiles.flatMap(p=>p.sections.map((s,i)=>({id:`${p.id}-section-${i+1}`,profile:p.id,title:s.title,status:s.status,claims:s.paragraphs,sourceIds:(s.refs||[]).map(n=>`${p.id}-${n}`)}))),journeyAndTradeoffs:profiles.map(p=>({profile:p.id,question:p.deep.question,journey:p.deep.route,experience:p.deep.ux,tradeoffs:p.deep.tradeoffs,status:'analysis and recommendations; task completion is recorded separately'})),taskRecords:profiles.filter(p=>p.deep.task).map(p=>({profile:p.id,...p.deep.task})),nativeReferenceGroups:native,note:'Native reference IDs retained internally only. Web report uses descriptive source links. Current operation evidence is root-observed; screenshots are scoped to avoid account fields.'};
fs.writeFileSync(path.join(out,'claim-source-ledger.json'),JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(path.join(out,'screenshot-manifest.json'),JSON.stringify({capturedAt:'2026-09-09',images},null,2)+'\n');
fs.writeFileSync(path.join(out,'research-access-log.json'),JSON.stringify({scope:coverage,comparativeTask:'Fictional unbranded white ceramic cup; models and languages differ, so this is a task-flow study, not a quality benchmark.',acceptedJobCounts:{tusi:1,openart:2,jimeng:1,kling:1},submissionButtonActivations:{tusi:3,openart:2,jimeng:2,kling:1},stoppedBeforeGeneration:['liblib: free-resource deduction source unconfirmed','runninghub: repeated setup notices in this session','tensor: free and visibility conditions not confirmed','seaart: non-public output condition unconfirmed','civitai: browser tool access policy','nightcafe: Studio browser tool access policy','midjourney: no free web / Discord trial','leonardo: personal terms onboarding','runway: personal identity onboarding'],readOnlyTemplateObservations:['dify','modelscope'],publicResearchOnly:['huggingface','waytoagi','datawhale','linuxdo'],excluded:['aistudio','coze'],sameProductGroup:['tusi','tensor'],stopReason:'18 dossiers have primary sources, observed/documented page evidence, differentiated UX analysis and specific team tradeoffs. Permitted image task paths were exercised within the free, non-public, three-submission cap. Remaining gaps require account setup, visibility assurance, paid access, real users, or data not exposed publicly.'},null,2)+'\n');
console.log('V2 canonical report, claim ledger, access log and screenshot manifest finalized.');

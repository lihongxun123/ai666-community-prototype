import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import ts from 'typescript';
const base=path.resolve(import.meta.dirname);
const out=path.dirname(base);
const cache=new Map();
function load(name){
 const filename=path.resolve(base,'lib',name.endsWith('.ts')?name:`${name}.ts`);
 if(cache.has(filename))return cache.get(filename);
 const source=fs.readFileSync(filename,'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 cache.set(filename,module.exports);
 new Function('exports','require','module',code)(module.exports,id=>load(id),module);
 return module.exports;
}
const {profiles}=load('profiles');
const {synthesis,evidence}=load('synthesis');
const errors=[];
if(profiles.length!==21)errors.push(`Expected 21 profiles; got ${profiles.length}`);
if(new Set(profiles.map(p=>p.id)).size!==21)errors.push('Duplicate profile IDs');
const coverage=profiles.map(p=>{
 if(p.sources.length<4)errors.push(`${p.id}: fewer than 4 sources`);
 if(p.sections.length<5)errors.push(`${p.id}: fewer than 5 substantive sections`);
 if(!p.access||p.gaps.length<2)errors.push(`${p.id}: missing access / gaps`);
 for(const src of p.sources){try{const u=new URL(src.url);if(u.protocol!=='https:')errors.push(`Not HTTPS: ${src.url}`);}catch{errors.push(`Invalid URL: ${src.url}`);}if(!src.title||!src.date||!src.note)errors.push(`${p.id}: incomplete source metadata`);}
 for(const section of p.sections){for(const n of section.refs??[]){if(!Number.isInteger(n)||n<1||n>p.sources.length)errors.push(`${p.id}: invalid ref ${n}`);}if((section.status==='事实'||section.status==='历史')&&!section.refs?.length)errors.push(`${p.id}: sourced section has no references`);}
 return {id:p.id,name:p.name,group:p.group,sections:p.sections.length,sources:p.sources.length,chineseCharacters:(JSON.stringify(p).match(/[\u3400-\u9fff]/g)||[]).length,access:p.access};
});
const page=fs.readFileSync(path.join(base,'components/research.tsx'),'utf8');
const ids=['overview','matrix','strategy','evidence'];
const navRefs=[...page.matchAll(/navigate\('([^']+)'\)/g)].map(m=>m[1]);
for(const id of navRefs)if(!ids.includes(id)&&!profiles.some(p=>p.id===id))errors.push(`Invalid navigation: ${id}`);
for(const text of [JSON.stringify(profiles),JSON.stringify(synthesis),JSON.stringify(evidence)]){
 if(/turn\d+(?:view|search|reddit)\d+|appgprj_|BEGIN PRIVATE KEY|Bearer\s+[A-Za-z0-9]/.test(text))errors.push('Internal citation or credential marker in user content');
}
const validation={checkedAt:new Date().toISOString(),status:errors.length?'failed':'passed',profileCount:profiles.length,sourceRecordCount:profiles.reduce((a,p)=>a+p.sources.length,0),uniqueSourceUrls:new Set(profiles.flatMap(p=>p.sources.map(s=>s.url))).size,groups:Object.fromEntries([...new Set(profiles.map(p=>p.group))].map(g=>[g,profiles.filter(p=>p.group===g).length])),coverage,errors,checks:{profileSchema:true,referenceIndexes:true,urlSyntax:true,staticNavigationTargets:true,internalMarkerScan:true,browserVisualQA:'not performed; Sites skill requires explicit request',endToEndGeneration:'not performed; public read-only research'},build:'see delivery-validation.json',globalScaffoldLint:'19 errors in unmodified unused starter components/hooks; report app/lib lint passes'};
fs.writeFileSync(path.join(out,'research-validation.json'),JSON.stringify(validation,null,2)+'\n');
console.log(JSON.stringify({status:validation.status,profiles:validation.profileCount,sources:validation.sourceRecordCount,groups:validation.groups,errors},null,2));
if(errors.length)process.exit(1);
if(!process.argv.includes('--finalize'))process.exit(0);
const canonical=path.join(out,'report-source.md');
if(fs.existsSync(canonical))throw new Error('Canonical report already exists. Review before regenerating.');
const lines=['# 多元拾光｜21 个 AI 社区深度调研','', '受众：AI666 产品、运营与经营决策者。','资料基准：2026-09-08；整理完成：2026-09-09。','范围：21 个候选平台的公开资料研究；用户选择浏览网页报告。','', '## 结论','先建立一小组可复用案例与真实任务，再决定社区要长成什么样。当前证据支持探索可用方法与作者反馈，尚不能确定目标人群或证明社区功能的留存增量。','', '## 前提与假设','以用户本轮陈述为准：2 位全栈研发、1 产品、1 运营；主营为廉价 Token/API 与 MakeNow；暂无成熟案例、稳定作者、客户；画布分享复制尚未上线。', ''];
for(const section of synthesis){lines.push(`## ${section.title}（${section.status}）`,'',...section.paragraphs.flatMap(p=>[p,'']));}
for(const p of profiles){
 lines.push(`## ${p.name}`,'',`**结论：** ${p.thesis}`,'',`**类型／任务：** ${p.group}；${p.job}`,`**核心对象：** ${p.object}`,`**首次使用：** ${p.first}`,`**供给：** ${p.supply}`,`**复访推断：** ${p.repeat}`,`**商业：** ${p.business}`,'',`**核验边界：** ${p.access}`,'');
 for(const section of p.sections){lines.push(`### ${section.title}（${section.status}）`,'',...section.paragraphs.flatMap(t=>[t,'']));if(section.refs?.length)lines.push('依据：'+section.refs.map(n=>`[${p.sources[n-1].title}](${p.sources[n-1].url})`).join('；'),'');}
 lines.push('### 最小验证建议','',p.experiment,'',`暂不复制：${p.notCopy}`,'','### 资料不足','',...p.gaps.map(t=>`- ${t}`),'','### 来源记录','');
 p.sources.forEach((s,i)=>lines.push(`${i+1}. [${s.title}](${s.url}) — ${s.type}；${s.date}。${s.note}`));lines.push('');
}
for(const section of evidence)lines.push(`## ${section.title}（${section.status}）`,'',...section.paragraphs.flatMap(p=>[p,'']));
fs.writeFileSync(canonical,lines.join('\n'));
const native={liblib:[],runninghub:[],tusi:['turn29view3'],tensor:['turn110view0'],civitai:['turn93view0','turn96view1','turn96view2','turn81view0','turn80view2','turn96view0'],seaart:['turn53view0','turn58view0','turn51view0','turn55view3'],openart:['turn58view1','turn51view3','turn58view2','turn51view2','turn58view4'],nightcafe:['turn20view0'],jimeng:[],kling:[],midjourney:['turn73search2','turn73search10','turn76search1','turn85view0'],leonardo:['turn110view1','turn108view0'],runway:['turn85view2','turn85search0','turn108view1','turn85view1'],waytoagi:['turn106view0','turn106view1'],datawhale:['turn95view2','turn99view0','turn106view2','turn106view3'],huggingface:['turn94view3','turn95view0'],modelscope:[],aistudio:['turn66view0','turn66view1','turn64view1'],linuxdo:['turn94view0','turn94view1','turn99view1','turn99view2'],dify:['turn110view2','turn70view3','turn70view1'],coze:['turn110view3','turn88view0','turn90view0','turn90view1']};
const ledger={report:'report-source.md',researchCutoff:'2026-09-08',assembledAt:new Date().toISOString(),note:'Native references are preserved from current thread and research-lane handoffs. Website contains descriptive URLs only. Publication date unknown stays unknown.',sources:profiles.flatMap(p=>p.sources.map((s,i)=>({id:`${p.id}-${i+1}`,profile:p.id,title:s.title,publisherOrAuthor:s.type==='官方'?p.name:s.type.includes('官方')?`${p.name} / ${s.type}`:`${s.type} / ${new URL(s.url).hostname}`,publicationOrUpdate:s.date,url:s.url,accessNotes:s.note,profileAccess:p.access}))),claims:profiles.flatMap(p=>p.sections.map((section,i)=>({id:`${p.id}-section-${i+1}`,profile:p.id,title:section.title,status:section.status,claims:section.paragraphs,sourceIds:(section.refs||[]).map(n=>`${p.id}-${n}`),confidence:section.status==='建议'||section.status==='推断'?'analysis; not measured':p.access.includes('索引')?'primary / indexed evidence with access boundaries':'public-source evidence; not authenticated test'}))),nativeReferenceGroups:native,officialBrowserEvidence:{civitaiProposal:'site/.playwright-cli/page-2026-09-08T15-39-00-215Z.yml',civitaiCollaboration:'site/.playwright-cli/page-2026-09-08T15-41-35-034Z.yml',runninghub:'site/.playwright-cli/page-2026-09-08T15-31-52-424Z.yml'},sha256:crypto.createHash('sha256').update(fs.readFileSync(canonical)).digest('hex')};
fs.writeFileSync(path.join(out,'claim-source-ledger.json'),JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(path.join(out,'research-search-log.json'),JSON.stringify({researchCutoff:'2026-09-08',scope:profiles.map(p=>p.name),lanes:['国内创作六家：作者招募、奖励、创作路径与当前协议','全球创作七家：生成、社群、项目扶持与反证','开发五家：模型/模板/插件/技能与共享边界','根研究：学习共建、LINUX DO、关键交叉验证和业务综合'],targetedGapSearches:['Liblib 联合创始人早期定向邀约','吐司 2026 激励停止通知','Tensor.Art 2026 新规则覆盖旧指南','Civitai 官方浏览器读取提案和协作公告','Hugging Face Spaces 当前创建/复制条件','WaytoAGI 创始人口述与历史共学奖励','Datawhale 组队作业和贡献流程','LINUX DO 推广规则与 Credit 服务边界','Leonardo 暂停申请、OpenArt Fund Coming Soon、Runway 基金重定向','Dify 2026 正式发布与 Coze 分对象变现'],stopReason:'All 21 profiles have >=4 sources, substantive mechanism/history/limits, tailored application and explicit missing evidence. High-impact rules cross-checked; further general searches unlikely to resolve private retention or actual generation success. No paid/login/outreach was performed.'},null,2)+'\n');
console.log('Canonical internal report and claim/source ledger created.');

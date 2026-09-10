'use client';
/* oxlint-disable next/no-img-element -- Evidence screenshots keep their native encoding, load lazily and link to the original file. */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Menu, X } from 'lucide-react';
import { profiles } from '@/lib/profiles';
import { LinuxDoLoginUpdate } from '@/components/linuxdo-login';
import { ResearchFramework, ToolSupportProfile } from '@/components/research-framework';
import { ResearchProgress } from '@/components/research-progress';
import { MakeNowStudy } from '@/components/makenow-study';
import { StrategyComparison } from '@/components/strategy-comparison';
import { ChinaAIUsers } from '@/components/china-ai-users';
import { AudienceResearch } from '@/components/audience-research';
import { type Section } from '@/lib/research-types';
import { evidence } from '@/lib/synthesis';
import { BusinessOverview, BusinessProfile } from '@/components/business-research';
import type { BusinessProfileData } from '@/lib/business-types';
import businessData from '@/lib/business-data.json';
import { businessInsights } from '@/lib/business-synthesis';
import { PublicDataOverview, PublicDataProfileSection } from '@/components/public-data-research';
import type { PublicDataProfile } from '@/lib/public-data-types';
import publicData from '@/lib/public-data.json';
import { publicDataMethod } from '@/lib/public-data-method';
import { publicDataInsights } from '@/lib/public-data-insights';
import { ContentOverview, ContentProfile } from '@/components/content-research';
import { ValidationOverview } from '@/components/validation-research';
import { EvidenceUpdateOverview, EvidenceUpdateProfile } from '@/components/evidence-update';
import type { EvidenceUpdate } from '@/lib/evidence-update-types';
import evidenceUpdateJson from '@/lib/evidence-update.json';
import { OperationsDocument, ContentDocument, StudyProfileLinks } from '@/components/study-documents';
import type { StudyDocument, OperatingStudy, ContentStudy } from '@/lib/study-types';
import operatingJson from '@/lib/platform-operations.json';
import contentJson from '@/lib/content-forms.json';

const businessProfiles: BusinessProfileData[] = businessData;
const businessById = new Map(businessProfiles.map(profile => [profile.id, profile]));
const publicProfiles = publicData as PublicDataProfile[];
const publicById = new Map(publicProfiles.map(profile => [profile.id, profile]));
const evidenceUpdate=evidenceUpdateJson as EvidenceUpdate;
const evidenceById=new Map(evidenceUpdate.profiles.map(profile=>[profile.id,profile]));
const operatingStudy=operatingJson as StudyDocument<OperatingStudy>;
const contentStudy=contentJson as StudyDocument<ContentStudy>;
const operatingById=new Map(operatingStudy.profiles.map(profile=>[profile.id,profile]));
const contentById=new Map(contentStudy.profiles.map(profile=>[profile.id,profile]));

import {topViews} from '@/lib/research-navigation';
import {ResearchDirectory} from '@/components/research-directory';
import {ResearchSidebar} from '@/components/research-sidebar';
import {ResearchBrief} from '@/components/research-brief';
import {ResearchPlatformFilter} from '@/components/research-platform-filter';

function revealSection(id:string){const target=document.getElementById(id);for(let node=target?.parentElement;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;}target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});}
function filterProfiles(query:string,group:string){return profiles.filter(p=>{const business=businessById.get(p.id);return (group==='全部'||p.group===group)&&`${p.name} ${p.focus} ${p.job} ${p.object} ${operatingById.get(p.id)?.position||''} ${contentById.get(p.id)?.forms.map(c=>c.name).join(' ')||''} ${business?.payer||''} ${business?.segments.map(segment=>`${segment.name} ${segment.job}`).join(' ')||''}`.toLowerCase().includes(query.trim().toLowerCase());});}
export default function Research(){
 const [view,setView]=useState('overview'); const [query,setQuery]=useState(''); const [group,setGroup]=useState('全部'); const [mobile,setMobile]=useState(false); const [selected,setSelected]=useState<string[]>([]);
 const [studyQuery,setStudyQuery]=useState(''); const [studyGroup,setStudyGroup]=useState('全部');
 const [sectionTarget,setSectionTarget]=useState<{view:string;sectionId:string}|null>(null);
 useEffect(()=>{const read=()=>{const raw=decodeURIComponent(location.hash.slice(1));const hash=raw==='tensor'?'tusi':raw;setView(profiles.some(p=>p.id===hash)||topViews.some(t=>t[0]===hash)?hash:'overview');setSectionTarget(null);setMobile(false);};read();window.addEventListener('hashchange',read);return()=>window.removeEventListener('hashchange',read);},[]);
 const navigate=(id:string,anchor?:string)=>{window.history.pushState(null,'',`#${id}`);if(anchor){setStudyQuery('');setStudyGroup('全部');}setSectionTarget(anchor?{view:id,sectionId:anchor}:null);setView(id);setMobile(false);window.scrollTo({top:0,behavior:'instant'});};
 useEffect(()=>{if(sectionTarget?.view===view){revealSection(sectionTarget.sectionId);setSectionTarget(null);}},[view,sectionTarget]);
 const showAudience=(id:string)=>navigate('audience',`audience-profile-${id}`);
 const showBusiness=(id:string)=>navigate(id,'commercial');
 const showData=(id:string)=>navigate(id,'public-data');
 const showContent=(id:string)=>navigate(id,'content-observations');
 const showStudy=(kind:'operations'|'content',id:string)=>navigate(kind,`${kind}-${id}`);
 const showEvidence=(id:string)=>navigate(id,'evidence-update');
 const filtered=useMemo(()=>filterProfiles(query,group),[query,group]);
 const studyFiltered=useMemo(()=>filterProfiles(studyQuery,studyGroup),[studyQuery,studyGroup]);
 const platformFilter=<ResearchPlatformFilter query={studyQuery} setQuery={setStudyQuery} group={studyGroup} setGroup={setStudyGroup} count={studyFiltered.length}/>;
 const p=profiles.find(x=>x.id===view); const index=p?profiles.indexOf(p):-1;
 const toggle=(id:string)=>setSelected(prev=>prev.includes(id)?prev.filter(v=>v!==id):prev.length<3?[...prev,id]:prev);
 const rows=selected.length?profiles.filter(x=>selected.includes(x.id)):filtered;
 return <div className="research-shell">
 <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();window.scrollTo({top:0});}}>跳到正文</a>
 <header className="app-header"><button className="mobile-menu icon-button" onClick={()=>setMobile(!mobile)} aria-label="打开目录" aria-expanded={mobile}><Menu size={20}/></button><button className="brand" onClick={()=>navigate('overview')}><span className="brand-icon"><BookOpen size={17}/></span> 多元拾光 <span className="brand-divider">/</span><span className="brand-sub">研究室</span></button><span className="header-meta">AI 社区观察 · 运营与内容 · 2026.09.10</span><button onClick={()=>navigate('evidence')} className="download"><BookOpen size={15}/><span>来源与方法</span></button></header>
 {mobile&&<button className="sidebar-scrim" onClick={()=>setMobile(false)} aria-label="关闭目录"/>}
 <ResearchSidebar view={view} navigate={navigate} mobile={mobile} query={query} setQuery={setQuery} group={group} setGroup={setGroup} profiles={profiles} filtered={filtered}/>
 <main id="main" className="report-main" tabIndex={-1}>
 <div className="breadcrumb"><span>研究报告</span><span>/</span><span>{p?p.group:topViews.find(t=>t[0]===view)?.[1]}</span></div>
 {view==='overview'&&<ResearchDirectory navigate={navigate}/>}
 {view==='report'&&<ResearchBrief navigate={navigate}/>}
 {view==='matrix'&&<>
 <div className="page-heading"><h1>平台对照</h1></div>
 <div className="compare-controls"><p>选择最多 3 家并排对照。{selected.length>0?`已选 ${selected.length} 家。`:'未选择时显示目录筛选结果。'}</p>{selected.length>0&&<button className="text-button" onClick={()=>setSelected([])}>清空选择 <X size={14}/></button>}</div>
 <div className="compare-options">{profiles.map(item=><button aria-pressed={selected.includes(item.id)} disabled={selected.length===3&&!selected.includes(item.id)} className={selected.includes(item.id)?'chosen':''} key={item.id} onClick={()=>toggle(item.id)}>{selected.includes(item.id)&&<Check size={13}/>} {item.name}</button>)}</div>
 <div className="table-wrap"><table className="comparison-table"><thead><tr><th>竞品 / 类型</th><th>用户与核心内容</th><th>首次使用路径</th><th>作者供给与商业</th><th>复访机制（推断）</th><th>适用条件</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><th><button onClick={()=>navigate(item.id)}>{item.name}<ArrowUpRight size={14}/></button><small>{item.group}</small></th><td>{item.job}<small>{item.object}</small></td><td>{item.first}</td><td>{item.supply}<small>{item.business}</small></td><td>{item.repeat}</td><td>{item.relevance}<small>暂不复制：{item.notCopy}</small></td></tr>)}</tbody></table></div>
 {rows.length===0&&<p className="empty">没有匹配结果，请清除左侧筛选。</p>}
 </>}
{view==='progress'&&<ResearchProgress navigate={navigate}/>}
{view==='china-users'&&<ChinaAIUsers navigate={navigate}/>}
{view==='audience'&&<AudienceResearch navigate={navigate}/>}
 {view==='makenow'&&<MakeNowStudy navigate={navigate}/>}
 {view==='discussion'&&<><ResearchFramework navigate={navigate}/></>}
 {view==='validation'&&<ValidationOverview/>}
 {view==='operations'&&<OperationsDocument data={operatingStudy} visibleIds={studyFiltered.map(p=>p.id)} navigate={navigate} filter={platformFilter}/>}
 {view==='content'&&<ContentDocument data={contentStudy} visibleIds={studyFiltered.map(p=>p.id)} navigate={navigate} filter={platformFilter}/>}
 {view==='supplement'&&<>{platformFilter}<EvidenceUpdateOverview data={evidenceUpdate} visibleIds={studyFiltered.map(p=>p.id)} onSelect={showEvidence}/></>}
 {view==='tasks'&&<><ContentOverview onSelect={showContent}/></>}
 {view==='data'&&<><div className="study-actions"><button className="text-button" onClick={()=>navigate('supplement')}>经营规则与使用证据 <ArrowRight size={14}/></button></div>{platformFilter}<PublicDataOverview data={publicProfiles.filter(item=>studyFiltered.some(profile=>profile.id===item.id))} allData={publicProfiles} methods={publicDataMethod} insights={publicDataInsights} onSelect={showData}/></>}
 {view==='business'&&<>{platformFilter}<BusinessOverview data={businessProfiles.filter(item=>studyFiltered.some(profile=>profile.id===item.id))} insights={businessInsights} onSelect={showBusiness}/></>}
{view==='strategy'&&<><StrategyComparison navigate={navigate}/></>}
 {view==='evidence'&&<>
 <div className="page-heading"><h1>来源与研究限制</h1></div>
 {evidence.map((section,i)=><Essay key={section.title} section={section} number={i+1}/>)}
 <div className="evidence-register"><h2>逐家来源覆盖</h2><p className="muted">{profiles.reduce((a,p)=>a+p.sources.length,0)} 条来源记录（按档案计，含重复域名与历史资料）。数量不代表证据强弱。</p>{profiles.map(item=><button key={item.id} onClick={()=>navigate(item.id)}><strong>{item.name}</strong><span>{item.sources.length} 条来源</span><span>{item.access}</span><ArrowRight size={15}/></button>)}</div>
 </>}
 {p&&<article className="platform-dossier" key={p.id}>
 <div className="page-heading profile-heading"><h1>{p.name}</h1><p className="focus-line">{p.focus}</p>{p.deep&&<div className="official-links"><a href={p.deep.website} target="_blank" rel="noreferrer">访问官网 <ArrowUpRight size={15}/></a>{p.id==='tusi'&&<a href="https://tensor.art/" target="_blank" rel="noreferrer">Tensor.Art 官网 <ArrowUpRight size={15}/></a>}</div>}<p className="lead">{p.thesis}</p></div>
 <div className="study-actions"><button className="text-button" onClick={()=>showAudience(p.id)}>{p.name}用户画像与产品价值 →</button></div>
 <div className="profile-summary"><div><span>服务谁</span><p>{p.job}</p></div><div><span>核心内容</span><p>{p.object}</p></div><div><span>首次使用路径</span><p>{p.first}</p></div></div>
 <div className="access-note"><strong>访问与操作核验</strong><p>{p.access}</p></div>
 <nav className="article-toc" aria-label="快速跳转">{[...(p.id==='linuxdo'?[['linuxdo-login',"登录补核"]]:[]),['independent-studies','运营与内容专题'],['evidence-update','经营与使用证据'],...(['runninghub','liblib','tusi'].includes(p.id)?[['content-observations',"内容与任务"]]:[]),['public-data','公开数据与访问行为'],['commercial','商业化、规模与用户'],['page-evidence','页面证据'],...(p.deep?.task?[['task-log','实际操作']]:[]),['experience','界面与操作体验'],['tradeoffs',"采用条件与代价"],['source-list','来源记录']].map(([id,label])=><a key={id} href={`#${p.id}`} onClick={e=>{e.preventDefault();revealSection(id);}}>{label}</a>)}</nav>
 <details className="profile-section-group" open><summary>内容与运营</summary>
 {p.id==='linuxdo'&&<LinuxDoLoginUpdate/>}
 <ToolSupportProfile id={p.id} navigate={navigate}/>
 {operatingById.has(p.id)&&contentById.has(p.id)&&<StudyProfileLinks operations={operatingById.get(p.id)!} content={contentById.get(p.id)!} onOpen={showStudy}/>}
 <ContentProfile id={p.id} onOpen={()=>navigate('tasks')}/>
 </details>
 <details className="profile-section-group"><summary>商业化与公开数据</summary>
 {evidenceById.has(p.id)&&<EvidenceUpdateProfile data={evidenceById.get(p.id)!}/>}
 {publicById.has(p.id)&&<PublicDataProfileSection data={publicById.get(p.id)!}/>}
 {businessById.has(p.id)&&<BusinessProfile data={businessById.get(p.id)!}/>}
 </details>
 {p.deep&&<details className="profile-section-group"><summary>界面与实际操作</summary>
 <section className="research-focus"><h2>这家最值得追问的事</h2><p>{p.deep.question}</p></section>
 <section className="research-gallery" id="page-evidence"><div className="section-heading"><h2>页面证据</h2><span>点击图片查看大图</span></div>{p.deep.images.length?p.deep.images.map(img=><figure key={img.file}><a href={img.file} target="_blank" rel="noreferrer"><img src={img.file} alt={img.title} loading="lazy"/></a><figcaption><div><strong>{img.title}</strong><span>{img.kind} · {img.date}</span></div><p>{img.observation}</p><p className="muted">{img.limitation}</p><a href={img.url} target="_blank" rel="noreferrer">研究原页 <ArrowUpRight size={13}/></a></figcaption></figure>):<p className="access-note">核心页面尚未取得有效截图。保留资料分析，具体访问限制见本档案；不以空白页或验证页代替。</p>}</section>
 {p.deep.task&&<section className="task-record" id="task-log"><div className="section-heading"><h2>实际操作</h2><span>{p.deep.task.date}</span></div><p>{p.deep.task.scope}</p><ol>{p.deep.task.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><p><strong>结果：</strong>{p.deep.task.result}</p><p className="muted">已接收生成任务 {p.deep.task.attempts} 次；按钮重试与未接收情况见记录。{p.deep.task.limit}</p></section>}
 <section className="journey"><h2>从发现到再次使用</h2><p className="muted">下表分析产品提供的路径及可能阻塞；实际完成范围以上方记录为准。</p><div className="table-wrap"><table><thead><tr><th>阶段</th><th>用户在做什么</th><th>哪里可能卡住</th></tr></thead><tbody>{p.deep.route.map(r=><tr key={r.stage}><th>{r.stage}</th><td>{r.behavior}</td><td>{r.friction}</td></tr>)}</tbody></table></div></section>
 </details>}
 <details className="profile-section-group"><summary>平台分析与采用条件</summary>
 <nav className="article-toc" aria-label="本档案章节">{p.sections.map((section,i)=><a key={section.title} href={`#${p.id}`} onClick={e=>{e.preventDefault();revealSection(`section-${i}`);}}>{String(i+1).padStart(2,'0')} {section.title}</a>)}</nav>
 <div className="article-body">{p.sections.map((section,i)=><section key={section.title} id={`section-${i}`} className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(i+1).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((para,j)=><p key={j}>{para}</p>)}{section.refs&&<div className="citations"><span>依据</span>{section.refs.map(n=><a key={n} href={p.sources[n-1].url} target="_blank" rel="noreferrer">[{n}] {p.sources[n-1].title}<ArrowUpRight size={12}/></a>)}</div>}</section>)}</div>
 {p.deep&&<>
 <section className="essay-section" id="experience"><div className="section-heading"><h2>界面与操作体验</h2><span className="status status-推断">观察与分析</span></div>{p.deep.ux.map((para,i)=><p key={i}>{para}</p>)}</section>
 <section className="tradeoffs" id="tradeoffs"><div className="section-heading"><h2>采用条件与代价</h2><span className="status status-建议">建议</span></div>{p.deep.tradeoffs.map((trade,i)=><article key={trade.title}><h3><span>{String(i+1).padStart(2,'0')}</span>{trade.title}</h3><dl><dt>先做什么</dt><dd>{trade.action}</dd><dt>为什么</dt><dd>{trade.reason}</dd><dt>需要付出</dt><dd>{trade.cost}</dd><dt>何时扩大或调整</dt><dd>{trade.signal}</dd></dl></article>)}</section>
 </>}

 </details>
 <details className="profile-section-group"><summary>来源与资料缺口</summary>
 <section className="unknowns"><h2>待验证假设与资料缺口</h2><ul>{p.gaps.map(g=><li key={g}>{g}</li>)}</ul></section>
 <section className="sources" id="source-list"><div className="section-heading"><h2>来源与时间边界</h2><span>采集 09-08 · 补核 09-09</span></div>{p.sources.map((src,i)=><div className="source-row" key={`${src.url}-${i}`}><span className="source-number">{i+1}</span><div><a href={src.url} target="_blank" rel="noreferrer">{src.title}<ArrowUpRight size={14}/></a><p>{src.note}</p><small>{src.type} · {src.date}</small></div></div>)}</section>
 </details>
 <div className="page-turn"><button onClick={()=>navigate(index===0?'overview':profiles[index-1].id)}><ArrowLeft size={17}/><span><small>上一篇</small>{index===0?'研究目录':profiles[index-1].name}</span></button><button onClick={()=>navigate(index===profiles.length-1?'strategy':profiles[index+1].id)}><span><small>下一篇</small>{index===profiles.length-1?'社区方案对照':profiles[index+1].name}</span><ArrowRight size={17}/></button></div>
 </article>}
 <footer className="report-footer"><span>多元拾光 · AI社区研究</span><span>资料截至 2026.09.10</span></footer>
 </main></div>
}
function Essay({section,number}:{section:Section;number:number}){return <section className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(number).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>}

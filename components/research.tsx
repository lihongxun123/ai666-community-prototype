'use client';
import {PlanningReferenceNotice} from './research-stage';

import {CompetitorTopic,topicIds} from './competitor-topics';
import {PlatformDigest,PlatformDigestNav,digestById} from './platform-digest';
import {LiblibReadingNav} from './liblib-reading-nav';
/* oxlint-disable next/no-img-element -- Evidence screenshots keep their native encoding, load lazily and link to the original file. */
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, X } from 'lucide-react';
import { isPlanningSection } from '@/lib/research-planning';
import { profiles } from '@/lib/profiles';
import { LinuxDoLoginUpdate } from '@/components/linuxdo-login';
import { ResearchFramework, ToolSupportProfile } from '@/components/research-framework';
import { ResearchProgress } from '@/components/research-progress';
import {PlatformReview} from '@/components/platform-review';
import {RepresentativeEvidence} from '@/components/representative-evidence';
import { MakeNowStudy } from '@/components/makenow-study';
import { StrategyComparison } from '@/components/strategy-comparison';
import {CategoryProfile} from '@/components/category-paths';
import {FunctionProfile,functionProfiles} from '@/components/function-pages';
import { ChinaAIUsers } from '@/components/china-ai-users';
import { IndustryResearch } from './industry-research';
import { SocialResearch } from './social-research';
import { AudienceResearch } from '@/components/audience-research';
import { CreatorSupply,CreatorSupplyLink } from '@/components/creator-supply';
import { ContentDemand } from '@/components/content-demand';
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

function revealSection(id:string){const target=document.getElementById(id);if(target instanceof HTMLDetailsElement)target.open=true;for(let node=target?.parentElement;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;}target?.scrollIntoView({block:'start'});target?.focus({preventScroll:true});}
function filterProfiles(query:string,group:string){return profiles.filter(p=>{const business=businessById.get(p.id);return (group==='全部'||p.group===group)&&`${p.name} ${p.focus} ${p.job} ${p.object} ${operatingById.get(p.id)?.position||''} ${contentById.get(p.id)?.forms.map(c=>c.name).join(' ')||''} ${business?.payer||''} ${business?.segments.map(segment=>`${segment.name} ${segment.job}`).join(' ')||''}`.toLowerCase().includes(query.trim().toLowerCase());});}
export default function Research({evidenceView=false}:{evidenceView?:boolean}){
 const [topicDetail,setTopicDetail]=useState(false);
 const [marketDetail,setMarketDetail]=useState(false);
 const [view,setView]=useState('overview');
 const [studyQuery,setStudyQuery]=useState(''); const [studyGroup,setStudyGroup]=useState('全部');
 const [sectionTarget,setSectionTarget]=useState<{view:string;sectionId:string}|null>(null);
 useEffect(()=>{const read=()=>{const raw=decodeURIComponent(location.hash.slice(1));const hash=raw==='matrix'?'report':raw==='tensor'?'tusi':raw;if(hash==='strategy'){location.replace('/community-options');return;}const anchor=new URLSearchParams(location.search).get('section');setTopicDetail(topicIds.includes(hash)&&!!anchor);setMarketDetail(!!anchor&&(hash==='china-users'||hash==='content-demand'));if(!evidenceView&&hash!=='liblib'&&profiles.some(p=>p.id===hash)&&anchor&&!anchor.startsWith(hash+'-digest-')){location.replace('/platform-evidence?section='+encodeURIComponent(anchor)+'#'+hash);return;}if(evidenceView&&!profiles.some(p=>p.id===hash)){location.replace('/#'+(hash||'overview'));return;}setView(profiles.some(p=>p.id===hash)||topViews.some(t=>t[0]===hash)?hash:'overview');const sectionId=new URLSearchParams(location.search).get('section');if(hash==='liblib'&&sectionId&&/^(liblib-function-|liblib-supply-(?!model)|liblib-demand-|liblib-week-supply|liblib-cross-entry-supply|function-coverage)/.test(sectionId)){location.replace('/liblib-evidence?section='+encodeURIComponent(sectionId));return;}setSectionTarget(sectionId?{view:hash,sectionId}:null);};read();window.addEventListener('hashchange',read);window.addEventListener('popstate',read);return()=>{window.removeEventListener('hashchange',read);window.removeEventListener('popstate',read);};},[]);
 const navigateHere=(id:string,anchor?:string)=>{if(id==='strategy'){location.assign('/community-options');return;}setTopicDetail(topicIds.includes(id)&&!!anchor);setMarketDetail(!!anchor&&(id==='china-users'||id==='content-demand'));if(evidenceView){location.assign('/'+(anchor?'?section='+encodeURIComponent(anchor):'')+'#'+id);return;}window.history.pushState(null,'',`${location.pathname}${anchor?'?section='+encodeURIComponent(anchor):''}#${id}`);if(anchor){setStudyQuery('');setStudyGroup('全部');}setSectionTarget(anchor?{view:id,sectionId:anchor}:null);setView(id);window.scrollTo({top:0,behavior:'instant'});};
 const navigate=(id:string,anchor?:string)=>{if(!evidenceView&&id===view&&(!anchor||anchor.startsWith(id+'-digest-'))){navigateHere(id,anchor);return;}window.location.assign(`/${anchor?'?section='+encodeURIComponent(anchor):''}#${id}`);};
 useEffect(()=>{if(evidenceView)document.querySelectorAll<HTMLDetailsElement>('.evidence-view details').forEach(d=>d.open=true);if(sectionTarget?.view===view){revealSection(sectionTarget.sectionId);setSectionTarget(null);}},[view,sectionTarget]);
 const showAudience=(id:string)=>navigate('audience',`audience-profile-${id}`);
 const showBusiness=(id:string)=>navigate(id,'commercial');
 const showData=(id:string)=>navigate(id,'public-data');
 const showContent=(id:string)=>navigate(id,'content-observations');
 const showStudy=(kind:'operations'|'content',id:string)=>navigate(kind,`${kind}-${id}`);
 const showEvidence=(id:string)=>navigate(id,'evidence-update');
 const studyFiltered=useMemo(()=>filterProfiles(studyQuery,studyGroup),[studyQuery,studyGroup]);
 const platformFilter=<ResearchPlatformFilter query={studyQuery} setQuery={setStudyQuery} group={studyGroup} setGroup={setStudyGroup} count={studyFiltered.length}/>;
 const p=profiles.find(x=>x.id===view); const index=p?profiles.indexOf(p):-1;
 return <div className={'research-shell '+(evidenceView?'evidence-view':'')}>
 <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();window.scrollTo({top:0});}}>跳到正文</a>
 <header className="app-header"><button className="brand" onClick={()=>navigateHere('overview')}><span className="brand-icon"><BookOpen size={17}/></span> 多元拾光 <span className="brand-divider">/</span><span className="brand-sub">研究室</span></button><span className="header-meta">AI社区研究</span><a className="research-prototype-entry" href="/community-options/prototype-review?section=c&amp;view=home&amp;device=pc&amp;reading=prototype">产品原型 →</a><button onClick={()=>navigate('evidence')} className="download"><BookOpen size={15}/><span>来源与方法</span></button></header>

 <ResearchSidebar view={view} navigate={navigateHere} profiles={profiles}/>
 <main id="main" className="report-main" tabIndex={-1} onClick={e=>{if(e.defaultPrevented||e.button!==0||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;const a=(e.target as HTMLElement).closest('a');if(!a||a.target==='_blank')return;const href=a.getAttribute('href')||'';if(!href.startsWith('#'))return;const id=href.slice(1);if(id!==view&&(profiles.some(p=>p.id===id)||topViews.some(t=>t[0]===id))){e.preventDefault();navigate(id);}}}>
 <div className="breadcrumb"><span>多元拾光研究室</span><span>/</span><span>{p?p.group:topViews.find(t=>t[0]===view)?.[1]}</span></div>
 {view==='overview'&&<ResearchDirectory navigate={navigate}/>}
 {view==='report'&&<ResearchBrief navigate={navigate}/>}
 {topicIds.includes(view)&&!topicDetail&&<CompetitorTopic topic={view}/>}

{view==='progress'&&<><PlanningReferenceNotice/><ResearchProgress navigate={navigate}/></>}
{view==='china-users'&&(marketDetail?<ChinaAIUsers navigate={navigate}/>:<IndustryResearch/>)}
{view==='audience'&&topicDetail&&<AudienceResearch navigate={navigate}/>}
{view==='supply'&&<><PlanningReferenceNotice/><CreatorSupply/></>}
{view==='content-demand'&&(marketDetail?<ContentDemand navigate={navigate}/>:<SocialResearch/>)}
 {view==='makenow'&&<><PlanningReferenceNotice/><MakeNowStudy navigate={navigate}/></>}
 {view==='discussion'&&topicDetail&&<ResearchFramework navigate={navigate}/>}
 {view==='validation'&&<><PlanningReferenceNotice/><ValidationOverview/></>}
 {view==='operations'&&topicDetail&&<OperationsDocument data={operatingStudy} visibleIds={studyFiltered.map(p=>p.id)} navigate={navigate} filter={platformFilter}/>}
 {view==='content'&&topicDetail&&<ContentDocument data={contentStudy} visibleIds={studyFiltered.map(p=>p.id)} navigate={navigate} filter={platformFilter}/>}
 {view==='supplement'&&topicDetail&&<><EvidenceUpdateOverview filter={platformFilter} data={evidenceUpdate} visibleIds={studyFiltered.map(p=>p.id)} onSelect={showEvidence}/></>}
 {view==='tasks'&&topicDetail&&<><ContentOverview onSelect={showContent}/></>}
 {view==='data'&&topicDetail&&<><PublicDataOverview filter={platformFilter} data={publicProfiles.filter(item=>studyFiltered.some(profile=>profile.id===item.id))} allData={publicProfiles} methods={publicDataMethod} insights={publicDataInsights} onSelect={showData}/></>}
 {view==='business'&&topicDetail&&<><BusinessOverview filter={platformFilter} data={businessProfiles.filter(item=>studyFiltered.some(profile=>profile.id===item.id))} insights={businessInsights} onSelect={showBusiness}/></>}
{view==='strategy'&&<><StrategyComparison navigate={navigate}/></>}
 {view==='evidence'&&<>
 <div className="page-heading"><h1>来源与研究方法</h1></div>
 {evidence.map((section,i)=><Essay key={section.title} section={section} number={i+1}/>)}
 <div className="evidence-register"><h2>逐家来源覆盖</h2><p className="muted">{profiles.reduce((a,p)=>a+p.sources.length,0)} 条来源记录（按档案计，含重复域名与历史资料）。数量不代表证据强弱。</p>{profiles.map(item=><button key={item.id} onClick={()=>navigate(item.id)}><strong>{item.name}</strong><span>{item.sources.length} 条来源</span><span>{item.access}</span><ArrowRight size={15}/></button>)}</div>
 </>}
 {p&&<article className={'platform-dossier '+(p.id==='liblib'?'editorial-liblib':'editorial-platform')} key={p.id}>
 <div className="page-heading profile-heading"><div className="platform-title-row"><h1>{p.name}{evidenceView?' · 研究资料':''}</h1>{p.deep&&<a href={p.deep.website} target="_blank" rel="noopener noreferrer">官网 <ArrowUpRight size={15}/></a>}{p.id==="tusi"&&<a href="https://tensor.art/" target="_blank" rel="noopener noreferrer">Tensor.Art 官网 <ArrowUpRight size={15}/></a>}</div>{!evidenceView&&<p className="focus-line">{p.id==='liblib'?'以模型和工作流共享为基础的 AI 创作平台':digestById.get(p.id)?.tagline||p.focus}</p>}</div>
 {evidenceView?<a href={'/?#'+p.id}>← 返回平台档案</a>:<div className="study-actions"><a className="text-button" href="/?#audience" target="_blank" rel="noopener noreferrer">比较其他平台的用户与价值 ↗</a><button className="text-button" onClick={()=>navigate('content-demand',`de-platform-${p.id}`)}>内容样本与供给 ↗</button></div>}
 {p.id!=='liblib'&&!evidenceView&&digestById.has(p.id)?<><PlatformDigestNav id={p.id}/><PlatformDigest id={p.id}/></>:<>
 {p.id==='liblib'?<LiblibReadingNav/>:<nav className="article-toc" aria-label="快速跳转">{(p.id==='liblib'?[['liblib-platform-model','平台运作'],['liblib-user-tasks','用户任务'],['liblib-distribution','分类与分发'],['liblib-use-paths','内容与使用'],['liblib-supply-model','供给与运营'],['liblib-commercial-model','商业机制'],['liblib-supply-evidence','样本与截图'],['liblib-demand-appendix','需求反馈'],['source-list','来源记录']]:[['function-pages','主要功能与用户路径'],['function-coverage','页面核对范围'],...(['jimeng','runninghub'].includes(p.id)?[[`${p.id}-catalog-evidence`,'分类内容样本'],[`${p.id}-page-evidence`,'详情与操作截图']]:[]),['category-path-profile','分类、详情与按钮'],...(p.id==='linuxdo'?[['linuxdo-login',"登录后内容与权限"]]:[]),['independent-studies','运营与内容专题'],['evidence-update','经营与使用证据'],...(['runninghub','liblib','tusi'].includes(p.id)?[['content-observations',"内容与任务"]]:[]),['public-data','公开数据与访问行为'],['commercial','商业化、规模与用户'],['page-evidence','页面证据'],...(p.deep?.task?[['task-log','实际操作']]:[]),['experience','界面与操作体验'],['source-list','来源记录']]).map(([id,label])=><a key={id} href={`#${p.id}`} onClick={e=>{e.preventDefault();revealSection(id);}}>{label}</a>)}</nav>}
 <FunctionProfile id={p.id} evidenceOnly={evidenceView}/>
 <details className="profile-section-group"><summary>分类、详情、按钮与截图证据</summary><CategoryProfile id={p.id}/></details>
 <details className="profile-section-group"><summary>用户经历与服务条件</summary><PlatformReview platformId={p.id}/><div className="access-note"><strong>早期访问记录</strong><p>{p.access}</p><p><a href={`/platform-evidence?section=function-pages#${p.id}`} target="_blank" rel="noopener noreferrer">查看后续功能与页面记录 →</a></p></div></details>
 <details className="profile-section-group"><summary>内容供给与用户参与</summary>
 <section id="profile-operations" className="essay-section"><h2>供给与回访机制</h2><dl className="business-key-facts"><dt>内容来源</dt><dd>{p.supply}</dd><dt>回访理由（分析）</dt><dd>{p.repeat}</dd></dl></section>
 {p.id==='linuxdo'&&<LinuxDoLoginUpdate/>}
 {operatingById.has(p.id)&&contentById.has(p.id)&&<StudyProfileLinks operations={operatingById.get(p.id)!} content={contentById.get(p.id)!} onOpen={showStudy}/>}
 <ContentProfile id={p.id} onOpen={()=>navigate('tasks','content-ledger')}/>
 </details>
 <details className="profile-section-group"><summary>工具、商业化与规模</summary>
 <ToolSupportProfile id={p.id} navigate={navigate}/>
 {businessById.has(p.id)&&<BusinessProfile data={businessById.get(p.id)!}/>}
 <details className="study-sources"><summary>收费规则与具体使用记录</summary>{evidenceById.has(p.id)&&<EvidenceUpdateProfile data={evidenceById.get(p.id)!}/>}<RepresentativeEvidence platformId={p.id}/></details>
 {publicById.has(p.id)&&<details className="study-sources"><summary>网站访问与渠道数据</summary><PublicDataProfileSection data={publicById.get(p.id)!}/></details>}
 </details>
 {p.deep&&<details className="profile-section-group"><summary>界面与实际操作</summary>
 <section className="research-focus"><h2>重点问题</h2><p>{p.deep.question}</p></section>
 <section className="research-gallery" id="page-evidence"><div className="section-heading"><h2>页面证据</h2><span>点击图片查看大图</span></div>{p.deep.images.length?p.deep.images.map(img=><figure key={img.file}><a href={img.file} target="_blank" rel="noreferrer"><img src={img.file} alt={img.title} loading="lazy"/></a><figcaption><div><strong>{img.title}</strong><span>{img.kind} · {img.date}</span></div><p>{img.observation}</p><p className="muted">{img.limitation}</p><a href={img.url} target="_blank" rel="noreferrer">原始页面 <ArrowUpRight size={13}/></a></figcaption></figure>):<p className="access-note">核心页面截图未取得，具体访问范围见来源记录。</p>}</section>
 {p.deep.task&&<section className="task-record" id="task-log"><div className="section-heading"><h2>实际操作</h2><span>{p.deep.task.date}</span></div><p>{p.deep.task.scope}</p><ol>{p.deep.task.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><p><strong>结果：</strong>{p.deep.task.result}</p><p className="muted">已接收生成任务 {p.deep.task.attempts} 次；按钮重试与未接收情况见记录。{p.deep.task.limit}</p></section>}
 <section className="journey"><h2>从发现到再次使用</h2><p className="muted">下表分析产品提供的路径及可能阻塞；实际完成范围以上方记录为准。</p><div className="table-wrap"><table><thead><tr><th>阶段</th><th>用户在做什么</th><th>哪里可能卡住</th></tr></thead><tbody>{p.deep.route.map(r=><tr key={r.stage}><th>{r.stage}</th><td>{r.behavior}</td><td>{r.friction}</td></tr>)}</tbody></table></div></section>
 </details>}
 <details className="profile-section-group"><summary>平台分析与使用体验</summary>
 <nav className="article-toc" aria-label="本档案章节">{p.sections.filter(s=>!isPlanningSection(s)).map((section,i)=><a key={section.title} href={`#${p.id}`} onClick={e=>{e.preventDefault();revealSection(`section-${i}`);}}>{String(i+1).padStart(2,'0')} {section.title}</a>)}</nav>
 <div className="article-body">{p.sections.filter(s=>!isPlanningSection(s)).map((section,i)=><section key={section.title} id={`section-${i}`} className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(i+1).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((para,j)=><p key={j}>{para}</p>)}{section.refs&&<div className="citations"><span>依据</span>{section.refs.map(n=><a key={n} href={p.sources[n-1].url} target="_blank" rel="noreferrer">[{n}] {p.sources[n-1].title}<ArrowUpRight size={12}/></a>)}</div>}</section>)}</div>
 {p.deep&&<>
 <section className="essay-section" id="experience"><div className="section-heading"><h2>界面与操作体验</h2><span className="status status-推断">观察与分析</span></div>{p.deep.ux.map((para,i)=><p key={i}>{para}</p>)}</section>
<p className="research-related"><button className="text-button" onClick={()=>navigate('report')}>查看15家竞品的机制比较 →</button></p>
 </>}

 </details>
 <details className="profile-section-group"><summary>来源与资料缺口</summary>
 <section className="unknowns"><h2>待验证假设与资料缺口</h2><ul>{p.gaps.map(g=><li key={g}>{g}</li>)}</ul></section>
 <section className="sources" id="source-list"><div className="section-heading"><h2>来源与时间边界</h2><span>日期与范围见逐条来源</span></div>{p.sources.map((src,i)=><div className="source-row" key={`${src.url}-${i}`}><span className="source-number">{i+1}</span><div><a href={src.url} target="_blank" rel="noreferrer">{src.title}<ArrowUpRight size={14}/></a><p>{src.note}</p><small>{src.type} · {src.date}</small></div></div>)}</section>
 </details>
 </>}
 <div className="page-turn"><button onClick={()=>navigate(index===0?'overview':profiles[index-1].id)}><ArrowLeft size={17}/><span><small>上一篇</small>{index===0?'研究总览':profiles[index-1].name}</span></button><button onClick={()=>navigate(index===profiles.length-1?'strategy':profiles[index+1].id)}><span><small>下一篇</small>{index===profiles.length-1?'方案与验证':profiles[index+1].name}</span><ArrowRight size={17}/></button></div>
 </article>}
 <footer className="report-footer"><span>多元拾光 · AI社区研究</span><span>整理日期：2026-09-21 · 资料日期见各页来源</span></footer>
 </main></div>
}
function Essay({section,number}:{section:Section;number:number}){return <section className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(number).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>}

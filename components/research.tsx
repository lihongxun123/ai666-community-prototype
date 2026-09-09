'use client';
/* oxlint-disable next/no-img-element -- Evidence screenshots keep their native encoding, load lazily and link to the original file. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, ListFilter, Menu, Search, X } from 'lucide-react';
import { profiles } from '@/lib/profiles';
import { groups, type Section } from '@/lib/research-types';
import { synthesis, evidence } from '@/lib/synthesis';
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

const businessProfiles: BusinessProfileData[] = businessData;
const businessById = new Map(businessProfiles.map(profile => [profile.id, profile]));
const publicProfiles = publicData as PublicDataProfile[];
const publicById = new Map(publicProfiles.map(profile => [profile.id, profile]));
const evidenceUpdate=evidenceUpdateJson as EvidenceUpdate;
const evidenceById=new Map(evidenceUpdate.profiles.map(profile=>[profile.id,profile]));
const topViews=[['overview','研究总览'],['supplement','竞品证据补核'],['matrix','18 个竞品对照'],['tasks','任务、内容与作者'],['data','公开数据对照'],['business','商业化、规模与用户'],['evidence','证据与局限'],['strategy','附录：定位假设'],['validation','附录：自身用户验证']];
export default function Research(){
 const [view,setView]=useState('overview'); const [query,setQuery]=useState(''); const [group,setGroup]=useState('全部'); const [mobile,setMobile]=useState(false); const [selected,setSelected]=useState<string[]>([]);
 const sectionTarget=useRef<{profileId:string;sectionId:string}|null>(null);
 useEffect(()=>{const read=()=>{const raw=decodeURIComponent(location.hash.slice(1));const hash=raw==='tensor'?'tusi':raw;setView(profiles.some(p=>p.id===hash)||topViews.some(t=>t[0]===hash)?hash:'overview');};read();window.addEventListener('hashchange',read);return()=>window.removeEventListener('hashchange',read);},[]);
 const navigate=(id:string)=>{window.history.pushState(null,'',`#${id}`);setView(id);setMobile(false);window.scrollTo({top:0,behavior:'instant'});};
 useEffect(()=>{if(sectionTarget.current?.profileId===view){document.getElementById(sectionTarget.current.sectionId)?.scrollIntoView({block:'start'});sectionTarget.current=null;}},[view]);
 const showBusiness=(id:string)=>{sectionTarget.current={profileId:id,sectionId:'commercial'};navigate(id);};
 const showData=(id:string)=>{sectionTarget.current={profileId:id,sectionId:'public-data'};navigate(id);};
 const showContent=(id:string)=>{sectionTarget.current={profileId:id,sectionId:'content-observations'};navigate(id);};
 const showEvidence=(id:string)=>{sectionTarget.current={profileId:id,sectionId:'evidence-update'};navigate(id);};
 const filtered=useMemo(()=>profiles.filter(p=>{const business=businessById.get(p.id);return (group==='全部'||p.group===group)&&`${p.name} ${p.focus} ${p.job} ${p.object} ${business?.payer||''} ${business?.segments.map(segment=>`${segment.name} ${segment.job}`).join(' ')||''}`.toLowerCase().includes(query.trim().toLowerCase());}),[query,group]);
 const p=profiles.find(x=>x.id===view); const index=p?profiles.indexOf(p):-1;
 const toggle=(id:string)=>setSelected(prev=>prev.includes(id)?prev.filter(v=>v!==id):prev.length<3?[...prev,id]:prev);
 const rows=selected.length?profiles.filter(x=>selected.includes(x.id)):filtered;
 return <div className="research-shell">
 <a href="#main" className="skip-link" onClick={e=>{e.preventDefault();document.getElementById('main')?.focus();window.scrollTo({top:0});}}>跳到正文</a>
 <header className="app-header"><button className="mobile-menu icon-button" onClick={()=>setMobile(!mobile)} aria-label="打开目录" aria-expanded={mobile}><Menu size={20}/></button><button className="brand" onClick={()=>navigate('overview')}><span className="brand-icon"><BookOpen size={17}/></span> 多元拾光 <span className="brand-divider">/</span><span className="brand-sub">研究室</span></button><span className="header-meta">AI 社区观察 · 公开数据补核 · 2026.09.09</span><button onClick={()=>navigate('evidence')} className="download"><BookOpen size={15}/><span>阅读说明</span></button></header>
 {mobile&&<button className="sidebar-scrim" onClick={()=>setMobile(false)} aria-label="关闭目录"/>}
 <aside className={`sidebar ${mobile?'is-open':''}`} aria-label="研究目录">
 <div className="sidebar-top"><p className="eyebrow">RESEARCH INDEX</p><p className="sidebar-title">从看内容，到反复使用</p></div>
 <nav className="top-nav">{topViews.map(([id,title])=><button key={id} onClick={()=>navigate(id)} aria-current={view===id?'page':undefined} className={view===id?'active':''}><span>{title}</span>{view===id&&<span className="active-dot"/>}</button>)}</nav>
 <div className="sidebar-controls"><label className="search"><Search size={15}/><input aria-label="搜索竞品、用户或内容类型" placeholder="搜索竞品、用户或内容" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button onClick={()=>setQuery('')} aria-label="清除搜索"><X size={14}/></button>}</label><label className="filter"><ListFilter size={14}/><select aria-label="按社区类型筛选" value={group} onChange={e=>setGroup(e.target.value)}><option>全部</option>{groups.map(g=><option key={g}>{g}</option>)}</select><span>{filtered.length} / {profiles.length}</span></label></div>
 <nav className="profile-nav">{filtered.map(item=><button key={item.id} onClick={()=>navigate(item.id)} aria-current={view===item.id?'page':undefined} className={view===item.id?'active':''}><span className="nav-number">{String(profiles.indexOf(item)+1).padStart(2,'0')}</span><span>{item.name}</span>{view===item.id&&<span className="active-dot"/>}</button>)}{filtered.length===0&&<div className="empty">没有匹配的竞品。<button onClick={()=>{setQuery('');setGroup('全部')}}>清除筛选</button></div>}</nav>
 <div className="sidebar-foot">18 个竞品档案<br/>页面实操 + 经营分析 + 公开数据</div>
 </aside>
 <main id="main" className="report-main" tabIndex={-1}>
 <div className="breadcrumb"><span>研究报告</span><span>/</span><span>{p?p.group:topViews.find(t=>t[0]===view)?.[1]}</span></div>
 {view==='overview'&&<>
 <div className="page-heading"><p className="eyebrow">18 个竞品 · 5 类社区 · 一个业务问题</p><h1>什么让用户愿意<br className="desktop-break"/>一次次回来？</h1><p className="lead">围绕多元拾光与 MakeNow，查清案例从哪里来、用户怎样做成、下一次为什么回来。逐家记录证据，再讨论四人团队值得投入哪一段。</p></div>
 <div className="context-strip"><div><span>当前目标</span><strong>目标用户规模 + 持续活跃</strong></div><div><span>可用资产</span><strong>低价 API · MakeNow</strong></div><div><span>核心缺口</span><strong>成熟案例 · 作者 · 真实任务</strong></div></div>
 <section className="overview-verdict"><span className="section-index">研究重点</span><h2>创作者怎样获得回报，<br/>使用者为什么付费？</h2><p>逐家核对收费规则、规模数字和具体使用记录。官方案例与公开评论分别阅读，区分产品提供了什么、有人实际做过什么，以及仍缺少哪些经营证据。</p><button className="primary-button" onClick={()=>navigate('supplement')}>查看本次竞品证据 <ArrowRight size={17}/></button></section>
 <section><div className="section-heading"><h2>值得带进讨论的六个发现</h2><span>点击进入相关档案</span></div><div className="finding-grid">
 {[
 ['01','供给需要被组织','Liblib 的早期定向邀约、WaytoAGI 的编辑整理，都说明第一批内容有人承担具体工作。',['liblib','waytoagi']],
 ['02','激励正在变化','吐司停止部分旧激励，Tensor.Art 收窄范围；旧版创作者计划不能当作今天的规则。',['tusi','civitai']],
 ['03','内容应带着下一步','运行应用、复制工作流、改作与 Fork，让观看之后有可执行行动。按钮存在仍不代表成功。',['runninghub','dify','runway']],
 ['04','工具复用与社区价值分开看','下一个真实任务可以带来工具回访；他人的案例和反馈是否有帮助，需要另行验证。',['openart','huggingface','dify']],
 ['05','福利也可以筛选行动','一些共学、挑战将资源绑定作业或创作。还要观察奖励结束后的参与、成果采用与组织成本；长期补贴另算可承担预算。',['nightcafe','datawhale','waytoagi']],
 ['06','作者合作要看过程','专业平台的精选成片背后仍有重试、编辑与制作能力。采购可复现方法，才能服务下一位用户。',['runway','leonardo','kling']],
 ].map(([n,title,body,ids])=><article className="finding" key={n as string}><span className="finding-number">{n as string}</span><h3>{title as string}</h3><p>{body as string}</p><div className="profile-links">{(ids as string[]).map(id=><button key={id} onClick={()=>navigate(id)}>{profiles.find(p=>p.id===id)?.name||id}<ArrowUpRight size={13}/></button>)}</div></article>)}
 </div></section>
 <section><div className="section-heading"><h2>建议这样读</h2><button className="text-button" onClick={()=>navigate('matrix')}>打开全部对照 <ArrowRight size={16}/></button></div><div className="reading-paths">{[
 ['看作者供给','liblib','runninghub','tusi','runway'],['看用户参与','openart','waytoagi','datawhale','linuxdo'],['看资源交接','dify','huggingface','tusi']
 ].map(([title,...ids])=><div key={title}><h3>{title}</h3>{ids.map(id=><button onClick={()=>navigate(id)} key={id}>{profiles.find(p=>p.id===id)?.name||id}<ArrowRight size={14}/></button>)}</div>)}</div></section>
 <div className="notice"><strong>阅读边界</strong><p>资料核验于 2026 年 9 月 8–9 日。吐司与 Tensor.Art 合并研究，移除飞桨、Coze；LINUX DO 保留公开研究。登录实操、未完成步骤与截图类型逐家注明。少量虚构商品样图不能证明目标用户需求或普遍成功率。</p><button onClick={()=>navigate('evidence')} className="text-button">查看方法与证据缺口 <ArrowRight size={14}/></button></div>
 </>}
 {view==='matrix'&&<>
 <div className="page-heading"><p className="eyebrow">COMPARISON</p><h1>18 个竞品，比较各自解决的事</h1><p className="lead">比较服务谁、提供什么、为什么回来，以及你们值得截取哪一段。文档描述的路径与本轮实际完成范围分开，实操结果见各档案；未对经营表现打分。</p></div>
 <div className="compare-controls"><p>选择最多 3 家并排对照。{selected.length>0?`已选 ${selected.length} 家。`:'未选择时显示目录筛选结果。'}</p>{selected.length>0&&<button className="text-button" onClick={()=>setSelected([])}>清空选择 <X size={14}/></button>}</div>
 <div className="compare-options">{profiles.map(item=><button aria-pressed={selected.includes(item.id)} disabled={selected.length===3&&!selected.includes(item.id)} className={selected.includes(item.id)?'chosen':''} key={item.id} onClick={()=>toggle(item.id)}>{selected.includes(item.id)&&<Check size={13}/>} {item.name}</button>)}</div>
 <div className="table-wrap"><table className="comparison-table"><thead><tr><th>竞品 / 类型</th><th>用户与核心内容</th><th>首次使用路径</th><th>作者供给与商业</th><th>复访机制（推断）</th><th>对你们的取舍</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><th><button onClick={()=>navigate(item.id)}>{item.name}<ArrowUpRight size={14}/></button><small>{item.group}</small></th><td>{item.job}<small>{item.object}</small></td><td>{item.first}</td><td>{item.supply}<small>{item.business}</small></td><td>{item.repeat}</td><td>{item.relevance}<small>暂不复制：{item.notCopy}</small></td></tr>)}</tbody></table></div>
 {rows.length===0&&<p className="empty">没有匹配结果，请清除左侧筛选。</p>}<p className="muted">各项事实、日期与访问限制见对应档案。这个对照不意味着所有平台都是直接竞争者。</p>
 </>}
 {view==='validation'&&<ValidationOverview/>}
 {view==='supplement'&&<EvidenceUpdateOverview data={evidenceUpdate} visibleIds={filtered.map(p=>p.id)} onSelect={showEvidence}/>}
 {view==='tasks'&&<><div className="notice"><strong>本页的竞品证据与后续方案分别阅读</strong><p>内容样本和公开讨论属于竞品调研。多元拾光的访谈、作者合作与试用方案作为后续附录保留，尚未执行，也不计入竞品调研进度。</p></div><ContentOverview onSelect={showContent}/></>}
 {view==='data'&&<><div className="notice"><strong>已补充18家的经营规则与使用证据</strong><p>{evidenceUpdate.stats.claims}条核验结论，逐条标注来源、日期、适用范围与仍未解决的问题。原流量数据保留月份和采集轮次，不与本轮披露混算。</p><button className="text-button" onClick={()=>navigate('supplement')}>查看竞品证据补核 <ArrowRight size={14}/></button></div><PublicDataOverview data={publicProfiles.filter(item=>filtered.some(profile=>profile.id===item.id))} allData={publicProfiles} methods={publicDataMethod} insights={publicDataInsights} onSelect={showData}/></>}
 {view==='business'&&<><div className="notice"><strong>本次补核：套餐范围、作者收益与实际使用</strong><p>完整商业档案继续保留。本次补充集中展示规则例外、经营数字边界与公开用户后续记录。</p><button className="text-button" onClick={()=>navigate('supplement')}>查看新增与复核证据 <ArrowRight size={14}/></button></div><BusinessOverview data={businessProfiles.filter(item=>filtered.some(profile=>profile.id===item.id))} insights={businessInsights} onSelect={showBusiness}/></>}
 {(view==='strategy'||view==='evidence')&&<>
 <div className="page-heading"><p className="eyebrow">{view==='strategy'?'DECISIONS TO TEST':'EVIDENCE & LIMITS'}</p><h1>{view==='strategy'?'找到第一批会再次使用的人':'知道什么，也知道还缺什么'}</h1><p className="lead">{view==='strategy'?'三个方向都先作为假设。用真实输入、第二次任务和人的反馈，缩小选择范围。':'公开资料说明产品规则或设计；是否上线、能否完成任务分别核验。实际采用、持续付费和经营效果，继续从竞品客户记录、公开反馈与披露资料核验。'}</p></div>
 {(view==='strategy'?synthesis:evidence).map((section,i)=><Essay key={section.title} section={section} number={i+1}/>)}
 {view==='evidence'&&<div className="evidence-register"><h2>逐家来源覆盖</h2><p className="muted">{profiles.reduce((a,p)=>a+p.sources.length,0)} 条来源记录（按档案计，含重复域名与历史资料）。数量不代表证据强弱。</p>{profiles.map(item=><button key={item.id} onClick={()=>navigate(item.id)}><strong>{item.name}</strong><span>{item.sources.length} 条来源</span><span>{item.access}</span><ArrowRight size={15}/></button>)}</div>}
 </>}
 {p&&<>
 <div className="page-heading profile-heading"><p className="eyebrow">档案 {String(index+1).padStart(2,'0')} / 18 <span>·</span> {p.group}</p><h1>{p.name}</h1><p className="focus-line">{p.focus}</p>{p.deep&&<div className="official-links"><a href={p.deep.website} target="_blank" rel="noreferrer">访问官网 <ArrowUpRight size={15}/></a>{p.id==='tusi'&&<a href="https://tensor.art/" target="_blank" rel="noreferrer">Tensor.Art 官网 <ArrowUpRight size={15}/></a>}</div>}<p className="lead">{p.thesis}</p></div>
 <div className="profile-summary"><div><span>服务谁</span><p>{p.job}</p></div><div><span>核心内容</span><p>{p.object}</p></div><div><span>首次使用路径</span><p>{p.first}</p></div></div>
 <div className="access-note"><strong>第二轮操作核验</strong><p>{p.access}</p></div>
 <nav className="article-toc" aria-label="快速跳转">{[['evidence-update','本次经营与使用补核'],...(['runninghub','liblib','tusi'].includes(p.id)?[['content-observations','第五轮内容与任务']]:[]),['public-data','公开数据与访问行为'],['commercial','商业化、规模与用户'],['page-evidence','页面证据'],...(p.deep?.task?[['task-log','实际操作']]:[]),['experience','界面与操作体验'],['tradeoffs','四人团队怎样取舍'],['source-list','来源记录']].map(([id,label])=><a key={id} href={`#${p.id}`} onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{label}</a>)}</nav>
 {evidenceById.has(p.id)&&<EvidenceUpdateProfile data={evidenceById.get(p.id)!}/>}
 <ContentProfile id={p.id} onOpen={()=>navigate('tasks')}/>
 {publicById.has(p.id)&&<PublicDataProfileSection data={publicById.get(p.id)!}/>}
 {businessById.has(p.id)&&<BusinessProfile data={businessById.get(p.id)!}/>}
 {p.deep&&<>
 <section className="research-focus"><h2>这家最值得追问的事</h2><p>{p.deep.question}</p></section>
 <section className="research-gallery" id="page-evidence"><div className="section-heading"><h2>页面证据</h2><span>点击图片查看大图</span></div>{p.deep.images.length?p.deep.images.map(img=><figure key={img.file}><a href={img.file} target="_blank" rel="noreferrer"><img src={img.file} alt={img.title} loading="lazy"/></a><figcaption><div><strong>{img.title}</strong><span>{img.kind} · {img.date}</span></div><p>{img.observation}</p><p className="muted">{img.limitation}</p><a href={img.url} target="_blank" rel="noreferrer">研究原页 <ArrowUpRight size={13}/></a></figcaption></figure>):<p className="access-note">核心页面尚未取得有效截图。保留资料分析，具体访问限制见本档案；不以空白页或验证页代替。</p>}</section>
 {p.deep.task&&<section className="task-record" id="task-log"><div className="section-heading"><h2>本轮实际操作</h2><span>{p.deep.task.date}</span></div><p>{p.deep.task.scope}</p><ol>{p.deep.task.steps.map((step,i)=><li key={i}>{step}</li>)}</ol><p><strong>结果：</strong>{p.deep.task.result}</p><p className="muted">已接收生成任务 {p.deep.task.attempts} 次；按钮重试与未接收情况见记录。{p.deep.task.limit}</p></section>}
 <section className="journey"><h2>从发现到再次使用</h2><p className="muted">下表分析产品提供的路径及可能阻塞；实际完成范围以上方记录为准。</p><div className="table-wrap"><table><thead><tr><th>阶段</th><th>用户在做什么</th><th>哪里可能卡住</th></tr></thead><tbody>{p.deep.route.map(r=><tr key={r.stage}><th>{r.stage}</th><td>{r.behavior}</td><td>{r.friction}</td></tr>)}</tbody></table></div></section>
 </>}
 <nav className="article-toc" aria-label="本档案章节">{p.sections.map((section,i)=><a key={section.title} href={`#${p.id}`} onClick={e=>{e.preventDefault();document.getElementById(`section-${i}`)?.scrollIntoView({behavior:'smooth',block:'start'});}}>{String(i+1).padStart(2,'0')} {section.title}</a>)}</nav>
 <div className="article-body">{p.sections.map((section,i)=><section key={section.title} id={`section-${i}`} className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(i+1).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((para,j)=><p key={j}>{para}</p>)}{section.refs&&<div className="citations"><span>依据</span>{section.refs.map(n=><a key={n} href={p.sources[n-1].url} target="_blank" rel="noreferrer">[{n}] {p.sources[n-1].title}<ArrowUpRight size={12}/></a>)}</div>}</section>)}</div>
 {p.deep&&<>
 <section className="essay-section" id="experience"><div className="section-heading"><h2>界面与操作体验</h2><span className="status status-推断">观察与分析</span></div>{p.deep.ux.map((para,i)=><p key={i}>{para}</p>)}</section>
 <section className="tradeoffs" id="tradeoffs"><div className="section-heading"><h2>四人团队怎样取舍</h2><span className="status status-建议">建议</span></div>{p.deep.tradeoffs.map((trade,i)=><article key={trade.title}><h3><span>{String(i+1).padStart(2,'0')}</span>{trade.title}</h3><dl><dt>先做什么</dt><dd>{trade.action}</dd><dt>为什么</dt><dd>{trade.reason}</dd><dt>需要付出</dt><dd>{trade.cost}</dd><dt>何时扩大或调整</dt><dd>{trade.signal}</dd></dl></article>)}</section>
 </>}

 <section className="unknowns"><h2>待验证假设与资料缺口</h2><ul>{p.gaps.map(g=><li key={g}>{g}</li>)}</ul></section>
 <section className="sources" id="source-list"><div className="section-heading"><h2>来源与时间边界</h2><span>采集 09-08 · 补核 09-09</span></div>{p.sources.map((src,i)=><div className="source-row" key={`${src.url}-${i}`}><span className="source-number">{i+1}</span><div><a href={src.url} target="_blank" rel="noreferrer">{src.title}<ArrowUpRight size={14}/></a><p>{src.note}</p><small>{src.type} · {src.date}</small></div></div>)}</section>
 <div className="page-turn"><button onClick={()=>navigate(index===0?'overview':profiles[index-1].id)}><ArrowLeft size={17}/><span><small>上一篇</small>{index===0?'研究总览':profiles[index-1].name}</span></button><button onClick={()=>navigate(index===profiles.length-1?'strategy':profiles[index+1].id)}><span><small>下一篇</small>{index===profiles.length-1?'定位与种子用户':profiles[index+1].name}</span><ArrowRight size={17}/></button></div>
 </>}
 <footer className="report-footer"><span>多元拾光 · 竞品研究工作底稿</span><span>资料核验：2026.09.08–09.09</span></footer>
 </main></div>
}
function Essay({section,number}:{section:Section;number:number}){return <section className="essay-section"><div className="section-heading"><h2><span className="section-index">{String(number).padStart(2,'0')}</span>{section.title}</h2><span className={`status status-${section.status}`}>{section.status}</span></div>{section.paragraphs.map((p,i)=><p key={i}>{p}</p>)}</section>}

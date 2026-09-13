'use client';
import {ResearchOutline,ResearchAppendix} from './research-outline';
import dataset from '@/lib/content-demand-ecosystem.json';
import {DouyinDepth} from './content-demand-depth';
import {DouyinPanel} from './content-demand-panel';
import {DouyinComparison} from './content-demand-comparison';
import {ThemeComparison} from './content-demand-themes';
import './content-demand-ecosystem.css';

const d=dataset;
const e=d.findings;
const dir=d.directions;
const base='/research-kit/douyin-ecosystem-2026-09-12/';
const text=(v:unknown):string=>v==null?'':Array.isArray(v)?v.map(text).join('；'):typeof v==='object'?Object.entries(v as Record<string,unknown>).map(([k,x])=>`${k}：${text(x)}`).join('；'):String(v);
function Link({url,children}:{url:string;children:React.ReactNode}){return <a href={url} target="_blank" rel="noreferrer">{children} ↗</a>}
function Jump({id,children}:{id:string;children:React.ReactNode}){return <button className="cd-link" type="button" data-jump={id} onClick={()=>{const el=document.getElementById(id);if(el instanceof HTMLDetailsElement)el.open=true;for(let p=el?.parentElement;p;p=p.parentElement)if(p instanceof HTMLDetailsElement)p.open=true;el?.scrollIntoView({block:'start'});}}>{children}</button>}
function Table({heads,rows}:{heads:string[];rows:React.ReactNode[][]}){return <div className="cd-table"><table><thead><tr>{heads.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div>}
function Fields({rows}:{rows:[string,unknown][]}){return <dl className="de-fields">{rows.filter(([,v])=>text(v)).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{text(v)}</dd></div>)}</dl>}
function Sources({urls}:{urls:string[]}){return <div className="de-sources">{[...new Set(urls)].map((url,i)=><Link key={url} url={url}>来源 {i+1}</Link>)}</div>}

export function DouyinEcosystem(){
 return <div className="de-research">
  <header className="page-heading"><h1>内容供需与主题</h1>

  </header>
  <ResearchOutline items={[
   ['theme-comparison','四类主题对照'],['cd-platforms','18个平台供给'],['de-map','细分题材地图'],['de-index','关键词指数'],['de-evidence','作品与评论记录']
  ]}/>
  <ThemeComparison />
  <ResearchAppendix id="de-evidence" title="作品、评论与采样记录">
  <details className="cd-profile"><summary><strong>同作者作品对照与画面研究</strong><span>既有逐集、互动与材料核查</span></summary><div className="cd-profile-body"><DouyinComparison /></div></details>
  <details className="cd-profile"><summary><strong>作品互动与逐条评论底表</strong><span>63件作品与已读讨论</span></summary><div className="cd-profile-body"><DouyinPanel /></div></details>
  <details className="cd-profile"><summary><strong>参考方法、作者样本与指数复算</strong></summary><div className="cd-profile-body"><DouyinDepth /></div></details>
  <ResearchAppendix id="de-baseline-data" title="题材、关键词与竞品供给底表">
  <div className="de-counts">{[[d.counts.cendCards,'抖音内容卡片'],[d.counts.guideRows,'垂类热词记录'],[d.counts.competitorObjects,'竞品内容对象'],[d.counts.lexiconTerms,'去重来源词条']].map(([n,t])=><div key={t}><strong>{n}</strong><span>{t}</span></div>)}</div>
  <p className="de-meta">核对：2026-09-12。卡片、详情、词条分别计数；13 个抖音详情中有 {d.counts.cendDetailOverlap} 个来自上述卡片。竞品对象覆盖 {d.counts.competitorPlatforms} 个平台。</p>
  <nav className="cd-toc" aria-label="抖音与内容供给目录">{[['findings','主要判断'],['map','细分内容地图'],['cases','观众与创作者反馈'],['index','关键词实值'],['guide','垂类热词'],['competitors','竞品供给'],['cend','抖音样本'],['words','用词库'],['method','机会判断']].map(([id,label])=><Jump key={id} id={'de-'+id}>{label}</Jump>)}</nav>

  <section id="de-findings"><h2>观看、学习与制作的不同需要</h2><div className="de-findings">{e.findings.filter((_,i)=>i!==7).map((f,i)=><article key={f.title}><span className="de-number">{String(i+1).padStart(2,'0')}</span><div><h3>{f.title}</h3><p>{f.text}</p><Sources urls={f.urls}/></div></article>)}</div></section>

  <section id="de-map"><h2>{dir.length} 个细分内容方向</h2><p>以下按消费目的区分，不是拟定的社区频道。每项同时说明看什么、怎样使用、谁提供，以及需要补哪条证据。</p>
   <div className="de-sectors">{[...new Set(dir.map(x=>x.sector))].map(sector=><div key={sector}><h3>{sector}</h3><div className="de-topic-links">{dir.filter(x=>x.sector===sector).map(x=><Jump key={x.id} id={'de-topic-'+x.id}>{x.topic}</Jump>)}</div></div>)}</div>
   {dir.map(x=><details className="cd-profile" id={'de-topic-'+x.id} key={x.id}><summary><strong>{x.topic}</strong><span>{x.consumerQuestion}</span></summary><div className="cd-profile-body"><Fields rows={[
    ['消费问题',x.consumerQuestion],['页面已见用词',x.observedTerms],['制作任务',x.productionTasks],['AI 能支持什么',x.aiSupport],['缺口证据',x.gapEvidence],['还需核对什么',x.nextObservation]
   ]}/><div className="de-sources">{x.consumerSources.map((s,i)=><Link key={s.url+i} url={s.url}>{s.id||'内容来源'}</Link>)}</div><p className="de-meta">竞品参照：{x.competitorIds.length?x.competitorIds.map(id=><span key={id}><Jump id={'de-object-'+id}>{id}</Jump>{' '}</span>):'尚未找到可对应的具体对象'}</p></div></details>)}
  </section>

  <section id="de-cases"><h2>观众在问什么，创作者卡在哪里</h2><p>读取 13 个详情的说明、关联搜索和默认可见评论；其中 {d.counts.cendAiDeclared} 个显示作者的 AI 生成声明。下面选取 8 个任务清楚的例子，评论按主题归纳。</p>
   <div className="de-cases">{e.cases.map(c=>{const detail=d.details.find(x=>x.url.endsWith(c.videoId));return <article key={c.videoId}><h3><Link url={'https://www.douyin.com/video/'+c.videoId}>{c.label}</Link></h3><div className="de-metrics">{detail?.metrics.map(m=><span key={m.field}><b>{m.value}</b> {m.field}</span>)}</div><Fields rows={[
    ['实际反馈',c.signal],['说明了什么',c.meaning],['核对情况',c.limit]
   ]}/><p className="de-meta">发布：{detail?.publishedAt||'未取得'}；AI 声明：{detail?.aiDeclaration?'页面已显示':'未显示，不能据此判断未使用 AI'}。数量为页面累计显示，非观看人数。</p></article>})}</div>
   <details className="cd-profile"><summary><strong>全部 13 个详情记录</strong></summary><div className="cd-profile-body"><Table heads={['内容','发布','可见指标','AI 声明','关联搜索']} rows={d.details.map(x=>[<Link url={x.url} key={x.url}>{x.description.slice(0,90)}</Link>,x.publishedAt||'未知',x.metrics.map(m=>`${m.field} ${m.value}`).join('；'),x.aiDeclaration||'未显示',text(x.relatedSearch)])}/></div></details>
  </section>

  <section id="de-index"><h2>关键词指数：题材词与制作词分开看</h2><p>全国／抖音，2026-08-10 至 2026-09-10。{d.counts.indexKeywords} 个精确词取得搜索与综合指数均值。数值是指数，不是搜索次数或人数；同比和环比按页面原文保留。</p>
   <p>历史故事、分镜等词出现“同比上升、环比下降”；天文和植物在此窗口环比上升。它们反映所查词的变化，不能直接排列行业机会；例如“历史”和“历史人文”覆盖的搜索表达并不相同。</p>
   <Table heads={['精确关键词','搜索均值','同比','环比','综合均值','同比','环比']} rows={d.index.filter(x=>x.status==='indexed').map(x=>[<Link key={x.keyword} url={x.sourceUrl}>{x.keyword}</Link>,x.search?.average,x.search?.yoy,x.search?.mom,x.composite?.average,x.composite?.yoy,x.composite?.mom])}/>

   <details className="cd-profile"><summary><strong>同义词与未匹配记录</strong><span>无精确候选不等于无需求</span></summary><div className="cd-profile-body"><p>“影视解说”未出现同字候选，但候选中有“影视剧解说”；“英语启蒙”有“儿童英语启蒙”等表达。本表保留输入与候选，不把相近词的指数赋给原词。</p><Table heads={['输入词','可见候选','结果']} rows={d.associations.map(x=>[x.query,text(x.terms),x.exactMatch===false?'未取得该精确词的结果':'已记录联想词'])}/></div></details>
  </section>

  <section id="de-guide"><h2>24 个垂类的 480 条热词记录</h2><p>创作者中心热门关键词，统计周期为 2026-09-09 近 1 日；每类读取前两页。用于发现题材，未按词量推算行业消费份额。“视频量”保留 w+、&lt;1w 等原文，其周期含义未核实，不与指数相除。</p>
   {[...new Set(d.guide.map(g=>g.category))].map(category=>{const rows=d.guide.filter(g=>g.category===category);return <details className="cd-profile" key={category} id={'de-guide-'+category}><summary><strong>{category}</strong><span>{rows.slice(0,6).map(r=>r.keyword).join('、')}…</span></summary><div className="cd-profile-body"><Link url={rows[0].url}>垂类原页</Link><Table heads={['榜内顺序','关键词','综合指数','搜索指数','视频量原文']} rows={rows.map(r=>[r.rank,r.keyword,r.compositeRaw,r.searchRaw,r.videoRaw])}/></div></details>})}

  </section>

  <section id="de-competitors"><h2>竞品具体提供了什么</h2><p>{d.counts.competitorObjects} 个对象对应 {d.counts.competitorUrls} 个对象／来源链接；{d.counts.competitorDetails} 个已读详情、{d.counts.competitorListings} 个列表或报道对象、{d.counts.competitorIndexed} 个索引片段。详情指文字或界面阅读，未逐项运行工具或看完整部作品。</p>
   <Table heads={['平台','对象','详情','列表／报道','索引','所见供给']} rows={d.platformCounts.map(p=>[<Jump key={p.id} id={'de-platform-'+p.id}>{p.name}</Jump>,p.objects,p.detail,p.listing,p.indexed,p.forms.join('、')||'本次未取得可读对象'])}/>
   {d.platformCounts.map(p=><details className="cd-profile" id={'de-platform-'+p.id} key={p.id}><summary><strong>{p.name}</strong><span>{p.objects} 个对象</span></summary><div className="cd-profile-body">{p.objects===0?<p>具体对象页面未能读取。保留平台档案，不将访问缺口解释为缺少供给。</p>:d.competitors.filter(x=>x.platformId===p.id).map(x=><article className="de-object" id={'de-object-'+x.id} key={x.id}><h3><Link url={x.url}>{x.title}</Link></h3><p className="de-meta">{x.id} · {x.depth==='detail'?'已读详情':x.depth==='indexed-excerpt'?'搜索索引片段':'列表／报道对象'} · 发布：{x.publishedAt||'未标明'}</p><Fields rows={[
    ['主题与任务',x.theme+'；'+x.intent],['内容形式',x.form],['已经提供',x.supplied],['缺失／未核',x.missing],['消费或使用反馈',x.feedback],['AI 依据',x.aiEvidence]
   ]}/>{x.metrics.length>0&&<p className="de-meta">可见字段：{x.metrics.map(m=>`${m.field} ${m.value}（${m.period||'周期未标'}）`).join('；')}</p>}</article>)}</div></details>)}

  </section>

  <section id="de-cend"><h2>抖音 C 端内容样本</h2><p>16 个分类中当次可见序列的前 19–24 张卡片，可能受个性化与编辑排序影响。日期保留页面原文，部分公开课来自更早年份。标签或标题中的 AI 表述仅是线索。</p>
   {[...new Set(d.cend.map(s=>s.category))].map(category=><details className="cd-profile" key={category}><summary><strong>{category}</strong><span>{d.cend.filter(s=>s.category===category).length} 条卡片</span></summary><div className="cd-profile-body"><Table heads={['标题与话题','时长','卡片可见计数','日期','AI 线索']} rows={d.cend.filter(s=>s.category===category).map(s=>[<div key={s.id}><Link url={s.url}>{s.title}</Link><small className="de-meta">{s.tags.join(' · ')}</small></div>,s.duration||'未取得',s.visibleCountRaw||'未取得',s.dateText||'未取得',s.aiEvidence||'未确认'])}/></div></details>)}

  </section>

  <section id="de-words"><h2>{d.counts.lexiconTerms} 个有出处的用词</h2><p>词条来自热榜、作者标题／标签、页面联想、普通讨论与竞品任务。它们不是同一种需求证据；英文词保留原文并单列译文，未直接当作中国用户搜索词。正文中的消费问题是研究归纳，下面的词条才是来源原词。</p>
   {[...new Set(d.lexicon.map(x=>text(x.kind)))].map(kind=><details className="cd-profile" key={kind}><summary><strong>{kind}</strong><span>{d.lexicon.filter(x=>text(x.kind)===kind).length} 词</span></summary><div className="cd-profile-body"><Table heads={['词条','译文','垂类','来源类型','出处']} rows={d.lexicon.filter(x=>text(x.kind)===kind).map(x=>[x.term,x.translation||'—',text(x.vertical),text(x.sourceType),<div key={x.term} className="de-sources">{x.sources.slice(0,3).map((s,i)=><Link key={s.url+i} url={s.url}>{s.recordId||'来源'}</Link>)}</div>])}/></div></details>)}

  </section>

  <section id="de-method"><h2>这些数据能说明什么，不能说明什么</h2><Table heads={['观察入口','回答的问题','使用方法','本次证据']} rows={e.ecosystem.filter((_,i)=>i!==4).map(x=>[x.surface,x.question,x.use,x.evidence])}/><h3>“供给少、消费多”需要同时满足哪些条件</h3><Table heads={['条件','要看到的证据','容易误判之处']} rows={e.gapTests.filter((_,i)=>![2,4,5].includes(i)).map(x=>[x.test,x.evidence,x.trap])}/>
   <h3>13个详情样本提出的补证问题</h3><ol>{e.next.filter((_,i)=>i!==3).map(x=><li key={x.title}><strong>{x.title}</strong><p>{x.text}</p></li>)}</ol>
   <details className="cd-profile"><summary><strong>采样与计数说明</strong></summary><div className="cd-profile-body"><ul><li>本表含180个对象，其中1个是已知对象的复核，不能全部计为新增。</li><li>不同对象可共用一个报道来源。可灵的 8 个具名作品来自同一报道；NightCafe 的 7 个列表对象来自同一作者案例，均未增加独立作者或消费者计数。</li><li>13 个抖音详情与列表部分重合；内容、词条、评论片段不能相加为人数。没有逐条看完成片、审核知识真实性或运行工作流。</li><li>Civitai、Midjourney 无本次可读具体对象；WaytoAGI 和魔搭本批为索引片段，可灵为外部报道。官方教程和策选案例不能代表普通用户分布。</li><li>当前没有同窗口全站内容分母、独立消费者数、完播率或跨周回访率。样本规模扩大后，仍以来源和任务验证判断，而不是按样本数量给行业排名。</li></ul></div></details>
  </section>
 </ResearchAppendix>
 </ResearchAppendix>

 </div>
}

export function EcosystemPlanning(){return <div><h3>题材对应的内容与工作安排</h3><p>以下是候选做法，题材词和作品数量不能证明这些安排已经有稳定需求。</p>{dir.map(x=><details className="study-sources" key={x.id}><summary>{x.topic}</summary><Fields rows={[["内容形式",x.deliveryForm],["回访假设",x.returnReason],["人工工作",x.humanWork],["依据与缺口",x.gapEvidence]]}/><Sources urls={x.consumerSources.map(s=>s.url)}/></details>)}<h3>从具体反馈推导的尝试</h3>{e.cases.map(c=><section key={c.videoId}><h4>{c.label}</h4><p>{c.form}</p><p>{c.return}</p><p className="muted">{c.limit}</p><Link url={'https://www.douyin.com/video/'+c.videoId}>原作品</Link></section>)}{e.findings.filter((_,i)=>i===7).map(x=><section key={x.title}><h3>{x.title}</h3><p>{x.text}</p><Sources urls={x.urls}/></section>)}<Table heads={['要成立的条件','需要的证据','容易误判之处']} rows={e.gapTests.filter((_,i)=>[2,4,5].includes(i)).map(x=>[x.test,x.evidence,x.trap])}/>{e.ecosystem.filter((_,i)=>i===4).map(x=><p key={x.surface}>{x.question}：{x.use} {x.evidence}</p>)}{e.next.filter((_,i)=>i===3).map(x=><section key={x.title}><h3>{x.title}</h3><p>{x.text}</p></section>)}</div>;}

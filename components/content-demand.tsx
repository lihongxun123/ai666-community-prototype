'use client';
import editorial from '@/lib/content-demand-editorial.json';
import data from '@/lib/content-demand-platforms.json';
import {ContentDemandIndex} from './content-demand-index';
import {ContentDemandSamples} from './content-demand-samples';
import './content-demand.css';

type Item={text:string;sourceIds:string[]};
const profiles=data.profiles;
function jump(id:string){const el=document.getElementById(id);if(el instanceof HTMLDetailsElement)el.open=true;for(let p=el?.parentElement;p;p=p.parentElement)if(p instanceof HTMLDetailsElement)p.open=true;el?.scrollIntoView({block:'start'});}
function Jump({id,children}:{id:string;children:React.ReactNode}){return <button type="button" className="cd-link" data-jump={id} onClick={()=>jump(id)}>{children}</button>;}
function External({url,children}:{url:string;children:React.ReactNode}){return <a href={url} target="_blank" rel="noreferrer">{children} ↗</a>;}
function Items({items,platform}:{items:Item[];platform?:string}){return <ul>{items.map((v,i)=><li key={i}>{v.text}{platform&&v.sourceIds.length>0&&<span className="cd-cites">{v.sourceIds.map(id=><Jump key={id} id={`cd-source-${platform}-${id}`}>来源</Jump>)}</span>}</li>)}</ul>;}
function Refs({ids}:{ids:string[]}){return <span className="cd-refs">{ids.map(id=><Jump key={id} id={`cd-platform-${id}`}>{profiles.find(p=>p.id===id)?.name||id}</Jump>)}</span>;}

export function ContentDemand({navigate}:{navigate?:(id:string,anchor?:string)=>void}){
 return <article className="content-demand">
  <header className="page-heading"><h1>{editorial.title}</h1><p>{editorial.verdict}</p>
   <div className="cd-downloads"><a href="/research-kit/content-demand-2026-09-11/report.html" target="_blank" rel="noreferrer">独立阅读／打印</a><a href="/research-kit/content-demand-2026-09-11/report.md" download>下载正文</a><a href="/research-kit/content-demand-2026-09-11/keyword-records.csv" download>指数采集表</a><a href="/research-kit/content-demand-2026-09-11/content-observations.csv" download>内容观察表</a><a href="/research-kit/content-demand-2026-09-11/data.json" download>来源与结构化资料</a></div>
  </header>
  <nav className="cd-toc" aria-label="内容供需专题目录">{[['findings','主要发现'],['index','抖音实值'],['guide','垂类供需'],['observations','具体内容与求助'],['platforms','18个平台'],['opportunities','主题与机会'],['douyin','选题方法'],['next','后续工作']].map(([id,label])=><Jump key={id} id={`cd-${id}`}>{label}</Jump>)}</nav>
  <section id="cd-findings"><h2>先看供给如何组织，再看谁在消费</h2><div className="cd-findings">{editorial.findings.map(f=><div key={f.title}><h3>{f.title}</h3><p>{f.text}</p></div>)}</div>
   <div className="cd-table"><table><caption>一条内容的五个观察维度</caption><thead><tr><th>维度</th><th>要回答的问题</th><th>标注方法</th></tr></thead><tbody>{editorial.taxonomy.map(t=><tr key={t.dimension}><th>{t.dimension}</th><td>{t.question}</td><td>{t.examples}</td></tr>)}</tbody></table></div><p>{editorial.taxonomyExample}</p>
  </section>
  <ContentDemandIndex/>
  <ContentDemandSamples/>
  <section id="cd-platforms"><h2>18个平台的行业、主题与消费线索</h2><p>{editorial.reading}</p>
   <div className="cd-table"><table><thead><tr><th>平台</th><th>可见供给主题／用途</th><th>消费线索</th><th>证据状态</th></tr></thead><tbody>{profiles.map(p=><tr key={p.id}><th><Jump id={`cd-platform-${p.id}`}>{p.name} ↓</Jump></th>{p.summary.map((s,i)=><td key={i}>{s}</td>)}</tr>)}</tbody></table></div>
   {profiles.map(p=><details id={`cd-platform-${p.id}`} className="cd-profile" key={p.id}><summary><strong>{p.name}</strong><span>{p.summary[0]}</span></summary>
    <div className="cd-profile-body"><div className="cd-columns">{[['供给题材',p.supplyTopics],['行业与使用场景',p.industryUses],['消费主题与意图',p.consumptionTopics],['内容形式',p.contentForms],['谁在供给',p.supplierTypes],['已观察到的信号',p.observedSignals]].map(([label,items])=><div key={label as string}><h3>{label as string}</h3><Items items={items as Item[]} platform={p.id}/></div>)}</div>
    <h3>可检验的机会</h3><p>{p.opportunity}</p>{p.counterexample&&<p className="cd-counter">反例：{p.counterexample}</p>}
    <h3>还缺的数据</h3><Items items={p.unknowns}/>
    <h3>来源</h3><ol className="cd-sources">{p.sources.map(s=><li id={`cd-source-${p.id}-${s.id}`} key={s.id}><External url={s.url}>{s.title}</External><span>{s.whatSupports}</span><small>资料日期：{s.date||'未标明'} · 观察：{s.accessedAt}</small></li>)}</ol>
    <a className="cd-link" href={`#${p.id}`} onClick={e=>{if(navigate){e.preventDefault();navigate(p.id);}}}>查看{p.name}完整竞品档案 →</a></div>
   </details>)}
  </section>
  <section id="cd-opportunities"><h2>什么情况下，“供给少、消费多”才值得进入</h2><p>{editorial.gapInterpretation}</p>
   <div className="cd-table"><table><thead><tr><th>判断条件</th><th>需要的证据</th><th>可能看错的情况</th></tr></thead><tbody>{editorial.gaps.map(g=><tr key={g.condition}><th>{g.condition}</th><td>{g.evidence}</td><td>{g.failure}</td></tr>)}</tbody></table></div>
   <h3>下一批优先核对的三组内容</h3><div className="cd-table"><table><thead><tr><th>主题</th><th>为何继续查</th><th>具体查什么</th><th>还未接上的证据</th></tr></thead><tbody>{editorial.researchPriorities.map(p=><tr key={p.theme}><th>{p.theme}</th><td>{p.why}</td><td>{p.task}</td><td>{p.missing}</td></tr>)}</tbody></table></div>
   <h2>8个主题怎样继续比较</h2><p>指数与具体内容已经补入，尚未取得各主题的全站供给量和消费份额。以下按可提供的内容、回访理由和现有缺口比较。</p>
   {editorial.opportunities.map((o,i)=><details className="cd-opportunity" key={o.id} open={i===0}><summary><strong>{o.theme}</strong><span>{o.status}</span></summary><div className="cd-profile-body"><Refs ids={o.platformIds}/><dl>{[['竞品供给',o.supply],['谁来消费',o.consumer],['可能缺什么',o.possibleGap],['社区承接',o.community],['持续供给',o.supplyPlan],['可能不成立',o.counter],['下一条证据',o.nextProof]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></div></details>)}
  </section>
  <section id="cd-douyin"><h2>抖音指数如何指导国内运营</h2><p>{editorial.douyin.recommendation}</p>
   <h3>已有官方依据</h3><ul className="cd-sources">{editorial.douyin.officialEvidence.map(s=><li key={s.id}><External url={s.url}>{s.title}</External><span>{s.finding}</span><small>{s.date||'日期未标明／动态入口'}</small></li>)}</ul>
   <p className="cd-access">{editorial.douyin.access}</p>
   <details className="cd-profile"><summary><strong>如何使用这些指标</strong></summary><div className="cd-profile-body"><div className="cd-table"><table><thead><tr><th>指标类别</th><th>运营用途</th><th>解释要求</th></tr></thead><tbody>{editorial.douyin.fields.map(f=><tr key={f.field}><th>{f.field}</th><td>{f.use}</td><td>{f.limit}</td></tr>)}</tbody></table></div></div></details>
   <h3>先查用户的词，再查AI的词</h3><p>{editorial.douyin.keywordNote}</p><div className="cd-table"><table><thead><tr><th>主题</th><th>主题／任务词</th><th>AI／方法词</th><th>排除与分组</th></tr></thead><tbody>{editorial.douyin.keywords.map(k=><tr key={k.topic}><th>{k.topic}</th><td>{k.watch.join('、')}</td><td>{k.make.join('、')}</td><td>{k.exclude}</td></tr>)}</tbody></table></div>
   <h3>取数与筛选顺序</h3><ol>{editorial.douyin.recording.map(x=><li key={x}>{x}</li>)}</ol><p>{editorial.douyin.comparison}</p>
  </section>
  <section id="cd-sampling"><h2>竞品供给与消费怎样采样</h2><p>{editorial.sampling.scope}</p><div className="cd-columns"><div><h3>供给记录</h3><ul>{editorial.sampling.supplyFields.map(x=><li key={x}>{x}</li>)}</ul></div><div><h3>消费记录</h3><ul>{editorial.sampling.demandFields.map(x=><li key={x}>{x}</li>)}</ul></div></div><p>{editorial.sampling.calculation}</p><p>{editorial.sampling.quality}</p></section>
  <section id="cd-next"><h2>接下来补什么</h2><ol className="cd-next">{editorial.next.map(n=><li key={n.step}><h3>{n.step}</h3><p>{n.work}</p><small>{n.output}</small></li>)}</ol><a href="#progress" onClick={e=>{if(navigate){e.preventDefault();navigate('progress');}}}>查看持续活跃指标与执行计划 →</a></section>
 </article>;
}

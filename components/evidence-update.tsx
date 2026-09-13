import type {ReactNode} from 'react';
import type { EvidenceProfile, EvidenceSource, EvidenceUpdate } from '@/lib/evidence-update-types';
import {RepresentativeEvidence} from '@/components/representative-evidence';

const dimensions = { commercial: '商业化与收费', scale: '规模与统计范围', usage: '具体使用记录' } as const;
const changes = { new: '补充', corroborated: '复核', correction: '纠偏' } as const;
const classes = { 'official-rule': '官方规则', 'official-disclosure': '官方披露', 'third-party-estimate': '第三方估计', 'user-report': '用户公开自述', 'case-study': '案例材料', 'public-counter': '公开页面计数', 'author-description': '作者或开发者说明', 'implementation-doc': '官方实现说明；线上适用待核' } as const;

function Refs({ ids, sources }: { ids: string[]; sources: EvidenceSource[] }) {
 return <span className="evidence-inline-refs">{ids.map(id=>{const s=sources.find(x=>x.id===id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer">〔{s.publisher}：{s.title}〕</a>:null;})}</span>;
}

export function EvidenceUpdateOverview({data, visibleIds, onSelect, filter}:{data:EvidenceUpdate;visibleIds:string[];onSelect:(id:string)=>void;filter?:ReactNode}) {
 const sources=[...data.profiles.flatMap(p=>p.sources),...data.methods.sources];
 const profiles=data.profiles.filter(p=>visibleIds.includes(p.id));
 return <div className="evidence-update-report">
  <div className="page-heading"><h1>收费、规模与使用证据</h1></div>
  {filter}
  <p className="evidence-update-meta">查阅日期：{data.accessedAt} · {data.stats.claims}条核验结论 · {data.stats.uniqueUrls}个来源页面。数量用于追溯，不代表研究完成度。</p>
  <p><a href="/research-kit/competitor-evidence.md" download>下载证据与来源</a></p>
  <nav className="article-toc" aria-label="竞品证据章节">{[['evidence-findings',"判断"],['evidence-coverage','18家证据对照'],['evidence-methods','进一步取数'],['evidence-missing','仍然缺什么']].map(([id,label])=><a key={id} href="#supplement" onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({block:'start',behavior:'smooth'});}}>{label}</a>)}</nav>
  <section id="evidence-findings">{data.findings.map(f=><article className="essay-section" key={f.title}><h2>{f.title}</h2><p>{f.text}<Refs ids={f.sourceIds} sources={sources}/></p></article>)}</section>
  <section id="evidence-coverage"><h2>18家证据对照</h2><p>表格沿用页面筛选。点击竞品进入逐条证据、适用条件和未解问题。没有数字的规模栏不估填。</p><div className="table-wrap"><table className="evidence-coverage-table"><thead><tr><th>竞品</th>{Object.values(dimensions).map(d=><th key={d}>{d}</th>)}</tr></thead><tbody>{profiles.map(p=><tr key={p.id}><th><button className="text-button" onClick={()=>onSelect(p.id)}>{p.name} ↗</button><small>{p.claims.length}条结论</small></th>{(Object.keys(dimensions) as (keyof typeof dimensions)[]).map(d=>{const cs=p.claims.filter(c=>c.dimension===d);return <td key={d}>{cs.length?<><p>{cs[0].statement}</p><small>{classes[cs[0].evidenceClass]} · {cs[0].period}</small><Refs ids={cs[0].sourceIds} sources={p.sources}/>{cs.length>1&&<button className="text-button" onClick={()=>onSelect(p.id)}>另有{cs.length-1}条，查看全文 ↗</button>}</>:<p className="muted">未取得足以确认的新证据；已知范围与缺口见档案。</p>}</td>;})}</tr>)}</tbody></table></div>{profiles.length===0&&<p>没有匹配结果，请清除页面筛选。</p>}</section>
  <details className="research-appendix"><summary>代表平台的使用条件与回应记录</summary><RepresentativeEvidence/></details>
  <section id="evidence-user-records"><h2>公开使用记录的前后经过</h2><p>{data.userRecords.method}</p><p>这4个账号的记录适合检查任务、付费预期和使用障碍。未验证真实身份，也没有按用户总体抽样。</p>{data.userRecords.records.map(r=><details className="data-sources" key={r.id}><summary>{r.id} · {r.competitors.map(id=>data.profiles.find(p=>p.id===id)?.name).join(' / ')}：{r.task}</summary><div className="evidence-claim"><p>{r.period}<Refs ids={r.sourceIds} sources={sources}/></p><dl><dt>付费自述</dt><dd>{r.paymentSelfReport}</dd><dt>使用经过</dt><dd>{r.actionSelfReport}</dd><dt>遇到的问题</dt><dd>{r.problemSelfReport}</dd><dt>后续反馈</dt><dd>{r.response}</dd><dt>结果</dt><dd>{r.outcome}</dd><dt>证据边界</dt><dd>{r.limitation}</dd></dl></div></details>)}</section>
  <section id="evidence-methods"><h2>{data.methods.title}</h2>{data.methods.items.map(item=><article className="essay-section" key={item.title}><h3>{item.title}</h3><p>{item.fact}<Refs ids={item.sourceIds} sources={data.methods.sources}/></p><p className="evidence-inference">判断：{item.implication}</p></article>)}<div className="table-wrap"><table className="evidence-coverage-table"><thead><tr><th>问题</th><th>所需证据</th><th>能回答到哪里</th><th>当前状态</th></tr></thead><tbody>{data.methods.collectionOptions.map(o=><tr key={o.question}><th>{o.question}</th><td>{o.evidence}</td><td>{o.limit}</td><td>{o.status}</td></tr>)}</tbody></table></div></section>
  <section id="evidence-missing"><h2>仍然缺什么</h2><p>18家尚无同口径的真实付费率、分群留存、用户终身价值、获客成本与产品毛利。少数披露或个案可以缩小问题，不能填满其他平台的数据空白。</p></section>
  <details className="data-sources"><summary>数据工具与方法来源（{data.methods.sources.length}条）</summary><SourceList sources={data.methods.sources}/></details>
 </div>;
}

function SourceList({sources}:{sources:EvidenceSource[]}) {
 return <div>{sources.map(s=><div className="source-row" key={s.id}><div><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.publisher}发布/更新：{s.publishedAt||'页面未标日期'}查阅{s.accessedAt} · {s.accessLevel==='full-page'?'已读取正文':'仅索引线索'}</p><p>支持：{s.supports}</p><p className="muted">范围：{s.limitation}</p></div></div>)}</div>;
}

export function EvidenceUpdateProfile({data}:{data:EvidenceProfile}) {
 return <section id="evidence-update" className="evidence-profile">
  <div className="section-heading"><h2>商业化、规模与使用证据补核</h2><span>2026.09.09</span></div><p className="business-summary">{data.summary}</p>
  {(Object.entries(dimensions) as [keyof typeof dimensions,string][]).map(([dimension,label])=>{const claims=data.claims.filter(c=>c.dimension===dimension);return claims.length?<div className="evidence-dimension" key={dimension}><h3>{label}</h3>{claims.map(c=><article className="evidence-claim" key={c.id}><div className="evidence-claim-label"><span>{changes[c.change]}</span><span>{classes[c.evidenceClass]}</span></div><p>{c.statement}<Refs ids={c.sourceIds} sources={data.sources}/></p><dl><dt>日期与对象</dt><dd>{c.period} · {c.scope}</dd><dt>不能据此推出</dt><dd>{c.limitation}</dd></dl></article>)}</div>:null;})}
  <div className="evidence-interpretations"><h3>对竞争关系的判断</h3>{data.analysis.map((a,i)=><p key={i}>{a.text}<Refs ids={a.sourceIds} sources={data.sources}/></p>)}</div>
  <h3>尚待核实的问题</h3><div className="table-wrap"><table className="evidence-coverage-table"><thead><tr><th>问题</th><th>为什么仍不能回答</th><th>需要补哪种证据</th></tr></thead><tbody>{data.gaps.map(g=><tr key={g.question}><th>{g.question}</th><td>{g.whyMissing}</td><td>{g.nextEvidence}</td></tr>)}</tbody></table></div>
  <details className="data-sources"><summary>本次补核来源（{data.sources.length}条）</summary><SourceList sources={data.sources}/></details>
 </section>;
}

import {PlatformReviewDimension} from '@/components/platform-review';
import type { ReactNode } from 'react';
import { LinuxDoImages } from '@/components/linuxdo-login';
import { MarketContentForms } from '@/components/market-content-forms';
import type { Adoption, ContentStudy, OperatingStudy, PlatformIdentity, StudyDocument, StudySource } from '@/lib/study-types';
import { ContentDepthProfile, ContentScreenshotGallery, ContentTaxonomy } from '@/components/content-evidence';

type Kind = 'operations' | 'content';
const labels = { operations: '运营思路研究', content: '内容形态研究' };
const files = { operations: 'platform-operations.md', content: 'content-forms.md' };
const stages = { supply: '供给组织', discovery: '筛选与分发', activation: '首次参与', participation: '持续参与', return: '再次使用', governance: '规则与维护', monetization: '收费与回报' };
const sourceKinds = { 'official-rule': '官方规则', 'official-page': '官方页面', 'implementation-doc': '实现说明', 'author-content': '作者内容', 'user-report': '用户自述', 'historical-report': '历史资料' };
const accessKinds = { 'full-page': "读取正文", 'prior-research': "沿用核验", 'search-index': '仅取得索引' };

function Refs({ ids, sources }: { ids: string[]; sources: StudySource[] }) {
 return <span className="study-refs">{ids.map(id => { const n = sources.findIndex(s => s.id === id), s = sources[n]; return s ? <a key={id} href={s.url} target="_blank" rel="noreferrer" title={`${s.publisher}：${s.title}`} aria-label={`来源${n + 1}：${s.title}`}>〔{n + 1}〕</a> : null; })}</span>;
}
function Definition({ rows }: { rows: [string, string][] }) { return <dl className="study-definition">{rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>; }
function Takeaway({ data }: { data: Adoption }) { return <><h3>多元拾光的采用条件</h3><Definition rows={[["可借鉴的工作", data.suitable], ["需要先具备", data.conditions], ["暂不适合照搬", data.avoid]]}/></>; }
function Sources({ sources }: { sources: StudySource[] }) { return <section className="study-sources"><h2>来源与适用范围</h2><ol>{sources.map(s => <li key={s.id}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.publisher} · {sourceKinds[s.type]} · {s.date} · 查阅：{s.accessedAt} · {accessKinds[s.access]}</p><p>{s.supports}</p><p className="muted">{s.limitation}</p></li>)}</ol></section>; }

function DocumentFrame<P extends PlatformIdentity & { position: string }>({ kind, data, visibleIds, navigate, filter, children }: { kind: Kind; data: StudyDocument<P>; visibleIds: string[]; navigate: (id: string) => void; filter?: ReactNode; children: (p: P) => ReactNode }) {
 const items = data.profiles.filter(p => visibleIds.includes(p.id));
 const other: Kind = kind === 'operations' ? 'content' : 'operations';
 const reveal=(id:string)=>{const target=document.getElementById(id);for(let node=target?.parentElement;node;node=node.parentElement){if(node instanceof HTMLDetailsElement)node.open=true;}target?.scrollIntoView({behavior:'smooth',block:'start'});};
 const jump = (id: string) => reveal(`${kind}-${id}`);
 return <article className="study-document">
  <div className="page-heading"><h1>{data.title}</h1></div>

  <div className="study-actions"><a href={`/research-kit/${files[kind]}`} download>下载完整文档（Markdown）</a>{kind === 'content' && <a href="/research-kit/content-forms-with-images.zip" download>下载文档与截图合集</a>}<button className="text-button" onClick={() => navigate(other)}>阅读另一份：{labels[other]} ↗</button></div>

  {kind === 'content' && <div className="study-actions"><button className="text-button" onClick={() => document.getElementById('content-visual-evidence')?.scrollIntoView({behavior:'smooth'})}>先看卡片与详情截图 ↓</button><button className="text-button" onClick={() => reveal('content-form-map')}>查看内容字段分类 ↓</button><button className="text-button" onClick={() => reveal('content-platform-directory')}>平台内容档案 ↓</button></div>}
  {kind === 'content' && <ContentScreenshotGallery visibleIds={data.profiles.map(p=>p.id)}/>}
  {kind === 'content' && <details className="study-sources"><summary>内容字段分类对照</summary><ContentTaxonomy/></details>}
  <section className="study-guide">{data.guide.map(g => <div key={g.title}><h2>{g.title}</h2><p>{g.text}<Refs ids={g.sourceIds} sources={data.sources}/></p></div>)}</section>
  <section className="study-directory" id={`${kind}-platform-directory`}><h2>平台档案</h2>{filter}<nav className="article-toc" aria-label={`${labels[kind]}平台目录`}>{items.map(p => <a key={p.id} href={`#${kind}`} onClick={e => { e.preventDefault(); jump(p.id); }}>{p.name}</a>)}</nav></section>
  <section className="study-comparison"><h2>{kind === 'operations' ? '运营重点对照' : '内容单位对照'}</h2><div className="table-wrap"><table><thead><tr><th>平台</th><th>{kind === 'operations' ? '主要组织什么工作（分析）' : '内容价值与形式的区别（分析）'}</th></tr></thead><tbody>{items.map(p => <tr key={p.id}><th><button className="text-button" onClick={() => jump(p.id)}>{p.name} ↗</button></th><td>{p.position}</td></tr>)}</tbody></table></div></section>
  {items.map(p => <section className="study-platform" id={`${kind}-${p.id}`} key={p.id}><div className="section-heading"><h2>{p.name}</h2>{p.id === 'tusi' ? <span><a href="https://tusi.cn/" target="_blank" rel="noreferrer">吐司官网 ↗</a> · <a href="https://tensor.art/" target="_blank" rel="noreferrer">Tensor.Art官网 ↗</a></span> : <a href={p.homepage} target="_blank" rel="noreferrer">官网 ↗</a>}</div><PlatformReviewDimension platformId={p.id} dimension={kind}/>{children(p)}<div className="study-actions"><button className="text-button" onClick={() => navigate(p.id)}>查看该平台其他研究与截图 ↗</button><a href={`#${kind}`} onClick={e => { e.preventDefault(); reveal(`${kind}-platform-directory`); }}>返回文档目录 ↑</a></div></section>)}
  {items.length === 0 && <p>没有匹配的平台，请调整档案筛选。</p>}
  <Sources sources={data.sources}/>
  <p className="muted">资料截至{data.accessedAt}。</p>
 </article>;
}

export function OperationsDocument({ data, visibleIds, navigate, filter }: { data: StudyDocument<OperatingStudy>; visibleIds: string[]; navigate: (id: string) => void; filter?: ReactNode }) {
 return <DocumentFrame kind="operations" data={data} visibleIds={visibleIds} navigate={navigate} filter={filter}>{p => <>
  <h3>参与者与动机</h3><p>{p.audience}</p>
  <h3>运营机制与持续分工</h3>{p.system.map(m => <section className="study-mechanism" key={m.title}><span className="muted">{stages[m.stage]}</span><h4>{m.title}</h4><p>{m.confirmed}<Refs ids={m.sourceIds} sources={data.sources}/></p><Definition rows={[["执行与分工", m.division], ["触发与节奏", m.rhythm], ["运营作用（分析）", m.reason], ["失效条件与证据边界", m.breakpoint]]}/></section>)}
  <h3>具体机制实例：{p.case.title}</h3><p>{p.case.observed}<Refs ids={p.case.sourceIds} sources={data.sources}/></p><ol>{p.case.sequence.map(s => <li key={s}>{s}</li>)}</ol><Definition rows={[["组织者要做的工作", p.case.operatorWork], ["参与者取得的价值（分析）", p.case.participantValue]]}/><p className="muted">{p.case.unproven}</p>
  <h3>激励与付费的关系</h3><Definition rows={[["供给者", p.incentives.supply], ["参与者", p.incentives.participation], ["与付费的连接", p.incentives.payment], ["可能出现的偏差（分析）", p.incentives.distortion]]}/><Refs ids={p.incentives.sourceIds} sources={data.sources}/>
  <h3>持续投入与依赖</h3><Definition rows={[["持续工作", p.burden.recurringWork], ["未量化的成本", p.burden.hiddenCost], ["成立条件", p.burden.dependency]]}/><Refs ids={p.burden.sourceIds} sources={data.sources}/>
  <Takeaway data={p.takeaway}/><h3>仍待确认的运营问题</h3><ul>{p.gaps.map(g => <li key={g}>{g}</li>)}</ul>
 </>}</DocumentFrame>;
}

export function ContentDocument({ data, visibleIds, navigate, filter }: { data: StudyDocument<ContentStudy>; visibleIds: string[]; navigate: (id: string) => void; filter?: ReactNode }) {
 return <><MarketContentForms/><details className="study-sources"><summary>平台内容档案、分类与截图</summary><DocumentFrame kind="content" data={data} visibleIds={visibleIds} navigate={navigate} filter={filter}>{p => <>
  <ContentDepthProfile id={p.id}/>
  {p.id === 'linuxdo' && <><h3>登录后的卡片、详情与修订截图</h3><p>补核于2026-09-09。以下4张截自界面；全7张及商业化、样本范围见该平台档案与独立下载研究。</p><LinuxDoImages contentOnly/></>}
  <h3>主要内容形态</h3>{p.forms.map(f => <section className="study-form" key={f.name}><h4>{f.name}</h4><p>{f.unit}<Refs ids={f.sourceIds} sources={data.sources}/></p><h5>实际字段与材料</h5><ul>{f.fields.map(x => <li key={x}>{x}</li>)}</ul><Definition rows={[["具体示例或入口", f.example], ["使用者能获得的深度", f.depth], ["看完之后的动作", f.nextAction], ["材料与使用限制", f.limits]]}/></section>)}
  <h3>样本拆解：{p.sample.title}</h3><p>{p.sample.scope}</p><div className="table-wrap"><table className="study-sample-table"><thead><tr><th>材料部分</th><th>实际观察到什么</th><th>这部分的作用（分析）</th></tr></thead><tbody>{p.sample.parts.map(part => <tr key={part.element}><th>{part.element}</th><td>{part.observed}<Refs ids={part.sourceIds} sources={data.sources}/></td><td>{part.role}</td></tr>)}</tbody></table></div><p><strong>尚缺的材料：</strong></p><ul>{p.sample.missing.map(x => <li key={x}>{x}</li>)}</ul><p className="muted">{p.sample.notProven}</p>
  <h3>复用能带走什么</h3><Definition rows={[["可取得或继承", p.reuse.available], ["还需准备", p.reuse.requires], ["无法直接迁移或尚未确认", p.reuse.notPortable]]}/><Refs ids={p.reuse.sourceIds} sources={data.sources}/>
  <h3>怎样判断内容是否有用</h3><Definition rows={[["有用内容的判断（分析）", p.quality.useful], ["容易误判的内容（分析）", p.quality.weak]]}/><Refs ids={p.quality.sourceIds} sources={data.sources}/>
  <Takeaway data={p.takeaway}/><h3>仍待确认的内容问题</h3><ul>{p.gaps.map(g => <li key={g}>{g}</li>)}</ul>
 </>}</DocumentFrame></details></>;
}

export function StudyProfileLinks({ operations, content, onOpen }: { operations: OperatingStudy; content: ContentStudy; onOpen: (kind: Kind, id: string) => void }) {
 return <section id="independent-studies" className="study-profile-links"><h2>两份专题研究</h2><h3>运营思路</h3><p>{operations.position}</p><button className="text-button" onClick={() => onOpen('operations', operations.id)}>阅读该平台运营机制、分工与投入 ↗</button><h3>内容形态</h3><p>{content.position}</p><button className="text-button" onClick={() => onOpen('content', content.id)}>阅读该平台内容字段、样本与复用限制 ↗</button></section>;
}

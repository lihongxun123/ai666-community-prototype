import type { OperationsProfile, OperationsResearch, OperationsSource } from '@/lib/operations-types';

const stageLabels = { supply: '内容供给', discovery: '内容发现', activation: '首次参与', participation: '创作与交流', return: '再次参与', governance: '规则与维护', monetization: '与付费的连接' };
const sourceLabels = { 'official-rule': '官方规则', 'official-page': '官方页面', 'implementation-doc': '实现说明', 'author-content': '作者内容', 'user-report': '用户自述', 'historical-report': '历史材料' };
const accessLabels = { 'full-page': '读取正文', 'search-index': '仅搜索索引', 'prior-research': "沿用核验" };

function References({ ids, sources }: { ids: string[]; sources: OperationsSource[] }) {
 return <span className="evidence-inline-refs">{ids.map(id => { const s = sources.find(x => x.id === id); return s ? <a key={id} href={s.url} target="_blank" rel="noreferrer">〔{s.publisher}：{s.title}〕</a> : null; })}</span>;
}

export function OperationsOverview({ data, visibleIds, onSelect }: { data: OperationsResearch; visibleIds: string[]; onSelect: (id: string) => void }) {
 const profiles = data.profiles.filter(p => visibleIds.includes(p.id));
 const sources = data.profiles.flatMap(p => p.sources);
 return <div className="operations-report">
  <div className="page-heading"><h1>运营思路与内容形态</h1></div>
  <p className="muted">覆盖15家，资料查阅于{data.accessedAt}。运营主线及其作用是基于公开机制的分析，未将功能或活动存在视为留存已经成立。</p>

  <nav className="article-toc" aria-label="运营研究章节">{[['ops-reading','怎样比较'],['ops-synthesis','不同的运营方式'],['ops-comparison','15家逐项对照'],['ops-boundaries','证据范围']].map(([id,label]) => <a key={id} href="#operations" onClick={e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{label}</a>)}</nav>
  <section id="ops-reading" className="essay-section"><h2>内容形式相同，承担的作用可以不同</h2><p>图片和视频是可见的成品，真正被使用的内容还可能包括输入素材、提示词、参数、工作流、模型版本、作业要求或问题上下文。比较内容时，需要看它能否被理解、复用、反馈和维护。</p><p>运营分析分别回答三件事：谁持续提供这些材料；平台怎样把材料送到合适的人面前；使用者完成什么动作后，有理由再次参与。社区的热闹程度、工具的重复使用和实际付费各有证据要求。</p></section>
  <section id="ops-synthesis">{data.synthesis.map(s => <article className="essay-section" key={s.title}><h2>{s.title}</h2><p>{s.text}<References ids={s.sourceIds} sources={sources}/></p><div className="profile-links">{s.profileIds.map(id => <button key={id} onClick={() => onSelect(id)}>{data.profiles.find(p => p.id === id)?.name} ↗</button>)}</div></article>)}</section>
  <section id="ops-comparison"><h2>15家逐项对照</h2><div className="table-wrap"><table className="ops-comparison-table"><thead><tr><th>平台</th><th>运营主线（分析）</th><th>主要内容形态</th><th>产品提供的参与路径</th></tr></thead><tbody>{profiles.map(p => <tr key={p.id}><th><button className="text-button" onClick={() => onSelect(p.id)}>{p.name} ↗</button><small>{p.archetype}</small></th><td>{p.thesis}</td><td>{p.content.map(c => c.form).join('；')}</td><td><ol>{p.journey.steps.map((s,i) => <li key={i}>{s}</li>)}</ol><small>路径存在及其可能作用，不等于漏斗或留存已验证。</small><button className="text-button" onClick={() => onSelect(p.id)}>阅读逐项分析 ↗</button></td></tr>)}</tbody></table></div>{profiles.length === 0 && <p>没有匹配平台，请清除左侧筛选。</p>}</section>
  <section id="ops-boundaries" className="essay-section"><h2>证据范围</h2><p>这份分析覆盖内容组织与运营机制，没有重新测量15家的活跃、作者收入或运营投入。官方规则、作者说明、历史活动与代码实现分别标明；资料不足的机制不补写为统一运营流程。</p><p>截图与实操按记录日期阅读。</p><p className="muted">15家共列出{data.stats.contentForms}项内容形态、{data.stats.mechanisms}项运营机制说明，按分析条目计数，同类内容可重复。来源见对应档案。</p></section>
 </div>;
}

export function OperationsProfileSection({ data }: { data: OperationsProfile }) {
 return <section className="operations-profile" id="operations-profile">
  <div className="section-heading"><h2>运营思路与内容形态</h2><span>2026.09.09</span></div>
  <p className="ops-archetype">{data.archetype}</p><p className="business-summary">{data.thesis}</p><p className="muted">以上为运营主线的分析判断。{data.evidenceScope}</p>
  <h3>谁在参与</h3><p>{data.audience}</p>
  <h3>内容具体包含什么</h3><div className="table-wrap"><table className="ops-content-table"><thead><tr><th>内容形态</th><th>一个内容单元包含什么</th><th>承担的作用</th><th>具体示例或入口</th></tr></thead><tbody>{data.content.map(c => <tr key={c.form}><th>{c.form}</th><td>{c.unit}</td><td>{c.purpose}</td><td>{c.example}<References ids={c.sourceIds} sources={data.sources}/></td></tr>)}</tbody></table></div>
  <h3>平台怎样组织参与</h3>{data.mechanisms.map(m => <article className="ops-mechanism" key={m.title}><span className="muted">{stageLabels[m.stage]}</span><h4>{m.title}</h4><p>{m.fact}<References ids={m.sourceIds} sources={data.sources}/></p><p><strong>运营作用（分析）：</strong>{m.analysis}</p><p className="muted">{m.limitation}</p></article>)}
  <h3>从内容到下一次参与</h3><ol className="ops-journey">{data.journey.steps.map((s,i) => <li key={i}>{s}</li>)}</ol><p className="muted">{data.journey.limitation}</p>
  <h3>谁承担持续运营的工作</h3><dl className="ops-roles"><dt>平台方</dt><dd>{data.roles.official}</dd><dt>作者或维护者</dt><dd>{data.roles.creators}</dd><dt>使用者与参与者</dt><dd>{data.roles.members}</dd></dl><p className="muted">{data.roles.limitation}</p>

  <h3>还没有证实的部分</h3><ul>{data.gaps.map(g => <li key={g}>{g}</li>)}</ul>
  <details className="data-sources"><summary>本节来源与时间范围（{data.sources.length}条）</summary>{data.sources.map(s => <div className="source-row" key={s.id}><div><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a><p>{s.publisher} · {sourceLabels[s.type]} · {s.date}查阅{s.accessedAt} · {accessLabels[s.access]}</p><p>{s.supports}</p><p className="muted">{s.limitation}</p></div></div>)}</details>
 </section>;
}

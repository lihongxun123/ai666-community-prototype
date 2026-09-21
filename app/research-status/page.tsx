import {scenarios} from '../community-options/content-system/configuration';
/* Native anchors preserve the research site's full-document and hash navigation. */
/* eslint-disable next/no-html-link-for-pages */
import data from '@/lib/research-evidence-status.json';
import '@/components/market-social.css';

const relatedResearch:Record<string,[string,string]>={
  'A1.1':['/research-decisions/tasks','23项任务、已有解决办法与原始依据'],
  'A1.2':['/research-decisions#evidence','社区采用与合作的待定事项'],
  'A2.1':['/domain-research#p1-evidence','14领域案例与依据'],
  'A2.2':['/#china-users','行业与用户依据'],
  'A3.1':['/task-research#task-learning-troubleshooting','学习排错与跨平台取用案例'],
  'A3.2':['/task-research#task-revision-review','修改审校与结果边界'],
  'A4.1':['/domain-research#p1-evidence','14领域案例与依据'],
  'A4.2':['/research-decisions','当前范围与方案'],
  'A4.3':['/research-decisions','当前范围与方案'],
  'B1.1':['/task-research#task-top','任务比较与阅读目录'],
  'B1.2':['/domain-research#p1-evidence','14领域案例与依据'],
  'B2':['/task-research#task-understand','理解内容与参与讨论'],
  'C1.1':['/research-decisions','当前范围与方案'],
  'C1.2':['/domain-research#research-conclusions','行业与社媒综合判断']
};

export default function Page(){return <main className="ms-report blueprint-report">
  <p><a href="/#overview">多元拾光研究室</a> / 研究证据状态</p>
  <header className="page-heading"><h1>研究证据状态</h1><p>九类场景的设计依据与实际证据分开记录</p></header>
  <div className="ms-lead"><strong>方向可评审，效果与合作仍需验证。</strong><p>15家竞品提供机制参照，行业与社媒材料支持任务分析。实践主线、创作交流独立入口及九类研究范围已经明确；公开研究、方案设计和实际采用分别记录。</p></div>
  <section id="current"><h2>九类场景</h2><p><a href="/community-options/review#increment" target="_blank" rel="noopener noreferrer">2026年9月20日专题复核：原渠道、参与理由与九类投入顺序 ↗</a></p><p>下表标出各类的证据范围。合作、授权文件、实际效果和工具集成仍须分别核验。</p><div className="ms-grid two">{scenarios.map(s=><article key={s.id}><h3>{s.name}</h3><p className="ms-caption">{s.kind}</p><p><strong>已有依据：</strong>{s.known}</p><p><strong>仍缺：</strong>{s.gap}</p><p><strong>设计用途：</strong>{s.lesson}</p><a href={s.detail} target="_blank" rel="noopener noreferrer">专题与来源 ↗</a></article>)}</div><h3>共同待验证事项</h3><p>实际合作、授权资产、用户采用和制作集成不能由概念图或公开案例代替。</p><a href="/research-decisions">当前范围与方案 →</a></section>
  <section id="previous"><h2>历史审查记录</h2><p>{data.date} · 以下状态对应旧九主题、23项任务及当时的问题。保留“已解决”等原状态用于追溯，不自动扩展到当前九类。</p></section>
  <section id="targeted-comparison"><h2>历史比较结论</h2><p>当时保留九主题；教学、MV与通用改编因有独立成果要求，作为开放任务保留。现有比较支持区分帮助方式，尚未形成市场机会排名。</p><div className="ms-grid two">{data.comparisons.map(item=><article key={item.theme}><h3>{item.theme}</h3><p>{item.result}</p><p className="ms-caption"><a href={item.url} target="_blank" rel="noopener noreferrer">{item.source} ↗</a></p></article>)}</div></section>
  <p>{data.scope}</p>
  <div className="ms-grid two">{data.definitions.map(([label,description])=><article key={label}><h2>{label}</h2><p>{description}</p></article>)}</div>
  <nav className="ms-links" aria-label="研究问题目录">{['A1','A2','A3','A4','B1','B2','C1'].map(id=><a key={id} href={`#issue-${id}`}>{data.items.find(item=>item.id.startsWith(id))?.area}</a>)}</nav>
  {['A1','A2','A3','A4','B1','B2','C1'].map(id=><section id={`issue-${id}`} key={id}><h2>{data.items.find(item=>item.id.startsWith(id))?.area}</h2>{data.items.filter(item=>item.id.startsWith(id)).map(item=>{const [href,label]=relatedResearch[item.id];return <article key={item.id} style={{padding:'18px 0',borderBottom:'1px solid #d9e1dc'}}><h3>{item.question} · {item.status}</h3><p>{item.finding}</p><p><strong>适用限制：</strong>{item.remaining}</p><p className="ms-caption">重新核查的条件：{item.reopen}</p><p className="ms-caption"><strong>依据报告：</strong>{item.evidence.join(' · ')}</p><p className="ms-caption"><strong>相关研究：</strong><a href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a></p></article>})}</section>)}
  <section><h2>阅读入口</h2><p className="ms-links"><a href="/research-decisions" target="_blank" rel="noopener noreferrer">当前范围与方案 ↗</a><a href="/domain-research#research-conclusions" target="_blank" rel="noopener noreferrer">行业与社媒判断 ↗</a><a href="/task-research" target="_blank" rel="noopener noreferrer">具体任务分析 ↗</a><a href="/#report" target="_blank" rel="noopener noreferrer">15家竞品研究 ↗</a></p></section>
</main>}

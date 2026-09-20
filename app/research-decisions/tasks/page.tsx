/* eslint-disable next/no-html-link-for-pages */
import '@/components/market-social.css';
import choices from '@/lib/task-choices.json';
const themes = ['电商','设计','本地经营','历史','科普','角色','写作','人像','手作'];


export default function Page(){return <main className="ms-report blueprint-report">
<p><a href="/research-decisions">社区方向决策</a> / 任务与依据</p>
<header className="page-heading"><h1>前轮23项任务记录</h1><p>2026年9月18日研究记录 · 保留当时范围与原始依据</p></header>
<p>当前范围已调整为九类场景：历史与科普归入知识，手作退出本轮，新增职场学习与IP。<a href="/research-decisions">查看当前方案 →</a></p><div className="ms-lead"><strong>先看原有办法，再决定社区补充什么。</strong><p>每项分别呈现研究依据与设计建议。内容与帮助方式可以组合；专业服务属于未来条件选项，推荐组合首版暂缓撮合。分类数量仅描述研究范围，不用于判断市场规模或投入顺序。</p></div>
  <section id="task-choices"><h2>23项重点任务：已有办法与社区选择</h2><p>{choices.scope}</p><nav className="ms-links" aria-label="任务取舍主题目录">{themes.map(t=><a href={`#tasks-${themes.indexOf(t)}`} key={t}>{t}</a>)}</nav>
    {themes.map((theme,index)=><section id={`tasks-${index}`} key={theme}><h3>{theme}</h3>{choices.items.filter(item=>item.theme===theme).map(item=><article className="task-choice" key={item.id} style={{padding:'18px 0',borderBottom:'1px solid #d9e1dc'}}><h4 id={item.id}>{item.id} · {item.task}</h4><p className="ms-caption">{item.basis}</p><p><strong>设计建议：{item.primary}。</strong>{item.support}</p><div className="ms-grid two"><div><p><strong>已有办法：</strong>{item.existing}</p></div><div><p><strong>剩余问题：</strong>{item.remaining}</p></div></div><p>{item.boundary}</p><p className="ms-caption ms-links">{item.evidence.map(e=><a key={e.url+e.label} href={e.url} target="_blank" rel="noopener noreferrer">{e.label} ↗</a>)}</p></article>)}</section>)}
  </section>

<p><a href="/research-decisions">返回方向决策</a> · <a href="/research-status" target="_blank" rel="noopener noreferrer">研究证据状态 ↗</a></p>
</main>}

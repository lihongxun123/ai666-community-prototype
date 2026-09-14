'use client';
import data from '@/lib/strategy-directions.json';
import category from '@/lib/category-paths.json';
import {jumpToResearchSection} from './research-outline';
import './strategy-directions.css';

type Navigate=(id:string,anchor?:string)=>void;
function Items({items}:{items:string[]}){return <ul>{items.map((text,i)=><li key={i}>{text}</li>)}</ul>;}
function Rows({rows}:{rows:[string,string][]}){return <dl className="direction-facts">{rows.map(([name,text])=><div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>;}

export function StrategyDirections({navigate}:{navigate:Navigate}){return <div className="direction-study">
 <header className="page-heading"><h1>社区方向与实施方案</h1><p className="direction-date">{data.date}</p></header>
 <section id="direction-goal"><h2>先比较用户为什么回来</h2><p>{data.decision}</p><p><strong>共同目标：</strong>连续两周有效活跃的外部目标用户数。观看、阅读、交流和资源使用都可以产生价值，不以创作或付费作为必要条件。</p><details className="study-sources"><summary>指标口径与执行安排</summary><p>{data.goal}</p><p>供给演练、作者招募和长期观察由团队人工安排；下文只列成立条件与判据。所有页面示例均为拟议编排，尚未形成真实内容或可运行原型。</p></details></section>
 <div className="direction-levels" aria-label="方案的三个层次">
  <div><strong>社区方向</strong><p>服务谁，为什么值得专程回来。</p></div>
  <div><strong>内容与服务</strong><p>用什么材料兑现价值，谁持续维护。</p></div>
  <div><strong>页面与路径</strong><p>用户看见什么，点完去哪，下次怎么接着用。</p></div>
 </div>
 <section id="direction-comparison"><h2>三个候选方向</h2><div className="table-wrap"><table><thead><tr><th>比较项</th>{data.directions.map(d=><th key={d.id}><a href="#strategy" onClick={e=>{e.preventDefault();jumpToResearchSection('direction-'+d.id);}}>{d.name} ↓</a></th>)}</tr></thead><tbody>
  {([['audience','优先用户'],['promise','第一次得到什么'],['returnReason','再次访问的理由'],['reasonToChoose','相较现有选择多做什么']] as const).map(([key,label])=><tr key={key}><th>{label}</th>{data.directions.map(d=><td key={d.id}>{d[key]}</td>)}</tr>)}
  <tr><th>主要内容组合</th>{data.directions.map(d=><td key={d.id}>{d.contentMix.map(c=>c.name).join('、')}</td>)}</tr>
  <tr><th>最难持续承担的工作</th>{data.directions.map(d=><td key={d.id}>{d.supply.map(s=>s.maintenance).join('；')}</td>)}</tr>
  <tr><th>最小版本</th>{data.directions.map(d=><td key={d.id}>{d.minimum.scope}</td>)}</tr>
 </tbody></table></div></section>
 <nav className="direction-nav" aria-label="三个方向的详细方案">{data.directions.map((d,i)=><a key={d.id} href="#strategy" onClick={e=>{e.preventDefault();jumpToResearchSection('direction-'+d.id);}}><span>{String(i+1).padStart(2,'0')}</span>{d.name} ↓</a>)}</nav>
 {data.directions.map((d,i)=><section id={'direction-'+d.id} className="direction-dossier" key={d.id} tabIndex={-1}>
  <header className="direction-title"><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h2>{d.name}</h2><p>{d.promise}</p></div></header>
  <h3>为什么选择这里</h3><Rows rows={[["用户已有的选择",d.alternative],["候选差异",d.reasonToChoose],["获客入口",d.entry.channel],["到站后",d.entry.arrival+'；'+d.entry.firstValue]]}/>
  <h3>供给哪些内容</h3><div className="direction-mix">{d.contentMix.map(c=><div key={c.name}><h4>{c.name}</h4><p>{c.role}</p></div>)}</div>
  <h3>列表、详情和继续使用</h3><div className="table-wrap"><table><thead><tr><th>页面与目的</th><th>主要信息</th><th>主要动作</th><th>接下来</th></tr></thead><tbody>{d.pages.map(p=><tr key={p.name}><th>{p.name}<small>{p.purpose}</small></th><td>{p.fields.join('、')}</td><td>{p.primaryAction}</td><td>{p.continues}</td></tr>)}</tbody></table></div>
  <section className="direction-example"><header><span>拟议内容示例</span><h3>{d.example.topic}</h3><p>{d.example.label}</p></header><div className="direction-example-body"><div><h4>列表卡片</h4><Items items={d.example.card}/></div><div><h4>详情展开</h4><Items items={d.example.detail}/></div></div><div className="table-wrap"><table><thead><tr><th>按钮</th><th>到达哪里</th><th>保留什么</th><th>开放条件</th></tr></thead><tbody>{d.example.actions.map(a=><tr key={a.label}><th>{a.label}</th><td>{a.destination}</td><td>{a.carries}</td><td>{a.limit}</td></tr>)}</tbody></table></div><p className="direction-return"><strong>下次访问：</strong>{d.example.nextVisit}</p></section>
  <h3>谁供给，谁维护</h3><div className="table-wrap"><table><thead><tr><th>角色</th><th>需要交付</th><th>发布后仍要做</th><th>当前条件</th></tr></thead><tbody>{d.supply.map(s=><tr key={s.role}><th>{s.role}</th><td>{s.deliverable}</td><td>{s.maintenance}</td><td>{s.dependency}</td></tr>)}</tbody></table></div>
  <h3>最小版本与取舍</h3><Rows rows={[["范围",d.minimum.scope],["可用承载",d.minimum.canUseExisting],["开始前必须具备",d.minimum.requires]]}/><Items items={d.tradeoffs}/><p><strong>暂不承诺：</strong>{d.minimum.exclude.join('、')}。</p>
  <details className="study-sources"><summary>社区、MakeNow与API分别做什么</summary><Rows rows={[["社区",d.tools.community],["MakeNow",d.tools.makenow],["API",d.tools.api],["不使用自营工具时",d.tools.withoutTool]]}/></details>
  <details className="study-sources"><summary>竞品依据与采用理由</summary>{d.evidence.map((e,j)=>{const p=category.profiles.find(p=>p.id===e.platformId);return <section key={j} className="direction-evidence"><h4>{p?.name}</h4><p><strong>页面观察：</strong>{e.fact}</p><p><strong>设计判断：</strong>{e.designImplication}</p><p className="muted">{e.limit}</p><div className="study-refs">{e.sourceIds.map(id=>{const s=p?.sources.find(s=>s.id===id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>:null;})}<button className="text-button" onClick={()=>navigate(e.platformId,'category-path-profile')}>完整路径与截图 →</button></div></section>;})}</details>
  <details className="study-sources"><summary>如何判断成立，什么情况应当收缩</summary><h4>可继续做的材料核对</h4><Items items={d.validation.deskChecks}/><h4>团队开展验证时记录</h4><Items items={d.validation.signals}/><h4>失败或调整条件</h4><Items items={d.validation.failure}/><h4>仍需回答</h4><Items items={d.openQuestions}/><p>{d.validation.humanOnly.join('；')}。</p></details>
 </section>)}
 <section id="direction-decision"><h2>投入顺序取决于哪些条件</h2><p>竞品已证明这些内容和路径能够被产品承载。下一步选择取决于能否持续交付、目标用户有没有反复需要，以及相较他们现有选择是否更值得回来。</p><div className="table-wrap"><table><thead><tr><th>若已具备</th><th>可优先评估</th><th>还不能据此认定</th></tr></thead><tbody><tr><td>稳定的主题选片、授权与续作来源</td><td>视觉兴趣与创作</td><td>播放量高就能转为社区回访</td></tr><tr><td>真实重复任务、可靠方法与维护者</td><td>AI应用与资源实践</td><td>工具调用增加就代表社区活跃</td></tr><tr><td>连贯内容与能核对、回应的主题负责人</td><td>AI学习与交流</td><td>报名或交作业就代表持续学习</td></tr></tbody></table></div><p>当前三组条件都未落实。可以先整理已有材料并确认责任人；缺少相应能力时缩小承诺，不同时铺开三个方向。</p></section>
 </div>;}

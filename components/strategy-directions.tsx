'use client';
import data from '@/lib/strategy-directions.json';
import category from '@/lib/category-paths.json';
import {jumpToResearchSection} from './research-outline';
import './strategy-directions.css';
import './entry-editorial.css';

type Navigate=(id:string,anchor?:string)=>void;
function Items({items}:{items:string[]}){return <ul>{items.map((text,i)=><li key={i}>{text}</li>)}</ul>;}
function Rows({rows}:{rows:[string,string][]}){return <dl className="direction-facts">{rows.map(([name,text])=><div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl>;}

export function StrategyDirections({navigate}:{navigate:Navigate}){return <div className="direction-study">
 <header className="page-heading"><h1>社区方向与实施方案</h1><p className="direction-date">{data.date}</p></header>
 <section id="direction-goal"><h2>目标与选择依据</h2><p><strong>主要指标：周活用户数（WAU）。</strong>观看、阅读、交流和资源使用都可以构成活跃。次周留存用于区分持续使用和短期到访，内容维护工时与费用用于判断投入能否持续。</p><p>{data.decision}</p><details className="study-sources"><summary>统计口径与方案状态</summary><p>{data.goal}</p><p>三个方向均为候选方案，回访理由和供给能力有待实际验证。内容示例为设计示意；作者合作、稳定供稿和持续使用效果没有实测结论。</p></details></section>
 <section id="direction-comparison"><h2>三个候选方向</h2><div className="table-wrap"><table><thead><tr><th>比较项</th>{data.directions.map(d=><th key={d.id}><a href="#strategy" onClick={e=>{e.preventDefault();jumpToResearchSection('direction-'+d.id);}}>{d.name} ↓</a></th>)}</tr></thead><tbody>
  {([['audience','优先用户'],['promise','第一次得到什么'],['returnReason','再次访问的理由'],['reasonToChoose','相较现有选择多做什么']] as const).map(([key,label])=><tr key={key}><th>{label}</th>{data.directions.map(d=><td key={d.id}>{d[key]}</td>)}</tr>)}
  <tr><th>主要内容组合</th>{data.directions.map(d=><td key={d.id}>{d.contentMix.map(c=>c.name).join('、')}</td>)}</tr>
  <tr><th>最难持续承担的工作</th>{data.directions.map(d=><td key={d.id}>{d.supply.map(s=>s.maintenance).join('；')}</td>)}</tr>
  <tr><th>最小版本</th>{data.directions.map(d=><td key={d.id}>{d.minimum.scope}</td>)}</tr>
 </tbody></table></div></section>
 <section id="direction-criteria" className="direction-criteria"><h2>怎样比较试行结果</h2><p>候选方向需要在相同的观察周期内记录渠道来源、内容更新和运营投入。获客量、赠送额度或维护强度不同，不能只按周活总量排名。</p><div className="table-wrap"><table><thead><tr><th>判断问题</th><th>需要记录</th><th>如何解释</th></tr></thead><tbody>
  <tr><th>有多少人实际使用</th><td>WAU及观看、阅读、交流、资源使用人数；行为类别之间去重</td><td>周活是总体目标。行为构成说明增长来自哪种价值，单纯到访和领奖另列。</td></tr>
  <tr><th>为什么再次访问</th><td>按首次活跃周分组的次周留存、回来访问的内容与具体行为</td><td>新增用户增加而回访不变，说明获客有效，持续使用的理由仍需改进。</td></tr>
  <tr><th>供给能否持续</th><td>内容更新量、授权与修订问题、编辑和答疑工时、工具费用</td><td>如果每次更新都需要临时找作者或逐人代做，需缩小内容范围或调整服务承诺。</td></tr>
 </tbody></table></div><p>试行周期、最低样本量、投入上限和留存目标需要在启动前确定。缺少社区基线和可用产能，暂不设数值门槛。</p></section>
 <nav className="direction-nav" aria-label="三个方向的详细方案">{data.directions.map((d,i)=><a key={d.id} href="#strategy" onClick={e=>{e.preventDefault();jumpToResearchSection('direction-'+d.id);}}><span>{String(i+1).padStart(2,'0')}</span>{d.name} ↓</a>)}</nav>
 {data.directions.map((d,i)=><section id={'direction-'+d.id} className="direction-dossier" key={d.id} tabIndex={-1}>
  <header className="direction-title"><span aria-hidden="true">{String(i+1).padStart(2,'0')}</span><div><h2>{d.name}</h2><p>{d.promise}</p></div></header>
  <h3>用户为什么选择这里</h3><Rows rows={[["已有替代品",d.alternative],["提供的差异",d.reasonToChoose],["获客入口",d.entry.channel],["首次使用",d.entry.arrival+'；'+d.entry.firstValue]]}/>
  <h3>供给哪些内容</h3><div className="direction-mix">{d.contentMix.map(c=><div key={c.name}><h4>{c.name}</h4><p>{c.role}</p></div>)}</div>
  <h3>列表、详情和继续使用</h3><div className="table-wrap"><table><thead><tr><th>页面与目的</th><th>主要信息</th><th>主要动作</th><th>接下来</th></tr></thead><tbody>{d.pages.map(p=><tr key={p.name}><th>{p.name}<small>{p.purpose}</small></th><td>{p.fields.join('、')}</td><td>{p.primaryAction}</td><td>{p.continues}</td></tr>)}</tbody></table></div>
  <section className="direction-example"><header><span>拟议内容示例</span><h3>{d.example.topic}</h3><p>{d.example.label}</p></header><div className="direction-example-body"><div><h4>列表卡片</h4><Items items={d.example.card}/></div><div><h4>详情展开</h4><Items items={d.example.detail}/></div></div><div className="table-wrap"><table><thead><tr><th>按钮</th><th>到达哪里</th><th>保留什么</th><th>开放条件</th></tr></thead><tbody>{d.example.actions.map(a=><tr key={a.label}><th>{a.label}</th><td>{a.destination}</td><td>{a.carries}</td><td>{a.limit}</td></tr>)}</tbody></table></div><p className="direction-return"><strong>下次访问：</strong>{d.example.nextVisit}</p></section>
  <h3>谁供给，谁维护</h3><div className="table-wrap"><table><thead><tr><th>角色</th><th>需要交付</th><th>发布后仍要做</th><th>当前条件</th></tr></thead><tbody>{d.supply.map(s=><tr key={s.role}><th>{s.role}</th><td>{s.deliverable}</td><td>{s.maintenance}</td><td>{s.dependency}</td></tr>)}</tbody></table></div>
  <h3>最小版本与取舍</h3><Rows rows={[["内容范围",d.minimum.scope],["页面基础",d.minimum.canUseExisting],["启动条件",d.minimum.requires]]}/><Items items={d.tradeoffs}/><p><strong>范围之外：</strong>{d.minimum.exclude.join('、')}。</p>
  <details className="study-sources"><summary>社区、MakeNow与API分别做什么</summary><Rows rows={[["社区",d.tools.community],["MakeNow",d.tools.makenow],["API",d.tools.api],["不使用自营工具时",d.tools.withoutTool]]}/></details>
  <details className="study-sources"><summary>竞品依据与采用理由</summary>{d.evidence.map((e,j)=>{const p=category.profiles.find(p=>p.id===e.platformId);return <section key={j} className="direction-evidence"><h4>{p?.name}</h4><p><strong>页面观察：</strong>{e.fact}</p><p><strong>设计判断：</strong>{e.designImplication}</p><p className="muted">{e.limit}</p><div className="study-refs">{e.sourceIds.map(id=>{const s=p?.sources.find(s=>s.id===id);return s?<a key={id} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>:null;})}<button className="text-button" onClick={()=>navigate(e.platformId,'category-path-profile')}>完整路径与截图 →</button></div></section>;})}</details>
  <section className="direction-validation"><h3>验证重点与调整条件</h3><div className="direction-checks"><div><h4>发布前检查</h4><Items items={d.validation.deskChecks}/></div><div><h4>使用后观察</h4><Items items={d.validation.signals}/></div><div><h4>需要收缩或调整的情况</h4><Items items={d.validation.failure}/></div><div><h4>决定是否投入的问题</h4><Items items={d.openQuestions}/></div></div></section>
 </section>)}
 <section id="direction-decision"><h2>启动前需要落实的条件</h2><p>竞品页面提供了可参照的内容组织方式。多元拾光的投入顺序还取决于可用内容、维护能力和目标用户的访问频率。</p><div className="table-wrap"><table><thead><tr><th>可优先评估的方向</th><th>必须具备</th><th>优先验证</th></tr></thead><tbody><tr><th>视觉兴趣与创作</th><td>同一主题的连续作品、使用授权、选编与更新负责人</td><td>用户是否因系列更新和讨论再次访问，而不只看一条作品</td></tr><tr><th>AI应用与资源实践</th><td>反复出现的任务、可核对的方法、资源维护者</td><td>重复任务能否形成足够频繁的访问，以及维护是否依赖逐人代做</td></tr><tr><th>AI学习与交流</th><td>连贯的学习材料、可核对的例子、明确的答疑范围</td><td>用户能否继续阅读、解决疑问，并在活动之外回来</td></tr></tbody></table></div><p>稳定内容来源、维护负责人和可用工时尚缺确认资料。建议先选择具备启动条件的一个主题，限定内容范围、更新频率和回应责任，再比较其周活、次周留存与投入。</p></section>
 </div>;}

'use client';
import raw from '@/lib/category-paths.json';
import type {CategoryPathProfile} from '@/lib/category-path-types';
import './category-paths.css';

const data=raw as {date:string;profiles:CategoryPathProfile[]};
const imageRoot='/research-images/category-paths-2026-09-14/';
type Navigate=(id:string,anchor?:string)=>void;
function Refs({p,ids}:{p:CategoryPathProfile;ids:string[]}){
 const used=new Set<string>();
 return <span className="cp-refs">{ids.map(id=>{
  const s=p.sources.find(s=>s.id===id);const im=p.screenshots.find(s=>s.id===id);
  const url=s?.url||(im?imageRoot+im.file:undefined),title=s?.title||im?.title;
  if(!url||used.has(url))return null;used.add(url);
  return <a key={id} href={url} target="_blank" rel="noreferrer">{title} ↗</a>;
 })}</span>;
}
function Images({p,files}:{p:CategoryPathProfile;files?:string[]}){
 const images=files?p.screenshots.filter(im=>files.includes(im.file)):p.screenshots;
 return <div className="cp-images">{images.map(im=><figure key={im.file}>
  <a href={imageRoot+im.file} target="_blank" rel="noreferrer" aria-label={`放大：${im.title}`}><img src={imageRoot+im.file} alt={im.what||im.title} loading="lazy"/></a>
  <figcaption><strong>{im.title}</strong><p>{im.what}</p><small>{p.date} · {im.limitations}</small><a href={im.url} target="_blank" rel="noreferrer">来源页面 ↗</a></figcaption>
 </figure>)}</div>;
}
function Jump({p,navigate}:{p:CategoryPathProfile;navigate:Navigate}){return <button className="text-button" onClick={()=>navigate(p.id,'category-path-profile')}>{p.name}：分类、详情与操作 →</button>;}

export function CategoryOverview({navigate}:{navigate:Navigate}){
 const jm=data.profiles.find(p=>p.id==='jimeng'),ll=data.profiles.find(p=>p.id==='liblib');
 return <article className="cp-study">
  <header className="page-heading"><h1>内容形态与页面</h1></header>
  <nav className="article-toc" aria-label="内容页面研究目录">{[['cp-examples','即梦与Liblib'],['cp-platforms','18个平台'],['cp-comparison','设计差异']].map(([id,label])=><a key={id} href="#content" onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'smooth'});}}>{label}</a>)}</nav>
  <section id="cp-examples"><h2>分类决定入口，详情决定下一步</h2>
   <p>即梦用广告、影视、设计和电商等场景组织探索；Liblib把图片模型、视频特效、灵感和工作流放在主频道。两家的目录都混合了不同分类维度，需要连同卡片、详情和后续操作一起看。</p>
   {jm&&<section className="cp-example"><h3>即梦：同一个探索页，图片、短片和技能各有承载方式</h3><Images p={jm} files={['jimeng-film-list.png','jimeng-poster-list.png']}/><p>海报先让人看画面；短片先交代标题、作者与时长。短片还可以连接创作画布，但并非每条作品都提供。海报的“做同款”与“用作参考图”也不是同一个操作。</p><Jump p={jm} navigate={navigate}/></section>}
   {ll&&<section className="cp-example"><h3>Liblib：频道、资源类型和使用界面不是一一对应</h3><Images p={ll} files={['liblib-01-image-feed.png','liblib-12-app-form.png']}/><p>图片模型频道混排模型、LoRA和模板；一项工作流又能以节点画布或简化表单打开。分类解决发现问题，资源类型解释交付物，使用界面再决定用户需要懂多少参数。</p><Jump p={ll} navigate={navigate}/></section>}
  </section>
  <section id="cp-platforms"><h2>逐平台查看</h2><p className="cp-date">网页查阅：{data.date}。访问范围与未走通的步骤写在各平台记录中。</p>
   {[...new Set(data.profiles.map(p=>p.group))].map(group=><section key={group} className="cp-platform-group"><h3>{group}</h3><div className="table-wrap"><table><thead><tr><th>平台</th><th>已检查的内容与页面</th><th>实际走查范围</th></tr></thead><tbody>{data.profiles.filter(p=>p.group===group).map(p=><tr key={p.id}><th><Jump p={p} navigate={navigate}/></th><td>{p.surfaces.length?p.surfaces.map(s=>s.type).join('；'):'当前产品界面未取得'}</td><td>{p.access.scope}{!p.screenshots.length&&<p className="muted">没有新增产品截图，不能视为当前页面实测。</p>}</td></tr>)}</tbody></table></div></section>)}
  </section>
  <section id="cp-comparison"><h2>需要分别比较的设计选择</h2><div className="table-wrap"><table><thead><tr><th>比较项</th><th>具体差异</th><th>为什么不能只看名称</th></tr></thead><tbody>
   <tr><th>分类与筛选</th><td>用途、媒介、模型、最新／最热、活动入口可能处于同一栏。</td><td>用途回答想做什么，模型回答用什么，排序回答先看哪个；混成一张“行业分类表”会丢掉分发逻辑。</td></tr>
   <tr><th>作品与可用资源</th><td>图片或视频是成品；模板、模型、工作流、技能提供的材料不同。</td><td>相似封面不表示能取得相同素材、参数、权利或制作过程。</td></tr>
   <tr><th>详情主按钮</th><td>看下一部、做同款、参考图、运行模型、查看代码、开始学习分别通向不同活动。</td><td>应记录实际目的地与带入字段；按钮名称不能证明完整复现或任务成功。</td></tr>
   <tr><th>继续消费</th><td>观看队列、相关推荐、课程章节、作者主页与讨论更新提供不同的继续路径。</td><td>有下一步入口只能证明产品支持继续使用，不能证明用户真的持续回来。</td></tr>
   <tr><th>供给维护</th><td>活动要组织投稿与评选；模型和插件要维护版本；课程要维护章节；讨论要处理问题与回复。</td><td>卡片形式可以相似，持续工作和责任人却不同。具体机制见平台运营。</td></tr>
  </tbody></table></div><p><button className="text-button" onClick={()=>navigate('operations')}>查看平台运营 →</button></p></section>
 </article>;
}

export function CategoryProfile({id}:{id:string}){
 const p=data.profiles.find(p=>p.id===id);if(!p)return null;
 const parents=[...new Set(p.navigation.map(n=>n.parent||'主导航'))];
 return <section className="cp-study cp-profile" id="category-path-profile">
  <div className="section-heading"><h2>分类、内容详情与实际操作</h2><span>{p.date}</span></div>
  <p>{p.access.scope}</p><p className="cp-date">{p.access.terminal} · {p.access.login}</p>
  {p.navigation.length>0&&<details open className="cp-block"><summary>目录与分发入口</summary><div className="cp-taxonomy">{parents.map((parent,index)=><details key={parent} open={index===0}><summary>{parent}</summary><dl>{p.navigation.filter(n=>(n.parent||'主导航')===parent).map((n,i)=><div key={n.label+i}><dt>{n.label}<small>{n.kind}</small></dt><dd>{n.changes}<Refs p={p} ids={n.evidence}/></dd></div>)}</dl></details>)}</div></details>}
  {p.surfaces.length>0&&<details open className="cp-block"><summary>卡片和详情分别放什么</summary><div className="table-wrap"><table><thead><tr><th>承载对象／入口</th><th>列表卡片</th><th>详情内容</th><th>操作与内容关联</th></tr></thead><tbody>{p.surfaces.map((s,i)=><tr key={i}><th>{s.type}<small>{s.entry}</small></th><td><ul>{s.cardFields.map((x,j)=><li key={j}>{x}</li>)}</ul></td><td><ul>{s.detailFields.map((x,j)=><li key={j}>{x}</li>)}</ul></td><td><ul>{s.actions.map((x,j)=><li key={j}>{x}</li>)}</ul><p>{s.connections}</p><Refs p={p} ids={s.evidence}/></td></tr>)}</tbody></table></div></details>}
  {p.paths.length>0&&<section className="cp-block"><h3>按钮点下去之后</h3>{p.paths.map((r,i)=><details key={i} open={i<2} className="cp-path"><summary>{r.task}</summary><ol>{r.steps.map((s,j)=><li key={j}><strong>{s.action}</strong><p>{s.observed}</p><span className="cp-step-status">{s.status}</span><Refs p={p} ids={s.evidence}/></li>)}</ol>{r.limit&&<p className="muted">{r.limit}</p>}</details>)}</section>}
  {p.screenshots.length>0&&<details className="cp-block"><summary>实际截图（{p.screenshots.length}张）</summary><Images p={p}/></details>}
  {p.findings.length>0&&<section className="cp-block"><h3>设计作用与取舍</h3>{p.findings.map((f,i)=><article className="cp-finding" key={i}>{f.title&&<h4>{f.title}</h4>}<p><strong>页面事实：</strong>{f.fact}<Refs p={p} ids={f.evidence}/></p><p><strong>作用分析：</strong>{f.interpretation}</p><p><strong>代价与限制：</strong>{f.tradeoff}</p>{f.alternative&&<p><strong>其他解释或设计选择：</strong>{f.alternative}</p>}{f.effectUnknown&&<p className="muted">{f.effectUnknown}</p>}</article>)}</section>}
  <details className="cp-block"><summary>来源、取样与未完成部分</summary>{p.coverage.sampling&&<p>{p.coverage.sampling}</p>}{p.coverage.completed.length>0&&<><h3>已完成</h3><ul>{p.coverage.completed.map((x,i)=><li key={i}>{x}</li>)}</ul></>}<h3>尚缺</h3><ul>{p.coverage.gaps.map((x,i)=><li key={i}>{x}</li>)}</ul><ol className="cp-sources">{p.sources.map((s,i)=><li key={s.id+i}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><p>{s.scope}</p><small>{s.accessedAt}</small></li>)}</ol></details>
 </section>;
}

export function CategoryOperations({navigate}:{navigate:Navigate}){
 const rows=[
  ['jimeng','征集活动把制作规则和作品分发放在一起','所查品牌活动同时要求站内投稿、抖音发布和返稿问卷；详情中提供参赛作品流。','平台／合作方需要准备素材、审核、评选和激励；实际工时与活动回访未知。'],
  ['liblib','一项资源有不同使用门槛','工作流既可打开节点画布，也可作为应用表单使用；模型、模板和作品通过详情相连。','作者或平台需要配置输入、样例与说明，并维护资源和使用界面的一致性。'],
  ['runninghub','从任务分类进入可运行的应用','用途分类、工作流和应用页承担不同发现任务；所查工作流能转到对应应用并带示例输入。','示例可用性、参数说明与运行维护需要持续投入；仅有入口不证明成功率。'],
  ['tusi','作品反向引导到模型与参数','所查作品连接使用模型、模型版本和做同款；部分参数由用户决定是否采用。','模型说明、版本、示例与许可需要共同维护；作品互动不等于模型使用成功。'],
  ['datawhale','课程与活动分别组织内容和学习安排','课程详情展示目标人群、预期成果和章节；活动详情另列报名期限、进度与学习安排。','推断需要同步课程章节和活动状态；教学组织、同伴反馈执行、完成率与工时未知。'],
  ['huggingface','围绕资源组织接入与关联','模型详情的使用代码带入当前模型，并关联数据集、衍生模型与 Spaces。','推断需要维护说明、版本和资源关系；部分关系可能自动生成，人工投入、调用成功率与复用效果未知。'],
  ['linuxdo','把讨论沉淀为可查答案','所查已解决话题在首帖摘要展示接受答案，“阅读更多”实际跳至答案楼层。','需要参与者回应、确认答案及维护内容；接受标记不保证技术正确，总体解决率、响应时间与版主投入未知。']
 ];
 return <section className="cp-study cp-block"><h2>从页面看平台怎样组织内容</h2><div className="table-wrap"><table><thead><tr><th>平台与做法</th><th>页面证据</th><th>维护工作推断与未知成本</th></tr></thead><tbody>{rows.map(([id,title,fact,cost])=><tr key={id}><th>{title}<small>{data.profiles.find(p=>p.id===id)?.name}</small></th><td>{fact}<p><button className="text-button" onClick={()=>navigate(id,'category-path-profile')}>查看路径与截图 →</button></p></td><td>{cost}</td></tr>)}</tbody></table></div></section>;
}

export function CategoryAdoption({navigate}:{navigate:Navigate}){
 return <section className="cp-study cp-block" id="category-adoption"><h2>多元拾光可以借鉴什么</h2><p>社区以持续活跃为目标，内容看完后不必都导向生成。观看、阅读、找下一篇、关注系列和复用方法，需要各自有清楚的路径。</p><div className="table-wrap"><table><thead><tr><th>可以考虑的做法</th><th>采用条件</th><th>需要避免的误判</th></tr></thead><tbody>
  <tr><th>用途入口与内容类型分开</th><td>用途帮助找题材，内容类型帮助判断能看、能学还是能复用；先保证每个入口有足够相关内容。</td><td>一级菜单多不代表供给丰富。即梦和Liblib的分类不能直接复制成多元拾光的行业布局。</td></tr>
  <tr><th>按消费任务配置卡片与详情</th><td>图片突出画面；视频交代时长、标题和系列；教程展示能学到什么；可用资源交代输入、版本、效果和使用条件。</td><td>不是每种内容都需要独立频道，也不是所有资源都能套一个“使用”按钮。</td></tr>
  <tr><th>作品与制作过程相连，观看仍然独立成立</th><td>作者愿意提供过程时，关联教程、画布或工作流；普通读者可以继续看相关作品。</td><td>只有跳转MakeNow或调用API，不能算社区留存已经成立。工具入口应服务具体需求。</td></tr>
  <tr><th>系列需要明确关系</th><td>作者、主题、集数、更新状态与下一篇应可以连接；先整理真实系列，再决定是否做专属页面。</td><td>把“系列”写进标签或标题，并不能自动带来追更和复访。</td></tr>
  <tr><th>活动按供给能力选择规模</th><td>明确主题、作品要求、审核和回应责任；预算与维护人手由你们确定。</td><td>竞品的品牌合作、现金激励和跨平台征集，不是可以零成本照搬的日常运营方式。</td></tr>
 </tbody></table></div><p><button className="text-button" onClick={()=>navigate('content')}>查看上述判断的页面依据 →</button></p><p className="muted">这些是可比较的做法与采用条件，尚未据此选定方向；供给演练和长期用户观察仍由人工安排。</p></section>;
}

export function CategoryResearchNote({navigate}:{navigate:Navigate}){
 const inspected=data.profiles.filter(p=>p.navigation.length&&p.screenshots.length),limited=data.profiles.filter(p=>!p.navigation.length||!p.screenshots.length);
 return <section className="cp-study cp-block"><h3>分类、详情与按钮：已补页面路径证据</h3><p>{data.date}查阅，{inspected.length}个平台取得新的分类、内容详情或操作路径记录；{limited.map(p=>p.name).join('、')}仍缺当前产品界面。每个平台分别写明实际打开与仅看到入口的部分。</p><p>即梦的同款与参考图带入不同材料，Liblib的工作流与应用表单可能对应同一资源，部分短片能关联到制作画布。分类名称和按钮名称都不足以解释完整使用方式。</p><button className="text-button" onClick={()=>navigate('content')}>查看分类对照、实际路径与截图 →</button></section>;
}

'use client';
import {useState} from 'react';
import data from '@/lib/integrated-strategies.json';

export function IntegratedStrategies({navigate}:{navigate:(id:string)=>void}) {
 const [active,setActive]=useState('A');
 const o=data.options.find(x=>x.id===active)!;
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 const choose=(id:string)=>{setActive(id);jump('integrated-option');};
 return <article className="framework-study integrated-study">
  <div className="page-heading"><h1>{data.title}</h1></div>
  <p className="muted">{data.date} · {data.status}</p>

  <nav className="study-actions" aria-label="整体方案目录"><button className="text-button" onClick={()=>jump('integrated-matrix')}>四方向对照</button><button className="text-button" onClick={()=>jump('integrated-option')}>展示、使用与供给</button><button className="text-button" onClick={()=>jump('integrated-supply')}>合作与投入</button><button className="text-button" onClick={()=>jump('integrated-decision')}>当前判断</button><button className="text-button" onClick={()=>navigate('content')}>查看市场形式依据 →</button></nav>
  <section id="integrated-matrix"><h2>先比较主要承诺，再看页面与运营</h2><p>四个方向不是四套皮肤，也不是互斥的内容分类。它们选择优先保障不同的价值，因而需要不同的供给和维护。</p><div className="table-wrap"><table className="options-comparison"><thead><tr><th>比较项</th>{data.options.map(x=><th key={x.id}><button className="text-button" onClick={()=>choose(x.id)}>{x.id} · {x.name} →</button></th>)}</tr></thead><tbody>{data.comparison.map(r=><tr key={r.dimension}><th>{r.dimension}</th><td>{r.A}</td><td>{r.B}</td><td>{r.C}</td><td>{r.D}</td></tr>)}</tbody></table></div></section>
  <details className="study-sources"><summary>沿用的条件与仍缺少的资料</summary>{data.basis.map(b=><p key={b.label}><strong>{b.label}：</strong>{b.text}</p>)}</details>
  <section className="study-platform" id="integrated-option"><h2>每个方向具体怎样成立</h2><div className="compare-options" aria-label="选择整体方向">{data.options.map(x=><button className={x.id===active?'chosen':''} aria-pressed={x.id===active} onClick={()=>setActive(x.id)} key={x.id}>{x.id} · {x.name}</button>)}</div>
   <article key={o.id} aria-live="polite"><h3>{o.id} · {o.name}</h3><p className="lead">{o.promise}</p><p className="muted">{o.previous}</p><p><strong>用户与任务：</strong>{o.audience}</p><p><strong>回来做什么：</strong>{o.returnReason}</p><p><strong>决定性区别：</strong>{o.distinct}</p>
    <h3>一、用户看见什么</h3><p>{o.homeStyle}</p><div className="integrated-home">{o.homepage.map((x,i)=><div key={x.zone}><span className="muted">首页位置 {i+1}</span><h4>{x.zone}</h4><p>{x.content}</p><p className="muted">{x.why}</p></div>)}</div>
    <h4>卡片与内容示例</h4><p className="muted">以下12条示例均为虚构。此处显示当前方向的3条，用于比较内容组织；不代表已有作品、实测结果或上线能力。</p><div className="integrated-cards">{o.cards.map(c=><section key={c.title} className="integrated-card"><span>{c.type}</span><h4>{c.title}</h4><p>{c.summary}</p><ul>{c.fields.map(f=><li key={f}>{f}</li>)}</ul><p className="integrated-action">主要动作：{c.action}</p><p className="muted">{c.visual}</p></section>)}</div>
    <h4>点进详情后：{o.detailTitle}</h4><ol className="integrated-detail">{o.detail.map(d=><li key={d.label}><strong>{d.label}</strong><p>{d.text}</p></li>)}</ol>
    <h4>内容形式如何分工</h4><dl className="study-definition"><div><dt>主要内容</dt><dd>{o.formats.primary}</dd></div><div><dt>辅助内容</dt><dd>{o.formats.support}</dd></div><div><dt>暂缓扩展</dt><dd>{o.formats.defer}</dd></div></dl><p>{o.formats.why}</p>
    <h3>二、怎样使用，为什么再来</h3><div className="table-wrap"><table><thead><tr><th>阶段</th><th>用户行动</th><th>观察信号，尚未验证</th></tr></thead><tbody>{o.journey.map(j=><tr key={j.step}><th>{j.step}</th><td>{j.action}</td><td>{j.signal}</td></tr>)}</tbody></table></div>
    <h3>三、谁持续供给，交付到什么程度</h3><div className="table-wrap"><table className="integrated-supply-table"><thead><tr><th>角色</th><th>交付与验收</th><th>后续责任</th><th>回报与成本</th></tr></thead><tbody>{o.supply.map(s=><tr key={s.role}><th>{s.role}</th><td><p>{s.deliver}</p><p><strong>验收：</strong>{s.accept}</p></td><td>{s.maintain}</td><td>{s.return}</td></tr>)}</tbody></table></div>
    <h4>最小样例包</h4><p>以下数量是比较用交付要求，不是现有产能或已批准排程。四份方案不会自动同时启动。</p><ul>{o.starter.map(s=><li key={s}>{s}</li>)}</ul><p><strong>质量要求：</strong>{o.quality}</p><p><strong>供给不足时怎样调整：</strong>{o.reduce}</p>
    <h3>四、工具、经营与团队取舍</h3><p><strong>工具在路径中的位置：</strong>{o.tools}</p><p><strong>收入与成本：</strong>{o.economy}</p><p><strong>没有工具销售时的价值：</strong>{o.noTools}</p><dl className="study-definition"><div><dt>产品</dt><dd>{o.capacity.product}</dd></div><div><dt>运营</dt><dd>{o.capacity.operations}</dd></div><div><dt>两位研发</dt><dd>{o.capacity.development}</dd></div><div><dt>外部专业供给</dt><dd>{o.capacity.external}</dd></div><div><dt>被挤占的工作</dt><dd>{o.capacity.displaced}</dd></div></dl><p className="notice"><strong>停止扩张条件：</strong>{o.stop}</p>
    <h4>竞品依据与推断边界</h4><p>{o.evidenceWhy}</p><ul>{o.evidenceIds.map(id=>{const s=data.sources.find(s=>s.id===id)!;const check=data.sourceChecks.find(c=>c.id===id);return <li key={id}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a><p className="muted">{check?check.result:s.access+'；'+s.scope}</p></li>;})}</ul>
   </article>
  </section>
  <section className="study-platform"><h2>多种内容可以共存，承诺不能无限叠加</h2>{data.shared.map(s=><div key={s.name}><h3>{s.name}</h3><p>{s.text}</p></div>)}</section>
  <section className="study-platform" id="integrated-supply"><h2>合作供给与统一投入口径</h2><ol>{data.supplyProcess.map(s=><li key={s.step}><strong>{s.step}</strong><p>{s.work}</p></li>)}</ol><h3>比较一个任务包及一次后续更新</h3><p>相同发帖数不代表相同劳动。先扣除主营业务和既定任务占用，再约定同一现金与内部工时上限；当前工时、报价和调用成本资料不足，不能给四个方向填精确人效排名。</p><div className="table-wrap"><table><thead><tr><th>投入类别</th><th>应记录什么</th></tr></thead><tbody><tr><th>首次准备</th><td>选题、作者材料、编辑、审校、必要能力补齐，以及被推迟的原工作。</td></tr><tr><th>每份新增内容</th><td>核心材料、授权、复核与额外包装；同一案例的图文和视频不算两份独立方法。</td></tr><tr><th>每次使用与求助</th><td>调用、失败重试、解释、专业答复与分流；使用正常免费额度仍有资源成本。</td></tr><tr><th>存量维护</th><td>链接、模型与版本变化、修订和归档；旧内容越多，责任越多。</td></tr><tr><th>专业人手</th><td>编辑、技术作者、创作作者或主理人；尚未合作的人不算现有产能。</td></tr></tbody></table></div>
   <h3>四周准备草案</h3><p className="muted">周次只表达先后关系，先确认专业人员和可分配资源，再形成实际排程。未招募、采购、调用或开展用户实验。</p><div className="table-wrap"><table><thead><tr><th>阶段</th><th>准备交付</th><th>检查条件</th></tr></thead><tbody>{data.preparation.map(p=><tr key={p.period}><th>{p.period}</th><td>{p.deliver}</td><td>{p.gate}</td></tr>)}</tbody></table></div>
  </section>
  <section className="study-platform"><h2>规模、活跃、供给与经营分别判断</h2><div className="table-wrap"><table><thead><tr><th>维度</th><th>拟采用口径</th><th>不能据此宣称</th></tr></thead><tbody>{data.measurement.map(m=><tr key={m.dimension}><th>{m.dimension}</th><td>{m.definition}</td><td>{m.boundary}</td></tr>)}</tbody></table></div></section>
  <section className="study-platform" id="integrated-decision"><h2>当前判断与改变判断的条件</h2><p className="lead">{data.recommendation.headline}</p><p>{data.recommendation.why}</p><ul>{data.recommendation.rules.map(r=><li key={r}>{r}</li>)}</ul><p>{data.recommendation.combination}</p><p>{data.recommendation.next}</p><div className="study-actions"><button className="text-button" onClick={()=>navigate('content')}>回到15种市场形式 →</button></div></section>
 </article>;
}

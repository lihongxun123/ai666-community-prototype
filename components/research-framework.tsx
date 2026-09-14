'use client';
import { useState } from 'react';
import data from '@/lib/research-framework.json';

function Sources({ sources }: { sources: {title:string;url:string;scope?:string}[] }) {
 return <span className="study-refs">{sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" title={s.scope}>〔{s.title}〕</a>)}</span>;
}

export function ToolSupportProfile({ id, navigate }: {id:string;navigate:(id:string)=>void}) {
 const p=data.platforms.find(p=>p.id===id);
 if(!p) return null;
 return <section className="study-platform framework-profile" id="tool-support">
  <div className="section-heading"><h2>社区与工具是什么关系</h2><span>{data.date}</span></div>
  <p><strong>执行能力：</strong>{p.execution}</p><p><strong>内容如何关联工具：</strong>{p.connection}</p><p><strong>付费对象：</strong>{p.billing}</p>
  <p className="muted"><strong>边界与变化：</strong>{p.limit}</p><Sources sources={p.sources}/>

  <button className="text-button" onClick={()=>navigate('discussion')}>查看18家对照与内容质量讨论 →</button>
 </section>;
}

export function ResearchFramework({navigate}:{navigate:(id:string)=>void}) {
 const [kind,setKind]=useState('all');
 const platforms=kind==='all'?data.platforms:data.platforms.filter(p=>p.kind===kind);
 const jump=(id:string)=>document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
 return <div className="framework-study">
  <div className="page-heading"><h1>{data.title}</h1></div>

  <nav className="study-actions" aria-label="讨论目录">{[['framework-content','内容与质量'],['framework-tools','18家工具关系'],['framework-economics','收费对象']].map(([id,label])=><button className="text-button" key={id} onClick={()=>jump(id)}>{label}</button>)}</nav>



  <section id="framework-content" className="study-platform"><div className="section-heading"><h2>内容分类与承载方式</h2><span>分类是分析，不是开发清单</span></div>
   <div className="table-wrap"><table><thead><tr><th>层次</th><th>包括什么</th><th>回答的问题与边界</th></tr></thead><tbody>{data.layers.map(x=><tr key={x.layer}><th>{x.layer}</th><td>{x.examples}</td><td><p>{x.meaning}</p><p className="muted">{x.boundary}</p></td></tr>)}</tbody></table></div>
   <p className="muted">格式与能力定义参照官方文档；上述分层是本报告的组织分析。<Sources sources={data.definitionSources}/></p>
   <h3>不同内容的交付要求</h3><p>展示作品、解释方法、提供材料和在线执行是不同承诺，不是四个质量等级。艺术作品可以只有作品；声称可复用或可执行时，才增加对应要求。</p>
   <div className="table-wrap"><table><thead><tr><th>承诺</th><th>最低要求</th><th>证据与限制</th></tr></thead><tbody>{data.promises.map(x=><tr key={x.promise}><th>{x.promise}</th><td>{x.minimum}</td><td><p>{x.evidence}</p><p className="muted">{x.notRequired}</p></td></tr>)}</tbody></table></div>
   <div className="study-actions"><button className="text-button" onClick={()=>navigate('content')}>对照内容形态文档与真实截图 →</button><button className="text-button" onClick={()=>navigate('operations')}>对照作者供给与运营研究 →</button></div>
  </section>

  <section id="framework-tools" className="study-platform"><div className="section-heading"><h2>18家里，15家有平台直接执行能力的官方证据</h2><span>关联API另列1家</span></div><p>{data.countBoundary}</p>
   <div className="table-wrap"><table><thead><tr><th>主要关系</th><th>数量</th><th>统计定义</th></tr></thead><tbody>{data.countRules.map(x=><tr key={x.kind}><th>{x.label}</th><td>{x.count}</td><td>{x.definition}</td></tr>)}</tbody></table></div>
   <div className="compare-options" aria-label="按工具关系筛选"><button aria-pressed={kind==='all'} className={kind==='all'?'chosen':''} onClick={()=>setKind('all')}>全部18家</button>{data.countRules.map(x=><button key={x.kind} aria-pressed={kind===x.kind} className={kind===x.kind?'chosen':''} onClick={()=>setKind(x.kind)}>{x.label} · {x.count}</button>)}</div>
   <p className="muted" aria-live="polite">显示{platforms.length}家。社区结构为分析归类；工具能力与计费依据逐行附来源。类别按主要关系划分，不等于收入占比。</p>
   <div className="table-wrap"><table className="framework-matrix"><thead><tr><th>平台 / 社区结构</th><th>执行能力与内容</th><th>内容如何关联工具</th><th>谁为什么付费</th><th>证据边界与来源</th></tr></thead><tbody>{platforms.map(p=><tr key={p.id}><th><button className="text-button" onClick={()=>navigate(p.id)}>{p.name} ↗</button><p className="muted">{p.community}</p></th><td><p>{p.execution}</p><p className="muted">{p.objects}</p></td><td>{p.connection}</td><td>{p.billing}</td><td><p>{p.limit}</p><Sources sources={p.sources}/></td></tr>)}</tbody></table></div>
   <div className="notice"><strong>工具、收入与利润的证据要求</strong><p>有工具 → 工具可收费 → 主要收入来自工具 → 主要利润来自Token价差。每一步都需要额外证据；即便产品收入已披露，也不能反推社区贡献或盈利。</p></div>
  </section>

  <section id="framework-economics" className="study-platform"><div className="section-heading"><h2>用户购买的东西，往往多于计算用量</h2><span>收费项目、计费单位与社区作用</span></div>
   <div className="table-wrap"><table><thead><tr><th>单位或商品</th><th>具体含义</th><th>不能推出什么</th></tr></thead><tbody>{data.billing.map(x=><tr key={x.unit}><th>{x.unit}</th><td>{x.meaning}</td><td>{x.trap}</td></tr>)}</tbody></table></div>

  </section>


 </div>;
}

export function FrameworkContentPlanning() {
 return <section id="adoption-framework-content" className="study-platform">
  <h2>内容设计与维护要求</h2><p className="muted">{data.candidateNotice}</p>
  <h3>{data.objects.length}类内容的卡片与详情</h3>
  <div className="table-wrap"><table><thead><tr><th>对象</th><th>卡片与详情</th><th>维护与质量判断</th></tr></thead><tbody>{data.objects.map(x=><tr key={x.name}><th>{x.name}</th><td><p><strong>卡片：</strong>{x.card}</p><p><strong>详情：</strong>{x.detail}</p></td><td><p>{x.maintenance}</p><p className="muted">{x.quality}</p></td></tr>)}</tbody></table></div>
  <h3>材料与入口如何关联</h3><ol>{data.organization.map(x=><li key={x}>{x}</li>)}</ol>
  <h3>质量标准与维护边界</h3><ul>{data.qualityLimits.map(x=><li key={x}>{x}</li>)}</ul>
  <p className="muted">格式与能力定义：<Sources sources={data.definitionSources}/></p>
 </section>;
}

export function FrameworkPlanning({navigate}:{navigate:(id:string)=>void}){return <div><section id="framework-questions" className="study-platform"><div className="section-heading"><h2>三个问题，各自能确认到哪里</h2><span>用户输入 / 事实 / 判断</span></div>
   {data.agreements.map(a=><article key={a.topic} className="study-mechanism"><h3>{a.topic}</h3><p><strong>当时输入：</strong>{a.input}</p><p><strong>事实与边界：</strong>{a.fact}</p><p><strong>研究判断：</strong>{a.judgment}</p><p><strong>后续材料：</strong>{a.next}</p></article>)}
  </section>
<section id="framework-positioning" className="study-platform"><div className="section-heading"><h2>方案比较所需条件</h2><span>已启动</span></div><p>候选方案处于比较阶段，最终方向未定；缺少的资料列为条件和待验证假设。</p><button className="text-button" onClick={()=>navigate('strategy')}>查看方向与组织方式 →</button><ul>{data.positioning.distinctions.map(x=><li key={x}>{x}</li>)}</ul>
   <div className="table-wrap"><table><thead><tr><th>待补材料</th><th>记录内容</th><th>用来判断</th></tr></thead><tbody>{data.positioning.inputs.map(x=><tr key={x.item}><th>{x.item}</th><td>{x.need}</td><td>{x.use}</td></tr>)}</tbody></table></div>
   <p>三种候选方向按持续需要、供给和回访比较；具体的编选、方法维护、作品过程和练习反馈按需组合。真实消费、持续活跃及成本会改变投入顺序。</p><h3>仍可继续补充的竞品证据</h3><ol>{data.researchNext.slice(0,3).map(x=><li key={x}>{x}</li>)}</ol>
   <p className="muted">早期定位设想见历史附录。候选方案已进入比较；采购、招募、产品改版与研发执行尚未启动。</p>
  </section></div>;}

export function ToolModelPlanning(){return <section>   <h3>怎样判断这种模式是否适合多元拾光</h3><p className="muted">下表是评估问题，尚非已完成实验。支持与限制线索需要结合具体环节判断，不能单独当因果证据。</p>
   <div className="table-wrap"><table><thead><tr><th>问题</th><th>支持线索</th><th>限制线索</th><th>仍需证据</th></tr></thead><tbody>{data.testsOfModel.map(x=><tr key={x.question}><th>{x.question}</th><td>{x.positive}</td><td>{x.negative}</td><td>{x.needed}</td></tr>)}</tbody></table></div>
   <p>{data.economics}</p></section>;}

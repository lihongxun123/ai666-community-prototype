/* eslint-disable next/no-html-link-for-pages, next/no-img-element */
import designs from '@/lib/community-designs.json';
import evidence from '@/lib/community-design-evidence.json';
import review from '@/lib/community-scenario-review.json';
import '@/components/market-social.css';
import './community-design.css';
export default function CommunityDesign({id}:{id:string}) {
 const d=designs.find(x=>x.id===id)!;
 const current:Record<string,string>={practice:'a',creator:'c',resource:'d',help:'e'};
 const currentHref=current[id]?'/community-options/proposals/'+current[id]:'/community-options/scenarios';
 const r=review.items.find(x=>x.id===id)!;
 return <main className="ms-report blueprint-report cd-report">
 <p><a href="/community-options">当前五套方案</a> / 专题设计参考</p><aside className="ms-lead"><strong>专题设计参考</strong><p>本页保留较早的专题方案与案例。当前五套按任务创作、项目共学、创作者研讨、方法共建、问题互助组织，行业作为共同聚焦维度。</p><a href={currentHref}>查看当前方案与取舍 →</a></aside>
 <nav className="blueprint-picker" aria-label="较早专题设计">{designs.map(x=><a key={x.id} href={'/community-options/design/'+x.id} aria-current={id===x.id?'page':undefined}>{x.name}</a>)}</nav>
 <header className="page-heading"><p className="ms-caption">专题设计 · 拟议参考</p><h1>{d.name}</h1><p>{d.decision}</p></header>
 <nav className="ms-links cd-nav" aria-label="本页目录">{[['value','用户与价值'],['experience','内容与路径'],['operate','供给与运营'],['product','产品与取舍'],['evidence','案例依据']].map(([key,label])=><a href={'#'+key} key={key}>{label}</a>)}</nav>
 <p className="ms-caption">以下为专题设计参考；当前方案与供给条件见方案比较。<a href="/community-options/presentation" target="_blank" rel="noopener noreferrer">查看组合方案与取舍 ↗</a></p>
 <section id="value"><h2>用户为什么来</h2><p>{d.scenario}</p><div className="ms-lead"><strong>希望带来的结果</strong><p>{d.outcome}</p></div><p className="ms-caption">情境与页面示例用于解释方案；真实材料见下方“案例依据”。</p></section>
 <section id="experience"><h2>内容怎样组织</h2><div className="cd-home">{d.home.map(([name,body],i)=><article key={name}><span>0{i+1}</span><h3>{name}</h3><p>{body}</p></article>)}</div><div className="cd-example"><p className="ms-caption">设计示例</p><h3>{d.example.title}</h3><p>{d.example.body}</p><div className="cd-fields">{d.example.fields.map(f=><span key={f}>{f}</span>)}</div></div><h3>从进入到获得结果</h3><ol className="blueprint-flow">{d.journey.map(([name,body],i)=><li key={name}><span>0{i+1}</span><strong>{name}</strong><p>{body}</p></li>)}</ol></section>
 <section id="operate"><h2>谁供给，怎样持续运转</h2><div className="ms-grid three">{d.supply.map(([name,body])=><article key={name}><h3>{name}</h3><p>{body}</p></article>)}</div><div className="cd-ops">{d.ops.map(([name,body],i)=><div key={name}><span>0{i+1}</span><h3>{name}</h3><p>{body}</p></div>)}</div></section>
 {(id==='vertical'||id==='help')&&<section><h2>需要专业帮助时，怎样承接</h2><p>普通讨论自愿参与。若提出明确服务请求，先由社区协调者核对问题、可公开材料与所需能力，再由实际承接者决定是否接受。</p><ol className="blueprint-flow"><li><span>01</span><strong>界定问题</strong><p>请求者描述目标、已有尝试和希望得到的交付。材料只提供必要部分，敏感或无权分享的内容不进入公开区。</p></li><li><span>02</span><strong>确认能力</strong><p>承接者说明经验、工作范围和排除项；匹配不足时，给原渠道或已有资料入口。</p></li><li><span>03</span><strong>双方约定</strong><p>确认材料许可、交付形式、时间、回报、修改范围和退出方式，再开始服务。</p></li><li><span>04</span><strong>交付与核对</strong><p>承接者说明依据与处理结果；请求者核对目标与业务事实，专业内容由相应能力人员审核。</p></li><li><span>05</span><strong>结束与归档</strong><p>完成、部分完成和中止分别记录；社区协调者记录并协调争议，专业结果仍由对应人员判断；公开案例另征双方许可。</p></li></ol></section>}
 <section id="product"><h2>产品承接与投入取舍</h2><div className="ms-grid two"><article><h3>必要能力</h3><ul>{d.product.map(x=><li key={x}>{x}</li>)}</ul></article><article><h3>暂缓部分</h3><ul>{d.defer.map(x=><li key={x}>{x}</li>)}</ul></article></div><p><strong>容易失效的地方：</strong>{d.failure}</p><p><strong>何时调整选择：</strong>{r.changeIf}</p></section>
 <section id="evidence"><h2>案例怎样支持设计</h2><p>{r.reason}</p><p className="ms-caption">竞品截图复用已有归档，反映采集时的页面。以下将观察事实与设计建议分别说明。</p>
 {evidence.visuals.filter(x=>x.id===id).map(v=><figure className="cd-figure" key={v.image}><h3>{v.title}</h3><a href={v.image} target="_blank" rel="noopener noreferrer"><img src={v.image} alt={v.title+'，已归档页面截图'} loading="lazy" /></a><figcaption><p><strong>页面可见：</strong>{v.observed}</p><p><strong>设计建议：</strong>{v.implication}</p><p className="ms-caption">{v.caveat}</p><p className="ms-caption">{v.date} · <a href={v.source} target="_blank" rel="noopener noreferrer">来源档案 ↗</a> · <a href={v.sourcePage} target="_blank" rel="noopener noreferrer">原始页面 ↗</a> · 点击图片查看原尺寸</p></figcaption></figure>)}
 <h3>真实任务、已有满足与反例</h3>{r.cases.map(c=><article className="cd-case" key={c.id}><h4>{c.title}</h4><p className="ms-caption">{c.basis}</p><p>{c.observed}</p><p>{c.remaining}</p><p className="ms-links">{c.sources.map(s=><a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</p></article>)}
 {evidence.social.filter(x=>x.schemes.includes(id)).map(c=><article className="cd-case" key={c.id}><p className="ms-caption">抖音作品与评论 · {c.id} · 发布 {c.published} · 读取 {c.read}</p><h3><a href={c.url} target="_blank" rel="noopener noreferrer">{c.title} ↗</a></h3><ul>{c.comments.map(t=><li key={t}>{t}</li>)}</ul><p><strong>设计启发：</strong>{c.meaning}</p><p className="ms-caption">归档位置：{c.positions} · <a href={c.archive} target="_blank" rel="noopener noreferrer">评论与回应记录 ↗</a></p><p className="ms-caption">公开评论匿名转述；未记录提问者完成验证。两条作品来自同一作者，重复用于不同方案时仍计为同源材料。</p></article>)}
 <div className="ms-lead"><strong>对方案的约束</strong><p>{r.counter}</p><p>{r.revision}</p></div><p className="ms-caption">{r.unknown}</p><p><a href={'/community-options/review#'+id} target="_blank" rel="noopener noreferrer">查看竞品机制、迁移条件与完整取舍 ↗</a></p></section>
 </main>;
}

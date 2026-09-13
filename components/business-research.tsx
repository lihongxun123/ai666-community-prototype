import type {ReactNode} from 'react';
import type { BusinessInsight, BusinessProfileData, BusinessSource } from '@/lib/business-types';

function References({ ids, sources }: { ids: string[]; sources: BusinessSource[] }) {
  return <div className="citations business-citations">{ids.map(id => {
    const source = sources.find(item => item.id === id);
    return source ? <a key={id} href={source.url} target="_blank" rel="noreferrer">{source.publisher} · {source.title}</a> : null;
  })}</div>;
}

export function BusinessOverview({ data, insights, onSelect, filter }: {
  data: BusinessProfileData[];
  insights: BusinessInsight[];
  onSelect: (id: string) => void; filter?:ReactNode;
}) {
  return <div className="business-report">
    <div className="page-heading"><h1>商业模式与规模</h1></div>{filter}

    <nav className="article-toc" aria-label="经营研究章节">{[['business-comparison','逐家商业对照'],['business-method','规模数字怎样读'],['business-findings','对多元拾光的判断与验证建议']].map(([id,label])=><a key={id} href="#business" onClick={event=>{event.preventDefault();document.getElementById(id)?.scrollIntoView({block:'start'});}}>{label}</a>)}</nav>
    <p className="business-reading-note">下表沿用页面筛选。规模栏保留原指标、日期与证据性质；各指标不能直接排序，也不据此估算市场份额。</p>
    <div className="table-wrap" id="business-comparison"><table className="comparison-table business-comparison"><caption>商业路径对照。任务与付费动机主要为产品规则支持的画像推断，比例未知时不估算。点击竞品查看完整分析。</caption><thead><tr><th scope="col">竞品</th><th scope="col">谁付钱</th><th scope="col">收入从哪里来</th><th scope="col">公开规模线索</th><th scope="col">值得观察的用户</th></tr></thead><tbody>{data.map(item => <tr key={item.id}>
      <th scope="row"><button onClick={() => onSelect(item.id)}>{item.name}</button></th>
      <td>{item.payer}</td><td>{item.revenueModel}</td>
      <td>{item.metrics.slice(0, 2).map((metric, index) => <div className="business-metric-brief" key={`${metric.label}-${index}`}><strong>{metric.label}：{metric.value}</strong><small>{metric.period} · {metric.kind}<br/>{metric.scope}</small><References ids={metric.refs} sources={item.sources}/></div>)}</td>
      <td>{item.segments.map(segment => <p key={segment.name}>{segment.name}</p>)}</td>
    </tr>)}</tbody></table></div>
    {data.length === 0 && <p className="empty">没有匹配结果，请清除页面筛选。</p>}
    <section className="business-method" id="business-method"><h2>规模数字怎样读</h2><dl>
      <dt>收入 / ARR</dt><dd>期间收入记录已发生的经营结果；ARR 是某一时点的年化经常性收入。季度收入、ARR、累计流水各自保留口径。</dd>
      <dt>活跃 / 注册 / 访问</dt><dd>月活、累计注册、网站访问次数不能换算。设备、账号、访次是否去重，需要来源明示；第三方流量也不能补出付费率。</dd>
      <dt>供给 / 需求</dt><dd>模型、应用、作品、下载和星标衡量不同的活动。资源多不证明资源被反复使用；创作者多不证明消费者愿意付费。</dd>
      <dt>公司 / 产品 / 社区</dt><dd>集团收入、工具收入与社区收入分开。融资或收购对价说明资本安排，不能作为销售或利润；用户画像也不能用母平台人群替代。</dd>
    </dl></section>
    <div id="business-findings">{insights.slice(0,3).map(insight => <section className="essay-section business-insight" key={insight.title}><h2>{insight.title}</h2>{insight.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{insight.refs.length > 0 && <div className="citations business-citations">{insight.refs.map(ref => <a href={ref.url} key={ref.url} target="_blank" rel="noreferrer">{ref.title}</a>)}</div>}</section>)}<details className="data-gaps"><summary>后续附录：多元拾光的用户研究与试用构想</summary><p>自身业务验证建议，尚未执行，不计入竞品调研。</p>{insights.slice(3).map(insight=><section className="essay-section business-insight" key={insight.title}><h3>{insight.title}</h3>{insight.paragraphs.map((paragraph,index)=><p key={index}>{paragraph}</p>)}<div className="citations business-citations">{insight.refs.map(ref=><a href={ref.url} key={ref.url} target="_blank" rel="noreferrer">{ref.title}</a>)}</div></section>)}</details></div>
  </div>;
}

export function BusinessProfile({ data }: { data: BusinessProfileData }) {
  return <section id="commercial" className="business-report business-profile">
    <div className="section-heading"><h2>商业化、规模与用户</h2><span>经营资料补充 · 2026.09.09</span></div>

    <p className="business-summary">{data.summary}</p>
    <dl className="business-key-facts"><dt>主要付款者</dt><dd>{data.payer}</dd><dt>收费结构</dt><dd>{data.revenueModel}</dd></dl>
    <h3>商业化路径</h3>
    {data.commercialization.map(block => <article className="business-block" key={block.title}><h4>{block.title}</h4>{block.text.split('\n').filter(Boolean).map((text, index) => <p key={index}>{text}</p>)}<References ids={block.refs} sources={data.sources}/></article>)}
    <h3>规模：已披露什么，还缺什么</h3>
    <div className="table-wrap"><table className="business-metrics"><thead><tr><th scope="col">指标与原始数值</th><th scope="col">日期、对象和证据性质</th><th scope="col">可以怎样理解</th></tr></thead><tbody>{data.metrics.map((metric, index) => <tr key={`${metric.label}-${index}`}><th scope="row">{metric.label}<strong>{metric.value}</strong></th><td>{metric.period}<p>{metric.scope}</p><span className="business-evidence-label">{metric.kind}</span><References ids={metric.refs} sources={data.sources}/></td><td><p>{metric.meaning}</p><p className="business-limit">边界：{metric.limitation}</p></td></tr>)}</tbody></table></div>
    <h3>用户结构与付费动机</h3><p className="business-reading-note">下列人群按任务区分。除明确引用的人口或行为统计外，均为基于产品、案例和规则的分析，不能当作平台用户占比或访谈结论。</p>
    {data.segments.map(segment => <article className="business-segment" key={segment.name}><h4>{segment.name}</h4><dl><dt>要完成的事</dt><dd>{segment.job}</dd><dt>付费触发</dt><dd>{segment.payTrigger}</dd><dt>再次回来</dt><dd>{segment.returnReason}</dd><dt>依据与边界</dt><dd>{segment.evidence}<References ids={segment.refs} sources={data.sources}/></dd></dl></article>)}
    <h3>从接触到付费，再到复用</h3><p className="business-reading-note">路径分析；没有取得各步人数和转化率，不视为已验证漏斗。</p><ol className="business-funnel">{data.funnel.map((step, index) => <li key={index}>{step}</li>)}</ol>
    <h3>收入背后的成本与约束</h3>{data.economics.map((paragraph, index) => <p className="business-paragraph" key={index}>{paragraph}</p>)}
    <h3>对多元拾光的判断</h3>{data.implications.map((paragraph, index) => <p className="business-paragraph" key={index}>{paragraph}</p>)}
    <details className="business-unknowns" open><summary>尚不能回答的问题</summary><ul>{data.unknowns.map((text, index) => <li key={index}>{text}</li>)}</ul></details>
    <details className="business-source-list"><summary>经营资料来源（{data.sources.length} 条）</summary>{data.sources.map(source => <div className="source-row" key={source.id}><div><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a><p>{source.publisher} · {source.type} · {source.date}</p><p>{source.note}</p><small>查阅：{source.accessedAt}</small></div></div>)}</details>
  </section>;
}

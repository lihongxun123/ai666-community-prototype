import data from '@/lib/liblib-window-study.json';
import alternatives from '@/lib/liblib-task-alternatives.json';
import categories from '@/lib/liblib-category-study.json';
import coverage from '@/lib/liblib-coverage-followup.json';
import { LiblibWeekSupply } from './liblib-week-supply';
import { LiblibSupplyScope } from './liblib-supply-scope';
import { LiblibCrossEntrySupply } from './liblib-cross-entry-supply';

export function LiblibWindowStudy(){return <section id="liblib-supply-distribution">
  <h3>{data.title}</h3>
  <LiblibSupplyScope/>
  <p>{data.summary}</p><p>{data.boundary}</p>
  <figure className="supply-chart"><figcaption><strong>1天筛选窗口：资源形式（106条）</strong></figcaption><div className="supply-chart-rows">{data.forms.map(r=><div className="supply-chart-row" key={r.label}><span>{r.label}</span><div className="supply-bar-track"><span className="supply-bar" style={{width:r.percent+'%'}}/></div><strong>{r.count} · {r.percent}%</strong></div>)}</div></figure>
  <h4>用途构成：标题初步编码</h4><p>{data.codingNote}</p>
  <div className="table-wrap"><table><thead><tr><th>主主题</th><th>条数</th><th>观察集合内占比</th></tr></thead><tbody>{data.themes.map(r=><tr key={r.label}><th>{r.label}</th><td>{r.count}</td><td>{r.percent}%</td></tr>)}</tbody></table></div>
  <p>空间风格和人物外观在这组样本中较多。全站供给结构、电商需求规模、资源兼容条件、供给者集中度和实际消费仍需分别核对。</p>
  <details><summary>106条资源与统计范围</summary><p>读取日期：{data.date}。{data.scope} <a href={data.source} target="_blank" rel="noreferrer">目录来源 ↗</a></p><p>资源按ID去重，跨排序不重复计数；不合并不同ID的疑似同源资源。条目序号不表示排名。百分比四舍五入后合计可能不为100%。</p><div className="table-wrap"><table><thead><tr><th>资源</th><th>形式</th><th>标题初步归类</th></tr></thead><tbody>{data.resources.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.form}</td><td>{r.theme}</td></tr>)}</tbody></table></div></details>
  <h4>平台分类与交叉分发</h4>
  <p>{categories.scope} 九类合计{categories.membershipCount}条归属，去重后为{categories.uniqueCount}份资源；{categories.overlaps.length}份同时进入两个分类。</p>
  <div className="table-wrap"><table><thead><tr><th>平台分类</th><th>返回资源数</th></tr></thead><tbody>{categories.categories.map(r=><tr key={r.name}><th>{r.name}</th><td>{r.count}</td></tr>)}</tbody></table></div>
  {categories.findings.map(t=><p key={t}>{t}</p>)}
  <p>71份均可匹配到106份观察集合，另有35份没有在九分类结果中匹配到。逐条核对后，这35份均仍在全部入口中，详情也均有标签。分类入口与详情标签的覆盖范围存在差异。{categories.boundary}</p>
  <details><summary>跨分类资源与各类成员</summary>
    <div className="table-wrap"><table><thead><tr><th>交叉资源</th><th>出现入口</th></tr></thead><tbody>{categories.overlaps.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.categories.join('、')}</td></tr>)}</tbody></table></div>
    {categories.categories.map(c=><details key={c.name}><summary>{c.name}（{c.count}）</summary><ul>{c.resources.map(r=><li key={r.id}><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></li>)}</ul></details>)}
    <details><summary>35份未匹配资源的详情标签</summary><div className="table-wrap"><table><thead><tr><th>资源</th><th>详情可见标签</th></tr></thead><tbody>{coverage.details.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.tags.join('、')}</td></tr>)}</tbody></table></div></details>
  </details>
  <h4>入口覆盖受哪些因素影响</h4>
  <p>11份未匹配的室内资源均带有“家居家具、写实”标签。已进入建筑分类的对照资源还带有“住宅空间”；已进入摄影分类的人像对照则多出“日常摄影”。{coverage.interpretation}</p>
  <div className="table-wrap"><table><thead><tr><th>已匹配的对照资源</th><th>入口</th><th>详情标签</th></tr></thead><tbody>{coverage.controls.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.category}</td><td>{r.tags.join('、')}</td></tr>)}</tbody></table></div>
  <LiblibWeekSupply/>
  <LiblibCrossEntrySupply/>
  <h4>工作流的供给形式与时间口径</h4>
  <p>工作流目录按具体操作组织：{coverage.workflow.categories.join('、')}。这些是界面可见选项，尚未逐类采集。其筛选写的是“版本发布时间”，与资源首次发布不是同一概念。全部入口、一天筛选、推荐排序返回8份资源，卡片标识为5份工作流和3份AI应用；这不是一天新建工作流总量。</p>
  <details><summary>工作流一天筛选的8份资源</summary><p>{coverage.workflow.scope} {coverage.workflow.note} <a href={coverage.workflow.source} target="_blank" rel="noreferrer">目录来源 ↗</a></p><div className="table-wrap"><table><thead><tr><th>资源</th><th>卡片标识</th></tr></thead><tbody>{coverage.workflow.resources.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.form}</td></tr>)}</tbody></table></div></details>
  <h3>需求对应的替代供给</h3>
  <p>12份不同署名作者的资源说明中，5份有本地说明、文件线索或独立运行回报。换背景工作流还出现一位使用者替换节点后本地跑通的回报；另一个工作流依赖BizyAir云端，页面显示暂无法在线运行。平台已有本地路径，具体资源的依赖、许可与效果需要分别判断。</p>
  <p>商品保持的限制更具体：部分流程需要后期合成，部分重绘或放大步骤可能改变文字和产品细节。这些限制来自作者说明，仍缺独立使用者的交付结果，同类任务的整体成功率未知。</p>
  <details open><summary>12份候选替代资源的适用条件</summary><div className="table-wrap"><table><thead><tr><th>资源与来源</th><th>输入与运行条件</th><th>效果与限制</th></tr></thead><tbody>{alternatives.resources.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a><p>{r.author} · {r.form}</p></td><td><p>{r.inputs_dependencies}</p><p>{r.download_local_evidence}</p></td><td><p>{r.limits_or_counterevidence}</p><p>{r.independent_user_evidence}</p></td></tr>)}</tbody></table></div></details>
  <p>来源为2026-09-15读取的公开详情及检索缓存，读取日期不代表内容更新日期。两段式换背景资源的详情链接跳转至首页，其说明仅保留为历史缓存依据；无法据此确认已下架。</p>
  <h4>使用结果能说明什么</h4>
  <p>电商场景渲染的公开讨论中，1条反馈称商品未变形，另有毛绒坐垫效果不理想、沙发布料不一致两条具体反馈。这些是既有讨论的结构化复核，不增加独立用户样本。正向体验不能证明纹理和文字都保持，历史失败也不能证明当前版本仍然失败。</p>
  <p>多产品同背景有明确提问和作者答复，面料与文字保持也有相应资源说明，但仍缺按这些任务要求完成验收的记录。本地跑通的正向回报与节点不兼容的障碍同时存在；两者支持资源级比较，尚不能判断平台级供不应求。<a href="/liblib-evidence?section=liblib-demand-evidence" target="_blank" rel="noopener noreferrer">具体任务与使用结果</a></p>
</section>;}

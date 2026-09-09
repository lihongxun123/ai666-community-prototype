'use client';
import plan from '@/lib/validation-plan.json';

export function ValidationOverview(){
 return <div className="validation-report content-report">
  <div className="page-heading"><p className="eyebrow">后续附录 · 不计入竞品调研进度</p><h1>多元拾光自身的<br/>用户研究与试用方案</h1><p className="lead">这份材料用于后续验证自身需求，尚未启动。当前主线继续补足18个竞品的商业化、规模与实际使用证据。</p></div>
  <div className="validation-start"><div><strong>{plan.status}</strong><p>{plan.recruitmentStatus}</p></div><div className="validation-downloads"><a className="primary-button" href="/research-kit/seed-validation.xlsx" download>下载访谈与试用记录表</a><a className="text-button" href="/research-kit/interview-guide.md" download>下载招募文案与执行手册 ↗</a></div></div>
  <p className="data-scope-note">本页是执行方案；实际结果填写在下载的表格中，不会自动回传到网页。12次是计划访谈数，尚未计入任何真实受访者。{plan.scope}</p>
  <nav className="article-toc" aria-label="验证方案章节">{[['validation-today','今天先做什么'],['validation-groups','找谁与如何招募'],['validation-interview','筛选与访谈'],['validation-decide','怎样选择方向'],['validation-pilot','5人任务试用'],['validation-author','作者试交'],['validation-schedule','时间与投入']].map(([id,label])=><a href="#validation" key={id} onClick={e=>{e.preventDefault();document.getElementById(id)?.scrollIntoView({behavior:'smooth'})}}>{label}</a>)}</nav>
  <section id="validation-today"><h2>今天先把第一场访谈排出来</h2><ol className="business-funnel"><li><strong>运营列出可触达渠道。</strong>记录现有社区、API、MakeNow用户或公开渠道的大致范围，不把姓名和联系方式放进报告。先每类找两位候选，核对亲历任务后再约时间。</li><li><strong>产品确定两个访谈时段。</strong>直接使用下方6题筛选与30分钟提纲。先问过去的行为，之后再讨论是否参加试用。</li><li><strong>按匿名编号记录。</strong>下载表格中的12行是计划占位。只有实际完成访谈才改为完成；候补、拒绝、未到场和资料不足分别保留。</li></ol><p className="data-scope-note">招募稿已备好，尚未发送；实际渠道、可约人数和研究补偿待落实。不会因名单未齐就把计划人数当实际进展。</p></section>
  <section id="validation-groups"><h2>三类需求，用同一套方法比较</h2><div className="table-wrap"><table className="content-table content-wide"><thead><tr><th>方向 / 现有资源</th><th>先找谁</th><th>希望了解的材料</th><th>最需要回答什么</th></tr></thead><tbody>{plan.directions.map(d=><tr key={d.id}><th>{d.name}<small>拟访谈{plan.perDirection}人 · {d.asset}</small></th><td>{d.who}</td><td>{d.artifact}</td><td>{d.repeat}<small>{d.unknown}</small></td></tr>)}</tbody></table></div>
   <h3>可直接使用的招募文案</h3><p className="data-scope-note">发出前确定发布渠道与回复接收人。没有承诺积分、免费代做或试用名额；如给访谈补偿，先确定统一固定规则。</p><div className="validation-recruit">{plan.directions.map(d=><article key={d.id}><h3>{d.name}</h3><p>{d.recruit}</p></article>)}</div>
  </section>
  <section id="validation-interview"><h2>用6题筛选，不按“愿意付费”筛人</h2><ol className="business-funnel">{plan.screening.map(q=><li key={q}>{q}</li>)}</ol><details className="data-gaps"><summary>入组、来源与重复计数规则</summary><ul>{plan.selectionRules.map(r=><li key={r}>{r}</li>)}</ul></details>
   <h3>30分钟访谈提纲</h3><div className="table-wrap"><table className="content-table"><thead><tr><th>时间 / 目的</th><th>怎么问</th><th>记下什么</th></tr></thead><tbody>{plan.interview.map(s=><tr key={s.time}><th>{s.time}<small>{s.title}</small></th><td>{s.prompt}</td><td>{s.record}</td></tr>)}</tbody></table></div>
   <div className="notice"><strong>原话、事实和解释分开</strong><p>记录分为“已见脱敏材料”“受访者回忆”和“研究者推断”。不能展示材料的人仍可以访谈。默认手记，录音需另征同意；不将联系方式、密钥、账号或未获准公开的材料写入报告。</p></div>
  </section>
  <section id="validation-decide"><h2>先写证据和反例，再选择方向</h2><p>三组使用下表逐项比较，不做加权总分。每个判断附访谈编号、原话或看到的材料；没有证据就保留未知。现有商品图资料更多，不构成优先选它的充分理由。</p><div className="table-wrap"><table className="content-table"><thead><tr><th>比较项</th><th>支持继续的证据</th><th>必须保留的反例</th></tr></thead><tbody>{plan.comparison.map(r=><tr key={r.item}><th>{r.item}</th><td>{r.evidence}</td><td>{r.counter}</td></tr>)}</tbody></table></div>
   <div className="validation-gates">{plan.gates.map(g=><article key={g.name}><h3>{g.name}</h3><p>{g.rule}</p><p>{g.next}</p></article>)}</div><p className="data-scope-note">以上是拟定的内部试验规则，启动前确定，修改时保留理由。多方向都满足时，优先选依赖最少、交付边界最清楚的一项；每类4人不能形成用户画像或行业转化率结论。</p>
  </section>
  <section id="validation-pilot"><h2>选定任务后，才安排5人试用</h2><p>五个人做同一类窄任务，使用各自的材料。访谈参与者可以继续参加，但不能用团队预制的演示结果代替用户交付。</p><ol className="business-funnel">{plan.pilot.map(s=><li key={s}>{s}</li>)}</ol><div className="notice"><strong>此前的8人商品图方案是备选</strong><p>第五轮提出的“白底精修、场景图各4人”仅在商品内容方向被选中后供参考。本轮统一顺序为：三方向各4次探索访谈 → 选一种任务 → 5人试用，避免两套招募同时启动。</p></div></section>
  <section id="validation-author"><h2>作者合作，先验收一份可交付案例</h2><ol className="business-funnel">{plan.authorTrial.map(s=><li key={s}>{s}</li>)}</ol><p className="data-scope-note">作者报酬、试用补贴、正常报价、测试额度与成本上限目前均待确认。记录表预留实际金额和币种，不填假设收入，也不把空白费用当零。</p></section>
  <section id="validation-schedule"><h2>约7个工作日完成探索与选择</h2><div className="table-wrap"><table className="content-table"><thead><tr><th>时间</th><th>负责人</th><th>工作</th><th>交付</th></tr></thead><tbody>{plan.schedule.map(s=><tr key={s.day}><th>{s.day}</th><td>{s.owner}</td><td>{s.work}</td><td>{s.done}</td></tr>)}</tbody></table></div><p className="data-scope-note">{plan.capacity}</p><h3>遇到这些情况，怎样调整</h3><ul className="validation-fallbacks">{plan.fallbacks.map(f=><li key={f}>{f}</li>)}</ul></section>
  <section><h2>这份方案依据什么</h2><p>团队与资源来自本次对话；候选方向来自既有经营研究，验证缺口来自内容样本和实操记录。本页没有新增访谈事实，也未证明任何一类需求更大。</p><div className="profile-links"><a href="#business">经营与用户假设 ↗</a><a href="#tasks">内容与公开讨论证据 ↗</a><a href="#evidence">现有研究的边界 ↗</a></div></section>
 </div>
}

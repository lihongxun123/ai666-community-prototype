/* eslint-disable next/no-html-link-for-pages */
import '@/components/market-social.css';
const themes = [
 ['电商','比较商品真实特征、展示效果与制作方法','T-01'],
 ['设计','讲清需求、备选草案与修改理由','T-31'],
 ['本地经营','按餐饮、零售、美业匹配真实资料与表达','T-05'],
 ['历史','把叙事选择与史料、文物出处放在一起','T-25'],
 ['科普','对照源文、脚本与画面，分开知识核对和制图','T-27'],
 ['角色','围绕作者意图分享作品，选择需要的反馈','T-36'],
 ['写作','呈现片段修改及接受、拒绝建议的理由','T-29'],
 ['人像','保留人物身份与私人记忆，由本人决定修改和分享','T-38'],
 ['手作','区分参考创意、读图与结构，说明材料和技法','T-40'],
];
export default function Page(){return <main className="ms-report blueprint-report">
 <p><a href="/#overview">多元拾光研究室</a> / <a href="/#strategy">方案与验证</a></p>
 <header className="page-heading"><h1>社区方向决策</h1><p>2026年9月18日 · 方向已选，内容、运营与产品为设计方案</p></header>
 <div className="ms-lead"><strong>以 AI 实践为主线，创作交流保留独立入口。</strong><p>服务创作者、实际应用者和学习者：找到可参考的案例，看懂做法和取舍，再决定自己使用、交流或寻求帮助。</p></div>
 <p><a href="/community-options" target="_blank" rel="noopener noreferrer">比较五套社区方案：主定位、辅助能力与取舍 ↗</a></p>
 <nav className="ms-links" aria-label="决策页目录"><a href="#choices">用户价值</a><a href="#themes">内容方向</a><a href="#supply">供给与运营</a><a href="#evidence">待定事项</a></nav>
 <section id="choices"><h2>用户为什么来，来了做什么</h2><div className="ms-grid three">
  <article><h3>找办法 · 实践入口</h3><p>按任务看案例，对照输入、结果与适用条件，收藏方法或前往原工具使用。</p><small>建议价值：减少从零筛选和判断方法的负担。</small></article>
  <article><h3>表达与交流 · 独立入口</h3><p>发布作品、说明创作意图，选择展示或征求具体意见；反馈围绕作者提出的问题。</p><small>建议价值：作品获得理解，创作者保留自己的取舍。</small></article>
  <article><h3>解决卡点 · 按需帮助</h3><p>常规资料仍不能解决时，说明问题和材料；找到合适的承接者后，再约定诊断、评议或协作。</p><small>普通讨论自愿参与；专业服务首版暂缓。</small></article>
 </div><p className="ms-caption">阅读、收藏和私下使用均为完整路径。新增社区是否带来实际改善与持续使用，仍需真实参与验证。</p></section>
 <section id="themes"><h2>九个主题，按具体任务组织内容</h2><p>重点积累有过程、有取舍的案例。教学、音乐／MV与通用整理改编保持开放覆盖；企业与工业表达排除，纯娱乐观众不作为服务对象。</p>
 <div className="ms-grid three">{themes.map(([name,value,id],index)=><article key={name} id={`theme-${index}`}><h3>{name}</h3><p>{value}</p><a href={`/research-decisions/tasks#${id}`} target="_blank" rel="noopener noreferrer">任务与依据 ↗</a></article>)}</div>
 <p id="task-choices"><a href="/research-decisions/tasks" target="_blank" rel="noopener noreferrer">查看全部23项任务：已有办法、剩余问题与设计建议 ↗</a></p>
 <p className="ms-caption">主题顺序沿用研究目录。任务材料包括实际采用、工具方法与应用线索，具体依据在任务页分别标注。</p></section>
 <section id="supply"><h2>内容怎样来，运营与产品怎样承接</h2><div className="ms-grid two">
  <article><h3>编选已有方法</h3><p>编辑定位原始资料，整理用途、条件与来源。产品按任务提供案例比较、收藏和原站入口。</p><small>原站已有可用答案时直接引导使用。</small></article>
  <article><h3>与作者共同整理案例</h3><p>按公开作品、解释能力和具体经验寻找作者；支持投稿、授权节选与联合制作。运营协助讲清关键取舍，维护更正。</p><small>署名、展示与约定报酬是合作选项；参与意愿需逐人确认。</small></article>
  <article><h3>围绕作品组织交流</h3><p>作者选择讨论问题和可见范围，运营匹配相关经验。产品将作品、回复与后续修改关联，保留接受或拒绝的理由。</p><small>分享作品与承担长期答疑分别约定。</small></article>
  <article><h3>专业服务作为后续选项</h3><p>先匹配专业能力，再确认材料、交付、时限与退出条件。产品分别呈现普通回应、专业意见和采用结果。</p><small>首版暂缓专业服务撮合；具备承接者和履约安排后再开放。</small></article>
 </div><p className="ms-links"><a href="/community-blueprints" target="_blank" rel="noopener noreferrer">详细方案与备选机制 ↗</a><a href="/#report" target="_blank" rel="noopener noreferrer">15家竞品机制参照 ↗</a></p></section>
 <section id="evidence"><h2>实施前还需确定什么</h2><ol><li>从哪些品类、文本类型或技法起步，能取得哪些可公开的案例。</li><li>由谁编选、维护与专业承接，合作回报和授权怎样约定。</li><li>哪些帮助免费提供，哪些需要单独约定交付与费用。</li></ol><p>研究为方向组合提供了依据；具体讨论形式和服务安排仍是设计建议。作者合作、使用者迁移及成果改善保留为实际参与后的验证项。</p><p className="ms-links"><a href="/research-status" target="_blank" rel="noopener noreferrer">逐项证据状态与来源 ↗</a><a href="/domain-research#research-conclusions" target="_blank" rel="noopener noreferrer">行业与社媒依据 ↗</a></p></section>
</main>}

import Link from '@/components/research-link';
import choices from '@/lib/task-choices.json';
import provenance from '@/lib/theme-provenance.json';
import '@/components/market-social.css';
import '../briefs/briefs.css';

function Source({ href, children }: { href: string; children: React.ReactNode }) { return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>; }

export default function Page() { return <main className="ms-report proposal-brief">
  <p><Link href="/community-options/presentation#theme-sources">返回主讲 · 主题来源</Link></p>
  <header><p>研究依据 / 产品组织</p><h1>九个主题如何形成</h1><p>具体使用线索整理成任务，任务按领域归类，再按研究范围安排内容和产品入口。</p></header>
  <nav className="brief-nav"><a href="#sources">来源</a><a href="#selection">取舍过程</a><a href="#themes">九主题对应</a><Source href="/community-options/themes/decision">主题与任务建议</Source><a href="#product">产品组织</a></nav>
  <section id="sources"><h2>三类材料，各回答一个问题</h2><div className="brief-path">
    <div><h3>行业报告</h3><p>使用发生在哪些人群和场景，为寻找具体任务提供范围。</p><Source href="/community-options/background">国内背景</Source></div>
    <div><h3>作品与使用记录</h3><p>作者做了什么、怎么做、遇到什么问题，以及原渠道怎样回应。</p><Source href="/domain-research">应用领域研究</Source></div>
    <div><h3>竞品档案</h3><p>已有资源、工具、分类和社区路径，帮助判断哪些能力可沿用、哪些取舍值得解释。</p><Source href="/#report">竞品研究</Source></div>
  </div><p className="brief-meta">任务材料包含国内外厂商案例、作者自述、自然求助、机构实践和受控研究。下方逐项保留类型与原始链接；这些材料对需求规模和参与意愿的支持程度不同。</p></section>
  <section id="selection"><h2>先统一任务，再确认重点</h2><div className="brief-path">
    <div><h3>42条线索 → 41项任务</h3><p>以交付结果统一颗粒度。署名与AI标识另作跨任务要求。</p></div>
    <div><h3>确认九主题、23项任务</h3><p>用户选择重点主题，通用内容处理、教育与音乐等11项开放覆盖；另7项保留候选，尚未纳入九主题重点。企业与工业表达已移出范围。</p></div>
    <div><h3>逐项核查与调整</h3><p>继续检查原工具已有帮助、真实问题和反例，分别安排案例比较、原站方法指引或自愿讨论。</p></div>
  </div><p><Source href="/research-records/task-normalization.txt">任务规范化原记录 · 9月17日</Source> · <Source href="/research-records/scope-record.txt">范围决策记录 · 9月18日版本</Source></p><p className="brief-meta">记录日期为文档日期；下表列出范围取舍及依据。</p><h3>以商品图为例</h3><p>“替换背景”和“调整尺寸”原是两条线索，整理时合并为“为二手商品准备可上架的展示图”。背景与尺寸成为处理步骤；成色、磨损、颜色和标识成为核对重点。</p><p>任务成立后，继续比较实拍整理、人工合成、AI局部编辑和商品套图，再设计任务页、方法比较页与案例详情页。</p><Source href="/research-decisions/tasks#T-01">商品图任务与原始依据</Source><p className="brief-meta">九类场景按研究取舍组织，部分任务仅有供给或邻近场景线索，并非市场规模排名。进入首页的优先级还要结合具体内容质量和社区选择。</p></section>
  <section id="themes"><h2>主题、任务与入口逐项对应</h2><p>下列组织方式是产品建议。每个主题保留任务依据，选入重点范围的决定与证据强弱分别呈现。</p>
    {provenance.themes.map(theme => <article key={theme.name} id={'theme-'+theme.name} className="brief-evidence">
      <h3>{theme.name}</h3><p>{theme.reason}</p><div className="brief-comparison"><div><strong>任务入口</strong><p>{theme.taskEntry}</p></div><div><strong>作品专题示例</strong><p>{theme.workEntry}</p></div></div>
      <ul>{choices.items.filter(task => task.theme === theme.name).map(task => <li key={task.id}><Source href={'/research-decisions/tasks#'+task.id}>{task.task}</Source><p className="brief-meta">{task.basis} · {task.evidence.slice(0,2).map((source,index) => <span key={source.url}>{index > 0 ? ' / ' : ''}<Source href={source.url}>{source.label}</Source></span>)}</p></li>)}</ul><p className="brief-meta">{theme.limit}</p>
    </article>)}
  </section>
  <section id="product"><h2>两种入口，共用一组内容关系</h2><div className="brief-options"><article><h3>任务入口：我想完成什么</h3><p>主题 → 具体任务 → 素材与目标条件 → 方法比较 → 案例详情与原工具。</p><p>卡片使用“为二手商品换背景”这样的动作标题，详情保留结果标准与方法依据。</p></article><article><h3>作品专题：我想怎样创作</h3><p>主题 → 编辑选集 → 作品与过程 → 作者讨论 → 相关任务与方法。</p><p>专题说明选入理由。用户既可交流表达，也可沿作品进入方法；服务对象仍是创作者、应用者和学习者。</p></article></div>
  <h3>平台组织，作者供给</h3><p>平台维护主题、任务分类和专题选题，编辑核对案例与分类；作者提交作品、素材条件、方法和创作过程。同一内容可以关联多个任务或专题，页面通过关联复用它。</p>
  <h3>概念稿需要校准的例子</h3><div className="brief-comparison"><article><h4>可直接对应</h4><p>二手商品换背景对应商品展示图；人像保真修图对应身份保留；角色创作可对应角色故事与一致性。</p></article><article><h4>需要收窄或补查</h4><p>“门店活动海报”可作为品牌传播素材的产品示例，目前相关依据含传统方法；“旅行纪念册”暂缺直接任务对应，后续概念稿应替换或明确作为新增候选。</p></article></div><p>后续概念稿先确定所用任务、内容对象和主要动作，再安排布局。页面中的成品图和案例文案属于设计示意，真实佐证沿原始资料链接查看。</p><Source href="/community-options/proposals/a#concepts">商品图的产品路径与概念稿</Source>
  </section>
</main>; }

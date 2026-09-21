/* eslint-disable next/no-html-link-for-pages */
const sources = {
  ecom: 'https://github.com/linbei0/EcomGen',
  category: 'https://linux.do/t/topic/2829843',
  writing: 'https://openai.com/academy/writing/',
  author: 'https://sspai.com/post/107066',
  reading: 'https://www.reddit.com/r/WritingWithAI/comments/1upth5b/reciprocal_beta_reading_share_story_blurbs_jul_7/',
  earlier: 'https://www.reddit.com/r/WritingWithAI/comments/1ujnxnq/reciprocal_beta_reading_share_story_blurbs_jun_30/',
  contribution: 'https://github.com/datawhalechina/easy-data-x-ai/pull/57',
  revision: 'https://github.com/datawhalechina/all-in-rag/pull/135',
  maintenance: 'https://linux.do/t/topic/2127211',
  contest: 'https://sspai.com/post/105805',
  school: 'https://science.eitech.edu.cn/2026/0710/c1203a6485/page.htm',
  shop: 'https://www.businessinsider.tw/article/7042',
};
function Source({href,children}:{href:string;children:React.ReactNode}){return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>}
export default function ProposalIncrementReview(){return <>
  <header className="page-heading"><h1>社区能多提供什么</h1><p>普通教程与工具入口是基础。值得重点投入的，是具体任务中的选择依据和有用的同行反馈。</p></header>
  <nav className="ms-links" aria-label="当前取舍目录"><a href="#increment">与原渠道比较</a><a href="#participation">作者为什么参与</a><a href="#priorities">九类如何安排</a><a href="#legacy-review">早期材料</a></nav>
  <section id="increment"><h2>电商与写作的内容机会</h2><div className="ms-grid two">
    <article><h3>商品图：完整流程已有，品类取舍值得做</h3><p>EcomGen 已将策划、生成、编辑与导出串起来。原帖中，一位自称经营珠宝的使用者指出：珠宝强调质感与设计，通用功能卖点流程未必适用。</p><p><strong>专题重点：</strong>说明什么商品适合什么做法，展示选择与舍弃的理由；原工具已足够时直接引导使用。</p><p className="ms-caption">尚无同一商品的多路线实测，也未取得该使用者的后续成品。</p><p className="ms-links"><Source href={sources.ecom}>现有制作流程</Source><Source href={sources.category}>品类反馈原帖</Source></p></article>
    <article><h3>写作：作者取舍比通用改稿清单更重要</h3><p>官方教程已覆盖目标、约束、修订与核查；少数派作者也已在原工具中生成多个版本并自行定稿。</p><p><strong>专题重点：</strong>比较保留个人表达、适配读者和满足交付要求时的不同改法。有公开对照稿，才展开具体比较。</p><p className="ms-caption">现有材料支持这一选题，尚未证明额外比较能帮助作者作出更好的选择。</p><p className="ms-links"><Source href={sources.writing}>官方写作指南</Source><Source href={sources.author}>作者取舍披露</Source></p></article>
  </div><p><strong>A仍是建议主线，新增价值尚待使用者验证。</strong>目录、教程和制作入口值得跟进；方法比较需要比原页面多给出一条能影响选择的依据。</p></section>
  <section id="participation"><h2>参与要有具体回报</h2><div className="ms-grid two">
    <article><h3>作品换相关反馈</h3><p>2026年两期互读帖中，同一AI辅助写作作者继续分享章节；读者提出人物、开篇等意见，作者回应并称正在修订。</p><p><strong>C的组织方式：</strong>按题材匹配同行，让作者说明希望讨论的片段与问题。</p><p className="ms-caption">这是英语社区中的实际互动；中文作者的新增渠道意愿、改后成果仍未知。</p><p className="ms-links"><Source href={sources.earlier}>前一期分享</Source><Source href={sources.reading}>后一期反馈</Source></p></article>
    <article><h3>贡献换审阅、采纳与署名</h3><p>Datawhale有贡献者按要求处理修改后被合入，并收到礼物领取邀请。另一份内容重写后仍未合入。</p><p><strong>D的组织方式：</strong>明确可认领问题、审阅者、采纳位置和署名。</p><p className="ms-caption">奖励邀请与贡献被采用已有记录，稳定供稿尚未证实。</p><p className="ms-links"><Source href={sources.contribution}>采纳记录</Source><Source href={sources.revision}>未合入的重写稿</Source></p></article>
    <article><h3>发布换试用与问题反馈</h3><p>LINUX DO的工具作者在推广帖回应使用问题，并持续更新说明。社区为作者带来的，是相关使用者和具体反馈。</p><p><strong>可跟进的安排：</strong>把反馈连到材料、环境和结果，保留原作者入口；是否增加发布渠道由作者选择。</p><Source href={sources.maintenance}>作者回应与维护</Source></article>
    <article><h3>活动换过程披露</h3><p>少数派征文要求AI赛道披露关键对话，并设置展示与奖励。详细过程材料有明确的活动条件。</p><p><strong>可跟进的安排：</strong>约定要交付的案例、披露范围与回报，提前说明使用授权。</p><p className="ms-caption">本例支持活动供给设计，活动后的持续分享仍未知。</p><Source href={sources.contest}>征文要求</Source></article>
  </div></section>
  <section id="priorities"><h2>九类保留，三类先做重点专题</h2><p>建议优先编排电商营销、设计与视觉、写作与编辑三个专题；其余六类按已有材料覆盖。这个顺序是内容配置建议，市场规模和社区转化率尚无可比数据。</p><div className="ms-grid three">
    <article><h3>先比较：商品图、写作</h3><p>已有原渠道、作者取舍与反馈材料，适合检验“额外比较究竟改变什么选择”。写作同时可验证相关同行反馈。</p></article>
    <article><h3>重点编排：电商营销、设计、写作</h3><p>分别组织品类与用途、主视觉与系列、目标与改稿。角色、人像、知识保留案例和方法入口，后续按材料成熟度加深。</p></article>
    <article><h3>保留边界：本地经营、职场学习、IP</h3><p>教育已有实际试讲过程；品牌活动可作系列设计参照，企业汇报和IP仍需分别核对人工改动与实际采用。</p></article>
  </div><p><a href="/community-options/content-system#editorial-plan" target="_blank" rel="noopener noreferrer">九类具体编排：入口、卡片、制作与分工 ↗</a></p><h3>三条薄弱分支，这次改变了什么</h3><div className="ms-grid three">
    <article><h3>本地经营：加上品牌与顾客接受度</h3><p>2026年9月的店主采访记录了AI菜单海报印制后遭遇反对。生成和印刷完成之外，仍要考虑店铺风格与当地顾客。</p><p className="ms-caption">美国个案仅作反例。国内新增品牌活动系列参照，单店连续使用缺口保留。</p><Source href={sources.shop}>店主采访</Source><p><a href="/community-options/scenarios/local-business#brand-case" target="_blank" rel="noopener noreferrer">国内品牌活动参照 ↗</a></p></article>
    <article><h3>职场学习：讲义分支更具体</h3><p>校方记录了课程简报、逐页规划与课件制作，并根据试点中的提问困难和信息过载，增加讲解、缩小任务。</p><p className="ms-caption">支持教育应用过程；尚无源课件对照或独立效果评估，也未补成职场交付案例。</p><Source href={sources.school}>课程试讲与调整</Source><p><a href="/community-options/scenarios/work-learning#workplace-case" target="_blank" rel="noopener noreferrer">企业汇报的交付边界 ↗</a></p></article>
    <article><h3>IP：保留方向，暂不提高优先级</h3><p>新增作者的AI角色制作、白边处理与投稿受阻记录。这套Demo明确未正式上架；原少儿AI春晚线索仍未恢复，完整应用链保留缺口。</p><a href="/community-options/scenarios/ip#ai-process" target="_blank" rel="noopener noreferrer">已有IP依据 ↗</a></article>
  </div><p><strong>推荐组合仍为A主线、C独立入口。</strong>B、D、E分别以主理人、维护者、合适的回应者为条件加入。已有平台的成熟做法可以跟进；新增投入要说明为谁多解决了什么。</p><a href="/community-options#compare" target="_blank" rel="noopener noreferrer">五套方案与改选条件 ↗</a></section>
</>}

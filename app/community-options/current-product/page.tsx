import Link from '@/components/research-link';
import '@/components/market-social.css';
import '../briefs/briefs.css';

export default function Page() {
  return <main className="ms-report proposal-brief">
    <p><Link href="/">← 研究总览</Link></p>
    <header><p>多元拾光 / 当前产品方案</p><h1>发现 AI 创作，学习方法，交流与分享</h1>
      <p>社区把作品、教程、专题、圈子和 AI 应用介绍组织起来，让用户找到值得看的内容、理解可用的方法，并按自己的需要交流或开始创作。</p>
    </header>
    <nav className="brief-nav"><a href="#position">产品定位</a><a href="#audience">目标用户</a><a href="#journeys">核心场景</a><a href="#scope">产品分工</a><a href="#validation">范围与验证</a></nav>
    <section id="position"><h2>产品定位与价值</h2><p>已确认方向：以内容展示与交流为主，保留社区轻创作入口。浏览、学习、交流、创作和发布可以独立发生，用户不必完成一整套流程才获得价值。</p><p>希望提供的价值是：通过作品判断兴趣，通过教程和专题理解方法，通过圈子获得具体交流，再选择适合自己的工具。内容的组织、持续更新和回应能否构成用户选择这里的理由，需要实际验证。</p><p>本阶段重点是建立目标用户规模与持续活跃；工具调用和付费不能替代社区内容消费与回访的验证。</p></section>
    <section id="audience"><h2>目标用户与优先级</h2><p>优先围绕“看内容、学方法、交流创作”的人群验证，先保证内容值得持续看，再观察其中的制作需求。以下是需求角色，同一个人可以兼具多种角色；具体招募比例尚未确定。</p>
      <article><h3>核心消费用户：对 AI 创作感兴趣的人</h3><p><strong>场景：</strong>空闲时找灵感，看到喜欢的作品后想了解方法，或围绕一个主题持续阅读。</p><p><strong>困难：</strong>内容分散，效果与做法难以对应，不知道哪些值得保存和继续看。</p><p><strong>社区价值：</strong>作品发现、专题编排、教程、收藏和作者关注。回访假设是专题与作者更新、收藏回看和讨论回应。</p></article>
      <article><h3>内容供给者：愿意分享的创作者与实践作者</h3><p><strong>场景：</strong>展示作品、分享过程、记录经验，或者带着具体问题寻找反馈。</p><p><strong>困难：</strong>作品难被合适的人看到，讨论缺乏上下文，持续整理内容需要投入。</p><p><strong>社区价值：</strong>作品与帖子发布、作者主页、圈子讨论和专题收录。持续供给的动机、合作条件及维护成本需要单独验证。</p></article>
      <article><h3>任务型用户：带着具体材料寻找做法的人</h3><p><strong>场景：</strong>修复照片、改写文案或制作商品视觉，希望先看效果和准备要求，再进入工具。</p><p><strong>困难：</strong>不知道方法是否适合自己的素材，也难判断结果是否可用。</p><p><strong>社区价值：</strong>应用介绍、效果示例、教程与相关讨论；需要执行时去 MakeNow。电商是示例场景，尚未确定为唯一或首要目标市场。</p></article>
      <p className="brief-meta">暂不以年龄、城市、收入或职业比例定义画像：当前没有足够的直接用户证据支持这些细分。</p>
    </section>
    <section id="journeys"><h2>核心场景与回访理由</h2><div className="brief-options">
      <article><h3>发现与学习</h3><p>首页或搜索 → 作品、专题、教程 → 收藏或关注作者。用户可以只阅读和欣赏；后续更新与收藏回看是需要观察的回访原因。</p></article>
      <article><h3>交流与分享</h3><p>社区或圈子 → 阅读帖子、评论交流 → 主动发布作品或经验。观察回应是否具体、是否产生后续交流，而不只统计发布量。</p></article>
      <article><h3>了解应用并制作</h3><p>应用列表 → 效果、用途、准备材料与预期结果 → MakeNow。制作后的成果由用户自主决定是否回社区分享。</p></article>
      <article><h3>社区轻创作</h3><p>创作入口 → 图片、文字或视频轻创作 → 查看结果，按需继续调整或发布。保留此入口与 AI 应用外部执行是两条不同路径。</p></article>
    </div></section>
    <section id="scope"><h2>已确认的产品分工</h2>
      <article><h3>社区</h3><p>负责公开内容发现、搜索、作品与教程阅读、专题组织、圈子交流、作者展示及发布；保留轻创作。AI 应用在社区展示和介绍，不在社区完成应用输入、生成任务与结果管理。</p></article>
      <article><h3>MakeNow</h3><p>作为当前 AI 应用的执行承接方，输入、费用、进度与结果在该平台处理。执行入口逐项配置和核验；已配置入口可跳转，缺失或失效时说明原因。社区与 MakeNow 已实现账号互通，用户以同一账号继续；素材传递、结果回传等深度互通尚无方案和开发，不作为已接通能力。</p></article>
      <article><h3>电商 Agent 与后台</h3><p>电商 Agent 尚未上线，不作为当前可用执行入口。后台负责内容维护、审核、公开与运营配置；原型中的交互演示不等于真实后台和接口已经实现。</p></article>
    </section>
    <section id="validation"><h2>当前范围与待验证事项</h2><p><strong>当前评审范围：</strong>社区内容消费、搜索、专题、圈子、应用介绍、轻创作、发布与个人相关页面，以及配套后台和跨产品路径。页面仍在逐项评审，不将原型齐全视为产品全部定版。</p><p><strong>待验证：</strong>哪类用户最愿意持续回来；哪些主题值得优先经营；作者是否持续供给；讨论是否有帮助；用户能否顺利理解并进入 MakeNow。</p><p><strong>观察方式：</strong>先围绕有限主题招募真实用户，记录观看、阅读、收藏回看、交流和跨周回访；区分主动回访与运营提醒。对有制作需求的人另行记录素材适配、工具使用和结果采用，不把它们设为所有用户的门槛。</p><p><strong>暂缓扩展：</strong>五套探索方案中的共学、方法共建等能力不因出现在概念图中就自动纳入当前版本；后续按已确认需求和供给条件决定。</p></section>
    <section><h2>继续查看</h2><p><Link href="/community-options/prototype-review?section=c&view=home&device=mobile&reading=plan">页面级产品方案与原型 →</Link></p><p><Link href="/community-options/fusion/gallery">社区概念图集 →</Link></p><p><Link href="/community-options">五套探索方案 →</Link> · <Link href="/community-options/library">研究依据 →</Link></p><p className="brief-meta">早期探索方案和概念图用于追溯设计思路。应用执行分工以本页的当前决定及页面级需求为准。</p></section>
  </main>;
}

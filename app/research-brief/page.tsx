/* eslint-disable next/no-img-element -- The archived concept image is displayed directly and linked at its original resolution. */
import type { Metadata } from 'next';
import Link from '@/components/research-link';
import '../community-options/options.css';
import './brief.css';

export const metadata: Metadata = {
  title: 'AI创作社区的机会与选择 · 多元拾光研究室',
  description: '从中国AI使用、抖音小红书B站的需求观察与15家竞品，理解多元拾光的五种社区方向及融合方案。',
};

const competitors = [
  {
    title: '资源与运行',
    names: 'LiblibAI、RunningHub、吐司 / Tensor.Art、SeaArt',
    observation: '把效果、模型、工作流或应用与运行入口连接。RunningHub的应用表单降低配置门槛，工作流入口保留修改空间；LiblibAI的方法页补充输入条件与版本。',
    implication: '再增加一份目录的价值有限。比较应深入任务适用性、材料准备和失败处理。',
    href: '/#content',
  },
  {
    title: '工具与作品',
    names: '即梦、可灵、OpenArt、Leonardo、Runway',
    observation: '制作、编辑、作品展示与学习内容已在这些平台中出现。Runway的案例、课程与项目分别承接用途理解、学习和后续制作。',
    implication: '社区需要解释怎样选择与使用工具，围绕具体作品形成交流。',
    href: '/#runway',
  },
  {
    title: '学习与讨论',
    names: 'WaytoAGI、Datawhale、LINUX DO',
    observation: '分别提供知识整理、任务学习与持续讨论。Datawhale安排教材、作业和反馈；LINUX DO可见问题补充、答案标记与Wiki维护。',
    implication: '有内容还需要有人解释、组织和回应。主理人、维护者与答疑者是不同职责。',
    href: '/#operations',
  },
  {
    title: '开发与协作',
    names: 'Hugging Face、ModelScope、Dify',
    observation: '模型、演示、模板和应用构建资料已有专门供给。Hugging Face将模型说明、文件、应用与讨论分开，使用时仍需核对权限和依赖。',
    implication: '可运行资源要持续维护条件与版本；一个可见的演示还不足以构成可交接的方法。',
    href: '/#huggingface',
  },
];

const directions = [
  ['a', 'A', '任务创作', '帮助用户选择方法、完成具体制作。', '主线：发现 → 直接试用；专题按需进入'],
  ['c', 'C', '创作者研讨', '围绕作者意图与作品细节获得相关反馈。', '独立入口：作品、作者与圈子研讨'],
  ['b', 'B', '项目共学', '围绕一个项目练习，获得阶段反馈。', '有主理人时，作为圈子中的共学项目'],
  ['d', 'D', '方法共建', '共同补充条件、版本与复现经验。', '放入应用、工作流和教程的维护'],
  ['e', 'E', '问题互助', '带着目标、材料和尝试记录解决卡点。', '放入资源反馈与圈子求助'],
];

export default function ResearchBrief() {
  return <main id="top" className="op-shell rb-page">
    <header className="op-top">
      <Link href="/#overview">多元拾光 / 研究室</Link>
      <div><Link href="/community-options">五套方案</Link><Link href="/community-options/fusion">融合方案</Link></div>
    </header>

    <section className="op-hero rb-hero">
      <span>简版研究报告 / 2026年9月</span>
      <h1>AI创作社区的<br />机会与选择</h1>
      <p>建议以任务创作为主线，帮助使用者选择方法、完成制作；保留作品交流入口，按供给条件组织共学、方法维护与互助。</p>
      <p className="rb-meta">资料截至2026年9月20日 · 数据按原统计期引用</p>
      <nav aria-label="报告目录">
        <a href="#people">使用与角色</a><a href="#social">社媒需求</a><a href="#competition">竞品供给</a><a href="#opportunity">机会判断</a><a href="#direction">方向与融合</a><a href="#practice">产品与运营</a>
      </nav>
    </section>

    <section id="people" className="op-section rb-section">
      <span>01 / 中国AI使用与角色</span>
      <h2>使用规模是背景，具体任务决定社区价值</h2>
      <div className="rb-baseline">
        <div><strong>6.02<span>亿</span></strong><small>生成式AI用户 · 2025年12月</small></div>
        <p>CNNIC第57次报告给出的全国使用基线，普及率为42.8%。它覆盖多种用途，不能直接换算成持续创作者或新社区的潜在人群。<a href="https://www.cnnic.cn/n4/2026/0205/c326-11542.html" target="_blank" rel="noopener noreferrer">报告来源 ↗</a></p>
      </div>
      <p>2026年7月的应用监测进一步显示，AI效率办公赛道合计月活达1.02亿，总使用次数同比增长112.4%。该赛道的跨端去重方法未明确，与全国用户调查分列。<a href="https://www.questmobile.cn/research/report/2094686886299705346/" target="_blank" rel="noopener noreferrer">QuestMobile · 2026年9月发布 ↗</a></p>
      <p>AI使用涵盖用途探索、日常辅助、作品交付和流程维护。具体任务需要明确输入条件、结果标准与排错方法；各类使用方式重叠，人数尚无全国统计。</p>
      <p>多元拾光服务创作者、实际应用者与学习者。用户可只查资料或使用资源，自主选择是否投稿、提问和交流。</p>
      <p className="rb-source"><Link href="/#china-users">行业与角色研究 →</Link><Link href="/community-options/background">近期应用与原始来源 →</Link></p>
    </section>

    <section id="social" className="op-section rb-section">
      <span>02 / 抖音、小红书与B站</span>
      <h2>从作品热度继续追到制作、修改与求助</h2>
      <p>社媒中的观看理由包括故事、知识、审美与生活兴趣。AI可能只是制作方式。对创作社区更有用的线索，是作者如何处理反馈，以及学习者照做时遇到什么条件和障碍。</p>
      <div className="rb-observations">
        <article><span>抖音</span><h3>作品反馈可以进入修订</h3><p>《DEADLY：畸变》样本中已有相邻集入口、作者合集和评论讨论。作者说明根据反馈重做第三、四集，主页可见修正版；新社区不能把追看和评论当作尚不存在的服务。</p><a href="https://www.douyin.com/video/7676830509116165422" target="_blank" rel="noopener noreferrer">作者修订说明 ↗</a></article>
        <article><span>小红书</span><h3>制作目标需要具体条件</h3><p>空间复刻作者称补充平面图后改善细节，另一使用者报告墙面与家具高度问题。作者已回应，修复结果未知。方法说明需要写清素材与尺寸条件。</p><Link href="/task-research#task-faithful-expression">空间案例与反馈 →</Link></article>
        <article><span>B站</span><h3>得到建议与完成任务有距离</h3><p>一位学习者自述看完教程后试做受阻，并澄清目标是一镜到底；同行建议拆镜头、参考图或首尾帧。问题在于方法是否符合目标，建议后的成片结果仍未知。</p><Link href="/task-research#task-learning-troubleshooting">尝试与排错线程 →</Link></article>
      </div>
      <p className="rb-note">案例用于识别任务与问题，不用于估算人群比例或需求排名；缺少后续记录的结果保留未知。</p>
    </section>

    <section id="competition" className="op-section rb-section">
      <span>03 / 15家竞品供给</span>
      <h2>工具、资源与交流已有成熟的组织方式</h2>
      <p>15家平台覆盖不同任务。比较其已有服务、供给条件与维护责任，作为多元拾光的产品参照。</p>
      <div className="rb-competitors">{competitors.map(item => <article key={item.title}>
        <div><h3>{item.title}</h3><p className="rb-platforms">{item.names}</p></div>
        <div><p>{item.observation}</p><p className="rb-implication">{item.implication}</p><Link href={item.href}>对应研究 →</Link></div>
      </article>)}</div>
      <p className="rb-note">吐司与Tensor.Art计为一个关联产品组，两站规则分别判断。页面、文档和个别使用记录说明供给机制；平台整体成功率、留存及社区对收入的贡献，现有材料不足以量化。</p>
      <p className="rb-source"><Link href="/#report">完整竞品报告 →</Link><Link href="/#operations">内容供给与运营机制 →</Link></p>
    </section>

    <section id="opportunity" className="op-section rb-section">
      <span>04 / 机会判断</span>
      <h2>沿用成熟能力，把任务选择和反馈做具体</h2>
      <div className="op-table"><table><thead><tr><th>已有证据</th><th>我们的选择</th></tr></thead><tbody>
        <tr><td>电商工具已有策划、生成、编辑与导出流程；珠宝等品类对质感和表现方式要求不同。</td><td>保留制作入口，按品类组织效果对照、素材条件与修改方法，帮助用户选对做法。</td></tr>
        <tr><td>写作工具已有修订指南；作者仍需判断哪些改动符合自己的观点与语气。</td><td>用原稿、改稿和取舍理由呈现方法，让作者决定如何采用。</td></tr>
        <tr><td>社媒已有评论与修订；互读案例中出现了对人物、开篇的具体反馈和作者回应。</td><td>保留作品交流入口，把创作意图、具体问题与相关同行联系起来。</td></tr>
      </tbody></table></div>
      <aside className="rb-judgment"><strong>成熟功能值得跟进，改进点放在具体任务上。</strong><p>重点专题整理案例与工具，圈子承接自愿交流；有维护者的重点资源保留版本记录。新社区能否改善任务结果、吸引中文作者持续参与，仍需使用验证。</p></aside>
      <p className="rb-source"><Link href="/community-options/review#increment">任务选择与原渠道比较 →</Link><Link href="/community-options/review#participation">作者参与的案例依据 →</Link></p>
    </section>

    <section id="direction" className="op-section rb-section">
      <span>05 / 五方向与融合方案</span>
      <h2>以任务创作为主，保留作品交流入口</h2>
      <p>五种方向有不同的组织重心。推荐组合让任务创作承担发现、选择与制作路径，作品交流保留作者表达；其他方向在有人负责时进入对应场景，避免同时运营五套独立社区。</p>
      <div className="op-table rb-direction-table"><table><thead><tr><th scope="col">方向</th><th scope="col">核心价值</th><th scope="col">融合中的位置</th></tr></thead><tbody>{directions.map(([id,code,title,value,place]) => <tr key={id}><th scope="row"><Link href={'/community-options/proposals/'+id}><span>{code}</span>{title}</Link></th><td>{value}</td><td>{place}</td></tr>)}</tbody></table></div>
      <figure className="rb-concept"><a href="/proposal-fusion/home-v4-easy-start-white.png" target="_blank" rel="noopener noreferrer"><img src="/proposal-fusion/home-v4-easy-start-white.png" alt="融合方案首页概念：发现、专题、AI应用、圈子与模型广场导航，活动及专题入口，下方展示不同内容形式的卡片" loading="lazy" /></a><figcaption>融合方案首页概念：作品表达与应用试用并列，方法按需展开。<a href="/proposal-fusion/home-v4-easy-start-white.png" target="_blank" rel="noopener noreferrer">放大查看 ↗</a></figcaption></figure>
      <p>发现页提供选题与代表内容，专题按任务组织案例、教程和资源；AI应用承接方法选择，圈子承接研讨、共学与求助，模型广场提供模型信息。作品、方法和问题之间的关联，决定这些入口能否接成一次完整使用。</p>
      <p className="rb-source"><Link href="/community-options">五套完整方案 →</Link><Link href="/community-options/fusion">融合方案与用户路径 →</Link></p>
    </section>

    <section id="practice" className="op-section rb-section">
      <span>06 / 产品、内容与运营</span>
      <h2>以一个完整任务组织内容和责任</h2>
      <p>优先编排电商营销、设计与视觉、写作与编辑：分别检验商品表达、系列设计和文字取舍，已有材料可支撑案例与方法对照。这是内容投入顺序；市场需求排名仍缺少可比数据。其余领域继续按可靠材料覆盖。</p>
      <ol className="rb-path" aria-label="建议用户路径"><li>看到效果</li><li>确认所需素材</li><li>直接试用</li><li>保存结果</li></ol>
      <p>需要比较方法或继续修改时再进入专题；遇到问题可选择公开必要材料求助。已有作品也可直接分享创作想法，无需先整理成教程。</p>
      <p>作者自由分享作品；愿意公开方法时再补充过程。编辑集中维护重点专题和可用入口，有人负责的资源再持续跟进版本。圈子按需邀请同行，好回答经整理后保留署名与来源。</p>
      <p>制作由适合任务的工具承接。方案拟通过 MakeNow 画布连接制作，项目复制、素材导入与成果回流的接入条件尚待核实。内容采用和实际修改结果，是检验这条路径的依据。</p>
      <p className="rb-source"><Link href="/community-options/content-system#editorial-plan">专题与内容配置 →</Link><Link href="/community-options/content-system#supply">作者、编辑与维护分工 →</Link><Link href="/research-status">证据状态与待验证事项 →</Link></p>
    </section>

    <footer className="op-footer rb-footer">
      <p>依据公开统计、平台页面、官方规则、作品与讨论记录。来源及适用范围见各专题；案例观察不用于预测市场转化。</p>
      <Link href="/#overview">进入完整研究 →</Link><Link href="/community-options/library">查阅研究依据 →</Link><a href="#top" aria-label="返回报告顶部">返回顶部 ↑</a>
    </footer>
  </main>;
}

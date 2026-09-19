'use client';

/* eslint-disable next/no-img-element -- These are archived evidence screenshots, shown without image transformation. */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, X } from 'lucide-react';
import './presentation.css';

const chapters = [
  { id: 'position', title: '社区定位', short: '定位' },
  { id: 'findings', title: '研究发现', short: '发现' },
  { id: 'choice', title: '选择理由', short: '选择' },
  { id: 'practice', title: '实践经历', short: '实践' },
  { id: 'creation', title: '创作经历', short: '创作' },
  { id: 'connection', title: '两区关系', short: '关系' },
  { id: 'supply', title: '供给与运营', short: '供给' },
  { id: 'scope', title: '产品取舍', short: '取舍' },
  { id: 'decision', title: '结论与条件', short: '结论' },
];

function Source({ href, children }: { href: string; children: ReactNode }) {
  return <a className="pres-source" href={href} target="_blank" rel="noopener noreferrer">{children}<ArrowUpRight size={14} aria-hidden="true" /><span className="pres-sr-only">（新页面打开）</span></a>;
}

function Eyebrow({ number, children }: { number: string; children: ReactNode }) {
  return <p className="pres-eyebrow"><span>{number}</span>{children}</p>;
}

function ExampleTag({ children = '设计情境 · 非真实试用结果' }: { children?: ReactNode }) {
  return <span className="pres-example-tag">{children}</span>;
}

export default function CommunityPresentation() {
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<'pages' | 'scroll'>('pages');
  const [mobile, setMobile] = useState(false);
  const [menu, setMenu] = useState(false);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const current = useRef(0);
  const continuous = mobile || mode === 'scroll';

  useEffect(() => { current.current = active; }, [active]);

  const go = useCallback((index: number) => {
    const next = Math.max(0, Math.min(chapters.length - 1, index));
    setActive(next);
    setMenu(false);
    window.history.replaceState(null, '', `#${chapters[next].id}`);
    requestAnimationFrame(() => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (continuous) {
        sections.current[next]?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        sections.current[next]?.querySelector<HTMLElement>('h1, h2')?.focus({ preventScroll: true });
      }
    });
  }, [continuous]);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 760px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    const frame = requestAnimationFrame(() => {
      update();
      const index = chapters.findIndex(chapter => `#${chapter.id}` === window.location.hash);
      if (index >= 0) { setActive(index); current.current = index; }
    });
    return () => { media.removeEventListener('change', update); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (continuous) sections.current[current.current]?.scrollIntoView({ behavior: 'instant', block: 'start' });
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [continuous]);

  useEffect(() => {
    if (!continuous) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        let index = 0;
        const threshold = Math.min(window.innerHeight * .4, 260);
        sections.current.forEach((section, i) => {
          if (section && section.getBoundingClientRect().top <= threshold) index = i;
        });
        setActive(index);
      });
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => { window.removeEventListener('scroll', update); cancelAnimationFrame(frame); };
  }, [continuous]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === 'Escape') { setMenu(false); return; }
      if (event.key === 'ArrowRight' || (!continuous && event.key === 'PageDown')) { event.preventDefault(); go(current.current + 1); }
      if (event.key === 'ArrowLeft' || (!continuous && event.key === 'PageUp')) { event.preventDefault(); go(current.current - 1); }
      if (!continuous && event.key === 'Home') { event.preventDefault(); go(0); }
      if (!continuous && event.key === 'End') { event.preventDefault(); go(chapters.length - 1); }
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [continuous, go]);

  const panel = (index: number, className: string, children: ReactNode) => (
    <section id={chapters[index].id} ref={element => { sections.current[index] = element; }}
      className={`pres-slide ${className}`} hidden={!continuous && active !== index}
      aria-labelledby={`pres-heading-${index}`} key={chapters[index].id}>
      <div className="pres-slide-inner">{children}</div>
    </section>
  );

  return <div className={`presentation ${continuous ? 'pres-scroll' : 'pres-pages'}`}>
    <a className="pres-skip" href={`#pres-heading-${active}`}>跳至本章内容</a>
    <header className="pres-header">
      <Link className="pres-brand" href="/community-options"><span className="pres-brand-mark" aria-hidden="true">拾</span><span>多元拾光<span className="pres-brand-sub"> / 社区方案</span></span></Link>
      <span className="pres-header-meta">研究建议 · 2026.09.19</span>
      <div className="pres-mode" aria-label="阅读方式">
        <button type="button" aria-pressed={mode === 'pages'} onClick={() => setMode('pages')}>翻页</button>
        <button type="button" aria-pressed={mode === 'scroll'} onClick={() => setMode('scroll')}>滚动</button>
      </div>
      <button className="pres-menu-trigger" type="button" aria-expanded={menu} aria-controls="pres-chapters" onClick={() => setMenu(value => !value)}>目录 {menu ? <X size={15} aria-hidden="true" /> : <ChevronDown size={15} aria-hidden="true" />}</button>
    </header>

    {menu && <nav className="pres-menu" id="pres-chapters" aria-label="章节目录">
      <span className="pres-menu-label">THE PROPOSAL · 09 CHAPTERS</span>
      {chapters.map((chapter, index) => <button type="button" key={chapter.id} aria-current={active === index ? 'step' : undefined} onClick={() => go(index)}><span>{String(index + 1).padStart(2, '0')}</span>{chapter.title}<ArrowUpRight size={16} aria-hidden="true" /></button>)}
    </nav>}

    <main id="pres-main">
      {panel(0, 'pres-cover', <>
        <Eyebrow number="01">一个社区，两种有用的相遇</Eyebrow>
        <div className="pres-cover-layout">
          <div>
            <h1 id="pres-heading-0" tabIndex={-1}>用案例<span>判断做法。</span><br />用作品<span>连接作者。</span></h1>
            <p className="pres-cover-intro">服务正在用 AI 创作、工作或学习的人。<br />帮助他们看懂选择，也让自己的表达被理解。</p>
            <p className="pres-cover-status"><span />实践主线 · 创作独立 · 推荐组合</p>
          </div>
          <div className="pres-cover-paths" aria-label="两种社区价值">
            <div className="pres-cover-path"><span className="pres-overline">PRACTICE / 实践</span><h3>这件事，<br />怎样做更合适？</h3><p>任务 → 条件与取舍 → 原工具</p><span className="pres-path-tail">方法值得回查</span></div>
            <div className="pres-cover-path"><span className="pres-overline">CREATION / 创作</span><h3>这个表达，<br />你看见了什么？</h3><p>作品 → 作者意图 → 自选交流</p><span className="pres-path-tail">作者值得关注</span></div>
          </div>
        </div>
        <div className="pres-cover-bottom"><p>方案设计已形成；用户迁移、持续供给与实际帮助仍待验证。</p><button className="pres-text-button" type="button" onClick={() => go(1)}>从研究发现开始 <ArrowRight size={18} aria-hidden="true" /></button></div>
      </>)}

      {panel(1, 'pres-findings', <>
        <Eyebrow number="02">研究发现 / 归档证据</Eyebrow>
        <h2 id="pres-heading-1" tabIndex={-1}>工具已经很多。<br /><span>适不适合我，仍需解释。</span></h2>
        <p className="pres-lead">原平台已有用途分类、案例与制作入口。社区需要增加的，是条件相近的比较，以及采用或放弃一种做法的理由。</p>
        <div className="pres-evidence-grid">
          <figure className="pres-evidence"><a href="/research-images/v10/runninghub-workflow-detail.jpg" target="_blank" rel="noopener noreferrer" aria-label="新页面查看 RunningHub 归档原图"><img src="/research-images/v10/runninghub-workflow-detail.jpg" alt="RunningHub 商品换背景详情，同时显示打开 AI 应用和运行工作流两个入口" width={1610} height={569} /></a><figcaption><span className="pres-fact-tag">真实归档 · 2026.09.09</span><h3>RunningHub / 工具入口已在原地</h3><p>同一详情提供应用与工作流两种入口；页面展示不能证明商品细节保真或实际运行结果。</p><Source href="https://www.runninghub.ai/zh-cn/post/1845758651062743041">原页面</Source></figcaption></figure>
          <figure className="pres-evidence"><a href="/research-images/v10/liblib-template-detail.jpg" target="_blank" rel="noopener noreferrer" aria-label="新页面查看 LiblibAI 归档原图"><img src="/research-images/v10/liblib-template-detail.jpg" alt="LiblibAI 商品精修模板详情中的效果图、版本、参考图要求和许可字段" width={1200} height={750} /></a><figcaption><span className="pres-fact-tag">真实归档 · 2026.09.09</span><h3>LiblibAI / 使用条件同样重要</h3><p>详情已有版本、参考图与许可字段。该样本许可表述存在冲突，仅参照页面组织，不作商用推荐。</p><Source href="https://www.liblib.art/modelinfo/b3c0dc71aabb4496af0d178bfa347bc8">原页面</Source></figcaption></figure>
        </div>
        <div className="pres-comment-evidence"><div><span className="pres-overline">公开评论 · 归纳转述</span><p>新手追问工具入口；其他读者追问模型版本、参考图质量与复杂场景的适用性。</p></div><div><Source href="/?section=dp-comments#content-demand">两条教程的评论归档</Source><small>2026.09.12 读取，同一作者；未记录提问者完成验证，不推导需求规模。</small></div></div>
      </>)}

      {panel(2, 'pres-choice', <>
        <Eyebrow number="03">选择理由 / 推荐设计</Eyebrow>
        <h2 id="pres-heading-2" tabIndex={-1}>一个主重心。<br /><span>辅助能力各归其位。</span></h2>
        <div className="pres-choice-layout">
          <div className="pres-relationship" aria-label="五套方案的组合关系">
            <div className="pres-primary-node"><span className="pres-overline">默认入口</span><h3>实践案例</h3><p>解释条件、选择与结果</p></div>
            <div className="pres-attached"><div><span>01</span><h4>方法资源</h4><p>附在步骤，支持检索</p></div><div><span>02</span><h4>行业专题</h4><p>聚合同一业务任务</p></div><div><span>03</span><h4>问题讨论</h4><p>关联具体内容，自愿回应</p></div></div>
            <div className="pres-independent-node"><span className="pres-overline">独立一级入口</span><h3>创作交流</h3><p>作品、系列与作者选择的交流</p><small>按实际内容关系与实践区连接</small></div>
          </div>
          <div className="pres-choice-notes"><h3>实践优先的理由</h3><p>现有任务、作品和方法材料，可以围绕“一次有依据的选择”组织起来。</p><p>创作保留自己的价值：作品无需写成教程，作者也可以只展示。</p><div className="pres-pullquote">如果内容只是重复原教程，<br />这个选择就需要重审。</div><Source href="/community-options/review">五套方案的支持与反例</Source></div>
        </div>
        <p className="pres-footnote">九主题继续覆盖：电商、设计、本地经营、历史、科普、角色、写作、人像、手作。用于检索与编选，不等于同时运营九个专业频道。</p>
      </>)}

      {panel(3, 'pres-practice', <>
        <Eyebrow number="04">贯穿情境 A / 商品展示图</Eyebrow>
        <div className="pres-heading-with-tag"><h2 id="pres-heading-3" tabIndex={-1}>换一个背景，<br /><span>保留商品真实的样子。</span></h2><ExampleTag /></div>
        <p className="pres-lead">二手皮包经营者想统一上架背景，同时保留磨损、颜色和材质。先比较处理方式，再进入工具。</p>
        <div className="pres-task-strip"><span>任务</span><strong>保留磨损，只调整背景</strong><span>输入</span><strong>商品实拍图</strong><span>核对</span><strong>边缘 · 色差 · 磨损 · 文字</strong></div>
        <div className="pres-methods" aria-label="三种方法的编辑判断框架，不是实测排名">
          <article><span className="pres-method-number">A</span><h3>保留实拍</h3><p>裁切与整理背景</p><div><span>适合考虑</span>商品状态已清楚，主要问题在构图。</div><div><span>必须核对</span>裁切有没有遮住重要细节。</div></article>
          <article><span className="pres-method-number">B</span><h3>抠图合成</h3><p>单独控制商品区域</p><div><span>适合考虑</span>需要统一背景，保留主体。</div><div><span>必须核对</span>边缘、阴影、透明与反光区域。</div></article>
          <article><span className="pres-method-number">C</span><h3>局部生成</h3><p>尝试不同场景表达</p><div><span>适合考虑</span>愿意逐项核验修改结果。</div><div><span>必须核对</span>形状、标识与磨损有没有被改写。</div></article>
        </div>
        <ol className="pres-journey"><li><b>01</b><span>找相近案例<small>素材与处理范围</small></span></li><li><b>02</b><span>判断取舍<small>比较条件，收藏</small></span></li><li><b>03</b><span>前往原工具<small>版本、许可与入口</small></span></li><li><b>04</b><span>按需回来<small>查偏差，自愿反馈</small></span></li></ol>
        <div className="pres-section-end"><p>这是一套拟议判断框架。素材不同不能排成同条件榜单；外部制作结果由使用者核对，不回报也完成阅读路径。</p><Source href="/community-options/design/practice">完整实践方案与任务依据</Source></div>
      </>)}

      {panel(4, 'pres-creation', <>
        <Eyebrow number="05">贯穿情境 B / 角色作品</Eyebrow>
        <div className="pres-heading-with-tag"><h2 id="pres-heading-4" tabIndex={-1}>作品先被看见。<br /><span>讨论由作者邀请。</span></h2><ExampleTag>虚构作品与回复 · 设计样例</ExampleTag></div>
        <div className="pres-creation-layout">
          <article className="pres-story"><div className="pres-story-top"><span>原创角色故事 / 片段示意</span><span>01—03</span></div><h3>她为什么<br />在这一幕离开？</h3><p className="pres-story-intention">她仍然关心同伴，<br />却决定独自寻找线索。</p><div className="pres-story-frames"><span>前情<small>同伴受困</small></span><span>此刻<small>独自离开</small></span><span>后续<small>寻找线索</small></span></div><p className="pres-story-caption">文字分镜示意，非真实作者作品</p></article>
          <div className="pres-discussion"><span className="pres-overline">作者选择 · 开放讨论</span><h3>人物动机，<br />能从片段里看出来吗？</h3><p>这次希望听叙事意见；画风与工具选择不在讨论范围内。</p><blockquote>她离开前没有回应同伴，我更容易理解成愤怒。如果想表达担心，可以考虑增加一个回望的动作。<cite>虚构读者回复 · 针对一个具体选择</cite></blockquote><p className="pres-discussion-choice"><Check size={16} aria-hidden="true" />作者可以接受、解释，也可以保留原处理。</p><div className="pres-feedback-options"><span>仅展示<small>收藏与关注</small></span><span>开放讨论<small>问题说明伴随评论</small></span></div></div>
        </div>
        <div className="pres-section-end"><p>系列与作者更新承接回访；过程资料自愿补充。一次有依据的交流就有价值，修改作品不是参与义务。</p><Source href="/community-options/design/creator">真实作者参照与创作方案</Source></div>
      </>)}

      {panel(5, 'pres-connection', <>
        <Eyebrow number="06">两区关系 / 有条件的连接</Eyebrow>
        <h2 id="pres-heading-5" tabIndex={-1}>有关系的内容，<br /><span>才值得互相引路。</span></h2>
        <p className="pres-lead">商品图经营者与角色创作者未必重合。两区可以共存，增长上的相互促进仍没有证据。</p>
        <div className="pres-connection-map" aria-label="实践与创作仅在同作者、过程授权或自愿分享时关联">
          <div className="pres-area pres-area-practice"><span className="pres-overline">PRACTICE</span><h3>实践</h3><p>为什么采用这一步？</p><small>商品展示图情境<br />收藏案例，回查方法</small></div>
          <div className="pres-bridges"><div><span>同一作者</span><p>作品与实践记录互相引用</p></div><div><span>取得过程授权</span><p>作品可被联合整理成案例</p></div><div><span>使用者自愿分享</span><p>新成果关联参考案例</p></div></div>
          <div className="pres-area pres-area-creation"><span className="pres-overline">CREATION</span><h3>创作</h3><p>作者想表达什么？</p><small>角色故事情境<br />关注作者，读后续作品</small></div>
        </div>
        <div className="pres-two-notes"><div><h3>共享基础</h3><p>作者身份、主题、收藏、来源与授权。</p></div><div><h3>分别组织</h3><p>发现与推荐、发布要求、交流目标；不要求使用者公开成果。</p></div></div>
        <p className="pres-footnote">图中连接是设计条件，不代表已经发生的转化；两条情境用于说明不同价值，不构成需求规模或人群重合证据。</p>
      </>)}

      {panel(6, 'pres-supply', <>
        <Eyebrow number="07">供给与运营 / 一条内容怎样形成</Eyebrow>
        <h2 id="pres-heading-6" tabIndex={-1}>编辑把材料组织好。<br /><span>作者把经验讲准确。</span></h2>
        <p className="pres-lead">首批供给按“编辑主导、作者参与”设计。自主投稿开放，但不承担稳定供给假设。</p>
        <div className="pres-supply-roles"><article><span>EDITOR</span><h3>编辑</h3><p>选题、权限与来源核对，补齐条件，维护入口和已知状态。</p></article><article><span>AUTHOR</span><h3>作者</h3><p>解释自己的关键取舍，确认经验表述，选择公开与交流范围。</p></article><article><span>CONTRIBUTOR</span><h3>相关经验者</h3><p>自愿回应具体问题。专业判断由具有对应能力的人承担。</p></article></div>
        <ol className="pres-lifecycle"><li>发现候选</li><li>核对材料与权限</li><li>联合整理</li><li>作者确认</li><li>发布与归类</li><li>反馈与更新</li></ol>
        <div className="pres-supply-cases"><div><span className="pres-case-letter">A</span><h3>商品案例</h3><p>取得一段可公开的过程，讲清一次关键选择；缺少过程时，保留为方法索引或作品。</p></div><div><span className="pres-case-letter">B</span><h3>角色作品</h3><p>作品发布保持轻量。需要对谈或整理创作过程时，再与作者分别约定。</p></div></div>
        <div className="pres-section-end"><p>署名、编辑协助、来源导流与稿酬可作为合作内容；参与意愿需逐人确认。一次投稿不附带长期维护或答疑义务。</p><Source href="/community-options#combine">供给安排与组合方案</Source></div>
      </>)}

      {panel(7, 'pres-scope', <>
        <Eyebrow number="08">产品取舍 / 建议优先级</Eyebrow>
        <h2 id="pres-heading-7" tabIndex={-1}>把核心路径做完整。<br /><span>把服务承诺说具体。</span></h2>
        <div className="pres-scope-grid"><article><span className="pres-scope-label">保留</span><h3>内容与作者关系</h3><ul><li>实践、创作两个入口</li><li>案例与作品各有详情</li><li>作者归属、收藏、原站入口</li><li>围绕具体内容，自愿讨论</li></ul></article><article><span className="pres-scope-label">调整</span><h3>用轻量方式承接</h3><ul><li>比较先用编辑对照与关联阅读</li><li>筛选围绕已有内容的有效条件</li><li>反馈先设仅展示 / 开放讨论</li><li>系列先关联原作与后续说明</li></ul></article><article><span className="pres-scope-label">暂缓</span><h3>等待明确供给</h3><ul><li>专业服务撮合</li><li>独立行业频道</li><li>全量资源目录与镜像托管</li><li>统一生成器与复杂排名</li></ul></article></div>
        <div className="pres-commercial"><span className="pres-overline">商业安排</span><p>基础发现、阅读与普通交流承担社区价值。商业合作独立标识；收入路径等明确付费方和交付物后再选择。</p><small>作者稿酬属于供给成本。付费意愿与履约能力未验证，专业服务收入不作为本方案成立的理由。</small></div>
        <p className="pres-footnote">以上为产品设计建议，尚未进入研发范围确认，不代表开发排期或已确认的服务能力。</p>
      </>)}

      {panel(8, 'pres-decision', <>
        <Eyebrow number="09">结论与条件 / 推荐继续深化</Eyebrow>
        <h2 id="pres-heading-8" tabIndex={-1}>选择实践主线，<br /><span>保留创作的独立价值。</span></h2>
        <p className="pres-lead">这套组合具备继续设计的逻辑依据。它最终能否成立，取决于内容增加了什么，以及谁愿意持续参与。</p>
        <div className="pres-conditions"><div><span>01</span><h3>有值得比较的材料</h3><p>能取得选择理由、适用条件或后续修正。</p><small>如果只有成品或教程复述 → 缩小选题，回到作品或原站指引。</small></div><div><span>02</span><h3>有自愿参与的作者</h3><p>作者愿意公开经验，或参与有范围的交流。</p><small>如果只愿展示 → 保持轻量作品空间，降低对谈与答疑承诺。</small></div><div><span>03</span><h3>比较确实帮助选择</h3><p>使用者能更清楚地判断一种做法是否适用。</p><small>如果仍需回原站重复查找 → 重审案例增加的信息与主定位。</small></div></div>
        <div className="pres-closing"><p>下一步：以两条路径为输入，<br /><strong>深化页面信息与动作。</strong></p><div><span>当前完成的是研究与方案设计。</span><span>用户迁移、持续供给、付费意愿仍待实际参与验证。</span><span>尚未开展招募、供给演练或用户观察。</span></div></div>
        <div className="pres-reading"><span>继续查阅</span><Source href="/community-options/review">依据与反例</Source><Source href="/community-options">五套方案</Source><Source href="/research-decisions">方向与真实任务</Source><Source href="/research-status">证据状态</Source></div>
      </>)}
    </main>

    <footer className="pres-controls" aria-label="演示导航">
      <div className="pres-progress-label" aria-live="polite" aria-atomic="true"><strong>{String(active + 1).padStart(2, '0')}</strong><span>/ 09</span><span>{chapters[active].title}</span></div>
      <nav className="pres-chapter-dots" aria-label="快速章节跳转">{chapters.map((chapter, index) => <button key={chapter.id} type="button" title={`${index + 1}. ${chapter.title}`} aria-label={`第 ${index + 1} 章：${chapter.title}`} aria-current={index === active ? 'step' : undefined} onClick={() => go(index)}><span /></button>)}</nav>
      <div className="pres-arrows"><span className="pres-key-hint">← → 切换章节</span><button type="button" disabled={active === 0} aria-label="上一章" onClick={() => go(active - 1)}><ArrowLeft size={18} aria-hidden="true" /></button><button type="button" disabled={active === chapters.length - 1} aria-label="下一章" onClick={() => go(active + 1)}><ArrowRight size={18} aria-hidden="true" /></button></div>
      <div className="pres-progress-track" aria-hidden="true"><span style={{ width: `${(active + 1) / chapters.length * 100}%` }} /></div>
    </footer>
  </div>;
}

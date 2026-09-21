import Depth from './depth';
import Link from '@/components/research-link';
import '../../cases/ecommerce/style.css';
export default function Page() {
  return (
    <main className="ec-study">
      <header>
        <Link href="/community-options/scenarios">← 九类场景</Link>
        <span>本地经营宣传 · 专题方案</span>
      </header>
      <h1>把一次门店活动做成一套可用物料</h1>
      <p className="ec-lead">
        从商家确认的信息出发，完成海报、配套文案和不同用途的版式；活动变了，也能找到需要重做的那几张。
      </p>
      <nav>
        <a href="#evidence">已有方案</a>
        <a href="#branches">任务分支</a>
        <a href="#handoff">制作与交接</a>
        <a href="#packages">内容包</a>
        <a href="#cards">卡片与入口</a>
        <a href="#delivery">交付检查</a>
      </nav>
      <section id="evidence">
        <h2>工具已经在解决什么</h2>
        <article>
          <small>美团技术团队 · 2026-06-18 · 平台自述</small>
          <h3>海报生成、编辑和评估已经连在一起</h3>
          <p>
            美团公开了海报生成、主体保持和质量评估的技术实践，并展示品牌 IP
            与商品海报。材料支持“已有成套技术方案”，单个门店从改稿到实际使用的过程仍未展开。
          </p>
          <a
            href="https://tech.meituan.com/2026/06/18/AIGC-poster.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看原文与示例 ↗
          </a>
        </article>
        <article>
          <small>Adobe 官方教程 · 2026-08-07</small>
          <h3>一张品牌图，可以继续做多尺寸物料</h3>
          <p>
            教程演示从参考图调整品牌视觉，进入 Express
            添加文字，再延展不同尺寸。部分版式需手动调整。它提供了可借鉴的制作路径，尚未展示门店使用后的经营结果。
          </p>
          <a
            href="https://www.adobe.com/learn/firefly/web/create-social-campaign-adobe-express"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看制作演示 ↗
          </a>
        </article>
        <p>
          <strong>判断：</strong>
          基础制作值得跟进；活动信息、修改记录和物料复用仍需门店连续使用案例检验。
        </p>
      </section>
      <section id="brand-case">
        <h2>品牌系列参照：固定调性，变化每张表达</h2>
        <article>
          <small>全速数字设计 · 2026-09-08 · 服务方项目自述</small>
          <h3>歪马送酒会员活动：黑金与揭幕系列</h3>
          <p>
            作者说明以品牌黑金色和幕布动作组织倒计时海报、活动页，使用AI制作幕布、光影和IP姿态，并处理徽章与系列变化。
          </p>
          <p>
            可以借鉴同组物料固定什么、变化什么。原文未公开单店改稿、客户确认或再次复用，仍按品牌设计参照使用。
          </p>
          <a
            href="https://m.adquan.com/case2/detail-363335"
            target="_blank"
            rel="noopener noreferrer"
          >
            项目取舍与输出 ↗
          </a>
        </article>
      </section>
      <Depth />

      <section id="cards">
        <h2>先看用途，再选材料</h2>
        <div className="ec-three ec-choice">
          <article>
            <h3>活动案例卡</h3>
            <p>预览整套物料；标注业态、活动类型、用途。进入后看制作与改稿。</p>
          </article>
          <article>
            <h3>版式资产卡</h3>
            <p>
              预览、可改字段、格式、许可及工具条件。先确认适用性，再进入制作。
            </p>
          </article>
          <article>
            <h3>修改求助卡</h3>
            <p>
              展示问题局部与期望变化。优惠条件只公开必要内容，私人经营资料由作者自行脱敏。
            </p>
          </article>
        </div>
        <p>
          建议以活动专题关联三类内容。MakeNow
          作为优先制作入口，画布的文字编辑、尺寸延展与导出能力需逐项核对；不兼容的工程保留原工具说明。
        </p>
      </section>
      <section id="delivery">
        <h2>一次交付要过四道检查</h2>
        <ol>
          <li>
            <strong>内容准确：</strong>
            商家逐项确认商品、价格、期限、门店与限制条件。
          </li>
          <li>
            <strong>画面真实：</strong>
            成品与实际提供的商品或服务相符，装饰元素不会改变承诺。
          </li>
          <li>
            <strong>用途适配：</strong>
            手机能读清，重要信息未裁切；印刷规格由实际承印方确认。
          </li>
          <li>
            <strong>版本可找：</strong>
            明确当前使用版，活动变更后列出待替换物料。
          </li>
        </ol>
        <p>
          拟由专题编辑维护用途说明与模板状态，作者提供工程条件和修改记录，商家确认活动事实。当前证据仍缺中文门店的连续改稿、实际投放和再次复用；本页是供给与产品建议。
        </p>
      </section>
      <footer>
        来源核读：2026-09-20。专题方案尚未验证门店实操或 MakeNow 集成。
      </footer>
    </main>
  );
}

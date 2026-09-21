import Continuation from './continuation';
import TopicReadingPlan from '../topic-reading-plan';
import Link from '@/components/research-link';
import '../../cases/ecommerce/style.css';
const rows = [
  [
    '明确交付',
    '读者、用途、长度、发布日期、不能改的事实',
    '编辑简报',
    '事实范围或读者不明，不写正文',
  ],
  [
    '建立底稿',
    '已有稿先核对；无稿则整理可用材料、区分事实与观点，列提纲后形成底稿',
    '核对过的底稿、来源与编辑约束',
    '事实有来源，作者确认底稿表达；待核内容不写成事实',
  ],
  ['提出版本', '简报与具体修改目标', '基线版和目标改写版', '重要改动有理由'],
  ['作者取舍', '可定位反馈', '选定版本与变更记录', '不以“更顺”替代反馈'],
  [
    '交付检查',
    '链接、附件、样式、隐私',
    '可发送/发布文本',
    '残留、事实、格式均通过',
  ],
];
export default function Page() {
  return (
    <main className="ec-study">
      <header>
        <Link href="/community-options/scenarios">← 九类场景</Link>
        <span>写作与编辑 · 专题方案</span>
        <h1>从个人材料或草稿，写到作者定稿</h1>
        <p className="ec-lead">
          从个人材料形成底稿，或直接修改已有文本。围绕用途与读者保留修改理由，由作者决定最终表达。
        </p>
        <nav>
          <a href="#reading-plan">专题编排</a>
          <a href="#evidence">证据</a>
          <a href="#task">改稿路径</a>
          <a href="#content">内容卡</a>
          <a href="#peer-feedback">自改与讨论</a>
          <a href="#handoff">材料交接</a>
          <a href="#recovery">中断处理</a>
          <a href="#operations">平台分工</a>
          <a href="#delivery">交付与复用</a>
        </nav>
      </header>
      <TopicReadingPlan kind="writing" />
      <section id="evidence">
        <h2>版本演变与交付前纠错都有公开过程</h2>
        <article>
          <small>中文作者公开披露 · 2026-03-11 · 个人自述</small>
          <h3>作者保留三版，并最终选择自己的表达</h3>
          <p>
            少数派作者披露以长期记录生成文章、调整结构、改为个人风格并修订核心隐喻，且链接发布定稿；原始私有材料与三版全文未全公开，不能复做质量比较。
          </p>
          <a
            href="https://sspai.com/post/107066"
            target="_blank"
            rel="noopener noreferrer"
          >
            过程披露 ↗
          </a>{' '}
          ·{' '}
          <a
            href="https://sspai.com/post/107060"
            target="_blank"
            rel="noopener noreferrer"
          >
            公开定稿 ↗
          </a>
        </article>
        <article>
          <small>中文纠错过程 · 2026-07-16 · 个人自述</small>
          <h3>数十轮改动后，最终清理仍发现残留</h3>
          <p>
            一位作者在技术方案交付前发现草稿标记、内部 ID、死链，以及 Word
            修复提示和空表格单元格，因而补充末次扫描、结构和元数据检查。未公开原稿或差异版本。
          </p>
          <a
            href="https://blog-ai.tianli.cyou/how-to-brief-an-ai"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看原文 ↗
          </a>
        </article>
        <article>
          <small>OpenAI Academy 官方教程 · 2026-04-10</small>
          <h3>目标、材料和具体反馈是编辑输入</h3>
          <p>
            教程覆盖规划、起草、修订和打包；它是工具任务说明，不是用户采用成效。
          </p>
          <a
            href="https://openai.com/academy/writing/"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看原文 ↗
          </a>
        </article>
        <p>
          <strong>判断：</strong>
          纠错记录支持将残留、结构、链接和元数据检查设为独立放行环节；它不证明所有作者会公开私稿，也不证明工具可自动完成核验。
        </p>
      </section>
      <section id="task">
        <h2>从底稿到定稿：保留每次取舍</h2>
        <p>
          已有稿件可直接核对原稿；只有个人材料时，先限定可用范围、区分事实与观点、组织提纲，再形成并核对底稿。之后进入同一改稿流程。
        </p>
        <div className="ec-flow">
          编辑简报 → 核对底稿与事实 → 定向修改 → 比较差异 → 作者取舍 → 交付检查
        </div>
        <div className="ec-scroll">
          <table>
            <thead>
              <tr>
                <th>环节</th>
                <th>输入与动作</th>
                <th>产物</th>
                <th>完成检查</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <td key={c}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ec-two">
          <article>
            <h3>对外说明分支</h3>
            <p>优先核对称谓、时间、链接和承诺强度；作者确认后才发送。</p>
          </article>
          <article>
            <h3>个人经验分支</h3>
            <p>
              优先保留作者承担的判断、材料范围和 AI
              使用披露；不能把私有材料自动公开。
            </p>
          </article>
        </div>
      </section>
      <section id="content">
        <h2>内容卡要带最低材料</h2>
        <div className="ec-scroll">
          <table>
            <thead>
              <tr>
                <th>任务</th>
                <th>最低材料</th>
                <th>产物</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  '会议通知两版改写',
                  '原通知、具体时间地点、收件人与动作',
                  '短版、说明版和删改理由',
                ],
                [
                  '一页项目更新',
                  '已确认进度、数据日期、风险和负责人',
                  '管理者摘要与团队行动版',
                ],
                [
                  '技术方案交付前清理',
                  '当前文档、链接/附件清单、格式要求',
                  '残留、结构、元数据检查单',
                ],
                [
                  '个人资料到发布文章',
                  '可披露材料范围、原稿、平台规则',
                  '版本说明与最终稿',
                ],
              ].map((r) => (
                <tr key={r[0]}>
                  {r.map((c) => (
                    <td key={c}>{c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="ec-three ec-choice">
          <article>
            <h3>改稿案例卡</h3>
            <p>原文片段、目标、前后差异与作者采用状态。</p>
          </article>
          <article>
            <h3>编辑约束卡</h3>
            <p>用途、语气、必留事实和检查顺序。</p>
          </article>
          <article>
            <h3>局部求助卡</h3>
            <p>一个问题、必要上下文和期望结果。</p>
          </article>
        </div>
      </section>
      <Continuation />
      <section id="delivery">
        <h2>作者决定最终版本</h2>
        <p>
          作者提供材料、选择观点并确认事实；编辑提出可定位修改、检查格式与发布要求；使用者按实际收件场景读一遍，指出不能理解或不能行动处。事实改写、反馈冲突、风格压过作者声音或仍有死链时，退回最近通过版本，归类为事实、结构、语气或格式问题。
        </p>
        <p>
          <strong>二次使用：</strong>
          编辑简报、事实核验表、版本命名、链接检查和披露模板可复用；正文模板只在读者、目的和事实范围相近时复用。文字编辑器、版本记录和写作助手已有相关任务组织方式，不代表本站或
          MakeNow 已集成。
        </p>
        <p>
          <strong>MakeNow 边界：</strong>
          只确认用户可在自有画布确认视觉稿。文本编辑、批注、版本比对、文档导入导出和演示生成均未知；本页是内容链，不是功能承诺。
        </p>
      </section>
      <footer>
        来源核读：2026-09-20。专题方案尚未验证真实作者改稿、投稿或工具集成。
      </footer>
    </main>
  );
}

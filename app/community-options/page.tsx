/* eslint-disable next/no-img-element -- Concept artwork and the standalone SVG retain their original pixels and text without image transformation. */
import Link from '@/components/research-link';
import './options.css';
const options = [
  [
    'a',
    '任务创作',
    '找到方法，完成任务',
    '围绕具体用途整理案例、应用和工作流；从看懂方法到动手制作，再回圈子交流。',
    '/proposal-one/home-v8-card-spacing.png',
    '任务与专题',
    '平台编辑＋实践作者',
  ],
  [
    'b',
    '项目共学',
    '完成一次有反馈的练习',
    '用完整项目串起材料、步骤、尝试和反馈。学习者留下自己的过程，主理人帮助越过关键难点。',
    '/proposal-options/b-home-differentiated.png',
    '练习与项目',
    '主理人＋方法作者＋同伴',
  ],
  [
    'c',
    '创作者研讨',
    '围绕作品，改进表达',
    '从作品和创作意图开始，邀请相关同行讨论。作者决定采用哪些建议，保留自己的表达。',
    '/proposal-options/c-home-differentiated.png',
    '作品与作者',
    '创作者＋相关同行＋策展编辑',
  ],
  [
    'd',
    '方法共建',
    '让方法随着工具一起更新',
    '把输入条件、版本、复现记录与替代办法放在一起。贡献者共同维护，使用者知道何时适用。',
    '/proposal-options/d-home-differentiated.png',
    '方法与版本',
    '维护者＋复现贡献者',
  ],
  [
    'e',
    '问题互助',
    '解决制作中的具体卡点',
    '围绕目标、材料和已尝试的方法交流。建议附适用条件，提问者补充尝试与采用结果。',
    '/proposal-options/e-home-differentiated.png',
    '问题与回应',
    '经验回应者＋圈子主持',
  ],
];
const comparison: Record<string, [string, string]> = {
  a: ['案例能帮助判断品类和方法，提供原教程之外的选择依据。', '仅重复原工具教程时，缩为专题内容。'],
  b: ['练习需要连续反馈，且有人持续带练。', '自学足够或缺少主理人时，保留阅读、自检与原教程入口。'],
  c: ['作者有具体表达问题，并能匹配理解作品语境的同行。', '原社媒已够用或只得到泛赞美时，先保留作品专题。'],
  d: ['版本差异影响使用，且有人持续维护有限范围。', '原渠道维护充分时只保留索引；无人维护时停止可靠推荐。'],
  e: ['具体卡点反复出现，且有匹配的回应者和纠错办法。', '回应者不足时，优先整理已有答案并分流原渠道；收到建议不等于问题已解决。'],
};
export default function Page() {
  return (
    <main className="op-shell">
      <header className="op-top">
        <Link href="/#overview">多元拾光 / 研究室</Link>
        <div>
          <Link href="/research-brief">简版研究报告 ↗</Link>
        </div>
      </header>
      <section className="op-hero">
        <span>社区方案</span>
        <h1>
          五种重心，
          <br />
          五套选择。
        </h1>
        <p>
          五套方案分别展开产品概念、用户路径、内容与运营，可独立采用或组合。
        </p>
        <nav>
          <Link href="/community-options/fusion">融合方案 →</Link>
          <Link href="#options">查看五套方案 ↓</Link>
          <Link href="#compare">比较与组合</Link>
          <Link href="/community-options/library">研究依据</Link>
        </nav>
      </section>
      <section id="options" className="op-grid">
        {options.map(([id, name, tag, text, image, core, supply], i) => (
          <article key={id}>
            <Link
              href={'/community-options/proposals/' + id}
              className="op-cover"
            >
              <img
                src={image}
                alt={name + '首页概念稿'}
                loading={i > 1 ? 'lazy' : 'eager'}
              />
            </Link>
            <div className="op-card-body">
              <span className="op-code">
                0{i + 1} / 方案 {id.toUpperCase()}
              </span>
              <h2>
                <Link href={'/community-options/proposals/' + id}>
                  {name} <span>↗</span>
                </Link>
              </h2>
              <h3>{tag}</h3>
              <p>{text}</p>
              <dl>
                <dt>组织核心</dt>
                <dd>{core}</dd>
                <dt>供给基础</dt>
                <dd>{supply}</dd>
              </dl>
              <Link href={'/community-options/proposals/' + id}>
                概念 · 路径 · 内容与运营 →
              </Link>
            </div>
          </article>
        ))}
      </section>
      <section id="compare" className="op-section">
        <span>比较与组合</span>
        <h2>功能可共用，社区重心要清楚。</h2>
        <div className="op-table">
          <table>
            <thead>
              <tr>
                <th>方案</th>
                <th>成立条件</th>
                <th>主要取舍</th>
              </tr>
            </thead>
            <tbody>
              {options.map(([id, name]) => (
                <tr key={id}>
                  <th>
                    {id.toUpperCase()} · {name}
                  </th>
                  <td>{comparison[id][0]}</td>
                  <td>{comparison[id][1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="op-callout">
          <h3>推荐组合：A 为主，C 保留独立入口</h3>
          <p>
            A 承接任务、方法选择与制作；C 留出围绕作品表达的交流空间。B
            可作为专题共学，D 用于维护重点资源，E 承接圈子问题。稳定供给形成后，再评估独立入口。
          </p>
          <Link href="/community-options/fusion">
            查看融合方案的信息架构与用户路径 →
          </Link>
        </div>
      </section>
      <footer className="op-footer">
        <Link href="/community-options/library">查看研究依据与参考材料 →</Link>
      </footer>
    </main>
  );
}

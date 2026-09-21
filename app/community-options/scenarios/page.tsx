import Link from '@/components/research-link';
import ContentMap from './content-map';
import '../cases/ecommerce/style.css';
const rows = [
  [
    '电商营销',
    '主图、场景图、详情图',
    '任务简报、六步制作、修改交付、复用',
    '已有代表方案；连续采用与真实集成待核',
    '/community-options/cases/ecommerce#topic-plan',
  ],
  [
    '本地经营宣传',
    '活动物料、菜单更新',
    '活动／改价／菜单三分支，交接与更新清单',
    '平台技术与官方教程；门店连续采用待补',
    '/community-options/scenarios/local-business',
  ],
  [
    '知识内容创作',
    '有出处的解释图文',
    '来源、解释、图文核对、修订与更正',
    '已有来源组织参照；完整发布与核稿证据待补',
    '/community-options/scenarios/knowledge',
  ],
  [
    '角色与故事创作',
    '同一角色的连贯故事',
    '角色设定、分镜、逐格修改、连读与复用',
    '工具组织与作者后续反馈；完整项目待补',
    '/community-options/scenarios/character',
  ],
  [
    '人像与生活影像',
    '人物特征可辨的纪念影像',
    '保留项、局部修复、写真／排版分支与确认',
    '修复求助与回应可查；完整纪念交付待补',
    '/community-options/scenarios/portrait',
  ],
  [
    '设计与视觉表达',
    '同主题的系列视觉',
    '简报、品牌约束、版式延展与源工程交付',
    '新增品牌提案与中文代理项目；连续改稿待补',
    '/community-options/scenarios/design',
  ],
  [
    '写作与编辑',
    '保留原意的改稿',
    '作者取舍、事实复核、版本对照与复用',
    '中文作者自述及公开成稿可查',
    '/community-options/scenarios/writing',
  ],
  [
    '职场与学习表达',
    '资料转成汇报或讲义',
    '资料对照、受众结构、展示检查与更新',
    '工具与校方参照；完整中文交付待补',
    '/community-options/scenarios/work-learning',
  ],
  [
    'IP与文创开发',
    '形象、动作与数字应用',
    '设定、复杂动作、系列检查与应用交付',
    '原创过程和AIGC成果分别可查；完整AI采用待补',
    '/community-options/scenarios/ip',
  ],
];
export default function Page() {
  return (
    <main className="ec-study">
      <header>
        <Link href="/#strategy">← 社区方案</Link>
        <span>九类场景</span>
      </header>
      <h1>九类场景，怎样组织才有用</h1>
      <p className="ec-lead">
        从具体任务出发，组织案例、方法、资产与修改讨论，并连接合适的制作入口。
      </p>
      <section>
        <h2>产品路径与案例证据分开看</h2>
        <p>
          商品已有代表方案；其余八类已有任务分支、内容包、交付与复用设计。真实采用、授权文件和工具兼容仍需对应证据。九类是研究范围，不直接等于九个频道。
        </p>
        <div className="ec-scroll">
          <table>
            <thead>
              <tr>
                <th>场景与任务</th>
                <th>方案展开</th>
                <th>案例证据</th>
                <th>阅读</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([name, task, design, evidence, url]) => (
                <tr key={name}>
                  <th>
                    {name}
                    <p>{task}</p>
                  </th>
                  <td>{design}</td>
                  <td>{evidence}</td>
                  <td>
                    <Link href={url}>查看专题 →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <p>
        <Link href="/community-options/content-system">
          查看九类内容配置与社区结构 →
        </Link>
      </p>
      <section>
        <h2>专题设计依据</h2>
        <div className="ec-three ec-choice">
          <article>
            <h3>内容包</h3>
            <p>写清作者交哪些材料，使用者可以接着做什么，完成时如何检查。</p>
          </article>
          <article>
            <h3>制作与修改</h3>
            <p>
              保留各类任务的分支、失败恢复、交付与再次复用，避免全部套成同一条生图路径。
            </p>
          </article>
          <article>
            <h3>工具承接</h3>
            <p>
              社区负责组织与关联；MakeNow及适合的原工具承担制作，专业判断由相应人员确认。
            </p>
          </article>
        </div>
        <p>
          MakeNow
          已有画布；项目复制、文件兼容、结果关联等具体能力仍需核对。自有电商
          Agent 与工作流工具属于规划。
        </p>
        <p>
          <Link href="/community-options/home-draft">查看已有社区样板 →</Link>
          　九类可在同一社区样板中筛选、查看详情与使用条件。
        </p>
      </section>
      <ContentMap />
      <footer>
        案例、工具能力与实际采用分别记录；九类场景的排列不代表市场排名。
      </footer>
    </main>
  );
}

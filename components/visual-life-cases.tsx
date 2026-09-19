import evidence from '@/lib/visual-life-evidence.json';

const observations = [
  {id:'world', title:'喜欢宏大场景，也会挑剔重复', need:'大场景、画质、运镜与沉浸感', supply:'世界草稿的三件东方巨构作品已有欣赏、配乐建议和制作讨论。', finding:'一条展开的评论中，作者与另一位创作者讨论天宫题材重复和差异化出图困难。继续增加相似画面，吸引力需要重新验证。'},
  {id:'infinite', title:'视觉作品也有连续浏览入口', need:'欣赏同一风格，继续看下一件', supply:'无限树的天宫系列已走通第2集→第3集→第4集。', finding:'评论包含场景代入、审美评价和成本询问。系列编号与发布日期顺序不同，适合按风格理解；叙事关系还需全片核对。'},
  {id:'circle', title:'看完改造，问题转向实物和做法', need:'效果参考、材料来源、制作步骤', supply:'圆子改造家同时提供AI转场展示、家居改造展示和DIY教程。', finding:'桌板和床的来源已有作者答复；屏风另有教程。具体材料、适用空间和落地条件，是继续核查的方向。'},
];
export function VisualLifeCases(){return <section id="ms-visual-life">
  <h2>审美与家居：同一作品，承接三种不同需求</h2>
  <p>3位作者、10个作品页面，归并为9个内容对象。采集日期为2026年9月16日，作品发表于2025年8月至2026年8月；以下依据详情、可见评论、回复与局部画面。</p>
  <div className="ms-grid three">{observations.map(o=><article key={o.id}><h3>{o.title}</h3><strong>{o.need}</strong><p>{o.supply}</p><p>{o.finding}</p><div className="ms-links">{evidence.groups.find(g=>g.id===o.id)?.workIds.map(id=>{const w=evidence.works.find(w=>w.id===id)!;return <a key={id} href={w.url} target="_blank" rel="noopener noreferrer">{w.title} ↗</a>})}</div></article>)}</div>
  <div className="ms-table"><table><thead><tr><th>观众要什么</th><th>样本中已有的回答</th><th>值得继续核查的问题</th></tr></thead><tbody>
    <tr><th>看得更过瘾</th><td>巨构、云海、配乐、系列浏览</td><td>题材与视觉表达怎样区别于同类？</td></tr>
    <tr><th>把灵感用进生活</th><td>部分家具来源、屏风和床幔教程</td><td>材料、尺寸与施工条件能否支撑照做？</td></tr>
    <tr><th>学会怎样制作</th><td>作者确认即梦制作转场，并认可首尾帧方法</td><td>具体提示词、排队和复杂场景效果如何解决？</td></tr>
  </tbody></table></div>
  <p>这些案例说明，供给机会需要落到具体缺失环节。欣赏者、购买参考者与制作学习者提出的问题不同；已有回复和教程也应计入供给。</p>
  <p className="ms-caption">家居转场中的AI参与由作者确认；其余家居作品按普通内容对照。页面章节摘要标注“内容由AI生成”，指向摘要本身。作品互动量保留在采集记录中，缺少播放量的作品不计算观看互动率。</p>
</section>}

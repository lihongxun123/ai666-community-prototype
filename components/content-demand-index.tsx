import index from '@/lib/douyin-index-observations.json';

type Query=typeof index.records[number];
const planned=index.records.filter(r=>r.cohort==='planned');
function QueryTable({records}:{records:Query[]}){
 return <div className="cd-table"><table><thead><tr><th>关键词</th><th>搜索指数均值</th><th>搜索环比</th><th>搜索同比</th><th>综合指数均值</th><th>综合环比</th><th>综合同比</th></tr></thead><tbody>{records.map(r=><tr key={r.keyword}><th><a href={r.url} target="_blank" rel="noreferrer">{r.keyword} ↗</a></th><td>{r.search?.averageText}</td><td>{r.search?.mom}</td><td>{r.search?.yoy}</td><td>{r.composite?.averageText}</td><td>{r.composite?.mom}</td><td>{r.composite?.yoy}</td></tr>)}</tbody></table></div>;
}
export function ContentDemandIndex(){
 return <section id="cd-index"><h2>抖音：已查到哪些需求信号</h2>
  <p>48个计划词中，9个返回指数，39个显示“暂未收录”。另查7个参照词，并做5次大小写及工具词复核。未收录不代表需求为零。</p>
  <p className="cd-data-date">抖音 · 全国 · 2026-08-10至2026-09-10 · 9月11日晚取数，9月12日零点后复核。下表是指数，不是搜索人数。</p>
  <QueryTable records={planned.filter(r=>r.status==='indexed')}/>
  <div className="cd-findings">
   <div><h3>宠物：主动搜索上升，综合声量近乎持平</h3><p>“猫咪日常”搜索环比+43.14%，综合环比−0.73%。说明两种信号并不一致。还需查看搜索者找的是猫咪故事、养宠知识，还是自家宠物的创作方法。</p></div>
   <div><h3>照片：同比增长和近期降温可以同时出现</h3><p>“老照片修复”搜索同比+130.65%，环比−38.07%；“照片动起来”环比−33.66%。有明确任务词，但仅凭同比增长无法判断近期获客时机，任务完成后的回访理由也仍待查。</p></div>
   <div><h3>办公：值得查具体任务与季节影响</h3><p>“PPT制作”搜索均值8862、环比+42.50%。它包括人工制作、素材查找和培训等需求，当前窗口又跨越开学季。需要拆开使用情境，再检查AI内容能解决哪一部分。</p></div>
   <div><h3>商品图：具体词的指数低，不能直接否定行业</h3><p>“商品主图”均值298，“产品摄影”212。竞品已存在商品处理工作流，但行业用户可能从工具、品类、渠道或合作方找方案，单组抖音词不足以估算商家需求规模。</p></div>
  </div>
  <h3>补充参照：AI与故事题材</h3>
  <QueryTable records={index.records.filter(r=>r.cohort==='supplemental'&&r.status==='indexed')}/>
  <p>“漫剧”“短剧”的范围远大于AI制作，“漫剧”的高同比还需要检查历史基数。它们适合用来查题材和读者措辞，不能换算成AI创作者人数。“ai创作”搜索环比−1.99%，也说明AI总词热度不能替代具体选题。</p>
  <details className="cd-profile"><summary><strong>48个计划词的查询状态</strong><span>按主题查看未收录词</span></summary><div className="cd-profile-body"><div className="cd-table"><table><thead><tr><th>主题</th><th>已收录</th><th>暂未收录</th></tr></thead><tbody>{[...new Set(planned.map(r=>r.topic))].map(topic=><tr key={topic}><th>{topic}</th><td>{planned.filter(r=>r.topic===topic&&r.status==='indexed').map(r=>r.keyword).join('、')||'无'}</td><td>{planned.filter(r=>r.topic===topic&&r.status==='not_indexed').map(r=>r.keyword).join('、')}</td></tr>)}</tbody></table></div><p>补充查询中，AI绘画、AI视频、ComfyUI未收录；其小写形式及ai角色复核结果一致，另查dify也未收录。逐词链接、精确查询时间和匹配词保留在<a href="/research-kit/content-demand-2026-09-11/keyword-records.csv" download>指数采集表</a>。</p></div></details>
  <details className="cd-profile"><summary><strong>指数定义与取数口径</strong></summary><div className="cd-profile-body"><dl>{Object.entries({搜索指数:index.definition.search,综合指数:index.definition.composite,均值与变化:index.definition.average,同比与环比基期:index.definition.comparisonBaseline,时间范围:index.definition.period}).map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><ul>{index.notes.map(n=><li key={n}>{n}</li>)}</ul><p><a href={index.definition.sourceUrl} target="_blank" rel="noreferrer">抖音创作者中心·指数说明 ↗</a></p></div></details>
  <h3>关联词：用来扩词，需要先消除歧义</h3><p>AI的搜索关联词周榜中可见“漫剧”（关联度60）、“ai创作”（59）、“短剧”（49），也混有缩写和URL片段。这三项是选出的有意义词，不是榜单前三名。该榜窗口为8月24日至30日，仅用来扩词。<a href={index.associations[0].url} target="_blank" rel="noreferrer">查看关联词来源 ↗</a></p>
  <h2 id="cd-guide">创作指南：直接核对垂类供给与消费</h2><p>{index.guide.finding}</p>
  <div className="cd-table"><table><thead><tr><th>字段</th><th>定义与用途</th><th>取得情况</th><th>页面周期</th></tr></thead><tbody>{index.guide.fields.map(f=><tr key={f.name}><th>{f.name}</th><td>{f.definition}</td><td>{f.status}</td><td>{f.period}</td></tr>)}</tbody></table></div>
  <p>如果后续取得占比，可以比较消费份额与投稿份额；还需核对存量内容、重复观看和头部集中的影响。消费份额高于投稿份额本身不能证明缺内容。</p>
  {index.guide.keywordTables.map(t=><details className="cd-profile" key={t.category}><summary><strong>{t.category}热词</strong><span>{t.period} · 默认第一页10条</span></summary><div className="cd-profile-body"><div className="cd-table"><table><thead><tr><th>顺序</th><th>关键词</th><th>综合指数</th><th>搜索指数</th><th>视频量原值</th></tr></thead><tbody>{t.rows.map(r=><tr key={r.keyword}><td>{r.rank}</td><th>{r.keyword}</th><td>{r.compositeText}</td><td>{r.searchText}</td><td>{r.videoCountText}</td></tr>)}</tbody></table></div><p>视频量的精确数值及是否累计未核实，保留“w+”原值；不把该字段写成当日新增视频。<a href={t.url} target="_blank" rel="noreferrer">查看该垂类 ↗</a></p></div></details>)}
  <p>二次元热词中的“合集、穿越、修仙、爽文”，摄影摄像中的“出片、剪辑、素材、质感”，能帮助运营把宽泛的“AI内容”改成用户能识别的题材与用途。科技第一页则以设备和品牌为主，不能拿整个科技榜替代AI主题研究。</p>
 </section>;
}

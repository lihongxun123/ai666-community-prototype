import data from '@/lib/liblib-work-details.json';

export function LiblibWorkDetails() {
  return <section id="liblib-work-details">
    <h4>作品题材、用途与关联资源</h4>
    <p>36件详情覆盖32件图片与4件视频。可辨识的形式包括海报、室内风格效果图、角色设定板、卡牌插画、汽车外观概念图和产品展示短片。部分人物与场景作品只能确认题材，未说明最终用途。</p>
    <div className="table-wrap"><table><thead><tr><th>具体观察</th><th>对供给统计的影响</th></tr></thead><tbody>
      <tr><th>教师节海报关联的模型信息包含“电商”</th><td>按画面与用途记录为节日海报，不把关联模型名称转换成电商作品。</td></tr>
      <tr><th>开学海报的提示词写“青年节、扁平矢量”</th><td>画面是带开学文字的立体卡通海报。提示词与结果分别保留，不以提示词代替看图。</td></tr>
      <tr><th>女剑客作品包含正、侧、背面及服装细节</th><td>能够确认角色设定板形式；没有游戏项目采用或交付记录。</td></tr>
      <tr><th>丝路作品呈现丝绸、刺绣与船队</th><td>能够确认国风题材；没有文旅客户或商品应用说明。</td></tr>
      <tr><th>“冰天雪地”是5秒舵机产品展示视频</th><td>画面中有产品与文字，不能只按标题归入冰雪风景。它关联的资源名称含“家居电商”，也不能据此把产品归为家居。</td></tr>
      <tr><th>“防晒广告片”包含人物场景与防晒产品特写</th><td>能确认广告短片形式；没有品牌委托、投放或转化记录。</td></tr>
    </tbody></table></div>
    <p>详情还连接模型信息、生成参数和继续创作入口。穿搭人像样本只显示“图生视频”，未见“做同款”；因此作品可浏览不等于都能沿相同路径复用。按钮可见也不代表已经生成成功。</p>
    <p>4件视频的继续创作入口不同：“冰天雪地”显示“做同款”并关联生成资源，舞蹈、防晒和湿地视频未见同款按钮。后3件仍可供观看，但不能作为已提供同款复用路径的案例。视频截图只证明所截画面，不用于评价整片质量或动作一致性。</p>
    <details><summary>36件作品的画面、用途和详情入口</summary>
      {data.records.map((r, i) => <article key={r.id} style={{borderTop:'1px solid var(--border, #ddd)',padding:'1rem 0'}}>
        <h5><a href={r.url} target="_blank" rel="noreferrer">{i+1}. {r.title || '未命名作品'} ↗</a> · {r.sort}</h5>
        <img src={`/evidence/liblib-work-details/${r.image.split('/').pop()}`} alt={r.visual} loading="lazy" style={{width:'100%',maxWidth:600,height:'auto'}} />
        <p>{r.visual} {r.useBasis}</p>
        <p>题材：{r.topics.join('、')}。用途：{r.uses.length ? r.uses.join('、') : '未明确'}。创作工具：{r.tool || '未显示'}。</p>
        <p>内容形式：{r.mediaType}。{r.durationDisplay ? `页面时长：${r.durationDisplay}。` : ''}页面标签：{r.tags.join('、') || '未显示'}。可见操作：{r.buttons.join('、') || '未见具名操作按钮'}。</p>
        <details><summary>关联模型信息</summary><ul>{r.modelLinks.map((m) => <li key={m.url}><a href={m.url} target="_blank" rel="noreferrer">{m.name} ↗</a></li>)}</ul>{r.base ? <p>基础信息：<a href={r.base.url} target="_blank" rel="noreferrer">{r.base.name} ↗</a></p> : <p>基础模型：{r.baseText || '未显示'}。</p>}</details>
      </article>)}
    </details>
    <p>详情观察日期：2026年9月15日。36件取自534个已见作品ID：24件按两种排序分段选取，同一署名最多2件，其中最热有5段回退；另12件按观察顺序选取未覆盖署名的作品，最新、最热各6件。合计覆盖28个署名标签，其余498件未完成详情编码。两组均为探索样本，不估算全站行业份额，也不比较两种排序的题材比例。</p>
  </section>;
}

import data from '@/lib/liblib-cross-entry-supply.json';
import { LiblibWorkDetails } from './liblib-work-details';

const conditions = [
  {id:'bd5c0b0fada74c91a89a3454b7ba0ef1',input:'首尾帧非必填，支持提示词；推荐 Vidu Q2。',models:'可选8种模型。',result:'在线生成数显示2；没有评论或公开返图。'},
  {id:'50c6cb64ee3348ed828ad40c71bc265e',input:'首尾帧必填，支持提示词；推荐可灵2.6。',models:'可选5种模型。',result:'在线生成数显示“暂无”；没有评论或公开返图。'},
  {id:'e39b3f526a10496b84951fcfd37a401c',input:'首尾帧必填，支持提示词。',models:'模型为可灵O1。',result:'没有评论或公开返图。'},
];

export function LiblibCrossEntrySupply(){return <section id="liblib-cross-entry-supply">
  <h4>一周筛选下的工作流、视频特效与作品</h4>
  <p>工作流目录同时分发可编辑流程和AI应用；视频特效把动作、场景变化封装为素材输入表单；发现灵感展示生成后的作品。三种入口的内容可以相互关联，但资源数量与作品数量需要分开统计。</p>
  <div className="table-wrap"><table><thead><tr><th>观察入口</th><th>筛选与排序</th><th>去重结果</th><th>覆盖范围</th></tr></thead><tbody>
    <tr><th><a href="https://www.liblib.art/workflows" target="_blank" rel="noreferrer">工作流 ↗</a></th><td>版本发布时间1周；最新、最热</td><td>各30份，重合15份，合并45份</td><td>两排序均显示终点，但返回集合不同；45份是已见资源并集，不能当作完整周供给。</td></tr>
    <tr><th><a href="https://www.liblib.art/video-effect" target="_blank" rel="noreferrer">视频特效 ↗</a></th><td>发布时间1周；推荐、最新</td><td>两排序均为同3个标题，已打开对应详情</td><td>两个目录均显示终点；未取得全站特效存量。</td></tr>
    <tr><th><a href="https://www.liblib.art/inspiration" target="_blank" rel="noreferrer">发现灵感 ↗</a></th><td>发布时间1周；最新、最热</td><td>266份与271份，重合3份，合并534份</td><td>两列表均未读到末尾，滚动区间不连续；不作为完整前列或随机样本。</td></tr>
  </tbody></table></div>
  <p>观察日期：{data.date}。“1周”是各入口的界面筛选，不代表已经核实为同一自然周。工作流按版本发布时间筛选，也不等于首次发布量。</p>
  <h4>工作流供给细分到具体处理任务</h4>
  <p>45份资源中，{data.forms.map(r=>`${r.name}${r.count}份`).join('，')}。标题可见美妆精修、材质通道、打光、抠图、局部处理等具体任务。它们比“电商”“设计”更接近使用者需要完成的操作；标题仍只是作者对用途的描述。</p>
  <details><summary>45份工作流目录资源及排序归属</summary><div className="table-wrap"><table><thead><tr><th>资源</th><th>形式</th><th>作者署名</th><th>出现排序</th></tr></thead><tbody>{data.workflows.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.form}</td><td>{r.author}</td><td>{r.sorts.join('、')}</td></tr>)}</tbody></table></div><p>按45个资源ID去重后对应{data.authors.length}个作者署名。署名相同不保证属于同一自然人。</p></details>
  <h4>视频特效的内容是示例，也是生成配置</h4>
  <div className="table-wrap"><table><thead><tr><th>特效</th><th>素材与模型条件</th><th>公开使用证据</th></tr></thead><tbody>{data.effects.map(r=>{const c=conditions.find(c=>c.id===r.id)!;return <tr key={r.id}><th><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></th><td>{c.input} {c.models}</td><td>{c.result}</td></tr>;})}</tbody></table></div>
  <p>这3份详情均标为视频特效、不可下载。相似的“使用特效”入口背后，必填素材和底层模型不同。在线生成数是页面累计字段，不是成功人数；没有公开返图，也不能据此判定没有人使用。</p>
  <LiblibWorkDetails/>
  {data.galleries.map(g=><details key={g.sort}><summary>{g.sort}排序的{g.records.length}份已见作品</summary><div className="table-wrap"><table><thead><tr><th>作品链接</th><th>作者署名</th></tr></thead><tbody>{g.records.map((r,i)=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">作品 {i+1} · {r.id.slice(0,8)} ↗</a></td><td>{r.author}</td></tr>)}</tbody></table></div></details>)}
</section>;}

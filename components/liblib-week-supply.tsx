import week from '@/lib/liblib-week-supply.json';
import { LiblibSupplyAxes } from './liblib-supply-axes';
import { LiblibDetailFollowup } from './liblib-detail-followup';

export function LiblibWeekSupply(){return <section id="liblib-week-supply">
  <h4>图片模型：一周筛选的供给结构</h4>
  <p>2026年9月15日，图片模型“全部”入口筛选发布时间“1周”，最多运行排序读取671份资源，最新排序读取596份。两者共有568份，按资源ID合并为699份；两个排序都到达列表末端，但返回集合不一致。</p>
  <p>下列占比描述这699份可见资源。平台全站存量、完整周供给规模及分类覆盖率仍缺少可核对的总数，两排序的331份模板完全相同；仅最多运行出现的103份为102份LoRA和1份Checkpoint，仅最新出现的28份均为LoRA。差异集中在模型，原因尚未确认。<a href="https://www.liblib.art/image-model" target="_blank" rel="noreferrer">图片模型目录 ↗</a></p>
  <div className="table-wrap"><table><thead><tr><th>供给形式</th><th>资源数</th><th>集合内占比</th></tr></thead><tbody>{week.forms.map(r=><tr key={r.name}><th>{r.name}</th><td>{r.count}</td><td>{r.sharePct}%</td></tr>)}</tbody></table></div>
  <p>模型与模板在同一目录分发，分别承载可选用的生成资源和可套用的案例。形式按卡片标识记录。“图片模型”入口也出现音乐模型标题，具体用途需看资源详情。</p>
  <h4>供给者分布</h4>
  <p>699份资源出现{week.authors}个不同公开署名。前1、前3、前10个署名分别贡献{week.concentration.top1.sharePct}%、{week.concentration.top3.sharePct}%、{week.concentration.top10.sharePct}%的资源。署名按页面文字去重，可能包含同名或多账号，不等同于真实人数。</p>
  <details><summary>供给数量最多的10个署名</summary><div className="table-wrap"><table><thead><tr><th>公开署名</th><th>资源数</th><th>集合内占比</th></tr></thead><tbody>{week.topAuthors.map(r=><tr key={r.name}><th>{r.name}</th><td>{r.count}</td><td>{r.sharePct}%</td></tr>)}</tbody></table></div></details>
  <LiblibSupplyAxes/>
  <LiblibDetailFollowup/>
</section>;}

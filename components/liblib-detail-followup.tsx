import details from '@/lib/liblib-detail-followup.json';
const source=(id:string)=>details.records.find(r=>r.id===id)?.url ?? `https://www.liblib.art/modelinfo/${id}`;
export function LiblibDetailFollowup(){return <section id="liblib-detail-supply">
  <h4>详情中的用途与限制</h4>
  <p>详情能补充标题中未体现的主题。未归类的263份资源中，62份已取得详情文本，补出了用途、标签和运行条件；201份仍缺有效详情。这组资源为定向选取，全站比例需另行统计。</p>
  <div className="table-wrap"><table><thead><tr><th>资源</th><th>详情补出的信息</th><th>可以支持的判断</th></tr></thead><tbody>
    <tr><th><a href={source('7d50511ddfa4432082f876754d99813d')} target="_blank" rel="noreferrer">城市通票 ↗</a></th><td>标签包含城市景观、旅行、钢笔/铅笔；作者说明用于旅行海报、文创明信片和手账素材。</td><td>这是文旅视觉与素材供给线索，尚无旅游从业者使用或交付的证据。</td></tr>
    <tr><th><a href={source('f654ebcf01574013ae4cf349d6f0dff2')} target="_blank" rel="noreferrer">法式复古轻奢风 ↗</a></th><td>标签为住宅空间、写实；作者列出家居空间、样板间、品牌视觉和家居电商主图等用途。</td><td>抽象风格名下面有空间设计用途；跨行业适用范围仍是作者宣称。</td></tr>
    <tr><th><a href={source('d1fbe1692c684c598300ecc126cde406')} target="_blank" rel="noreferrer">氛围感职场随拍 ↗</a></th><td>作者列出简历配图、社交形象、企业宣传和职场账号图文。</td><td>人像供给可继续按使用场景细分，不宜只用“写真”概括。</td></tr>
    <tr><th><a href={source('1180233f45224c9d8c1b4d3c419975a4')} target="_blank" rel="noreferrer">毛线画开学季、教师节主题 ↗</a></th><td>详情出现海报/Banner、毛线毛绒毛毡标签；模板支持1—2张参考图及提示词输入。</td><td>节日主题、视觉材质和可套用模板共同组织供给，标签与输入条件各承担不同作用。</td></tr>
    <tr><th><a href={source('6e884eb749e04c908ba69e412a4f01cb')} target="_blank" rel="noreferrer">80年代题材短剧CG ↗</a></th><td>标签含现代小说、3D建模、人/人群；资源类型为LoRA，作者给出文生图参数和年代剧场景提示词。</td><td>可记录为短剧视觉素材线索，不能当作已支持完整视频制作或连续镜头一致性。</td></tr>
    <tr><th><a href={source('da0a1a2147254e5ea1c62634bfde2680')} target="_blank" rel="noreferrer">粒子特效（荧光炫彩） ↗</a></th><td>作者列出彩妆海报、文旅视觉、影楼写真、化妆品电商等用途，同时提示部分底模需本地运行。</td><td>作者把同一风格资源定位于多个应用场景，适用性尚未实测；生成入口存在不代表所有版本和底模都能在线运行。</td></tr>
  </tbody></table></div>
  <h4>供给数量不能直接当作独立用途数量</h4>
  <p>“身材完美，莫兰迪配色”和“冷白皮漫感质感的光滑皮肤”的详情复用了同一段“休闲活力AI模型”介绍；“精心构图打光”的正文则介绍发丝优化，与“发丝清晰带细碎绒毛”相同。资源ID不同可以确认有不同条目，但文案重合与标题正文差异使独立用途和能力差异仍需另行核对，不能据此断定模型文件重复。</p>
  <p><a href={source('a091a0e1b53e4367ae0aa78e83c46220')} target="_blank" rel="noreferrer">莫兰迪配色 ↗</a> · <a href={source('33815b655ae949978b10f23176a009ae')} target="_blank" rel="noreferrer">冷白皮质感 ↗</a> · <a href={source('9bce43568b5247899ed08420ad73efc1')} target="_blank" rel="noreferrer">构图打光 ↗</a> · <a href={source('d694fa7428c24ee2a12dcc3f4232e0de')} target="_blank" rel="noreferrer">发丝细节 ↗</a></p>
  <h4>时间筛选与使用反馈</h4>
  <p>粒子特效详情显示首次发布于2025年9月28日、最近更新于2026年9月10日，却出现在2026年9月15日读取的“1周”列表中。这足以排除把该列表全部当作一周首次发布资源的解释，但不能单凭一个案例确定平台完整筛选规则。</p>
  <p>该资源讨论中，两名不同公开署名在2026年3月反馈WebUI未识别LoRA；作者建议不要开启修脸，并说明可使用高分修复。另有2025年11月的正向艺术效果反馈。讨论涉及历史版本，未看到故障解决后的结果，不能据此判断当前版本失败或计算成功率。作者正文的在线限制与界面的在线入口也需要按版本、底模分别验证。</p>
  <details><summary>62份详情的标签、类型与时间</summary><p>观察日期：2026年9月15日。标签保留页面原文；活动入口单列。未显示的日期或参数记为“未观察到”，不填零。详情正文为作者说明，未实际生成。</p><div className="table-wrap"><table><thead><tr><th>资源</th><th>可见标签</th><th>活动入口</th><th>类型</th><th>首次发布／最近更新</th></tr></thead><tbody>{details.records.map(r=><tr key={r.id}><td><a href={r.url} target="_blank" rel="noreferrer">{r.title} ↗</a></td><td>{r.tags.join('、')||'未观察到'}</td><td>{r.campaigns.join('、')||'未观察到'}</td><td>{r.type||'未观察到'}</td><td>{r.firstPublished||'未观察到'}／{r.lastUpdated||'未观察到'}</td></tr>)}</tbody></table></div></details>
</section>;}

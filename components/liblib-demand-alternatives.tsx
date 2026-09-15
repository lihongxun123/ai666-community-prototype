const resources = [
  {id:'c20ddbcabf4e4f5e81f7914eb0f54787',title:'电商服饰／布料修图',version:'e709aee8963e435c9a9420999b45f2b0',scope:'服饰布料与产品精修；页面建议单次效果不佳时多次出图。',access:'运行应用、ComfyUI、会员下载、API；页面标示限免8次。',evidence:'在线生成数18；未见讨论或公开晒图。没有面料跨图一致性的验收结果。',license:'生成内容仅会员可商用'},
  {id:'f0ce77765eab45949a6d89f26e83e24a',title:'箱包产品精修／去除褶皱',version:'61634666ceee4c27a5cdff0e2fe1b75a',scope:'标题宣称去褶皱、材质质感修复；正文与布料资源使用相同的通用效果说明。',access:'运行应用、ComfyUI、会员下载、API；页面标示限免8次。',evidence:'2026年9月15日首次发布；在线生成数显示“暂无”，未见讨论或公开晒图。',license:'生成内容仅会员可商用'},
  {id:'736a623d0fc847739953d76727ecb679',title:'千问全能溶图打光',version:'e863e034facf45e1b62e2bd6696c3b2a',scope:'转载工作流，描述为洗护用品电商图，页面提供17节点的预览。',access:'查看工作流与下载；页面写有“即将进行在线运行检测”。',evidence:'在线生成数、下载量均显示“暂无”，未见讨论或公开晒图；没有商品悬空或比例问题的解决回报。',license:'生成内容不可商用'},
];

export function LiblibDemandAlternatives(){return <section>
  <h4>相关工具存在，具体问题是否解决仍要看结果</h4>
  <p>45份工作流目录资源中的3份详情，分别面向布料、箱包和光影融合。它们可作为相关任务的候选工具，但说明书、应用入口和作者示例不能代替使用者对成品的确认。</p>
  <div className="table-wrap"><table><thead><tr><th>资源及承诺用途</th><th>使用路径与许可</th><th>结果证据</th></tr></thead><tbody>{resources.map(r=><tr key={r.id}><th><a href={`https://www.liblib.art/modelinfo/${r.id}?versionUuid=${r.version}`} target="_blank" rel="noreferrer">{r.title} ↗</a><p>{r.scope}</p></th><td>{r.access}<p>{r.license}。</p></td><td>{r.evidence}</td></tr>)}</tbody></table></div>
  <p>观察日期：2026年9月15日。前两份为同一作者发布；许可字段由作者填写。在线生成数是页面累计字段，不是成功人数。三份详情均未提供可归因的使用者完成结果，因此不能据此认定面料一致性、比例控制或商品落地感已解决，也不能反向认定这些任务没有可用供给。</p>
</section>;}

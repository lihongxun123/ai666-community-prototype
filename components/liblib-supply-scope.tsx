const entries = [
  {name:'图片模型',url:'https://www.liblib.art/image-model',object:'模型、图片模板',organization:'摄影写真、电商营销、动漫游戏、风格插画、平面设计、建筑及室内设计、创意玩法、文创周边、小说推文；另有活动入口。',scope:'按资源ID计数，版本ID另存。模板在模型类型筛选内，与LoRA、Checkpoint等共用目录。',coverage:'“全部／发布时间1周”的两排序并集699份；不是全站存量。'},
  {name:'工作流',url:'https://www.liblib.art/workflows',object:'工作流、AI应用卡片',organization:'高清放大、局部重绘、抠图、去水印、洗图扩图、换脸换装、人像调节、线稿提取、万物迁移、产品精修、视角控制、通用功能。',scope:'同一列表出现工作流与AI应用，均链接到资源详情；按ID去重，形式分开。版本发布时间不能直接当作首次发布时间。',coverage:'1周筛选最新与最热各30份，合并45份：18份工作流、27份AI应用。排序集合不同，未取得完整分母。'},
  {name:'视频特效',url:'https://www.liblib.art/video-effect',object:'可套用的视频效果',organization:'镜头控制、特效玩法、动作表情、视频转绘、更多玩法；另有电商产品渲染、短剧漫剧活动入口。',scope:'卡片显示效果示例、作者、模型与“使用特效”。通过详情记录modelinfo ID，目录标题与详情对应。',coverage:'1周筛选推荐与最新均出现同3个标题，已核对3份详情的输入与模型条件。'},
  {name:'发现灵感',url:'https://www.liblib.art/inspiration',object:'图片、视频作品',organization:'九个常规类目与活动入口；可按图片／视频、创作工具、模型及“可画同款”筛选。',scope:'以作品ID计数，与模型资源ID分表。作品数量、资源数量和作者数量各有分母。',coverage:'1周筛选最新266份、最热271份，合并534份；未到列表末尾；36份已核对画面、用途与关联资源（32图、4视频），其余498份未完成详情编码。'},
  {name:'AI应用工具页',url:'https://www.liblib.art/lib3',object:'上传素材并运行的工具界面',organization:'图像处理、电商营销两组工具；包括高清放大、抠图、扩图、换背景、换装、产品精修等。',scope:'这是使用入口，不能把功能按钮数当成创作者供给数，也不能与工作流目录中的AI应用数量直接相加。',coverage:'已查看默认高清放大表单；不作为供给总量统计入口。'},
];

export function LiblibSupplyScope(){return <section id="liblib-supply-scope">
  <h4>供给统计范围：目录、资源与作品</h4>
  <p>Liblib的入口不等于互斥的内容类型：图片模型目录包含模板，工作流目录包含AI应用，作品另有独立ID。供给统计需要先区分资源和作品，再按主题与用途比较。以下入口核对日期为2026年9月15日。</p>
  <div className="table-wrap"><table><thead><tr><th>入口与对象</th><th>分类方式</th><th>计数口径</th><th>现有覆盖</th></tr></thead><tbody>{entries.map(r=><tr key={r.name}><th><a href={r.url} target="_blank" rel="noreferrer">{r.name} ↗</a><p>{r.object}</p></th><td>{r.organization}</td><td>{r.scope}</td><td>{r.coverage}</td></tr>)}</tbody></table></div>
  <p>上述页面没有提供可据以核对的全站供给总数。699份资源只能说明特定筛选与排序下的可见结构；计算全站占比仍需要各资源目录的统一时间范围、可核对总数与跨入口去重。</p>
</section>;}

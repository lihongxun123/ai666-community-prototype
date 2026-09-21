const interest = [
 ['剧情与故事连载','接着看、找前情、讨论设定','三个作者系列；含回看自述与制作投入','核对补充内容的价值与持续供给条件'],
 ['角色、IP与同人','关注角色、寻找同好、参与二创','角色与故事相关资料','核授权、角色连续性与消费反馈'],
 ['视觉艺术与风格','欣赏、收藏、寻找参考','审美作品与竞品档案','补同题差异和低互动作品'],
 ['历史文化与经典','理解人物、文化与不同演绎','历史专题与文化资料','核史料、演绎和已有解释'],
 ['科普与知识可视化','看懂原理、追问与讨论','科普专题与知识报告','核准确性、AI制作依据与回答'],
 ['创意短片与音乐','视听欣赏、版本查找与重复收听','两首音乐的原页评论与作者回复','核版本去向、授权与不同作者'],
];
const practical = [
 ['电商商品内容','精修、背景、模特、详情图、视频','方法作者、商家采访与未采用案例','关联同一商品的输入、修改与使用'],
 ['品牌营销与广告','活动素材、品牌系列、多版本','品牌应用与营销案例','核审校、版本与真实使用'],
 ['自媒体内容生产','脚本、分镜、配音、封面、视频','内容生产案例与作品','核连续栏目、人工修改与反馈'],
 ['服装展示与设计','改款、虚拟模特、成套展示','制衣应用报道与功能说明','核版型、面料与实物对应'],
 ['室内与空间设计','原空间到风格提案','照片输入与风格选择页面','核尺寸、家具与落地反馈'],
 ['游戏与影视前期','角色、场景、分镜和镜头预演','分镜教程；游戏交付证据不足','分开核视觉提案与可用资产'],
 ['产品与包装设计','配色、包装概念、样机与迭代','Mattel、Versuni客户案例','核修改、打样及普通设计者使用'],
 ['教育与培训内容','教材、知识动画、练习素材','海外教师调查与工具资料','补国内案例、准确性与教学反馈'],
];
const sourceLinks = [
 ['故事系列与修订说明','https://www.douyin.com/video/7676830509116165422'],
 ['Liblib电商精修工作流','https://www.liblib.art/modelinfo/6f92484476484efeb7bd5a0db113cbc0'],
 ['淘天商家工具与应用披露','https://www.alibabagroup.com/zh-HK/document-1738398759789789184'],
 ['制衣设计与虚拟试衣报道','https://www.digitalchina.gov.cn/2025/xwzx/szkx/202506/t20250604_5028268.htm'],
 ['Mattel包装设计案例','https://blog.adobe.com/en/publish/2024/06/27/barbie-adobe-firefly-bringing-magic-to-mattels-packaging'],
 ['空间设计输入页面','https://www.homestyler.com/ai-room-design?lang=en_US'],
 ['分镜参考与预演教程','https://helpx.adobe.com/uk/firefly/how-to/create-commercial-storyboard-firefly-boards.html'],
 ['Canva美国教师调查','https://www.canva.com/newsroom/news/ai-education-survey/'],
];
function Table({rows}:{rows:string[][]}){return <div className="ms-table"><table><thead><tr><th>方向</th><th>具体任务</th><th>现有材料</th><th>下一项核查</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}>{r.map((v,i)=><td key={i}>{v}</td>)}</tr>)}</tbody></table></div>}
export function DualTrackResearch(){return <section id="report-topics">
 <h2>两条主线：社媒消费观察与实用应用</h2><p>兴趣消费观察用于判断创作者面对的内容需求、选题和合作对象，要求AI参与核心表达；实用线要求有明确任务和可检查的成果。多元拾光不服务纯娱乐观众。14个领域仅为研究范围，不是市场机会排名。</p>
 <div className="ms-grid two"><article><h3>社媒消费观察：创作者面对的内容需求</h3><p>观察作品、系列与讨论；教程和工具作为创作支撑。观看者观察只用于判断市场需求、选题和合作对象。</p></article><article><h3>实用应用：输入、方法与成果</h3><p>观察输入、方法、输出与修正，分别记录能力说明、实际应用和验收结果。</p></article></div>
 <h3>兴趣内容消费 · 六类</h3><Table rows={interest}/><h3>实用任务应用 · 八类</h3><Table rows={practical}/>
 <h2>代表样本的观察与判断</h2><div className="ms-grid two"><article><h3>故事连载</h3><p>《DEADLY：畸变》的原平台已有相邻集、合集、评论和修正版。评论中可见围绕角色与剧情的讨论和玩笑回复。</p><p><strong>判断：</strong>系列、版本与补充内容值得深入，需说明原平台以外的具体价值。</p><small>系列路径与普通短片反馈分别取样，跨周行为仍缺记录。</small></article><article><h3>电商视觉</h3><p>作者工作流写明精修、换景与人工补修。女装店主采访中，一位用AI图上新，另一位因面料与版型偏差放弃上线。</p><p><strong>判断：</strong>按商品真实性拆任务，服装虚拟上身单独验收。</p><small>两位店主为媒体采访中的化名受访者；同一商品的完整交付与消费者反馈仍缺。</small></article></div>
 <h2 id="field-findings">从作品评论与商家经历看需求</h2>
 <p>音乐评论已经出现具体版本查找和重复收听自述；短片评论兼有观看评价与制作学习。实用应用则需要核对成图与商品的对应关系。</p>
 <div className="ms-table"><table><thead><tr><th>对象</th><th>可见事实</th><th>已有满足与研究重点</th></tr></thead><tbody>
 <tr><td><a href="https://www.bilibili.com/video/BV1wENz6wEYa/" target="_blank" rel="noopener noreferrer">《守望星河》 ↗</a></td><td>前三根热评涉及制作建议、网页或本地生成、作品鼓励。</td><td>作者与其他用户已有答复；修改结果和制作完成情况仍待核。</td></tr>
 <tr><td><a href="https://www.douyin.com/video/7607110554281147638" target="_blank" rel="noopener noreferrer">《痛的节奏》 ↗</a></td><td>有人找完整版和收听入口；作者当时称汽水有普通版、撕裂版未上。</td><td>问题精确到版本。需核各版本当前去向及授权。</td></tr>
 <tr><td><a href="https://www.douyin.com/video/7615223655841655458" target="_blank" rel="noopener noreferrer">《檐下声》 ↗</a></td><td>15根已加载评论中，5条自述循环3天至两周；另有铃声需要。</td><td>作者回复可设铃声。自述未指明收听平台，回访率仍缺行为记录。</td></tr>
 <tr><td><a href="https://www.douyin.com/video/7654266723361282697" target="_blank" rel="noopener noreferrer">首次AI短片 ↗</a></td><td>作者自述积分不足未改片；评论指出武器连续性问题。</td><td>改稿负担需要纳入供给评估；尚未独立核片及后续修正。</td></tr>
 <tr><td><a href="https://finance.sina.cn/stock/jdts/2026-06-03/detail-iniaavwv1027132.d.html" target="_blank" rel="noopener noreferrer">女装店主采访 ↗</a></td><td>一位店主称多次调整后仍有面料、版型偏差，未采用AI模特图。</td><td>保留商品事实是验收重点；报道中的其他消费者未与该店商品关联。</td></tr>
 </tbody></table></div>
 <p><small>观察日期：2026年9月16日。评论为目的性取样，按页面默认顺序读取，包含作者点赞过的评论；音视频未完整观看。另保留《气球》96次播放、0评论的低反馈对照，详见<a href="https://www.bilibili.com/video/BV16Hto6aEjk/" target="_blank" rel="noopener noreferrer">原作品 ↗</a>。</small></p>
 <div className="ms-grid two"><article><h3>兴趣线：核对音乐版本与收听入口</h3><p>优先核对作品版本、合法收听去向与原平台已有回答；重复收听自述为消费线索，新增社区价值仍需单独判断。</p></article><article><h3>实用线：按任务确定可用标准</h3><p>换背景、修光影与虚拟上身分别研究。优先检查保留原商品的局部处理，再比较高保真要求的服装任务。</p></article></div>
 <h2 id="deepening-results">三个重点方向：证据与取舍</h2>
 <div className="ms-grid two"><article><h3>故事：回看围绕角色与前情发生</h3><p>《余烬之后》首集评论有人自述看完第四集后回看，第四集已有观众长篇解释角色命运，作者作出回应。故事讨论已经在原站发生。</p><p><a href="https://www.douyin.com/video/7651228393647721771" target="_blank" rel="noopener noreferrer">首集与回看自述 ↗</a> · <a href="https://www.douyin.com/video/7655396438347713818" target="_blank" rel="noopener noreferrer">第四集讨论 ↗</a></p></article><article><h3>供给：连载需要承担试错与维护</h3><p>《掠夺》作者称第一季制作历时三个月，视频算力约6000元，战斗片段反复生成5—8次。该数额是作者自述，人工与会员等完整成本未核。</p><p><a href="https://www.bilibili.com/video/BV1ymux6zEzN/" target="_blank" rel="noopener noreferrer">完结篇与作者说明 ↗</a></p></article></div>
 <div className="ms-table"><table><thead><tr><th>事实链</th><th>原平台的承接</th><th>对研究的影响</th></tr></thead><tbody>
 <tr><td>分集 → 导剪版 → 完结合集</td><td>《掠夺》10集加完结篇共11条；《余烬之后》第7条是1—6集导剪版，第8条才是剧情第七集。</td><td>作品编目要区分剧情集序与发布版本。单做合集目录的差异有限。</td></tr>
 <tr><td>音乐片段 → 曲目页 → 播放入口</td><td>《檐下声》已有汽水曲目页，展示作者、播放条、VIP标记和进入客户端入口。</td><td>曲目与播放入口已存在；全曲收听条件未核。继续研究特定版本与补充内容。</td></tr>
 <tr><td>实拍 → AI初图 → 调试图 → 未采用</td><td>女装采访提供三联图。可见人物、背景、袖口及腰部呈现变化；店主仍未采用。</td><td>可见修改与商品验收分别记录，成图美观不足以说明适合商品页。</td></tr>
 </tbody></table></div>
 <p className="ms-links"><a href="https://music.douyin.com/qishui/share/track?track_id=7613720143827355691" target="_blank" rel="noopener noreferrer">《檐下声》汽水曲目页 ↗</a><a href="https://m.jiemian.com/article/14524545.html" target="_blank" rel="noopener noreferrer">商家采访与三联图 ↗</a></p>
 <p><small>故事补充覆盖2位作者、3个详情页，连同既有《DEADLY：畸变》形成3个系列对照；评论为目的性取样，未完整核片。商品三联图已核读，实物一致性与发布后结果仍缺；音乐页面只确认入口，未完整试听或验证会员权益。</small></p>
 <p>《余烬之后》原作者已有足球番外，普通补充内容并非空白。电商历史采用报道仍缺少同SKU的修改记录与上线版本。<a href="/?section=direction-calibration#strategy" target="_blank" rel="noopener noreferrer">查看研究范围与证据状态 →</a></p><h3>研究重点</h3><p>故事区分观看、讨论与制作需要；电商同时核对商品处理结果和经验内容的消费需要；音乐检查版本信息与现有收听入口。这三类材料用于深入比较任务；社区方案还需结合行业、社媒和竞品证据判断。</p>
 <p>周活用户数（WAU）保持北极星指标，本阶段不依据未经测量的周活效果筛除方向。原平台的收听与讨论提供创作者市场需求线索，多元拾光服务对象的持续使用仍需要自身行为数据验证。</p>
 <h3>关键原始入口</h3><div className="ms-links">{sourceLinks.map(([name,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a>)}</div>
</section>}



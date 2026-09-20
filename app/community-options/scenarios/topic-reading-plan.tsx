import Link from 'next/link';
const plans={
  design:{title:'专题先看系列，再看怎样做',intro:'首页展示整套效果与用途。进入专题后，按已有主版、新主题、多画幅三种起点选内容；每张卡只保留用途、适用条件和一个主要入口。',cards:[
    ['先看成果','同一主视觉，如何保持系列感？','主视觉与延展并排预览，注明品牌约束、用途和作者。','小象超市系列与LABO-H提案可作研究参照；被舍弃候选及授权工程仍缺。','#brand-cases','看系列与取舍'],
    ['再选做法','已有方向，是替换内容还是重排画幅？','列出固定元素、可变元素和目标画幅，进入对应制作路线。','Adobe多尺寸教程已有人工调整过程；本站可复制主版尚未取得。','#branches','选制作路线'],
    ['带着条件继续','这份工程，我能打开和修改吗？','先看格式、字体、素材许可与可改范围，再决定原工具或MakeNow。','有授权且兼容时才提供工程；否则保留教程、预览和原工具入口。','#tool-choice','查制作条件'],
  ]},
  writing:{title:'专题先看改动，再决定怎样改',intro:'首页用获授权节选说明修改目标与作者选择。专题按用途分路：需要完成文稿的人先看改法，需要交流作品的人自愿进入同行讨论。',cards:[
    ['先看取舍','改得更规整，还是更像自己？','卡片说明读者、用途、关键修改与作者采用状态；有授权对照才展示前后文。','少数派案例有版本披露与定稿，三版全文不齐；目前适合展示取舍说明。','#evidence','看作者选择'],
    ['再定目标','我的稿子应先改事实、结构还是语气？','已有稿先核对事实与目标；无稿先整理材料、列提纲、形成底稿，再进入修改。','官方指南可作方法来源；简报与核对清单是拟议内容，未绑定可下载文件。','#task','看改稿路径'],
    ['按意愿交流','读者在哪一段跟不上？','展示可公开片段、作者想问的问题和同行回应位置。','已有英语互读与作者回应；中文回应者和本站服务尚未组织。','#peer-feedback','看讨论如何组织'],
  ]}
};
export default function TopicReadingPlan({kind}:{kind:'design'|'writing'}){const p=plans[kind];return <section id="reading-plan"><h2>{p.title}</h2><p>{p.intro}</p><div className="ec-three">{p.cards.map(([label,title,layout,evidence,href,action])=><article key={label}><small>{label}</small><h3>{title}</h3><p>{layout}</p><p><strong>当前材料：</strong>{evidence}</p><a href={href}>{action} ↓</a></article>)}</div><p>案例与方法可先阅读；资产经许可和兼容核对后再开放。遇到具体问题时，回到原内容关联讨论。上面的卡片安排是内容草案，尚非已发布资源。</p><p><Link href={'/community-options/product-sample/concepts#'+kind} target="_blank" rel="noopener noreferrer">打开已有交互样板：专题、案例、教程、资产、问题与改版 ↗</Link>{kind==='writing'&&<small>（写作样板演示已有稿件分支）</small>}</p></section>}

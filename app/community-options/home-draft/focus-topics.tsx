const topics=[
 {id:'ecommerce',name:'电商营销',title:'换背景，保留商品细节',result:['原始商品','场景版本','细节核对'],input:'清晰商品照片、场景参考、必须保留的文字与结构。',start:'先看替换背景的方法，再核对标签、颜色和比例。',action:'看电商营销专题',href:'/community-options/cases/ecommerce#topic-plan',route:'拟衔接 MakeNow 画布；示例项目未接入'},
 {id:'design',name:'视觉设计',title:'一张主视觉，延展整套版式',result:['主视觉','多种画幅','系列检查'],input:'品牌素材、主视觉或设计目标，以及要交付的尺寸。',start:'有主版就选延展路线；新主题先比较方向，再制作主版。',action:'看视觉设计专题',href:'/community-options/scenarios/design#reading-plan',route:'制作：原设计工具；兼容项目再接 MakeNow'},
 {id:'writing',name:'写作编辑',title:'把想说的话，改到清楚准确',result:['材料或草稿','修改与理由','作者定稿'],input:'可使用的材料或原稿、目标读者，以及必须保留的事实。',start:'无稿先整理材料和提纲；有稿先定位问题，再决定自己改或请人反馈。',action:'看写作编辑专题',href:'/community-options/scenarios/writing#reading-plan',route:'制作：原文字工具；作者决定修改与公开范围'}
];
export default function FocusTopics(){return <section className="hd-focus" aria-labelledby="focus-title">
 <div className="hd-section-title"><h2 id="focus-title">选一个任务开始</h2><span>专题编排草案 · 三类先展开，九类继续覆盖</span></div>
 <div className="hd-focus-grid">{topics.map(t=><article key={t.id}>
 <small>{t.name}</small><h3>{t.title}</h3>
 <ol className="hd-focus-result" aria-label="预期成果路径">{t.result.map((r,i)=><li key={r}><span>0{i+1}</span>{r}</li>)}</ol>
 <dl><dt>准备什么</dt><dd>{t.input}</dd><dt>从哪开始</dt><dd>{t.start}</dd></dl>
 <p className="hd-focus-route">{t.route}</p>
 <a href={t.href} target="_blank" rel="noopener noreferrer">{t.action} ↗</a>
 </article>)}</div>
 </section>}

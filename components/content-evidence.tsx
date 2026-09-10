import depth from '@/lib/content-depth.json';
import screenshots from '@/lib/content-screenshots.json';
import taxonomy from '@/lib/content-taxonomy.json';

type EvidenceImage={src:string;file:string;width:number;height:number;url:string;caption:string;fields?:string[]};
function EvidenceFigure({item,label}:{item:EvidenceImage;label:string}) {
 return <figure className="content-evidence-figure"><div className="content-image-label">{label}</div><a href={item.src} target="_blank" rel="noreferrer" title="打开原尺寸截图"><img src={item.src} width={item.width} height={item.height} alt={`${label}：${item.caption}`} loading="lazy"/></a><figcaption>{item.caption}</figcaption>{item.fields&&<p className="muted">可见字段：{item.fields.join('、')}</p>}<div className="study-actions"><a href={item.src} target="_blank" rel="noreferrer">原尺寸截图 ↗</a><a href={item.url} target="_blank" rel="noreferrer">来源页面 ↗</a></div></figure>;
}
export function ContentScreenshotGallery({visibleIds}:{visibleIds:string[]}) {
 const pairs=screenshots.pairs.filter(p=>visibleIds.includes(p.platformId));
 return <section className="content-gallery" id="content-visual-evidence"><h2>{screenshots.title}</h2><p>截图采集于{screenshots.capturedAt}。</p><p className="muted">{screenshots.method}</p>{pairs.map((p,i)=><details className="content-pair" key={p.id} open={i===0}><summary><span>{p.platform} · {p.form}</span><strong>{p.title}</strong></summary><p>{p.relationship}</p><div className="content-pair-images"><EvidenceFigure item={p.card} label="卡片 / 列表入口"/><EvidenceFigure item={p.detail} label="对应详情"/></div>{'extra' in p&&p.extra?.map(x=><details className="content-extra" key={x.file}><summary>补充详情：{x.caption}</summary><EvidenceFigure item={x} label="同页补充材料"/></details>)}<dl className="study-definition"><div><dt>从卡片到详情（分析）</dt><dd>{p.finding}</dd></div><div><dt>看完后的使用入口</dt><dd>{p.handoff}</dd></div><div><dt>这个样本的限制</dt><dd>{p.limits}</dd></div></dl></details>)}</section>;
}
export function ContentDepthProfile({id}:{id:string}) {
 const p=depth.profiles.find(p=>p.id===id);if(!p)return null;
 return <section className="content-depth"><h3>补充：内容从入口到使用的区别</h3><p className="muted">资料截至{depth.checkedAt}。</p>{p.items.map(item=><details key={item.title} className="content-depth-item"><summary>{item.title}</summary><h4>卡片或索引提供什么</h4><ul>{item.cardFields.map(s=><li key={s}>{s}</li>)}</ul><h4>详情交付什么</h4><ul>{item.detailFields.map(s=><li key={s}>{s}</li>)}</ul><p><strong>后续使用与分析：</strong>{item.handoff}</p><p className="muted"><strong>证据边界：</strong>{item.limits}</p><p className="content-evidence-links">{item.sourceUrls.map((url,i)=><a href={url} key={url} target="_blank" rel="noreferrer">来源{i+1} ↗</a>)}</p></details>)}</section>;
}

function EvidenceLinks({links}:{links:{url:string;title:string}[]}) {return <p className="content-evidence-links">{links.map((s,i)=><a key={s.url} href={s.url} target="_blank" rel="noreferrer" title={s.title}>依据{i+1}：{s.title} ↗</a>)}</p>;}
export function ContentTaxonomy() {
 return <section className="content-taxonomy" id="content-form-map"><h2>16类内容，分别交付什么</h2>{taxonomy.categories.map(c=><details key={c.id}><summary>{c.name} · {c.readerQuestion}</summary><p className="muted">代表平台：{c.platformNames.join('、')}</p><dl className="study-definition"><div><dt>卡片建议交代</dt><dd><ul>{c.cardMustShow.map(x=><li key={x}>{x}</li>)}</ul></dd></div><div><dt>详情建议交付</dt><dd><ul>{c.detailMustProvide.map(x=><li key={x}>{x}</li>)}</ul></dd></div><div><dt>后续动作</dt><dd>{c.handoff}</dd></div><div><dt>内容边界</dt><dd>{c.boundary}</dd></div></dl><EvidenceLinks links={c.links}/><p className="muted">证据范围：{c.evidenceBoundary}</p></details>)}<h2>跨竞品发现</h2>{taxonomy.findings.map(f=><div key={f.id}><h3>{f.title}</h3><p>{f.text}</p><EvidenceLinks links={f.links}/></div>)}<h2>多元拾光的内容投入取舍</h2><p>{taxonomy.decisionBasis}</p>{(['first','later','notNow'] as const).map((key,index)=><details key={key}><summary>{['先做','后做','暂不做'][index]}</summary>{taxonomy.priorities[key].map(p=><div key={p.title}><h3>{p.title}</h3><p>{p.content}</p><p>依据：{p.reason}</p><p className="muted">条件与范围：{p.boundary}</p></div>)}</details>)}</section>;
}

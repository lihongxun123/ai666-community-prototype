import evidence from '@/lib/proposal-evidence.json';
export function ProposalEvidence({id}:{id:string}){
 const item=evidence.find(x=>x.id===id);if(!item)return null;
 return <article className="brief-evidence"><h3>已有满足与额外价值</h3><p><strong>已有去处：</strong>{item.alternative}。</p><p><strong>方案增加什么：</strong>{item.value}。</p><p>{item.evidence}</p><p className="brief-meta">{item.limit}</p><p><strong>成立条件：</strong>{item.condition}</p><p><strong>何时改选：</strong>{item.change}</p><p className="brief-nav">{item.sources.map(s=><a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</p></article>
}
export default function ProposalComparison(){return <section id="comparison"><h2>五套方案怎样选择</h2><p>比较用户价值、已有替代和供给条件。材料数量不作为排名依据。</p><div className="brief-comparison">{evidence.map(item=><article key={item.id}><h3><a href={'/community-options/briefs/'+item.id}>{item.id.toUpperCase()} · {item.name} →</a></h3><p>{item.value}。</p><p><strong>已有替代：</strong>{item.alternative}。</p><p><strong>成立条件：</strong>{item.condition}</p><p><strong>改选理由：</strong>{item.change}</p></article>)}</div></section>}

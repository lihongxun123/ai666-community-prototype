import '../c-prototype/detail-skeleton.css';
import './states.css';
export function LayoutSkeleton({kind}:{kind:string}){
 const line=<div className="ds-block ds-line"/>;const title=<div className="ds-block ds-title"/>;const author=<div className="ds-author"><div className="ds-block ds-avatar"/><div>{title}</div></div>;
 const rows=<div className="gs-rows">{[0,1,2,3].map(i=><div className="gs-row" key={i}><div className="ds-block gs-thumb"/><div>{title}{line}{line}</div></div>)}</div>;
 const grid=<div className="gs-grid">{[0,1,2,3].map(i=><div key={i}><div className="ds-block gs-image"/>{line}</div>)}</div>;
 return <output className="detail-skeleton" aria-label="加载中" aria-busy="true">{kind==='grid'?grid:kind==='rows'?rows:kind==='posts'?<>{[0,1,2].map(i=><div className="gs-post" key={i}>{author}{title}{line}{line}<div className="ds-block ds-media"/></div>)}</>:kind==='banners'?<>{[0,1,2].map(i=><div className="gs-post" key={i}><div className="ds-block ds-media"/>{title}{line}</div>)}</>:kind==='circle'?<>{title}<div className="ds-block ds-media"/>{line}<div className="ds-block ds-action"/>{rows}</>:kind==='author'?<>{author}{line}<div className="ds-block ds-actions"/>{grid}</>:kind==='activity'?<><div className="ds-block ds-media"/>{title}{line}{line}<div className="ds-block ds-toc"/><div className="ds-block ds-action"/></>:<>{author}<div className="gs-grid">{[0,1,2,3].map(i=><div className="ds-block gs-tile" key={i}/>)}</div>{rows}</>}</output>
}

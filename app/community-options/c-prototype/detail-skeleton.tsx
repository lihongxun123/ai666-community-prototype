import './detail-skeleton.css';
export const detailSkeletonPages=['work','post','tutorial','app','resource'];
export function DetailSkeleton({page}:{page:string}){
 const bar=(kind='line')=><div className={'ds-block ds-'+kind}/>;
 const author=<div className="ds-author">{bar('avatar')}<div>{bar('short')}{bar('short')}</div></div>;
 const paragraph=<div className="ds-paragraph">{bar()}{bar()}{bar('short')}</div>;
 return <output className={'detail-skeleton ds-'+page} aria-label="加载中" aria-busy="true">
 {page==='work'?<>{bar('artwork')}{bar('title')}{author}{paragraph}{bar('actions')}</>:
 page==='post'?<>{author}{bar('title')}{paragraph}{bar('media')}{bar('actions')}</>:
 page==='tutorial'?<>{bar('title')}{author}{bar('toc')}{bar('subtitle')}{paragraph}{bar('media')}{paragraph}</>:
 page==='app'?<>{bar('media')}{bar('title')}{paragraph}<div className="ds-facts">{[0,1,2].map(i=><div key={i}>{bar('label')}{bar()}</div>)}</div>{bar('action')}</>:
 <>{bar('title')}{author}{paragraph}{bar('file')}<div className="ds-facts">{[0,1,2,3].map(i=><div key={i}>{bar('label')}{bar()}</div>)}</div>{bar('action')}</>}
 </output>;
}

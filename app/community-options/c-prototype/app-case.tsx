'use client';
/* oxlint-disable next/no-img-element -- Shared illustrative media assets. */
import type {AppCase} from '../app-editorial';
import {MediaPreview,mediaReady} from '../b-prototype/content-media';
import './app-case.css';
export function AppCaseContent({value}:{value?:AppCase}){
 if(!value||!value.items.length)return null;
 return <section className={'app-case app-case-'+value.style} aria-label="应用案例"><header><h2>{value.title}</h2>{value.illustrative&&<small>案例示意</small>}</header>{value.summary&&<p className="app-case-summary">{value.summary}</p>}<div className="app-case-items" style={{gridTemplateColumns:`repeat(${value.items.length},minmax(0,1fr))`}}>{value.items.map(item=><figure key={item.id}>{value.style==='media'?<>{item.panel!==undefined&&item.image&&!item.image.startsWith('local:')?<div className="app-case-panel"><img src={item.image} alt={item.title} style={{transform:`translateX(-${item.panel*100/3}%)`}}/></div>:mediaReady(item.image)?<MediaPreview value={item.image} alt={item.title} consumer/>:<p>图片暂不可用</p>}<figcaption>{item.title}</figcaption>{item.text&&<p>{item.text}</p>}</>:<><figcaption>{item.title}</figcaption><p className="app-case-document">{item.text}</p></>}</figure>)}</div></section>;
}

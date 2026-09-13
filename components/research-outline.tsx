'use client';
import type {ReactNode} from 'react';
export function jumpToResearchSection(id:string){
 const target=document.getElementById(id);
 if(!target)return;
 if(target instanceof HTMLDetailsElement)target.open=true;
 for(let parent=target.parentElement;parent;parent=parent.parentElement)if(parent instanceof HTMLDetailsElement)parent.open=true;
 target.scrollIntoView({block:'start'});
 if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
 target.focus({preventScroll:true});
}
export function ResearchOutline({items,label='本页目录'}:{items:readonly (readonly [string,string])[];label?:string}){
 return <nav className="research-outline" aria-label={label}><strong>{label}</strong><ol>{items.map(([id,title])=><li key={id}><button type="button" data-jump={id} onClick={()=>jumpToResearchSection(id)}>{title}</button></li>)}</ol></nav>;
}
export function ResearchAppendix({id,title,children}:{id:string;title:string;children:ReactNode}){
 return <details className="research-appendix" id={id}><summary>{title}</summary><div className="research-appendix-body">{children}</div></details>;
}

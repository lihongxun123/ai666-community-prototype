/* oxlint-disable next/no-img-element -- Shared local navigation icons. */
import './mobile-navigation.css';
import {CreationEntry} from './c-prototype/creation-entry';
export function MobileNavigation({active,go}:{active:string;go:(page:string)=>void}){
 return <nav className="mobile-navigation" aria-label="底部导航">{[['首页','home','home'],['社区','chat-3','community'],['AI创作','sparkling','create'],['活动','gift','activities'],['我的','user','mine']].map(([title,icon,id])=>id==='create'?<CreationEntry key={id} go={go} className="mobile-navigation-create"><span><img src="/home-prototype/icons/sparkling-line.svg" alt=""/></span>AI创作</CreationEntry>:<button key={id} aria-current={active===id?'page':undefined} className={id==='create'?'mobile-navigation-create':''} onClick={()=>go(id)}><span><img src={'/home-prototype/icons/'+icon+'-line.svg'} alt="" /></span>{title}</button>)}</nav>;
}

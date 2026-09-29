
'use client';
/* oxlint-disable next/no-img-element -- Existing local brand and icon assets. */
import {useEffect,useRef,useState} from 'react';
import {SearchSuggestions,rememberSearch} from './search-suggestions';
import './community-header.css';
import {communityTabs} from './c-prototype/community-navigation';
const icon=(name:string)=><img className="community-icon" src={'/home-prototype/icons/'+name+'-line.svg'} alt=""/>;
export function DesktopHeader({active='home',go,onHome,onModels}:{active?:string;go:(p:string)=>void;onHome?:()=>void;onModels?:()=>void}){
 const [query,setQuery]=useState(''),[searchOpen,setSearchOpen]=useState(false),[menu,setMenu]=useState(false);
 const area=useRef<HTMLDivElement>(null);
 useEffect(()=>{const close=(event:MouseEvent)=>{if(!area.current?.contains(event.target as Node))setSearchOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[]);
 const navigate=(target:string)=>{setSearchOpen(false);setMenu(false);go(target)};
 const submit=(text:string)=>{const value=text.trim();if(value)rememberSearch(value);setQuery(value);navigate('search?'+(value?'q='+encodeURIComponent(value):'state=idle'))};
 const selected=active==='topic'?'topics':active.startsWith('app')?'apps':['aigc','community','work'].includes(active)?'aigc':['circle','discussion','post','tutorial','tutorials'].includes(active)?'circles':active;
 return <header className="community-pc-header"><div className="community-pc-inner">
 <button className="community-logo" aria-label="多元拾光首页" onClick={()=>onHome?onHome():navigate('home')}><img src="/home-prototype/brand-logo.svg" alt="多元拾光"/></button>
 <nav aria-label="主导航" className="community-main-nav">{[['home','首页'],['aigc','AIGC'],['topics','专题'],['apps','AI应用'],['circles','圈子']].map(([id,label])=><button key={id} aria-current={selected===id?'page':undefined} onClick={()=>id==='home'&&onHome?onHome():navigate(id)}>{label}</button>)}<button onClick={()=>onModels?onModels():window.location.assign('/community-options/home-prototype?open=model-plaza')}>模型广场</button></nav>
 <div className="community-search" ref={area}><form onSubmit={e=>{e.preventDefault();submit(query)}}>{icon('search')}<input aria-label="搜索作品、应用、作者" placeholder="搜索作品、应用、作者" value={query} onChange={e=>setQuery(e.target.value)} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false)}}/>{query&&<button type="button" aria-label="清空搜索" onClick={()=>setQuery('')}>{icon('close')}</button>}</form>{searchOpen&&<div className="community-search-popover"><SearchSuggestions go={navigate} search={submit}/></div>}</div>
 <nav className="community-services" aria-label="账户与服务">{[['activities','gift','活动'],['shop','shopping-bag-3','商城'],['invite','user-add','邀请'],['notifications','notification-3','通知']].map(([id,i,label])=><button key={id} onClick={()=>navigate(id)} aria-label={label}>{icon(i)}<span>{label}</span></button>)}<div className="community-account"><button onClick={()=>navigate('points')}>积分中心</button><span/><button onClick={()=>navigate('checkin')}>签到</button></div><div className="community-user"><button aria-label="我的菜单" aria-expanded={menu} onClick={()=>setMenu(!menu)}><img className="community-avatar" src="/home-prototype/portrait.png" alt=""/></button>{menu&&<div className="community-user-menu"><button onClick={()=>navigate('mine')}>个人中心</button><button onClick={()=>navigate('favorites')}>我的收藏</button></div>}</div></nav>
 </div></header>
}
export function MobileHeader({title,back,go,home=false,community=false,communityTab='works',onCommunityTab}:{communityTab?:string;onCommunityTab?:(tab:string)=>void;title?:string;back?:()=>void;go:(p:string)=>void;home?:boolean;community?:boolean}){
 return <header className={'community-mobile-header'+(home?' community-mobile-home':community?' community-mobile-community':'')}>
 {community?<><nav className="community-header-tabs" aria-label="社区栏目">{communityTabs.map(([id,label])=><button key={id} aria-current={communityTab===id?'page':undefined} onClick={()=>onCommunityTab?.(id)}>{label}</button>)}</nav><button aria-label="搜索社区" onClick={()=>go('search?state=idle&from=community')}>{icon('search')}</button></>:home?<><img className="community-mobile-brand" src="/home-prototype/brand-logo.svg" alt="多元拾光"/><div className="community-mobile-actions"><button aria-label="搜索" onClick={()=>go('search?state=idle')}>{icon('search')}</button><button aria-label="通知" onClick={()=>go('notifications')}>{icon('notification-3')}</button></div></>:<><button className="community-back" onClick={back} aria-label="返回">{icon('arrow-left')}</button><h1>{title}</h1><span className="community-header-spacer" aria-hidden="true"/></>}
 </header>
}

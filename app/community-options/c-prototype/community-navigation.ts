import {prototypeStore as store} from './storage';
export const communityTabs=[['works','作品'],['talk','交流'],['tutorials','官方教程']] as const;
export function communityTab(search:string){const q=new URLSearchParams(search);const value=q.get('tab')||({aigc:'works',discussion:'talk',tutorials:'tutorials'}[q.get('page')||''] as string|undefined)||store.getItem('cl-tab');return communityTabs.some(([id])=>id===value)?value!:'works';}
export function switchCommunityTab(value:string){
 const current=communityTab(location.search);if(value===current)return;
 const key=current+':'+(current==='works'?(store.getItem('cl-work-type')||'全部')+':'+(store.getItem('cl-work-category')||'全部'):current==='talk'?(store.getItem('cl-circle')||'全部')+':'+'最新':store.getItem('cl-topic')||'全部');
 store.setItem('cl-scroll:'+key,String(window.scrollY));store.setItem('cl-tab',value);
 const url=new URL(location.href);url.searchParams.set('page','community');url.searchParams.set('tab',value);history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));
}

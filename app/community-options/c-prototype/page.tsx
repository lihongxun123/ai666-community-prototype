'use client';
import '../content-card-tokens.css';
import {samplePosts} from './content-data';
import {communityTab,switchCommunityTab} from './community-navigation';
import {deviceDestination} from '../navigation-model';
import {loadingLayouts} from '../common-states/catalog';
import {LayoutSkeleton} from '../common-states/layout-skeleton';
import {DetailSkeleton,detailSkeletonPages} from './detail-skeleton';
import {DesktopHeader,MobileHeader} from '../community-header';
import {MobileNavigation} from '../mobile-navigation';
/* oxlint-disable next/no-img-element -- Local icon assets. */
import { useSyncExternalStore, useEffect, useRef, useState } from 'react';
import {TransientFeedback} from './transient-feedback';
import MobileHome from '../mobile-home/page';
import HomePrototype from '../home-prototype/page';
import {DesktopContext, desktopLayout} from './desktop';
import './desktop.css';
import { TopicsPage, topicPages } from './topics';
import { ApplicationsPage, applicationPages } from './applications';
import { ReadingPage, readingPages, workAuthors } from './reading';
import { CreationEntry } from './creation-entry';
import { PersonalPage, personalPages } from './personal';
import { RetainedActivities } from './retained-activities';
import { RetainedShop } from './retained-shop';
import './prototype.css';
import './foundation.css';
import { prototypeStore } from './storage';
import {useB} from '../b-prototype/store';
import { PublishedBoundary } from './published';
import {ReviewPointsNotice} from './review-points-notice';
import {OperationsOverlays} from './operations-overlays';
export const homePages = [
  {
    id: 'home',
    title: '首页',
    module: '首页',
    states: [
      'normal',
      'loading',
      'empty',
      'error',
      'more-error',
      'image-error',
    ],
  },
];
export const allPages = [
  ...homePages,
  ...topicPages,
  ...applicationPages,
  ...readingPages,
  ...personalPages,
].map((p) => ({
  ...p,
  states: (loadingLayouts[p.id] || detailSkeletonPages.includes(p.id)) && !p.states.includes('loading') ? [...p.states,'loading'] : p.states,
  module:
    (
      {
        community: '社区与帖子',
        post: '社区与帖子',
        circles: '圈子',
        circle: '圈子',
        tutorials: '教程',
        tutorial: '教程',
        work: '作品详情',
        search: '搜索与作者',
        author: '搜索与作者',
        resource: '资源与跨端',
        login: '账号与通知',
        notifications: '账号与通知',
        points: '积分与任务',
        checkin: '积分与任务',
        invite: '积分与任务',
        shop: 'AI 商城',
        'account-link': '资源与跨端',
        'return-result': '资源与跨端',
        'pc-handoff': '资源与跨端',
      } as Record<string, string>
    )[p.id] || p.module,
}));
function subscribe(fn: () => void) {
  window.addEventListener('popstate', fn);
  return () => window.removeEventListener('popstate', fn);
}
const snapshot = () => window.location.search;
const positions = new Map<string, number>();
const hydrationSubscribe=()=>()=>{};
export default function Prototype() {
  const db=useB();
  const hydrated=useSyncExternalStore(hydrationSubscribe,()=>true,()=>false);
  const search = useSyncExternalStore(subscribe, snapshot, () => ''),
    params = new URLSearchParams(search);
  const legacyPage=params.get('page')||'topics';
  const rawPage=legacyPage==='publish' ? (params.get('state')==='activity'||params.get('state')==='expired' ? 'activity' : 'post-edit') : legacyPage === 'publish-status' ? 'my-content' : legacyPage;
  useEffect(()=>{
    if(!['app-input','app-task','app-result'].includes(rawPage))return;
    const timer=window.setTimeout(()=>{const url=new URL(location.href);if(!['app-input','app-task','app-result'].includes(url.searchParams.get('page')||''))return;url.searchParams.set('page','app');url.searchParams.delete('state');url.searchParams.delete('task');
    history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));},0);
    return()=>window.clearTimeout(timer);
  },[rawPage]);
  const resolvedDestination=deviceDestination(rawPage,params.toString(),params.get('device')||'mobile');
  useEffect(()=>{if(resolvedDestination.id===rawPage)return;const q=new URLSearchParams(resolvedDestination.query);q.set('page',resolvedDestination.id);history.replaceState(history.state,'',location.pathname+'?'+q);window.dispatchEvent(new PopStateEvent('popstate'));},[rawPage,resolvedDestination.id,resolvedDestination.query]);
  const requestedPage=resolvedDestination.id, loginOpen=requestedPage==='login', checkinOpen=requestedPage==='checkin';
  const [inviteFeedback,setInviteFeedback]=useState('');
  useEffect(()=>{
    if(loginOpen)return;
    const message=prototypeStore.getItem('cp-demo-invite-feedback');
    if(!message)return;
    const timer=window.setTimeout(()=>{prototypeStore.removeItem('cp-demo-invite-feedback');setInviteFeedback(message);},0);
    return()=>window.clearTimeout(timer);
  },[loginOpen,search]);
  const background=loginOpen?prototypeStore.getItem('cp-login-background')||'home':checkinOpen?prototypeStore.getItem('cp-checkin-background')||'mine':'';
  const [backgroundPage,backgroundQuery]=background.split('?');
  const page = loginOpen||checkinOpen?backgroundPage:requestedPage,
    state = loginOpen||checkinOpen?new URLSearchParams(backgroundQuery||'').get('state')||'normal':params.get('state') || 'normal',
    embed = params.get('embed') === '1',
    contentOnly = embed && params.get('contentOnly') === '1';
  const retained = ['activities', 'activity'].includes(page);
  const shopPage = ['shop','shop-exchange','shop-records'].includes(page);
  const desktop = params.get('device') === 'pc';
  const meta = allPages.find((p) => p.id === page),
    from = useRef<string[]>([]);
  const go = (target: string) => {
    positions.set(search, window.scrollY);
    const [rawId, rawQuery] = target.split('?');
    const destination=deviceDestination(rawId,rawQuery||'',desktop?'pc':'mobile');
    const id=destination.id,rest=destination.query;
    if(id==='checkin'&&!checkinOpen){const source=new URLSearchParams(params);['page','device','origin','embed','contentOnly'].forEach(key=>source.delete(key));prototypeStore.setItem('cp-checkin-background',page+(source.size?'?'+source.toString():''));}
    if(id==='login'&&!loginOpen){const source=new URLSearchParams(params);['page','device','origin','embed','contentOnly'].forEach(key=>source.delete(key));prototypeStore.setItem('cp-login-background',page+(source.size?'?'+source.toString():''));}
    if (id === 'create' && !loginOpen && !params.has('activity') && !(rest||'').includes('activity=') && prototypeStore.getItem('cp-activity')!=='1') {
      prototypeStore.removeItem('cp-activity');
      prototypeStore.removeItem('cp-source');
      prototypeStore.removeItem('cp-result');
    }
    const q = new URLSearchParams(rest || '');
    if(['apps','app'].includes(id)&&params.has('activity')&&!q.has('activity'))q.set('activity',params.get('activity')||'');
    if (params.get('origin') === 'pc') {
      q.set('origin', 'pc');
    }
    q.set('page', id);
    if (embed){q.set('embed','1');q.set('reviewScope',params.get('reviewScope')||params.get('page')+':'+params.get('state'));}
    if (params.get('device') === 'pc') q.set('device', 'pc');
    const replace=id==='login'||loginOpen||id==='checkin'||checkinOpen;
    if(!replace)from.current.push(search);
    window.history[replace?'replaceState':'pushState'](
      { ...window.history.state, cp: !replace||window.history.state?.cp },
      '',
      window.location.pathname + '?' + q.toString(),
    );
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  useEffect(() => {
    window.scrollTo(0, positions.get(search) || 0);
  }, [search]);
  const back = () => {
    if(page==='invite'&&state==='records'){go('invite');return;}
    if (['shop-exchange','shop-records'].includes(page)) { go('shop'); return; }
    if (window.history.state?.cp || from.current.length) {
      from.current.pop();
      window.history.back();
    } else
      go(
        page === 'circle' ? 'circles' : desktop&&page==='work'?'aigc':desktop&&page==='post'?'discussion':['circles','post'].includes(page) ? 'community' : page === 'tutorial' ? 'tutorials' : page === 'activity' ? 'activities' : ['topic'].includes(page)
          ? 'topics'
          : page.startsWith('app-')
            ? 'app'
            : page === 'app'
              ? 'apps'
              : 'home',
      );
  };
  if(!hydrated)return <main aria-busy="true"/>;
  const operationsLayer=<OperationsOverlays key={search} sample={params.get('reviewOverlay')||''} go={go}/>;
  const loginLayer=loginOpen?<PersonalPage page="login" state={params.get('state')||'normal'} go={go}/>:checkinOpen?<PersonalPage page="checkin" state={params.get('state')||'normal'} go={go}/>:null;
  const invitationFeedbackLayer=<TransientFeedback message={inviteFeedback} onClear={()=>setInviteFeedback('')}/>;
  if (page === 'home' || page === 'creation-entry')
    return <div className={loginOpen||checkinOpen?'cp-root'+(desktop?' cp-desktop cp-retained-desktop':''):undefined}><div inert={loginOpen||checkinOpen||page==='creation-entry'||undefined}>{desktop ? <HomePrototype navigate={go}/> : <MobileHome key={state} initialState={state} navigate={go} contentOnly={contentOnly}/>}</div>{page==='creation-entry'&&!loginOpen&&<CreationEntry go={go} controlledOpen onClose={()=>go('home')} />}{loginLayer}{operationsLayer}{invitationFeedbackLayer}</div>;
  const props = { page, state, go };
  return (
    <div
      data-page={page}
      data-state={state}
      className={'cp-root' + (desktop ? ' cp-retained-desktop cp-desktop cp-layout-'+desktopLayout(page) : '') + (embed ? ' cp-embedded' : '') + (contentOnly ? ' cp-content-only' : '')}
    >
      {operationsLayer}
      {page==='points'&&(params.get('reviewOverlay')==='points-arrival'||params.get('reviewOverlay')==='points-refund')&&<ReviewPointsNotice key={search} kind={params.get('reviewOverlay') as 'points-arrival'|'points-refund'}/>}
      <div inert={loginOpen||checkinOpen||undefined}>
      {desktop && <DesktopHeader active={page} go={go}/>}
      {!contentOnly && !desktop && <MobileHeader topic={page==='topic'} circle={page==='circle'} search={page==='search'} author={params.has('owned')?undefined:page==='post'&&!['loading','error','removed','private'].includes(state)?samplePosts.find(p=>p.id===(({'work-image':'restore','work-video':'sea','work-text':'letter'} as Record<string,string>)[state]||params.get('item')||'restore'))?.author:page==='work'&&!['loading','error','removed','private'].includes(state)?db.records.find(r=>r.id==='work-'+((({'work-image':'restore','work-video':'sea','work-text':'letter'} as Record<string,string>)[state]||params.get('item')||'restore')==='restore'?'1':params.get('item')))?.public?.author||workAuthors[({'work-image':'restore','work-video':'sea','work-text':'letter'} as Record<string,string>)[state]||params.get('item')||'restore']:undefined} community={['community','tutorials'].includes(page)} communityTab={communityTab(search)} onCommunityTab={switchCommunityTab} title={page==='invite'&&state==='records'?'邀请明细':page==='points'&&state==='records'?'积分明细':page==='search'?'搜索':meta?.title||'页面暂不可访问'} back={back} go={go}/>}
      {desktop && !['aigc','mine','shop','activities'].includes(page) && <div className="cp-desktop-heading">{!['aigc','circles','discussion','tutorials','topics','apps','activities','shop','points','invite','notifications'].includes(page)&&<button onClick={back} aria-label="返回"><img src="/home-prototype/icons/arrow-left-s-line.svg" alt=""/></button>}<h1>{state==='records'&&['points','invite'].includes(page)?(page==='points'?'积分明细':'邀请明细'):page==='search'?'搜索':meta?.title}</h1>{(page==='points'||(page==='invite'&&state==='records'))&&<button className="pc-benefits-detail-link" onClick={()=>go(state==='records'?page:page+'?state=records')}>{state==='records'?'返回'+(page==='points'?'积分中心':'邀请有礼'):(page==='points'?'积分明细':'邀请明细')} ›</button>}</div>}
      <div className="cp-desktop-workspace"><main className="cp-body" key={search}>
        {state==='loading'&&loadingLayouts[page]?<LayoutSkeleton kind={loadingLayouts[page]}/>:state==='loading'&&detailSkeletonPages.includes(page)?<DetailSkeleton page={page}/>:<PublishedBoundary {...props}>
        {shopPage ? <RetainedShop {...props}/> : retained ? <RetainedActivities {...props}/> : topicPages.some((p) => p.id === page) ? (
          <TopicsPage {...props} />
        ) : applicationPages.some((p) => p.id === page) ? (
          <ApplicationsPage {...props} />
        ) : readingPages.some((p) => p.id === page) ? (
          <ReadingPage {...props} />
        ) : personalPages.some((p) => p.id === page) ? (
          <PersonalPage {...props} />
        ) : (
          <div className="cp-state">
            <h2>页面暂不可访问</h2>
            <button className="cp-button" onClick={() => go('home')}>
              返回首页
            </button>
          </div>
        )}
        </PublishedBoundary>}
      </main>
      {desktop && !['work','mine'].includes(page) && <DesktopContext page={page} go={go}/>}
      </div>
      {!contentOnly && !desktop && !shopPage && page !== 'activity' && page !== 'app' && page !== 'post' && page !== 'work' && !['notifications','my-fans','my-relations','my-circles','profile-edit','my-content','drafts','records','favorites','submissions','points','checkin','invite','login','pc-handoff','account-link','return-result','search','author','resource'].includes(page) && page !== 'post-edit' && page !== 'post-publish' && <MobileNavigation active={['community','tutorials','circles','circle','post','tutorial'].includes(page)?'community':page} go={go} />}
      </div>
      {loginLayer}
      {invitationFeedbackLayer}
    </div>
  );
}

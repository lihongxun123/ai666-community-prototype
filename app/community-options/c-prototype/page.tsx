'use client';
import {loadingLayouts} from '../common-states/catalog';
import {LayoutSkeleton} from '../common-states/layout-skeleton';
import {DetailSkeleton,detailSkeletonPages} from './detail-skeleton';
import {DesktopHeader,MobileHeader} from '../community-header';
import {MobileNavigation} from '../mobile-navigation';
/* oxlint-disable next/no-img-element -- Local icon assets. */
import { useSyncExternalStore, useEffect, useRef } from 'react';
import MobileHome from '../mobile-home/page';
import HomePrototype from '../home-prototype/page';
import {DesktopContext, desktopLayout} from './desktop';
import './desktop.css';
import { TopicsPage, topicPages } from './topics';
import { ApplicationsPage, applicationPages } from './applications';
import { ReadingPage, readingPages } from './reading';
import { PersonalPage, personalPages } from './personal';
import { RetainedActivities } from './retained-activities';
import { RetainedShop } from './retained-shop';
import './prototype.css';
import './foundation.css';
import { prototypeStore } from './storage';
import { PublishedBoundary } from './published';
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
  const hydrated=useSyncExternalStore(hydrationSubscribe,()=>true,()=>false);
  const search = useSyncExternalStore(subscribe, snapshot, () => ''),
    params = new URLSearchParams(search);
  const requestedPage=params.get('page')||'topics', loginOpen=requestedPage==='login';
  const background=loginOpen?prototypeStore.getItem('cp-login-background')||'home':'';
  const [backgroundPage,backgroundQuery]=background.split('?');
  const page = loginOpen?backgroundPage:requestedPage,
    state = loginOpen?new URLSearchParams(backgroundQuery||'').get('state')||'normal':params.get('state') || 'normal',
    embed = params.get('embed') === '1',
    contentOnly = embed && params.get('contentOnly') === '1';
  const retained = ['activities', 'activity'].includes(page);
  const shopPage = ['shop','shop-records'].includes(page);
  const desktop = params.get('device') === 'pc';
  const meta = allPages.find((p) => p.id === page),
    from = useRef<string[]>([]);
  const go = (target: string) => {
    positions.set(search, window.scrollY);
    const [id, rest] = target.split('?');
    if(id==='login'&&!loginOpen){const source=new URLSearchParams(params);['page','device','origin','embed','contentOnly'].forEach(key=>source.delete(key));prototypeStore.setItem('cp-login-background',page+(source.size?'?'+source.toString():''));}
    if (id === 'create' && !loginOpen && !params.has('activity') && !(rest||'').includes('activity=') && prototypeStore.getItem('cp-activity')!=='1') {
      prototypeStore.removeItem('cp-activity');
      prototypeStore.removeItem('cp-source');
      prototypeStore.removeItem('cp-result');
    }
    const q = new URLSearchParams(rest || '');
    if(['apps','app','app-input','app-task','app-result'].includes(id)&&params.has('activity')&&!q.has('activity'))q.set('activity',params.get('activity')||'');
    if (params.get('origin') === 'pc') {
      if (id === 'home') {
        window.location.assign('/community-options/home-prototype');
        return;
      }
      q.set('origin', 'pc');
    }
    q.set('page', id);
    if (embed){q.set('embed','1');q.set('reviewScope',params.get('reviewScope')||params.get('page')+':'+params.get('state'));}
    if (params.get('device') === 'pc') q.set('device', 'pc');
    const replace=id==='login'||loginOpen;
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
    if (page === 'activity') { go('activities'); return; }
    if (page === 'shop-records') { go('shop'); return; }
    if (window.history.state?.cp || from.current.length) {
      from.current.pop();
      window.history.back();
    } else
      go(
        page === 'circle' ? 'circles' : ['circles','post'].includes(page) ? 'community' : page === 'tutorial' ? 'tutorials' : page === 'activity' ? 'activities' : ['topic'].includes(page)
          ? 'topics'
          : page.startsWith('app-')
            ? 'app'
            : page === 'app'
              ? 'apps'
              : 'home',
      );
  };
  if(!hydrated)return <main aria-busy="true"/>;
  const loginLayer=loginOpen?<PersonalPage page="login" state={params.get('state')||'normal'} go={go}/>:null;
  if (page === 'home')
    return <div className={loginOpen?'cp-root'+(desktop?' cp-desktop cp-retained-desktop':''):undefined}><div inert={loginOpen||undefined}>{desktop ? <HomePrototype/> : <MobileHome key={state} initialState={state} navigate={go} contentOnly={contentOnly}/>}</div>{loginLayer}</div>;
  const props = { page, state, go };
  return (
    <div
      data-page={page}
      data-state={state}
      className={'cp-root' + (desktop ? ' cp-retained-desktop cp-desktop cp-layout-'+desktopLayout(page) : '') + (embed ? ' cp-embedded' : '') + (contentOnly ? ' cp-content-only' : '')}
    >
      <div inert={loginOpen||undefined}>
      {desktop && <DesktopHeader active={page} go={go}/>}
      {!contentOnly && !desktop && <MobileHeader community={['community','tutorials'].includes(page)} title={page==='search'?'搜索':meta?.title||'页面暂不可访问'} back={back} go={go}/>}
      {desktop && <div className="cp-desktop-heading"><button onClick={back} aria-label="返回"><img src="/home-prototype/icons/arrow-left-line.svg" alt=""/></button><h1>{page==='search'?'搜索':meta?.title}</h1></div>}
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
      {desktop && <DesktopContext page={page} go={go}/>}
      </div>
      {!contentOnly && !desktop && !shopPage && page !== 'activity' && page !== 'app' && <MobileNavigation active={['community','tutorials','circles','circle','post','tutorial'].includes(page)?'community':page} go={go} />}
      </div>
      {loginLayer}
    </div>
  );
}

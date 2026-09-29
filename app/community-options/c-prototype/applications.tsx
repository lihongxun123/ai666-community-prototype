'use client';
/* oxlint-disable jsx-a11y/media-has-caption -- Bundled silent sea-sample video has no audio track. */
/* oxlint-disable next/no-img-element -- Local prototype sample media. */
import { prototypeStore as sessionStorage } from './storage';
import { useState } from 'react';
import './application-flow.css';
import { ActionBar, Comments } from './reading';
import {useB} from '../b-prototype/store';
import {AppIntroduction,appSummaries} from './app-introduction';
import { appHandoffUrl } from './app-handoff';
export const applicationPages = [
  {
    id: 'apps',
    title: 'AI应用',
    module: 'AI应用',
    states: ['normal', 'loading', 'empty', 'error'],
  },
  {
    id: 'app',
    title: '应用详情',
    module: 'AI应用',
    states: ['normal', 'pc', 'paused', 'removed', 'error'],
  },
  {
    id: 'pc-handoff',
    title: '电脑端继续',
    module: 'AI应用',
    states: ['normal', 'unavailable', 'copy-failed'],
  },
  {
    id: 'account-link',
    title: '关联账号',
    module: '跨产品承接',
    states: ['normal', 'mismatch', 'expired', 'error'],
  },
  {
    id: 'return-result',
    title: '选择成果',
    module: '跨产品承接',
    states: ['normal', 'error', 'activity-ended', 'duplicate', 'forbidden'],
  },
];
const applicationCategories = [{id:'all',label:'全部'},{id:'writing',label:'写文案'},{id:'product-image',label:'做商品图'},{id:'photo',label:'修照片'},{id:'video',label:'做视频'}];
const apps = [
 {id:'repair-color',category:'photo',name:'照片色彩修复',image:'portrait',mobile:true,available:true,input:'待修复照片',output:'图片',purpose:'影像处理',place:'MakeNow'},

  {
    id: 'copy',
    category: 'writing',
    name: '文案改写',
    image: 'writing',
    mobile: true,
    available: true,
    input: '原文、用途和语气',
    output: '文字',
    purpose: '写作表达',
    place: 'MakeNow',
  },
  {
    id: 'background',
    category: 'product-image',
    name: '产品换背景',
    image: 'perfume',
    mobile: true,
    available: true,
    input: '产品图片、背景描述',
    output: '图片',
    purpose: '商品展示',
    place: 'MakeNow',
  },
  {
    id: 'video',
    category: 'video',
    name: '产品短片制作',
    image: 'sea',
    mobile: false,
    available: true,
    input: '产品素材、镜头与场景',
    output: '视频',
    purpose: '商品展示',
    place: 'MakeNow',
  },
  {
    id: 'restore',
    category: 'photo',
    name: '照片修复',
    image: 'restore',
    mobile: true,
    available: false,
    input: '待修复照片',
    output: '图片',
    purpose: '影像处理',
    place: 'MakeNow',
  },
];
export function ApplicationsPage({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (p: string) => void;
}) {
  const contentDB=useB();
  const query =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const item = query?.get('item') || 'copy';
  const baseApp = apps.find((a) => a.id === item) || apps[0];
  const configuredApp=baseApp.id==='copy'?contentDB.records.find(r=>r.id==='app-1'):null;
  const app={...baseApp,name:configuredApp?.public?.title||baseApp.name,mobile:configuredApp?.public?configuredApp.public.device==='手机与电脑':baseApp.mobile};
  const [local, setLocal] = useState(state),
    [category, setCategory] = useState(applicationCategories.some(c=>c.id===query?.get('category'))?query!.get('category')!:'all'),
    [tip, setTip] = useState(''),
    [picked, setPicked] = useState(true),
    [linked, setLinked] = useState(false);
  const s = local;
  const nav = (p: string) => {const activity=query?.get('activity');go(p+'?item='+app.id+(activity?'&activity='+encodeURIComponent(activity):''));};
  if (page === 'apps') {
    if (s === 'loading')
      return (
        <div className="cp-skeleton" aria-label="加载中">
          <div />
          <div />
        </div>
      );
    if (s === 'empty' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'empty' ? '暂无应用' : '加载失败'}</h2>
          <button className="cp-button" onClick={() => setLocal('normal')}>
            重新加载
          </button>
        </div>
      );
    const updateCategory=(value:string)=>{
      setCategory(value);
      const url=new URL(location.href);
      url.searchParams.delete('purpose');url.searchParams.delete('output');
      if(value==='all')url.searchParams.delete('category');else url.searchParams.set('category',value);
      history.replaceState(history.state,'',url);window.dispatchEvent(new PopStateEvent('popstate'));
    };
    const publicCopy=contentDB.records.find(r=>r.id==='app-1');
    const list=apps.filter(a=>a.id!=='copy'||publicCopy?.publicStatus==='公开')
      .map(a=>({...a,name:a.id==='copy'?(publicCopy?.public?.title||a.name):a.name,available:a.available&&(a.id!=='copy'||publicCopy?.runtime==='可用')}))
      .filter(a=>category==='all'||a.category===category)
      .sort((a,b)=>query?.get('device')!=='pc'?Number(b.mobile&&b.available)-Number(a.mobile&&a.available):0);
    return (
      <section className="cp-app-discovery" aria-label="应用列表">
        <div className="cp-discovery-filters">
          <nav aria-label="应用任务分类">{applicationCategories.map(({id,label})=><button key={id} aria-pressed={category===id} onClick={()=>updateCategory(id)}>{label}</button>)}</nav>
        </div>
        {list.length===0?<div className="cp-state"><h2>暂无符合条件的应用</h2><button className="cp-button" onClick={()=>updateCategory('all')}>清除筛选</button></div>:<>
          <div className="cp-app-gallery">{list.map(a=><button className="cp-app-effect" key={a.id} aria-label={a.name} onClick={()=>{const activity=query?.get('activity');go('app?item='+a.id+(activity?'&activity='+encodeURIComponent(activity):''));}}>
            <img src={'/home-prototype/'+a.image+'.png'} alt=""/>
            <span className="cp-app-caption"><strong>{a.name}</strong>{!a.available&&<small>暂不可用</small>}</span>
          </button>)}</div>
          <p className="cp-end">没有更多了</p>
        </>}
      </section>
    );
  }
  if (page==='app'&&configuredApp?.publicStatus!=='公开'&&configuredApp)
    return <div className="cp-state"><h2>应用暂不可访问</h2><button className="cp-button" onClick={()=>go('apps')}>返回应用列表</button></div>;
  if (page === 'app') {
    if (s === 'removed' || s === 'error')
      return (
        <div className="cp-state">
          <h2>{s === 'removed' ? '内容暂不可访问' : '加载失败'}</h2>
          <button
            className="cp-button"
            onClick={() => (s === 'error' ? setLocal('normal') : go('apps'))}
          >
            {s === 'error' ? '重试' : '返回应用列表'}
          </button>
        </div>
      );
    const pc = s === 'pc' || !app.mobile,
      paused = s === 'paused' || !app.available || Boolean(configuredApp&&(configuredApp.runtime!=='可用'||!configuredApp.public?.entry));
    return (
      <article className="cp-app-detail">
        <div className="cp-app-detail-heading"><h2>{app.name}</h2><p>{appSummaries[app.id]}</p></div>
        <img
          className="cp-app-detail-cover"
          src={'/home-prototype/' + app.image + '.png'}
          alt={app.name}
        />

        {paused && (
          <div className="cp-alert">
            应用暂不可用，介绍与讨论仍可查看。
          </div>
        )}
        {pc && <section className="cp-note cp-mobile-only"><h2>请在电脑端使用</h2><p>画布与工作流操作需在电脑端完成。</p></section>}
        {!paused && <div className="cp-app-dock" aria-label="应用操作">
          {pc ? <><button className="cp-button cp-mobile-only" onClick={()=>nav('pc-handoff')}>获取电脑端链接</button><button className="cp-button cp-desktop-only" onClick={()=>window.location.assign(appHandoffUrl(app.id))}>在 MakeNow 中使用</button></> : <button className="cp-button" onClick={()=>window.location.assign(appHandoffUrl(app.id))}>在 MakeNow 中使用</button>}
        </div>}
        <AppIntroduction input={app.input} output={app.output} provider="多元拾光"/>

        <ActionBar kind="app" go={go}/>
        <Comments go={go} kind="app"/>
      </article>
    );
  }
  if (page === 'pc-handoff')
    return (
      <section className="af-page af-handoff">
        <div className="af-app-context"><img src={'/home-prototype/'+app.image+'.png'} alt=""/><div><strong>{app.name}</strong><span>在电脑浏览器中打开链接即可继续</span></div></div>
        {s === 'unavailable' ? (
          <div className="cp-state">
            <h2>目标暂不可访问</h2>
          </div>
        ) : (
          <>
            <label>
              应用链接
              <input
                readOnly
                value={
                  typeof window === 'undefined'
                    ? ''
                    : window.location.origin +
                      '/community-options/c-prototype?page=app&item=' +
                      app.id
                }
              />
            </label>
            <button
              className="cp-button"
              onClick={async () => {
                try {
                  if (s === 'copy-failed') throw Error();
                  await navigator.clipboard.writeText(
                    window.location.origin +
                      '/community-options/c-prototype?page=app&item=' +
                      app.id,
                  );
                  setTip('链接已复制');
                } catch {
                  setTip('复制失败，可长按链接手动复制');
                }
              }}
            >
              复制链接
            </button>
          </>
        )}
        {app.place==='MakeNow'&&<p className="af-subtle">进入 MakeNow 后，账号与费用以该平台为准。</p>}
        {tip && <output>{tip}</output>}
      </section>
    );
  if (page === 'account-link')
    return (
      <section className="af-page af-account">
        
        <dl className="cp-facts">
          <dt>社区</dt>
          <dd>林间</dd>
          <dt>MakeNow</dt>
          <dd>{s === 'mismatch' ? '另一位创作者' : '林间的工作室'}</dd>
        </dl>
        <p>关联后可将本人选定的成果带回社区。两端积分独立。</p>
        {s === 'mismatch' && (
          <div className="cp-alert">请确认这两个账号均属于你。</div>
        )}
        {s === 'expired' && (
          <div className="cp-alert">关联已失效，请重新登录确认。</div>
        )}
        {s === 'error' && (
          <div className="cp-alert">关联失败，原成果仍保留在 MakeNow。</div>
        )}
        {s === 'expired' && (
          <button
            className="cp-button"
            onClick={() => {
              sessionStorage.setItem('cp-return', 'account-link');
              go('login');
            }}
          >
            重新登录
          </button>
        )}
        {s === 'error' && (
          <button className="cp-button" onClick={() => setLocal('normal')}>
            重试关联
          </button>
        )}
        <label>
          <input
            type="checkbox"
            checked={linked}
            onChange={(e) => setLinked(e.target.checked)}
          />
          确认两个账号均由本人使用
        </label>
        <button
          className="cp-button"
          disabled={!linked || s === 'expired' || s === 'error'}
          onClick={() => {
            sessionStorage.setItem('cp-linked', '1');
            go('return-result');
          }}
        >
          确认关联
        </button>
        <button
          className="cp-button cp-secondary"
          onClick={() => go('resource')}
        >
          暂不关联
        </button>
      </section>
    );
  if (page === 'return-result')
    return (
      <section className="af-page af-return">
        {s === 'forbidden' ? (
          <div className="cp-state">
            <h2>无法确认成果归属</h2>
            <p>请使用制作该成果的账号。</p>
            <button className="cp-button" onClick={() => go('account-link')}>
              核对账号
            </button>
          </div>
        ) : (
          <>
            
            <label>
              <input
                type="checkbox"
                checked={picked}
                onChange={(e) => setPicked(e.target.checked)}
              />
              一瓶夏日晴光
            </label>
            <img
              className="cp-cover"
              src="/home-prototype/perfume.png"
              alt="待发布成果"
            />
            {s === 'activity-ended' && (
              <div className="cp-alert">
                活动已结束，无法继续投稿。成果仍为私有。
              </div>
            )}
            {s === 'error' && (
              <div className="cp-alert">
                回流失败，MakeNow 中的原成果不受影响。
              </div>
            )}
            {s === 'error' && (
              <button className="cp-button" onClick={() => setLocal('normal')}>
                重新获取成果
              </button>
            )}
            {s === 'duplicate' ? (
              <button
                className="cp-button"
                onClick={() => go('publish-status')}
              >
                查看原提交
              </button>
            ) : (
              <button
                className="cp-button"
                disabled={!picked || s === 'error'}
                onClick={() => {
                  sessionStorage.setItem('cp-source', 'MakeNow');
                  if (s === 'activity-ended')
                    sessionStorage.removeItem('cp-activity');
                  sessionStorage.setItem(
                    'cp-result',
                    JSON.stringify({
                      kind: 'image',
                      image: '/home-prototype/perfume.png',
                      title: '一瓶夏日晴光',
                    }),
                  );
                  go('post-edit');
                }}
              >
                {s === 'activity-ended'
                  ? '取消活动关联，作为普通作品编辑'
                  : '继续编辑作品'}
              </button>
            )}
          </>
        )}
      </section>
    );
  return null;
}


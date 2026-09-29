'use client';
/* oxlint-disable next/no-img-element -- Local prototype assets. */
import {createPortal} from 'react-dom';
import { useEffect,useState,useSyncExternalStore } from 'react';
import {WorkFeed} from './work-feed';
import {useB} from '../b-prototype/store';
export const topicPages = [
  {
    id: 'topics',
    title: '专题',
    module: '专题',
    states: ['normal', 'loading', 'empty', 'error', 'more-error'],
  },
  {
    id: 'topic',
    title: '专题详情',
    module: '专题',
    states: [
      'normal',
      'loading',
      'error',
      'partial',
      'empty',
      'removed',
      'single',
    ],
  },
];
const themes = [
  ['perfume', '电商营销', '从产品图片到展示短片', 'topic'],
  ['anime', '角色创作', '角色设计与表达', 'topic?theme=character'],
  ['restore', '图像修复', '修复方法与案例', 'topic?theme=restore'],
  ['writing', '写作表达', '文字组织与内容表达', 'topic?theme=writing'],
  ['portrait','人像修复练习','从肤色到细节的修复练习','topic?theme=repair'],
];
type TopicRow={id:string;title:string;status:string;detail?:string};
const subscribeTopics=(cb:()=>void)=>{window.addEventListener('bp-slots-change',cb);window.addEventListener('storage',cb);return()=>{window.removeEventListener('bp-slots-change',cb);window.removeEventListener('storage',cb);};};
const topicSnapshot=()=>[sessionStorage.getItem('bp-op-topics'),...Object.keys(sessionStorage).filter(key=>key.startsWith('bp-op-topic-public-')).sort().map(key=>sessionStorage.getItem(key))].join('|');
const targetForRef=(id:string)=>id==='work-1'?'work?item=restore':id==='post-1'?'post?item=restore':id==='tutorial-1'?'tutorial?item=restore':id==='app-1'?'app?item=copy':id==='resource-1'?'resource':/^(work|post|tutorial|app|resource)-/.test(id)?id.split('-')[0]+'?id='+id:'';
export function TopicsPage({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (p: string) => void;
}) {
  const [shareSlot,setShareSlot]=useState<HTMLElement|null>(null);
  useEffect(()=>{setShareSlot(document.getElementById('topic-share-slot'))},[]);
  const contentDB=useB();
  useSyncExternalStore(subscribeTopics,topicSnapshot,()=>'');
  const rows:TopicRow[]|null=typeof window==='undefined'?null:(()=>{try{return JSON.parse(sessionStorage.getItem('bp-op-topics')||'null') as TopicRow[]|null;}catch{return null;}})();
  const tutorialVisible=contentDB.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开';
  const appVisible=contentDB.records.find(r=>r.id==='app-1')?.publicStatus==='公开';
  const hasVisibleItem=(id:string)=>{try{const raw=sessionStorage.getItem('bp-op-topic-public-'+id);if(raw){const refs=(JSON.parse(raw) as {refs:string[]}).refs;return refs.some(ref=>contentDB.records.some(r=>r.id===ref&&r.publicStatus==='公开'));}}catch{/* fixed sample */}return id!=='tp-restore'||tutorialVisible;};
  const visibleThemes=rows?rows.filter(r=>r.status==='已发布'&&hasVisibleItem(r.id)).map(r=>{const key=r.id.replace(/^tp-/,'');const base=themes.find(t=>t[3]==='topic?theme='+key)||(key==='perfume'?themes[0]:themes[0]);return [base[0],r.title,r.detail||base[2],key==='perfume'?'topic':'topic?theme='+key];}):themes.filter(([,name])=>(name!=='图像修复'||tutorialVisible)&&(name!=='写作表达'||appVisible));
  const [retry, setRetry] = useState(false),
    [notice, setNotice] = useState('');
  const s = retry ? 'normal' : state;
  const params =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : null;
  const theme = params?.get('theme') || '';
  const selectedId='tp-'+(theme||'perfume');
  const selectedRow=rows?.find(r=>r.id===selectedId);
  const config=typeof window==='undefined'?null:(()=>{try{return JSON.parse(sessionStorage.getItem('bp-op-topic-public-'+selectedId)||'null') as {title:string;refs:string[]}|null;}catch{return null;}})();
  const topic =
    theme === 'repair' ? themes[4] : theme === 'character'
      ? themes[1]
      : theme === 'restore'
        ? themes[2]
        : theme === 'writing'
          ? themes[3]
          : themes[0];
  const single = s === 'single' || theme === 'restore' || theme === 'repair';
  if (s === 'loading')
    return (
      <div className={'cp-content-skeleton '+(page==='topics'?'is-list':'is-detail')} aria-label="加载中" aria-busy="true">
        {page==='topics'?Array.from({length:3},(_,i)=><div className="cp-skeleton-topic" key={i}><span /><span /></div>):<><div className="cp-skeleton-hero"/><div className="cp-skeleton-heading"/><div className="cp-skeleton-line"/><div className="cp-skeleton-line short"/><div className="cp-skeleton-tabs"/><div className="cp-skeleton-grid">{[0,1,2,3].map(i=><div key={i}><div className="cp-skeleton-image"/><div className="cp-skeleton-line"/></div>)}</div></>}
      </div>
    );
  if (s === 'error')
    return (
      <section className="cp-state">
        <h2>加载失败</h2>
        <button className="cp-button" onClick={() => setRetry(true)}>
          重试
        </button>
      </section>
    );
  if (s === 'removed' || (page === 'topics' && (s === 'empty' || visibleThemes.length===0)))
    return (
      <section className="cp-state">
        <h2>
          {s === 'removed'
            ? '专题暂不可访问'
            : page === 'topics'
              ? '暂无专题'
              : '暂无可浏览内容'}
        </h2>
        <button
          className="cp-button"
          onClick={() => go(page === 'topics' ? 'home' : 'topics')}
        >
          {page === 'topics' ? '返回首页' : '浏览其他专题'}
        </button>
      </section>
    );
  if (page === 'topics')
    return (
      <>
        <div className="cp-topic-list">
          {visibleThemes.map(([img, name, desc, target]) => (
            <button
              key={name}
              onClick={() => go(target)}
              aria-label={name}
              className="cp-topic-card"
            >
              <img src={'/home-prototype/' + img + '.png'} alt="" />
              <span>
                <strong>{name}</strong>
                <small>{desc}</small>
              </span>
            </button>
          ))}
        </div>
        {s === 'more-error' ? (
          <div className="cp-state cp-small">
            <p>更多专题加载失败</p>
            <button onClick={() => setRetry(true)}>重试</button>
          </div>
        ) : (
          <p className="cp-end">没有更多了</p>
        )}
      </>
    );
  const cover = single && s === 'single' ? themes[2] : topic;
  if(rows&&(selectedRow?.status!=='已发布'||!hasVisibleItem(selectedId)))return <section className="cp-state"><h2>专题暂不可访问</h2><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section>;
  if((theme==='restore'&&!tutorialVisible)||(theme==='writing'&&!appVisible))return <section className="cp-state"><h2>专题暂不可浏览</h2><p>当前没有公开内容。</p><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section>;
  const intro=selectedRow?.detail||cover[2];
  const shareButton=<button onClick={async()=>{
        try{
          const share=new URL('/community-options/c-prototype',location.origin);share.searchParams.set('page','topic');if(theme)share.searchParams.set('theme',theme);
          await navigator.clipboard.writeText(share.toString());setNotice('链接已复制');
        }catch{setNotice('复制失败，请重试');}
      }}><img src="/home-prototype/icons/share-forward-line.svg" alt=""/>分享</button>;
  return (
    <article className="cp-topic-detail">
      <div className="cp-topic-hero">
        <img src={'/home-prototype/'+cover[0]+'.png'} alt=""/>
        <div><h2>{config?.title||selectedRow?.title||cover[1]}</h2><p>{intro}</p></div>
      </div>
      {shareSlot?createPortal(shareButton,shareSlot):<div className="cp-topic-tools">{shareButton}</div>}
      {notice && <output>{notice}</output>}
      {config && s!=='empty' ? <section className="cp-section"><h2>精选内容</h2>{config.refs.filter(id=>contentDB.records.some(r=>r.id===id&&r.publicStatus==='公开')).map(id=>{const r=contentDB.records.find(x=>x.id===id)!;const target=targetForRef(id);return target?<button key={id} className="cp-row" onClick={()=>go(target)}><span><small>{r.kind==='app'?'AI应用':r.kind==='work'?'作品':r.kind==='post'?'帖子':r.kind==='tutorial'?'教程':'资源'}</small><strong>{r.public?.title}</strong></span><span>›</span></button>:null;})}</section> : s === 'empty' ? <section className="cp-state"><h2>暂无可浏览内容</h2><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section> : theme === 'writing' || theme === 'character' ? (
        theme==='writing'&&!appVisible?<p>暂无可浏览内容</p>:
        <section className="cp-section">
          <h2>{theme === 'writing' ? '应用' : '作品'}</h2>
          {theme==='character'?<WorkFeed items={[{id:'anime',title:'风从蓝色花间经过',author:'Tide',likes:982}]} go={go}/>:<button className="cp-card" onClick={()=>go('app?item=copy')}><img src={'/home-prototype/'+cover[0]+'.png'} alt=""/><strong>文案改写</strong></button>}
        </section>
      ) : single ? (
        !tutorialVisible?<p>暂无可浏览内容</p>:
        <section className="cp-section">
          <h2>从方法开始</h2>
          <button className="cp-row" onClick={() => go('tutorial')}>
            <img src={'/home-prototype/' + cover[0] + '.png'} alt="" />
            <span>
              <small>教程</small>
              <strong>旧照片修复：从判断破损到复查</strong>
            </span>
            <span>›</span>
          </button>
        </section>
      ) : (
        <>
          <section className="cp-section">
            <h2>看作品</h2>
            <WorkFeed items={[{id:'perfume',title:'一瓶夏日晴光',author:'鹿与光',likes:617},{id:'cup',title:'柠檬与蓝花杯',author:'鹿与光',likes:328}].filter(w=>w.id!=='perfume'||contentDB.records.find(r=>r.id==='work-perfume')?.publicStatus==='公开')} go={go}/>
          </section>
          <section className="cp-section">
            <h2>学方法</h2>
            <button
              className="cp-row"
              onClick={() => go('tutorial?item=product')}
            >
              <img src="/home-prototype/writing.png" alt="" />
              <span>
                <small>教程</small>
                <strong>产品背景与光线的搭配</strong>
              </span>
              <span>›</span>
            </button>
          </section>
          <section className="cp-section">
            <h2>试应用</h2>
            <button
              className="cp-row"
              onClick={() => go('app?item=background')}
            >
              <img src="/home-prototype/perfume.png" alt="" />
              <span>
                <small>AI应用</small>
                <strong>产品换背景</strong>
              </span>
              <span>›</span>
            </button>
            {s !== 'partial' && (
              <button className="cp-row" onClick={() => go('app?item=video')}>
                <img src="/home-prototype/sea.png" alt="" />
                <span>
                  <small>AI应用</small>
                  <strong>产品短片制作</strong>
                </span>
                <span>›</span>
              </button>
            )}
          </section>

        </>
      )}
    </article>
  );
}


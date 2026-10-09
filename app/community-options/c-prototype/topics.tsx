'use client';
import {hiddenPublicTarget} from './content-visibility';
import {TransientFeedback} from './transient-feedback';
/* oxlint-disable next/no-img-element -- Local prototype assets. */
import {createPortal} from 'react-dom';
import { useEffect,useState,useSyncExternalStore } from 'react';
import './topic-showcase.css';
import {TopicSections,topicImage,type TopicDisplaySection} from './topic-sections';
import {readOperations,publicOperationRows,type TopicSection} from '../b-prototype/operations-model';
import {DesktopTopic} from './topic-desktop';
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
      'empty',
      'removed',
    ],
  },
];
const themes = [
  ['perfume', '电商营销', '从产品图片到展示短片', 'topic'],
  ['anime', '角色创作', '角色设计与表达', 'topic?theme=character'],
  ['restore', '图像修复', '修复方法与案例', 'topic?theme=restore'],
  ['writing', '写作表达', '文字组织与内容表达', 'topic?theme=writing'],
  ['portrait','人像修复练习','从肤色到细节的修复练习','topic?theme=repair'],
  ['perfume','商品上新内容指南','从卖点梳理到商品套图，再到视频表达','topic?theme=launch'],
];
type TopicPreview={cover:string;title:string;kind:string;target:string};
const topicPreviews:Record<string,TopicPreview[]>={
 perfume:[{cover:'perfume',title:'一瓶夏日晴光',kind:'作品',target:'work?item=perfume'},{cover:'cup',title:'柠檬与蓝花杯',kind:'作品',target:'work?item=cup'},{cover:'writing',title:'产品背景与光线的搭配',kind:'教程',target:'tutorial?item=product'}],
 character:[{cover:'anime',title:'风从蓝色花间经过',kind:'作品',target:'work?item=anime'},{cover:'underwater',title:'沉入一场蓝色的梦',kind:'作品',target:'work?item=underwater'},{cover:'girl',title:'夏日的转角',kind:'作品',target:'work?item=girl'}],
 restore:[{cover:'restore',title:'旧照修复练习',kind:'作品',target:'work?item=restore'},{cover:'portrait',title:'旧照片修复：从判断破损到复查',kind:'教程',target:'tutorial'},{cover:'restore',title:'旧照片修复',kind:'AI 应用',target:'app?item=restore'}],
 writing:[{cover:'writing',title:'文案改写',kind:'AI应用',target:'app?item=copy'},{cover:'interior',title:'写给夏天的一封信',kind:'文字作品',target:'work?item=letter'}],
 repair:[{cover:'portrait',title:'人像修复：保留自然肤色',kind:'作品',target:'work?item=repair-portrait'},{cover:'restore',title:'旧照修复练习',kind:'作品',target:'work?item=restore'},{cover:'writing',title:'旧照片修复：从判断破损到复查',kind:'教程',target:'tutorial'}]
};
// The preview and detail share the same curated selection.
topicPreviews.perfume.push({cover:'perfume',title:'产品换背景',kind:'AI应用',target:'app?item=background'},{cover:'sea',title:'产品短片制作',kind:'AI应用',target:'app?item=video'},{cover:'interior',title:'在海边住一下午',kind:'作品',target:'work?item=interior'});
topicPreviews.character.push({cover:'cat',title:'西瓜味的夏天',kind:'作品',target:'work?item=cat'},{cover:'portrait',title:'把阳光留在眼睛里',kind:'作品',target:'work?item=portrait'},{cover:'dog',title:'快乐没有理由',kind:'作品',target:'work?item=dog'});
topicPreviews.restore.push({cover:'portrait',title:'保留自然肤色',kind:'作品',target:'work?item=repair-portrait'},{cover:'interior',title:'空间照片修复练习',kind:'作品',target:'work?item=repair-interior'},{cover:'cat',title:'宠物照片细节修复',kind:'作品',target:'work?item=repair-pet'});
topicPreviews.repair.push({cover:'anime',title:'角色图像修复与配色',kind:'作品',target:'work?item=repair-color'},{cover:'interior',title:'空间照片修复练习',kind:'作品',target:'work?item=repair-interior'},{cover:'cat',title:'宠物照片细节修复',kind:'作品',target:'work?item=repair-pet'});
type TopicRow={id:string;title:string;status:string;detail?:string};
const subscribeTopics=(cb:()=>void)=>{window.addEventListener('bp-slots-change',cb);window.addEventListener('bp-operations-change',cb);window.addEventListener('storage',cb);return()=>{window.removeEventListener('bp-slots-change',cb);window.removeEventListener('bp-operations-change',cb);window.removeEventListener('storage',cb);};};
const topicSnapshot=()=>[sessionStorage.getItem('bp-operations-management-v1'),sessionStorage.getItem('bp-op-topics'),...Object.keys(sessionStorage).filter(key=>key.startsWith('bp-op-topic-public-')).sort().map(key=>sessionStorage.getItem(key))].join('|');
const targetForRef=(id:string)=>id==='work-1'?'work?item=restore':id==='post-1'?'post?item=restore':id==='tutorial-1'?'tutorial?item=restore':id==='app-1'?'app?item=copy':id==='resource-1'?'app?item=restore':/^(work|post|tutorial|app|resource)-/.test(id)?id.split('-')[0]+'?id='+id:'';
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
  useEffect(()=>{queueMicrotask(()=>setShareSlot(document.getElementById('topic-share-slot')))},[]);
  const contentDB=useB();
  useSyncExternalStore(subscribeTopics,topicSnapshot,()=>'');
  const rows:TopicRow[]|null=typeof window==='undefined'?null:(()=>{try{const stored=JSON.parse(sessionStorage.getItem('bp-op-topics')||'null') as TopicRow[]|null;if(!stored)return null;const launch=publicOperationRows(readOperations().rows.topics).find(r=>r.id==='tp-launch');return launch&&!stored.some(r=>r.id===launch.id)?[...stored,{id:launch.id,title:launch.name,status:launch.status,detail:launch.summary}]:stored;}catch{return null;}})();
  const previewVisible=(card:TopicPreview)=>{if(hiddenPublicTarget(card.target))return false;const [kind,query]=card.target.split('?');const q=new URLSearchParams(query||'');const item=q.get('item');const id=q.get('id')||(kind==='work'?(item==='restore'?'work-1':'work-'+item):!item||item==='restore'||item==='copy'?kind+'-1':kind+'-'+item);const record=contentDB.records.find(r=>r.id===id);return !record||record.publicStatus==='公开';};
  const tutorialVisible=contentDB.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开';
  const appVisible=contentDB.records.find(r=>r.id==='app-1')?.publicStatus==='公开';
  const hasVisibleItem=(id:string)=>{try{const raw=sessionStorage.getItem('bp-op-topic-public-'+id);if(raw){const refs=(JSON.parse(raw) as {refs:string[]}).refs;return refs.some(ref=>contentDB.records.some(r=>r.id===ref&&r.publicStatus==='公开'&&!hiddenPublicTarget(targetForRef(ref))));}}catch{/* fixed sample */}return id!=='tp-restore'||tutorialVisible;};
  const visibleThemes=rows?rows.filter(r=>r.status==='已发布'&&hasVisibleItem(r.id)).map(r=>{const key=r.id.replace(/^tp-/,'');const base=themes.find(t=>t[3]==='topic?theme='+key)||(key==='perfume'?themes[0]:themes[0]);return [base[0],r.title,r.detail||base[2],key==='perfume'?'topic':'topic?theme='+key];}):themes.filter(([,name])=>(name!=='图像修复'||tutorialVisible)&&(name!=='写作表达'||appVisible)).map(t=>{const key=new URLSearchParams(t[3].split('?')[1]||'').get('theme')||'perfume';const row=typeof window==='undefined'?undefined:publicOperationRows(readOperations().rows.topics).find(r=>r.id==='tp-'+key);return row?.sections?.length?[t[0],row.name,row.summary||t[2],t[3]]:t;});
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
  const config=typeof window==='undefined'?null:(()=>{try{const stored=JSON.parse(sessionStorage.getItem('bp-op-topic-public-'+selectedId)||'null') as {title:string;intro?:string;cover?:string;refs:string[];sections?:TopicSection[]}|null;if(stored)return stored;const row=publicOperationRows(readOperations().rows.topics).find(x=>x.id===selectedId&&x.status==='已发布');return row?{title:row.name,intro:row.summary,cover:typeof row.cover==='string'?row.cover:undefined,refs:Array.isArray(row.refs)?row.refs.map(String):[],sections:row.sections}:null;}catch{return null;}})();
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
  if(page==='topics'&&params?.get('device')==='pc')return <><p className="topic-list-intro">从一个主题，发现更多创作可能</p><div className="topic-showcases" aria-label="精选专题">{visibleThemes.map(([cover,name,desc,target],index)=>{const key=new URLSearchParams(target.split('?')[1]||'').get('theme')||'perfume';let cards=topicPreviews[key]||topicPreviews.perfume;try{const raw=sessionStorage.getItem('bp-op-topic-public-tp-'+key);const fallback=publicOperationRows(readOperations().rows.topics).find(r=>r.id==='tp-'+key);const configured=raw?JSON.parse(raw):fallback;if(configured){cards=(configured.refs as string[]).flatMap(id=>{const r=contentDB.records.find(r=>r.id===id&&r.publicStatus==='公开');return r?.public?[{cover:r.kind==='work'&&/\.(png|jpe?g|webp)(\?|$)/i.test(r.public.core||'')?r.public.core:r.public.cover||cover,title:r.public.title,kind:r.kind==='work'?'作品':r.kind==='tutorial'?'教程':r.kind==='app'?'AI应用':'内容',target:targetForRef(id)}]:[];})}}catch{}return <section key={name} className={'topic-showcase tone-'+key}><div className="topic-showcase-art"><img src={'/home-prototype/'+cover+'.png'} alt=""/><div className="topic-showcase-copy"><span className="topic-showcase-index">精选专题 / {String(index+1).padStart(2,'0')}</span><h2>{name}</h2><p>{desc}</p><small className="topic-showcase-count">{cards.filter(previewVisible).length} 项精选内容</small><button onClick={()=>go(target)} aria-label={'查看专题：'+name}>探索专题 <img src="/home-prototype/icons/arrow-right-line.svg" alt=""/></button></div></div><div className="topic-showcase-content"><div className="topic-showcase-caption"><span>从灵感到实践</span><button onClick={()=>go(target)}>查看全部 <span aria-hidden="true">↗</span></button></div><div className="topic-showcase-grid">{cards.filter(previewVisible).slice(0,6).map(card=><button className="topic-showcase-item" key={card.target} onClick={()=>go(card.target)} aria-label={'查看'+card.kind+'：'+card.title}><div className="topic-showcase-image"><img src={topicImage(card.cover)} alt={card.title}/><span>{card.kind}</span></div><div className="topic-showcase-item-title"><strong>{card.title}</strong><img src="/home-prototype/icons/arrow-right-s-line.svg" alt=""/></div></button>)}</div></div></section>})}<div>{s==='more-error'?<div className="cp-state cp-small"><p>更多专题加载失败</p><button onClick={()=>setRetry(true)}>重试</button></div>:<p className="cp-end">已浏览全部专题</p>}</div></div></>;
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
  if(theme&&!Object.hasOwn(topicPreviews,theme)&&!selectedRow&&!config||rows&&(selectedRow?.status!=='已发布'||!hasVisibleItem(selectedId)))return <section className="cp-state"><h2>专题暂不可访问</h2><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section>;
  if((theme==='restore'&&!tutorialVisible)||(theme==='writing'&&!appVisible))return <section className="cp-state"><h2>专题暂不可浏览</h2><p>当前没有公开内容。</p><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section>;
  const intro=config?.intro||selectedRow?.detail||cover[2];
 const cardForRef=(id:string):TopicPreview[]=>{const r=contentDB.records.find(r=>r.id===id&&r.publicStatus==='公开');const target=targetForRef(id);return r?.public&&target&&!hiddenPublicTarget(target)?[{cover:r.kind==='work'&&/\.(png|jpe?g|webp)(\?|$)/i.test(r.public.core||'')?r.public.core:r.public.cover||cover[0],title:r.public.title,kind:r.kind==='work'?'作品':r.kind==='app'?'AI应用':r.kind==='tutorial'?'教程':r.kind==='post'?'帖子':'资源',target}]:[];};
 const groupedSections:TopicDisplaySection[]=s==='empty'?[]:(config?.sections||[]).map(x=>({...x,cards:x.refs.flatMap(cardForRef)})).filter(x=>x.cards.length);
 const isGrouped=!!config?.sections?.length;
  const shareButton=<button onClick={async()=>{
        try{
          const share=new URL('/community-options/c-prototype',location.origin);share.searchParams.set('page','topic');if(theme)share.searchParams.set('theme',theme);
          await navigator.clipboard.writeText(share.toString());setNotice('链接已复制');
        }catch{setNotice('复制失败，请重试');}
      }}><img src="/home-prototype/icons/share-forward-line.svg" alt=""/>分享</button>;
  if(params?.get('device')==='pc') {
    const cards:TopicPreview[]=s==='empty'?[]:config?config.refs.flatMap(id=>{const r=contentDB.records.find(r=>r.id===id&&r.publicStatus==='公开');const target=targetForRef(id);return r?.public&&target&&!hiddenPublicTarget(target)?[{cover:r.public.cover||cover[0],title:r.public.title,kind:r.kind==='work'?'作品':r.kind==='app'?'AI应用':r.kind==='tutorial'?'教程':r.kind==='post'?'帖子':'资源',target}]:[];}):(topicPreviews[theme||'perfume']||topicPreviews.perfume).filter(previewVisible);
    return <><DesktopTopic key={selectedId} title={config?.title||selectedRow?.title||cover[1]} intro={intro} cards={cards} sections={isGrouped?groupedSections:[]} cover={config?.cover||cover[0]} share={shareButton} go={go}/><TransientFeedback message={notice} onClear={()=>setNotice('')}/></>;
  }
  return (
    <article className="cp-topic-detail">
      <div className="cp-topic-hero">
        <img src={topicImage(config?.cover||cover[0])} alt=""/>
        <div><h2>{config?.title||selectedRow?.title||cover[1]}</h2><p>{intro}</p></div>
      </div>
      {shareSlot?createPortal(shareButton,shareSlot):<div className="cp-topic-tools">{shareButton}</div>}
      <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
      {isGrouped&&s!=='empty' ? groupedSections.length?<TopicSections sections={groupedSections} go={go}/>:<p className="cp-end">暂无可浏览内容</p> : config && s!=='empty' ? <section className="cp-section"><h2>精选内容</h2>{config.refs.filter(id=>contentDB.records.some(r=>r.id===id&&r.publicStatus==='公开'&&!hiddenPublicTarget(targetForRef(id)))).map(id=>{const r=contentDB.records.find(x=>x.id===id)!;const target=targetForRef(id);return target?<button key={id} className="cp-row" onClick={()=>go(target)}><span><small>{r.kind==='app'?'AI应用':r.kind==='work'?'作品':r.kind==='post'?'帖子':r.kind==='tutorial'?'教程':'资源'}</small><strong>{r.public?.title}</strong></span><span>›</span></button>:null;})}</section> : s === 'empty' ? <section className="cp-state"><h2>暂无可浏览内容</h2><button className="cp-button" onClick={()=>go('topics')}>浏览其他专题</button></section> : params?.get('device')==='pc' ? <section className="cp-section"><h2>精选内容</h2><div className="topic-showcase-grid topic-detail-picks">{(topicPreviews[theme||'perfume']||topicPreviews.perfume).filter(previewVisible).map(card=><button className="topic-showcase-item" key={card.target} onClick={()=>go(card.target)}><div className="topic-showcase-image"><img src={'/home-prototype/'+card.cover+'.png'} alt={card.title}/><span>{card.kind}</span></div><div className="topic-showcase-item-title"><strong>{card.title}</strong></div></button>)}</div></section> : theme === 'writing' || theme === 'character' ? (
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


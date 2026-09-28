'use client';
import {HomeSkeleton} from './home-skeleton';
import {MobileHeader} from '../community-header';
import {MobileNavigation} from '../mobile-navigation';
/* oxlint-disable next/no-img-element -- Approved local homepage assets. */
import { prototypeStore as sessionStorage } from '../c-prototype/storage';
import { useState, useSyncExternalStore } from 'react';
import {useFeatured,workSampleId} from '../c-prototype/featured';
import {useB} from '../b-prototype/store';
import {subscribeSlots,slotSnapshot,readPublishedSlots,resolveSlotTarget} from '../c-prototype/slots';
function subscribePrefs(fn: () => void) {
  window.addEventListener('cp-home-change', fn);
  return () => window.removeEventListener('cp-home-change', fn);
}
const readPrefs = () => sessionStorage.getItem('cp-home') || '全部';
import './mobile.css';
import {WorkFeed} from '../c-prototype/work-feed';
const base = '/home-prototype/';
const items = [
  ['girl', '夏日的转角', '周与斯', '1.2k', 'IP与文创', '3/4'],
  ['cat', '西瓜味的夏天', '小鹿', '862', '生活', '1/1'],
  ['perfume', '一瓶夏日晴光', '鹿与光', '617', '电商营销', '4/3'],
  ['portrait', '把阳光留在眼睛里', '夏目川', '2.3k', '摄影', '3/4'],
  ['anime', '风从蓝色花间经过', 'Tide', '982', 'IP与文创', '4/3'],
  ['sea', '日落之前', '陈屿', '726', '摄影', '16/9'],
  ['cup', '柠檬与蓝花杯', '鹿与光', '328', '电商营销', '1/1'],
  ['underwater', '沉入一场蓝色的梦', '拾光', '3.1k', '设计', '9/16'],
  ['interior', '在海边住一下午', '林间', '536', '生活', '4/3'],
  ['dog', '快乐没有理由', '小野', '1.1k', '生活', '1/1'],
];

function I({ name }: { name: string }) {
  return (
    <img
      className="mh-icon"
      src={base + 'icons/' + name + '-line.svg'}
      alt=""
    />
  );
}
export default function MobileHome({
  initialState = 'normal',
  navigate,
  contentOnly = false,
}: {
  initialState?: string;
  contentOnly?: boolean;
  navigate?: (p: string) => void;
}) {
  const featured=useFeatured(),contentDB=useB();
  useSyncExternalStore(subscribeSlots,slotSnapshot,()=> '');
  const slots=readPublishedSlots('mobile'),banner=slots.find(s=>s.type==='首页 Banner');
  const prefs = useSyncExternalStore(
    subscribePrefs,
    readPrefs,
    () => '全部',
  );
  const category = prefs.split('|')[0];
  const setCategory = (category: string) => {
    sessionStorage.setItem('cp-home', category);
    window.dispatchEvent(new Event('cp-home-change'));
  };
  const [state, setState] = useState(initialState);
  const go = (p: string) => {
    if (navigate) navigate(p);
    else {
      const [id, q] = p.split('?');
      window.location.href =
        '/community-options/c-prototype?page=' + id + (q ? '&' + q : '');
    }
  };
  const selectedItems=featured?featured.works.flatMap(id=>{const r=contentDB.records.find(x=>x.id===id);if(!r||r.publicStatus!=='公开'||!r.recommended)return [];const key=workSampleId(id),existing=items.find(w=>w[0]===key);return [[...(existing||[key,r.public?.title||'',r.public?.author||'','0','生活','4/3']),existing?base+key+'.png':r.public?.core.startsWith('/')?r.public.core:'',id]];}):items.filter(w=>{const r=contentDB.records.find(r=>r.id==='work-'+w[0]);return !r||r.publicStatus==='公开';});
  const filtered = selectedItems.filter(
    (w) => category === '全部' || w[4] === category,
  );
  const feed = filtered;
  return (
    <div className={'mh-root'+(contentOnly?' mh-content-only':'')} data-page="home" data-state={state}>
      {!contentOnly&&<MobileHeader home go={go}/>}
      <main>{state==='loading'?<HomeSkeleton/>:<>
        {state !== 'banner-hidden' && banner && (
          <button
            className="mh-banner"
            aria-label={banner.title}
            onClick={() =>
              go(
                state === 'banner-ended'
                  ? 'activity?state=ended'
                  : state === 'banner-removed'
                    ? 'activity?state=removed'
                    : resolveSlotTarget(banner.target)?.page||'activities',
              )
            }
          >
            {state === 'image-error' ? (
              <strong>一起画个夏天</strong>
            ) : (
              <img src={base + 'banner.png'} alt="一起画个夏天" />
            )}
            {state === 'banner-ended' && (
              <span className="mh-banner-ended">活动已结束</span>
            )}
          </button>
        )}
        <nav className="mh-quick" aria-label="快捷入口">
          {slots.filter(s=>s.type==='金刚区').map(slot=>{const label=slot.title,target=resolveSlotTarget(slot.target)?.page||'home',icon=({apps:'box-3',topics:'star',activities:'gift',checkin:'check'} as Record<string,string>)[target]||'arrow-right-s';return (
            <button key={target} onClick={() => go(target)}>
              <span>
                <I name={icon} />
              </span>
              {label}
            </button>
          );})}
        </nav>
        <div className="mh-topics-heading">
          <h2>精选专题</h2>
          <button onClick={() => go('topics')}>
            全部
            <I name="arrow-right-s" />
          </button>
        </div>
        <div className="mh-topics">
          {[
            ['perfume', '电商营销', ''],
            ['anime', '角色创作', 'character'],
            ['restore', '图像修复', 'restore'],
            ['writing', '写作表达', 'writing'],
          ].map(([image, title, theme]) => (
            <button
              key={title}
              onClick={() => go('topic' + (theme ? '?theme=' + theme : ''))}
            >
              <img src={base + image + '.png'} alt="" />
              <span>{title}</span>
            </button>
          ))}
        </div>
        <nav className="mh-categories" aria-label="内容分类">
          {['全部', '电商营销', 'IP与文创', '摄影', '设计', '生活'].map((c) => (
            <button
              key={c}
              className={category === c ? 'active' : ''}
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </nav>
        {state === 'error' || state === 'empty' ? (
          <div className="mh-empty">
            <p>{state === 'error' ? '作品加载失败' : '暂无作品'}</p>
            <button
              onClick={() => {
                setState('normal');
                if (state === 'empty') setCategory('全部');
              }}
            >
              {state === 'error' ? '重试' : '返回全部'}
            </button>
          </div>
        ) : (
          <>
            <WorkFeed items={feed.map(w=>({id:w[0],title:w[1],author:w[2],likes:w[3],image:w[7]&&!w[6]?'':w[6]||base+w[0]+'.png',type:w[0]==='sea'?'视频':'图片',target:(w[7]?'work?id='+w[7]+'&item=':'work?item=')+w[0]+(w[0]==='sea'?'&state=video':'')}))} go={go}/>
            {state === 'more-error' ? (
              <div className="mh-empty">
                <p>更多作品加载失败</p>
                <button
                  onClick={() => {
                    setState('normal');
                  }}
                >
                  重试
                </button>
              </div>
            ) : (
              <p className="mh-list-end">没有更多了</p>
            )}
          </>
        )}
      </>}</main>
      {!contentOnly&&<MobileNavigation active="home" go={(target)=>target==='home'?window.scrollTo({top:0,behavior:'smooth'}):go(target)} />}
    </div>
  );
}


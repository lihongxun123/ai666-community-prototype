'use client';
import {SearchSuggestions,rememberSearch} from '../search-suggestions';
/* eslint-disable next/no-img-element -- Local prototype images are served from the existing public asset set. */

import {
  prototypeStore as sessionStorage,
  getFavorites,
  toggleFavorite,
} from './storage';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './reading.css';
import {CirclesPage,CirclePage} from './circle-pages';
import {WorkDetailsExtras,WorkMedia} from './work-details-extras';
import {WorkFeed} from './work-feed';
import {CommunityLanding,communityTutorials} from './community-landing';
import { useB } from '../b-prototype/store';
import {samplePosts,sampleCircles,postTarget,circleTarget} from './content-data';
const closedCircle=(id:string)=>{
  try{const rows=JSON.parse(sessionStorage.getItem('bp-op-circles')||'[]') as {id:string;status:string}[];return rows.some(r=>r.id==='ci-'+id&&r.status==='已关闭');}catch{return false;}
};
const currentCircles=()=>{
  try{const raw=sessionStorage.getItem('bp-op-circles');if(raw){const rows=JSON.parse(raw) as {id:string;title:string;detail?:string}[];const managed=rows.map(r=>({id:r.id.replace(/^ci-/,''),name:r.title,description:r.detail||'',cover:sampleCircles.find(c=>c.id===r.id.replace(/^ci-/,''))?.cover||'restore'}));return [...managed,...sampleCircles.filter(c=>!managed.some(r=>r.id===c.id))];}}catch{/* fixed local examples */}
  return sampleCircles;
};

const returnToContent=()=>{const q=new URLSearchParams(location.search),page=q.get('page');if(page==='tutorial')return ['tutorials','返回官方教程'];if(q.get('device')!=='pc')return ['community','返回社区'];return page==='work'?['aigc','返回作品']:page==='post'?['discussion','返回交流']:['home','返回首页'];};
type Props = { page: string; state: string; go: (page: string) => void };
type PageMeta = { id: string; title: string; module: string; states: string[] };

export const readingPages: PageMeta[] = [
  {id:'aigc',title:'AIGC',module:'阅读与交流',states:['normal','loading','empty','error']},
  {id:'discussion',title:'交流',module:'阅读与交流',states:['normal','loading','empty','error']},
  {
    id: 'community',
    title: '社区',
    module: '阅读与交流',
    states: ['normal', 'loading', 'empty', 'error', 'more-error'],
  },
  {
    id: 'post',
    title: '帖子详情',
    module: '阅读与交流',
    states: [
      'normal',
      'loading',
      'removed',
      'partial',
      'forbidden',
      'action-error',
      'guest',
    ],
  },
  {
    id: 'circles',
    title: '圈子',
    module: '阅读与交流',
    states: ['normal', 'loading', 'empty', 'error'],
  },
  {
    id: 'circle',
    title: '圈子详情',
    module: '阅读与交流',
    states: ['normal', 'empty', 'closed', 'removed', 'forbidden', 'guest'],
  },
  {
    id: 'tutorials',
    title: '官方教程',
    module: '阅读与交流',
    states: ['normal', 'loading', 'empty', 'error', 'more-error'],
  },
  {
    id: 'tutorial',
    title: '教程详情',
    module: '阅读与交流',
    states: [
      'normal',
      'loading',
      'removed',
      'partial',
      'forbidden',
      'action-error',
      'guest',
    ],
  },
  {
    id: 'work',
    title: '作品详情',
    module: '阅读与交流',
    states: [
      'normal',
      'text',
      'video',
      'media-error',
      'loading',
      'removed',
      'partial',
      'forbidden',
      'action-error',
      'guest',
    ],
  },
  {
    id: 'search',
    title: '搜索',
    module: '发现',
    states: ['normal', 'idle', 'empty', 'error', 'partial'],
  },
  {
    id: 'author',
    title: '作者主页',
    module: '发现',
    states: ['normal', 'empty', 'removed', 'forbidden', 'guest'],
  },
  {
    id: 'resource',
    title: '资源详情',
    module: '阅读与交流',
    states: [
      'normal',
      'loading',
      'removed',
      'paused',
      'view-only',
      'revoked',
      'forbidden',
      'action-error',
      'guest',
    ],
  },
];

const img = (name: string) => `/home-prototype/${name}.png`;
const icon = (name: string) => `/home-prototype/icons/${name}-line.svg`;
const signedIn = () =>
  typeof window !== 'undefined' && sessionStorage.getItem('cp-auth') === '1';
const loginFor = (go: (page: string) => void) => {
  if (typeof window !== 'undefined') {
    const q = new URLSearchParams(window.location.search);
    const id = q.get('page') || 'community';
    q.delete('page');
    if (q.get('state') === 'guest') q.delete('state');
    sessionStorage.setItem('cp-return', id + '?' + q.toString());
  }
  go('login');
};

function Icon({ name }: { name: string }) {
  return <img className="reading-icon" src={icon(name)} alt="" />;
}
function Picture({
  name,
  alt,
  tall = false,
}: {
  name: string;
  alt: string;
  tall?: boolean;
}) {
  return (
    <img
      className={`reading-picture${tall ? ' tall' : ''}`}
      src={img(name)}
      alt={alt}
    />
  );
}
function Head(_props: {
  title: string;
  desc?: string;
  go?: (p: string) => void;
  back?: string;
}) {
  return null;
}
function Button({
  children,
  onClick,
  quiet = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  quiet?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`reading-button${quiet ? ' quiet' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="reading-tag">{children}</span>;
}
function Panel({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="reading-panel">
      <strong>{title}</strong>
      <p>{body}</p>
      {action && (
        <Button quiet onClick={onAction}>
          {action}
        </Button>
      )}
    </div>
  );
}
function Persona({
  go,
  aside,
  name = '林间',
}: {
  go: (p: string) => void;
  aside?: string;
  name?: string;
}) {
  return (
    <div className="reading-persona">
      <button
        type="button"
        className="reading-avatar"
        onClick={() => go('author?name=' + encodeURIComponent(name))}
      >
        {name.slice(0, 1)}
      </button>
      <div>
        <button
          type="button"
          className="reading-link strong"
          onClick={() => go('author?name=' + encodeURIComponent(name))}
        >
          {name}
        </button>
        <small>{aside || '9月24日 · 公开'}</small>
      </div>
    </div>
  );
}
function Jump({
  title,
  desc,
  cover,
  tag,
  target,
  go,
}: {
  title: string;
  desc?: string;
  cover?: string;
  tag?: string;
  target: string;
  go: (p: string) => void;
}) {
  const db=useB();
  const k=target==='tutorial'?'tutorial':target==='resource'?'resource':target==='post'?'post':target==='work?item=restore'?'work':null;
  const current=k?db.records.find(r=>r.id===k+'-1'):null;
  if(current&&current.publicStatus!=='公开')return k==='resource'?<p>关联资源暂不可用</p>:null;
  if(current?.publishedRevision&&current.publishedRevision>1)title=current.public?.title||title;
  return (
    <button type="button" className="reading-jump" onClick={() => go(target)}>
      {cover && <img src={img(cover)} alt="" />}
      <span>
        {tag && <Tag>{tag}</Tag>}
        <strong>{title}</strong>
        {desc && <small>{desc}</small>}
      </span>
      <Icon name="arrow-right" />
    </button>
  );
}

function interactionTarget(){
  if(typeof window==='undefined')return '';
  const q=new URLSearchParams(location.search),page=q.get('page')||'work';
  const id=q.get('id');const item=q.get('item')||(page==='app'?'copy':'restore');
  const aliases:Record<string,string>={'app-1':'app?item=copy','work-perfume':'work?item=perfume','work-sea':'work?item=sea','work-1':'work?item=restore','post-1':'post?item=restore','tutorial-1':'tutorial?item=restore','resource-1':'resource?item=restore'};
  return id?(aliases[id]||page+'?id='+encodeURIComponent(id)):page+'?item='+encodeURIComponent(item);
}
export function ActionBar({
  kind,
  go,
  guest = false,
  failOnAction = false,
}: {
  kind: string;
  go: (page: string) => void;
  guest?: boolean;
  failOnAction?: boolean;
}) {
  const likeKey='cp-like:'+kind+':'+(new URLSearchParams(interactionTarget().split('?')[1]||'').get('item')||interactionTarget());
  const [liked, setLiked] = useState(()=>sessionStorage.getItem(likeKey)==='1');
  const [saved, setSaved] = useState(() =>
    getFavorites().some((x) => x.target === interactionTarget()),
  );
  const [open, setOpen] = useState<'share' | ''>('');
  const [failNext, setFailNext] = useState(failOnAction);
  const [toast, setToast] = useState(failOnAction ? '操作未完成，请重试' : '');
  const toggle = (name: 'like' | 'save') => {
    if (guest || !signedIn()) {
      loginFor(go);
      return;
    }
    if (failNext) {
      setFailNext(false);
      setToast('操作未完成，请重试');
      return;
    }
    if (name === 'like') {
      sessionStorage.setItem(likeKey,liked?'0':'1');
      setLiked(!liked);
      setToast(liked ? '已取消喜欢' : '已喜欢');
    } else {
      setSaved(
        toggleFavorite({
          target: interactionTarget(),
          title:
            document.querySelector('main .reading-title')?.textContent ||
            document.querySelector('main h2')?.textContent ||
            '收藏内容',
          type: ({work:'作品',tutorial:'教程',app:'AI 应用',post:'帖子',resource:'资源'} as Record<string,string>)[kind]||'内容',
        }),
      );
      setToast(saved ? '已取消收藏' : '已收藏，可在我的找回');
    }
  };
  const share = async () => {
    try {
      await navigator.clipboard.writeText(new URL('/community-options/c-prototype?page='+interactionTarget().replace('?','&'),location.origin).toString());
      setToast('链接已复制');
      setOpen('');
    } catch {
      setToast('复制失败，请重试');
    }
  };
  return (
    <div className="reading-actions-wrap">
      <div className="reading-actions">
        <button type="button" aria-pressed={liked} onClick={() => toggle('like')}>
          <Icon name="heart" />
          {liked ? '已喜欢' : '喜欢'}
        </button>
        {(
          <button type="button" aria-pressed={saved} onClick={() => toggle('save')}>
            <Icon name="bookmark" />
            {saved ? '已收藏' : '收藏'}
          </button>
        )}
        <button
          type="button"
          onClick={() =>
            document
              .getElementById('reading-comments')
              ?.scrollIntoView({ behavior: 'smooth',block:'start' })
          }
        >
          <Icon name="chat-3" />
          评论
        </button>
        <button
          type="button"
          onClick={() => setOpen(open === 'share' ? '' : 'share')}
        >
          <Icon name="share-forward" />分享
        </button>
      </div>
      {toast && <output className="reading-toast">{toast}</output>}
      {open === 'share' && (
        <div className="reading-sheet">
          <strong>
            分享当前
            {kind === 'post'
              ? '帖子'
              : kind === 'tutorial'
                ? '教程'
                : kind === 'work'
                  ? '作品'
                  : kind === 'app' ? '应用' : '资源'}
          </strong>
          <Button onClick={share}>复制链接</Button>
          <Button quiet onClick={() => setOpen('')}>
            取消
          </Button>
        </div>
      )}

    </div>
  );
}

export function Comments({
  go,
  kind,
  guest = false,
}: {
  go: (p: string) => void;
  kind: string;
  guest?: boolean;
}) {
  const contentKey=interactionTarget()||kind;
  const pendingKey = `reading-pending-comment:${contentKey}`;
  const inputRef=useRef<HTMLTextAreaElement>(null);
  type Entry={id:string;text:string;reply:string;edited?:boolean};
  const commentKey='reading-comments:'+contentKey;
  const [entries,setEntries]=useState<Entry[]>(()=>{try{const saved=sessionStorage.getItem(commentKey);if(saved)return JSON.parse(saved);const text=sessionStorage.getItem('reading-comment:'+contentKey);return text&&sessionStorage.getItem('reading-comment-deleted:'+contentKey)!=='1'?[{id:'legacy',text,reply:sessionStorage.getItem('reading-reply:'+contentKey)||''}]:[];}catch{return [];}});
  const persist=(next:Entry[])=>{setEntries(next);sessionStorage.setItem(commentKey,JSON.stringify(next));};
  const [confirmDelete,setConfirmDelete]=useState('');
  const [text, setText] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : sessionStorage.getItem(pendingKey) || '',
  );
  const [replyTo, setReplyTo] = useState(()=>sessionStorage.getItem('reading-pending-reply:'+contentKey)||'');
  useEffect(()=>{sessionStorage.setItem('reading-pending-reply:'+contentKey,replyTo);},[replyTo,contentKey]);
  const [editing, setEditing] = useState('');
  const [error, setError] = useState('');
  const [expand, setExpand] = useState(false);
  const focusEditor = () => requestAnimationFrame(() => {
    const input = inputRef.current;
    input?.focus({preventScroll:true});
    input?.closest('.reading-comment-editor')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  const send = () => {
    const value = text.trim();
    if (!value) {
      setError('请输入评论内容');
      return;
    }
    if (value.length > 1000) {
      setError(`已输入 ${value.length} 字，最多 1000 字`);
      return;
    }
    if (guest || !signedIn()) {
      sessionStorage.setItem(pendingKey, value);
      loginFor(go);
      return;
    }
    if(!editing)sessionStorage.removeItem(pendingKey);
    persist(editing?entries.map(e=>e.id===editing?{...e,text:value,edited:true}:e):[...entries,{id:crypto.randomUUID(),text:value,reply:replyTo}]);
    setEditing('');
    setReplyTo('');
    setText(editing?sessionStorage.getItem(pendingKey)||'':'');
    setError('评论已提交');
  };
  return (
    <section id="reading-comments" className="reading-comments">
      <h2>
        评论 <span>{2+entries.length}</span>
      </h2>
      <div className="reading-comment">
        <span className="reading-avatar mini">周</span>
        <div>
          <strong>周末观察</strong>
          <p>这一步如果只有手机，先准备什么最合适？</p>
          <button
            type="button"
            className="reading-link"
            onClick={() => {
              setReplyTo('周末观察');
              if(editing)setText(sessionStorage.getItem(pendingKey)||'');setEditing('');setExpand(true);
              focusEditor();
            }}
          >
            回复
          </button>
          <button
            type="button"
            className="reading-link reading-expand-replies"
            aria-expanded={expand}
            onClick={() => setExpand(!expand)}
          >
            {expand ? '收起回复' : '查看 1 条回复'}
          </button>
          {expand && (
            <div className="reading-reply">
              <strong>林间 <span>回复 周末观察</span></strong>
              <p>先整理素材和目标效果，电脑操作的步骤可以稍后完成。</p><button type="button" className="reading-link" onClick={()=>{setReplyTo('林间');if(editing)setText(sessionStorage.getItem(pendingKey)||'');setEditing('');focusEditor();}}>回复</button>
            </div>
          )}
        </div>
      </div>
      {entries.map(entry=><div className="reading-comment" key={entry.id}><span className="reading-avatar mini">我</span><div><strong>我 {entry.reply&&<small>回复 {entry.reply}</small>} {entry.edited&&<small>已编辑</small>}</strong><p>{entry.text}</p><button type="button" className="reading-link" onClick={()=>{setText(entry.text);setEditing(entry.id);setReplyTo('');focusEditor();}}>编辑</button><button type="button" className="reading-link" onClick={()=>setConfirmDelete(entry.id)}>删除</button></div></div>)}
      {confirmDelete&&<div className="reading-delete-confirm" aria-label="删除评论确认"><span>删除这条评论？</span><button onClick={()=>setConfirmDelete('')}>取消</button><button onClick={()=>{persist(entries.filter(e=>e.id!==confirmDelete));if(editing===confirmDelete){setEditing('');setText(sessionStorage.getItem(pendingKey)||'');}setConfirmDelete('');}}>删除</button></div>}
      <div className="reading-comment-editor">
      {editing&&<p className="reading-reply-target">编辑评论 <button type="button" onClick={()=>{setEditing('');setText('');}}>取消</button></p>}
      {replyTo && (
        <p className="reading-reply-target">
          回复 {replyTo}{' '}
          <button type="button" onClick={() => setReplyTo('')}>
            取消
          </button>
        </p>
      )}
      <textarea
        id="reading-comment-input" ref={inputRef}
        className="reading-textarea" aria-label={replyTo?'回复 '+replyTo:'评论内容'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if(!editing)sessionStorage.setItem(pendingKey,e.target.value);
          setError('');
        }}
        placeholder="说点什么…"
      />
      <div className="reading-compose">
        <span className={text.trim().length > 1000 ? 'reading-over' : ''}>
          {text.trim().length}/1000
        </span>
        <Button disabled={!text.trim()||text.trim().length>1000} onClick={send}>{editing ? '保存修改' : '发布'}</Button>
      </div>
      </div>
      {error && <output className="reading-feedback">{error}</output>}
    </section>
  );
}

function detailState({ page, state, go }: Props) {
  const label: Record<string, string> = {
    work: '作品',
    post: '帖子',
    tutorial: '教程',
    resource: '资源',
    circle: '圈子',
    author: '作者主页',
  };
  const noun = label[page] || '内容';
  if (
    state === 'normal' ||
    state === 'action-error' ||
    state === 'guest' ||
    state === 'partial' ||
    state === 'paused' ||
    state === 'view-only' ||
    state === 'revoked' ||
    state === 'closed' ||
    state === 'empty'
  )
    return null;
  if (state === 'loading')
    return (
      <>
        <Head title={`正在打开${noun}`} go={go} back="community" />
        <div className="reading-skeleton" />
        <div className="reading-skeleton short" />
        <div className="reading-skeleton" />
      </>
    );
  const removed = state === 'removed';
  return (
    <>
      <Head title={noun} go={go} back="community" />
      <Panel
        title={removed ? `${noun}暂时不可访问` : '当前无法查看'}
        body={
          removed
            ? '内容状态已变化，请返回继续浏览。'
            : '当前账号没有查看权限，仍可返回公开内容。'
        }
        action={returnToContent()[1]}
        onAction={() => go(returnToContent()[0])}
      />
    </>
  );
}

function Community({state,go}:Props){return <CommunityLanding state={state} go={go}/>;}

function Post({ state, go }: Props) {
  useEffect(()=>{if(new URLSearchParams(location.search).get('discussion')==='1')requestAnimationFrame(()=>document.getElementById('reading-comments')?.scrollIntoView());},[]);
  const id=typeof window==='undefined'?'restore':new URLSearchParams(window.location.search).get('item')||'restore';
  const post=samplePosts.find(p=>p.id===id);
  const db=useB();
  const cover = detailState({ page: 'post', state, go });
  if (cover) return cover;
  if(!post||(post.id==='restore'&&db.records.find(r=>r.id==='post-1')?.publicStatus!=='公开'))return <Panel title="帖子暂不可访问" action={returnToContent()[1]} onAction={()=>go(returnToContent()[0])}/>;
  return (
    <>
      <Head title="帖子" go={go} back="community" />
      <h2 className="reading-title">{post.title}</h2>
      <Persona go={go} name={post.author} aside={post.date} />
      <div className="reading-prose">
        {post.body.map(p=><p key={p}>{p}</p>)}
      </div>
      <Picture name={post.image} alt={post.title} />
      {post.circle&&sampleCircles.some(c=>c.name===post.circle)&&<button
        type="button"
        className="reading-link"
        onClick={() => go(circleTarget(sampleCircles.find(c=>c.name===post.circle)!.id))}
      >
        来自 · {currentCircles().find(c=>c.id===sampleCircles.find(c=>c.name===post.circle)?.id)?.name||post.circle}
      </button>}
      {post.reference&&(state === 'partial'||(post.reference==='work?item=restore'&&db.records.find(r=>r.id==='work-1')?.publicStatus!=='公开') ? (
        <Panel
          title="引用作品暂时不可访问"
          body="这篇帖子的正文与讨论仍可阅读。"
        />
      ) : (
        <Jump
          title={post.id==='restore'?'旧照修复练习':'一瓶夏日晴光'}
          desc="查看原作品及完整说明"
          tag="引用作品"
          cover={post.id==='restore'?'restore':'perfume'}
          target={post.reference}
          go={go}
        />
      ))}
      <ActionBar
        kind="post"
        go={go}
        guest={state === 'guest'}
        failOnAction={state === 'action-error'}
      />
      <Comments go={go} kind={'post-'+post.id} guest={state === 'guest'} />
    </>
  );
}

function Tutorials({state,go}:Props){return <CommunityLanding state={state} go={go} initialTab="tutorials" desktop={new URLSearchParams(location.search).get('device')==='pc'}/>;}

const getTutorialItem = () => new URLSearchParams(window.location.search).get('item') || 'restore';

function Tutorial({ state, go }: Props) {
  const db=useB();
  const [section, setSection] = useState('准备素材');
  const item = useSyncExternalStore(
    subscribeWorkItem,
    getTutorialItem,
    () => 'restore',
  );
  const cover = detailState({ page: 'tutorial', state, go });
  if (cover) return cover;
  if((item==='restore'&&db.records.find(r=>r.id==='tutorial-1')?.publicStatus!=='公开'))return <Panel title="教程暂不可访问" action="返回教程" onAction={()=>go('tutorials')}/>;
  if(!communityTutorials.some(t=>t.id===item))return <Panel title="教程暂不可访问" action="返回教程" onAction={()=>go('tutorials')}/>;
  const liveSample=communityTutorials.find(t=>t.id===item&&t.sections.length>0);
  if(liveSample)return <><Tag>官方教程</Tag><h2 className="reading-title">{liveSample.title}</h2><p className="reading-muted">多元拾光官方 · {liveSample.topic}</p><Picture name={liveSample.cover} alt={liveSample.title}/><nav className="reading-toc" aria-label="教程目录"><strong>目录</strong>{liveSample.sections.map(([title],i)=><button key={title} type="button" onClick={()=>document.getElementById('tutorial-step-'+i)?.scrollIntoView({behavior:'smooth'})}>{i+1} {title}</button>)}</nav><div className="reading-prose">{liveSample.sections.map(([title,text],i)=><section id={'tutorial-step-'+i} key={title}><h3>{title}</h3><p>{text}</p></section>)}</div><ActionBar kind="tutorial" go={go} guest={state==='guest'} failOnAction={state==='action-error'}/><Comments kind={'tutorial-'+item} go={go} guest={state==='guest'}/></>;
  if (item === 'product')
    return (
      <>
        <Tag>官方原创</Tag>
        <h2 className="reading-title">产品背景与光线的搭配</h2>
        <p className="reading-muted">多元拾光官方 · 9月24日正式更新</p>
        <p className="reading-lead">
          从产品主体出发，选背景、对光线，再检查边缘细节。
        </p>
        <Picture name="perfume" alt="香氛产品的光线与背景" />
        <div className="reading-facts">
          <span>适用：产品视觉</span>
          <span>准备：产品主体图</span>
          <span>形式：图文</span>
        </div>
        <div className="reading-toc">
          <strong>目录</strong>
          {['准备主体', '匹配光线', '复查边缘'].map((s, i) => (
            <button
              key={s}
              type="button"
              className={section === s ? 'active' : ''}
              onClick={() => {
                setSection(s);
                document
                  .getElementById(`reading-step-${i}`)
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {String(i + 1).padStart(2, '0')} {s}
            </button>
          ))}
        </div>
        <div className="reading-prose">
          <h3 id="reading-step-0">01 准备主体</h3>
          <p>
            先确定要突出的瓶身轮廓和标签信息，保留一份原图，再试不同的背景。
          </p>
          <h3 id="reading-step-1">02 匹配光线</h3>
          <p>
            观察产品上的高光方向。背景亮度与主体相近时，可以用轻微的明暗差拉开层次。
          </p>
          <h3 id="reading-step-2">03 复查边缘</h3>
          <p>
            放大查看瓶盖、玻璃边缘和投影，确认主体与背景之间没有明显的接缝。
          </p>
        </div>
        <Jump
          title="一瓶夏日晴光"
          desc="查看作品效果"
          tag="作品"
          cover="perfume"
          target="work?item=perfume"
          go={go}
        />
        <ActionBar
          kind="tutorial"
          go={go}
          guest={state === 'guest'}
          failOnAction={state === 'action-error'}
        />
        <Comments go={go} kind="tutorial-product" guest={state === 'guest'} />
      </>
    );
  return (
    <>
      <Head title="教程" go={go} back="tutorials" />
      <Tag>官方原创</Tag>
      <h2 className="reading-title">旧照片修复：从判断破损到复查</h2>
      <p className="reading-muted">多元拾光官方 · 9月24日正式更新</p>
      <p className="reading-lead">
        适合第一次尝试照片修复的人。先观察，再处理，最后与原图比较。
      </p>
      <Picture name="restore" alt="旧照片修复教程封面" />
      <div className="reading-facts">
        <span>适用：旧照修复入门</span>
        <span>准备：原图副本</span>
        <span>操作：部分步骤需电脑</span>
      </div>
      <div className="reading-toc">
        <strong>目录</strong>
        {['准备素材', '判断破损', '逐处修复', '复查结果'].map((s, i) => (
          <button
            key={s}
            type="button"
            className={section === s ? 'active' : ''}
            onClick={() => {
              setSection(s);
              document
                .getElementById(`reading-step-${i}`)
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {String(i + 1).padStart(2, '0')} {s}
          </button>
        ))}
      </div>
      <div className="reading-prose">
        <h3 id="reading-step-0">01 准备素材</h3>
        <p>保留一份未经修改的原图。尽量使用清晰扫描件，不直接覆盖唯一原件。</p>
        <h3 id="reading-step-1">02 判断破损</h3>
        <p>
          从边缘、背景和人物面部逐处标出需要处理的位置；细节不确定时先暂停判断。
        </p>
        <h3 id="reading-step-2">03 逐处修复</h3>
        <p>
          先处理大面积划痕，再检查肤色和衣服的纹理。涉及电脑端精细操作时，在电脑上继续。
        </p>
        {state === 'partial' ? (
          <Panel
            title="关联资源已不可用"
            body="教程仍可阅读，资源当前不能取用。"
          />
        ) : (
          <Jump
            title="旧照修复参考工程"
            desc="查看用途、版本与取用条件"
            tag="关联资源"
            cover="restore"
            target="resource"
            go={go}
          />
        )}
        <h3 id="reading-step-3">04 复查结果</h3>
        <p>把结果与原图并排查看，确认人物表情和原有信息仍然一致。</p>
      </div>
      <Jump
        title="旧照修复练习"
        desc="看看这套方法的作品示例"
        tag="作品"
        cover="restore"
        target="work"
        go={go}
      />
      <ActionBar
        kind="tutorial"
        go={go}
        guest={state === 'guest'}
        failOnAction={state === 'action-error'}
      />
      <Comments go={go} kind="tutorial" guest={state === 'guest'} />
    </>
  );
}

const workAuthors: Record<string, string> = {
  girl: '周与斯',
  cat: '小鹿',
  perfume: '鹿与光',
  portrait: '夏目川',
  anime: 'Tide',
  sea: '陈屿',
  cup: '鹿与光',
  underwater: '拾光',
  interior: '林间',
  dog: '小野',
  restore: '林间',
  headphones: 'Tide',
  tram: '她与海',
  writing: '林间',
  letter: '林间',
};
const workVariants: Record<string, { title: string; description: string }> = {
  letter:{title:'写给夏天的一封信',description:'把一个普通的下午，写成自己的故事。'},
  headphones: {
    title: '只听见风的声音',
    description: '在日常声音里找到自己的节奏。',
  },
  tram: { title: '下一站，海边', description: '列车穿过城市，慢慢靠近海边。' },
  restore: {
    title: '旧照修复练习',
    description: '保留人物原有神态，修复影响观看的旧照划痕。',
  },
  perfume: {
    title: '一瓶夏日晴光',
    description: '透明瓶身与暖色光线，让产品成为画面的焦点。',
  },
  cup: {
    title: '柠檬与蓝花杯',
    description: '清亮的色彩和日常器物，组成一张轻快的静物画面。',
  },
  girl: { title: '夏日的转角', description: '在街角留住夏日的光线与人物。' },
  sea: { title: '日落之前', description: '记录海面与天空交界处的颜色。' },
  cat: { title: '西瓜味的夏天', description: '一只猫和一个悠闲的夏日午后。' },
  portrait: {
    title: '把阳光留在眼睛里',
    description: '观察光线如何落在人物面部。',
  },
  anime: {
    title: '风从蓝色花间经过',
    description: '用蓝色花与角色轮廓表现风的方向。',
  },
  underwater: {
    title: '沉入一场蓝色的梦',
    description: '表现水下光线与层次。',
  },
  interior: {
    title: '在海边住一下午',
    description: '记录空间里自然形成的秩序。',
  },
  dog: { title: '快乐没有理由', description: '捕捉日常散步时的一瞬间。' },
  writing: { title: '写作时刻', description: '用画面留住一个专注的下午。' },
};
const getWorkItem = () => {
  const requested =
    new URLSearchParams(window.location.search).get('item') || 'restore';
  return requested in workVariants ? requested : 'restore';
};
const subscribeWorkItem = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};
function Work({ state, go }: Props) {
  const db=useB();
  const workItem = useSyncExternalStore(
    subscribeWorkItem,
    getWorkItem,
    () => 'restore',
  );
  const publicWork=db.records.find(r=>r.id==='work-'+(workItem==='restore'?'1':workItem))?.public;
  const work = {...workVariants[workItem],...(publicWork?{title:publicWork.title}:{})};
  const videoMode=state==='video'||workItem==='sea';
  const cover = detailState({
    page: 'work',
    state: ['video', 'text', 'media-error'].includes(state) ? 'normal' : state,
    go,
  });
  if (cover) return cover;
  if((workItem==='restore'&&db.records.find(r=>r.id==='work-1')?.publicStatus!=='公开'))return <Panel title="作品暂不可访问" action={returnToContent()[1]} onAction={()=>go(returnToContent()[0])}/>;
  return (
    <>
      <Head title="作品" go={go} back="community" />
      {state === 'text' || workItem === 'letter' ? null : videoMode ? (
        <video
          className="cp-cover"
          controls
          playsInline
          poster={img('sea')}
          src="/home-prototype/sea-sample.mp4"
          aria-label="夏日海岸视频样本"
        >
          <track
            kind="captions"
            src="/home-prototype/sea-sample.vtt"
            srcLang="zh"
            label="中文"
          />
        </video>
      ) : state === 'media-error' ? (
        <Panel title="媒体加载失败" action="重试" onAction={() => go('work')} />
      ) : (
        <WorkMedia image={img(workItem)} title={work.title}/>
      )}
      <h2 className="reading-title">{state === 'text' ? '写给夏天的一封信' : work.title}</h2>
      <Persona go={go} name={publicWork?.author||workAuthors[workItem] || '林间'} />
      {(state === 'text' || workItem === 'letter') && (
        <article className="reading-text-work">
          <p>海风穿过街角，晒热的石板路渐渐安静下来。我们把一天的好心情留在落日里，等下一次相遇。</p>
        </article>
      )}
      <p className="reading-prose">{work.description}</p>
      <div className="reading-inline reading-work-meta">
        <Tag>{state === 'text'||workItem==='letter' ? '文字' : videoMode ? '视频' : '图片'}</Tag>
        {workItem==='restore'&&state!=='text'&&<Tag>影像处理</Tag>}
      </div>
      <WorkDetailsExtras item={workItem} description={work.description} state={state} go={go}/>
      {workItem !== 'restore' ||
      ['text', 'video'].includes(state)||videoMode ? null : state === 'partial' ? (
        <Panel
          title="关联资源暂时不可用"
          body="作品仍可欣赏，原工程入口已暂停。"
        />
      ) : (
        <>
          <Jump
            title="旧照修复参考工程"
            desc="了解版本、许可与取用条件"
            tag="资源"
            cover="restore"
            target="resource"
            go={go}
          />
          <Jump
            title="旧照片修复：从判断破损到复查"
            tag="教程"
            desc="查看完整步骤"
            target="tutorial"
            go={go}
          />
        </>
      )}
      <ActionBar
        kind="work"
        go={go}
        guest={state === 'guest'}
        failOnAction={state === 'action-error'}
      />
      <Comments
        go={go}
        kind={'work-' + workItem}
        guest={state === 'guest'}
      />
    </>
  );
}

const searchTypes = [
  { label: '作品', target: 'work', title: '旧照修复练习', cover: 'restore' },
  {
    label: '帖子',
    target: 'post',
    title: '给旧照片修复时，我先做了这三件事',
    cover: 'restore',
  },
  {
    label: '教程',
    target: 'tutorial',
    title: '旧照片修复：从判断破损到复查',
    cover: 'restore',
  },
  {
    label: '教程',
    target: 'tutorial?item=product',
    title: '产品背景与光线的搭配',
    cover: 'perfume',
  },
  {
    label: 'AI 应用',
    target: 'app?item=copy',
    title: '文案改写',
    cover: 'writing',
  },
  {
    label: 'AI 应用',
    target: 'app?item=restore',
    title: '照片修复',
    cover: 'restore',
  },
  {
    label: 'AI 应用',
    target: 'app?item=background',
    title: '产品换背景',
    cover: 'perfume',
  },
  {
    label: '专题',
    target: 'topic?theme=restore',
    title: '图像修复',
    cover: 'restore',
  },
  { label: '圈子', target: 'circle', title: '影像练习圈', cover: 'restore' },
  { label: '作者', target: 'author', title: '林间', cover: 'girl' },
];
function Search({ state, go }: Props) {
  const db=useB();
  const source =
    typeof window === 'undefined'
      ? ''
      : new URLSearchParams(window.location.search).get('from') || '';
  const saved = useSyncExternalStore(
    () => () => {},
    () => sessionStorage.getItem('cp-search-' + source) || '',
    () => '',
  );
  const old = saved ? JSON.parse(saved) : null;
  const [typed, setTyped] = useState<string | null>(null),
    [sent, setSent] = useState<string | null>(null),
    [chosen, setChosen] = useState<string | null>(null),
    [retried, setRetried] = useState(false);
  const [searchCounts,setSearchCounts]=useState<Record<string,number>>(()=>{
    try{return JSON.parse(sessionStorage.getItem('cp-search-count-'+source)||'{}')}catch{return {}}
  });
  const increase=(type:string)=>{
    const next={...searchCounts,[type]:(searchCounts[type]||2)+2};
    setSearchCounts(next);
    sessionStorage.setItem('cp-search-count-'+source,JSON.stringify(next));
  };
  const initialQuery =
    typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('q');
  const query =
      typed ?? initialQuery ?? (state==='idle'?'':old?.query) ?? (['empty','partial','error'].includes(state) ? '修复' : ''),
    submitted =
      sent ??
      initialQuery ??
      (state==='idle'?'':old?.submitted) ??
      (['empty','partial','error'].includes(state) ? '修复' : ''),
    scope =
      chosen ?? old?.scope ?? (source === 'community' ? '社区内容' : '全部');
  const persist = (q: string, term: string, sc: string) =>
    sessionStorage.setItem(
      'cp-search-' + source,
      JSON.stringify({ query: q, submitted: term, scope: sc }),
    );
  const visiblePosts=samplePosts.filter(p=>(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开'));
  const visibleAuthors=Array.from(new Set([...visiblePosts.map(p=>p.author),...Object.entries(workAuthors).filter(([id])=>id!=='restore'||db.records.find(r=>r.id==='work-1')?.publicStatus==='公开').map(([,name])=>name)]));
  const dynamicTypes=[...searchTypes.filter(x=>x.target!=='post'&&x.target!=='circle'&&x.target!=='author'),...visiblePosts.map(p=>({label:'帖子',target:postTarget(p.id),title:p.title,cover:p.image,summary:p.summary})),...currentCircles().filter(c=>!closedCircle(c.id)).map(c=>({label:'圈子',target:circleTarget(c.id),title:c.name,cover:c.cover,summary:c.description})),...visibleAuthors.map(name=>({label:'作者',target:'author?name='+encodeURIComponent(name),title:name,cover:'girl',summary:''}))];
  const matches = dynamicTypes.filter(
    (x) =>
      (x.target!=='work'||db.records.find(r=>r.id==='work-1')?.publicStatus==='公开')&&
      (x.target!=='tutorial'||db.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开')&&
      (x.target!=='topic?theme=restore'||db.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开')&&
      (x.target!=='app?item=copy'||db.records.find(r=>r.id==='app-1')?.publicStatus==='公开')&&
      (scope === '全部' ||
        (scope === '社区内容' && ['帖子', '教程', '圈子'].includes(x.label)) ||
        x.label === scope) &&
      (!submitted || x.title.includes(submitted)||('summary' in x&&typeof x.summary==='string'&&x.summary.includes(submitted))),
  );
  const types = ['作品', '帖子', '教程', 'AI 应用', '专题', '圈子', '作者'];
  const ordered =
    source === 'community'
      ? ['帖子', '教程', '圈子', '作品', 'AI 应用', '专题', '作者']
      : types;
  return (
    <>
      <form
        className="reading-search"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(query.trim());
          rememberSearch(query.trim());
          setSearchCounts({});
          sessionStorage.removeItem('cp-search-count-'+source);
          persist(query, query.trim(), scope);
        }}
      >
        <Icon name="search" />
        <input
          value={query}
          aria-label="搜索关键词"
          placeholder="输入关键词"
          onChange={(e) => setTyped(e.target.value)}
        />
        <button type="submit">搜索</button>
      </form>
      {submitted&&<div className="reading-tabs search-result-tabs" aria-label="搜索结果分类">
        {[
          '全部',
          ...(source === 'community' ? ['社区内容'] : []),
          ...types,
        ].map((t) => (
          <button
            key={t}
            className={t === scope ? 'active' : ''}
            onClick={() => {
              setChosen(t);
              persist(query, submitted, t);
            }}
          >
            {t}
          </button>
        ))}
      </div>}
      {!submitted ? (
        <SearchSuggestions go={go} search={term=>{setTyped(term);setSent(term);rememberSearch(term);persist(term,term,scope);}}/>
      ) : state === 'error' && !retried ? (
        <Panel
          title="搜索失败"
          action="重试"
          onAction={() => setRetried(true)}
        />
      ) : state === 'empty' || !matches.length ? (
        <Panel
          title="没有找到相关内容"
          action="清除条件"
          onAction={() => {
            setTyped('');
            setSent('');
            setChosen('全部');
            persist('', '', '全部');
          }}
        />
      ) : (
        <>
          {ordered.map((t) => {
            const list = matches.filter((x) => x.label === t).sort((a,b)=>{
              const rank=(x:typeof a)=>x.title===submitted?0:x.title.includes(submitted)?1:2;
              return rank(a)-rank(b)||a.target.localeCompare(b.target);
            });
            return list.length ? (
              <section className="reading-result-group" key={t}>
                <h2>{t}</h2>
                {t==='作品'?<WorkFeed items={list.slice(0,searchCounts[t]||2).map(x=>({id:x.cover,title:x.title,author:workAuthors[x.cover]||'林间',target:x.target,image:img(x.cover)}))} go={go}/>:list.slice(0,searchCounts[t]||2).map((x) => (
                  <Jump
                    key={x.target}
                    title={x.title}
                    cover={x.cover}
                    target={x.target}
                    go={go}
                  />
                ))}
                {list.length>(searchCounts[t]||2)&&<Button quiet onClick={()=>increase(t)}>加载更多{t}</Button>}
              </section>
            ) : null;
          })}
          {state === 'partial' && (
            <Panel
              title="部分结果加载失败"
              action="重试"
              onAction={() => go('search')}
            />
          )}
        </>
      )}
    </>
  );
}

function Author({ state, go }: Props) {
  const db=useB();
  const name =
    typeof window === 'undefined'
      ? '林间'
      : new URLSearchParams(window.location.search).get('name') || '林间';
  const [tab, setTab] = useState('作品');
  const [following, setFollowing] = useState(()=>sessionStorage.getItem('cp-following:'+name)==='1');
  const [notice, setNotice] = useState('');
  const cover = detailState({ page: 'author', state, go });
  if (cover) return cover;
  const items: Record<
    string,
    { title: string; cover: string; target: string }[]
  > = {
    作品: Object.entries(workAuthors)
      .filter(([id,author])=>(db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.public?.author||author)===name&&(!db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))||db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.publicStatus==='公开'))
      .map(([id])=>({title:db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.public?.title||workVariants[id].title,cover:id==='letter'?'writing':id,target:'work?item='+id+(id==='sea'?'&state=video':'')})),
    帖子: samplePosts.filter(p=>p.author===name&&(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开')).map(p=>({title:p.title,cover:p.image,target:postTarget(p.id)})),
    教程: [],
    'AI 应用': [],
  };
  return (
    <>
      <Head title="作者主页" go={go} back="community" />
      <div className="reading-author">
        <span className="reading-avatar large">{name.slice(0, 1)}</span>
        <div>
          <h2>{name}</h2>
          <p>记录影像与日常创作的练习。</p>
        </div>
          <Button
            onClick={() => {
              if (state === 'guest' || !signedIn()) {
                loginFor(go);
                return;
              }
              setFollowing(!following);
              sessionStorage.setItem('cp-following:'+name,following?'0':'1');
              setNotice(following ? '已取消关注' : '已关注');
            }}
          >
            {following ? '已关注' : '关注'}
          </Button>
      </div>
      {notice && <p className="reading-feedback">{notice}</p>}
      <div className="reading-tabs">
        {Object.keys(items).map((x) => (
          <button
            type="button"
            key={x}
            className={tab === x ? 'active' : ''}
            onClick={() => setTab(x)}
          >
            {x}
          </button>
        ))}
      </div>
      {state === 'empty' || items[tab].length === 0 ? (
        <Panel title={`暂无公开${tab}`} body="可以查看作者的其他公开栏目。" />
      ) : (
        tab==='作品'?<WorkFeed items={items[tab].map(x=>({id:new URLSearchParams(x.target.split('?')[1]).get('item')||x.cover,title:x.title,author:name,image:img(x.cover),type:x.target.includes('item=letter')?'文字':x.cover==='sea'?'视频':'图片',target:x.target}))} go={go}/>:<div className="author-content-feed">{items[tab].map(x=><button key={x.target} onClick={()=>go(x.target)}><strong>{x.title}</strong><img src={img(x.cover)} alt=""/></button>)}</div>
      )}
    </>
  );
}

function Resource({ state, go }: Props) {
  const resourceDB=useB();
  const [message, setMessage] = useState('');
  const gate = detailState({ page: 'resource', state, go });
  if (gate) return gate;
  if(resourceDB.records.find(r=>r.id==='resource-1')?.publicStatus!=='公开')return <Panel title="资源暂不可访问" action="返回关联作品" onAction={()=>go('work?item=restore')}/>;
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.origin + '/community-options/c-prototype?page=resource',
      );
      setMessage('链接已复制');
    } catch {
      setMessage('复制失败，请手动复制链接');
    }
  };
  return (
    <>
      <div className="reading-resource-heading">
        <Tag>MakeNow 画布</Tag>
        <h2 className="reading-title">旧照修复参考工程</h2>
        <p>包含原图、分步修复画布和结果对照，可在 MakeNow 查看或复制后继续创作。</p>
      </div>
      <div className="reading-resource-cover"><Picture name="restore" alt="修复前后对照" /></div>
      <dl className="reading-resource-facts">
        <dt>维护人</dt>
        <dd>林间</dd>
        <dt>公开版本</dt>
        <dd>1.2</dd>
        <dt>适用范围</dt>
        <dd>旧照片修复练习</dd>
        <dt>打开方式</dt><dd>MakeNow · 电脑浏览器</dd>
        <dt>准备条件</dt>
        <dd>原图副本与电脑端工具</dd>
      </dl>
      <section className="reading-prose reading-resource-body">
        <h3>使用权限</h3>
        <p>
          {state === 'view-only'
            ? '可查看制作项目，不开放复制。'
            : state === 'revoked'
              ? '作者已撤回工程分享。此前合法取得的个人副本不受影响。'
              : '允许复制为自己的项目，用于创作并发布成果。未经作者另行允许，不得再次公开工程。'}
        </p>
      </section>
      {state === 'paused' || state === 'revoked' ? (
        <Panel title="工程暂不可取用" body="资源说明仍可阅读。" />
      ) : (
        <section className="reading-resource-handoff">
          <strong>在电脑端继续</strong>
          <p>
            {state === 'view-only'
              ? '在电脑端查看项目。'
              : '在电脑端查看项目并创建个人副本。'}
          </p>
          <div className="reading-resource-handoff-actions">
            <Button onClick={copyLink}>复制链接到电脑</Button>
            <a className="reading-button cp-desktop-only" href={'/community-options/cross-prototype?page=project&source=resource'+(state==='view-only'?'&state=view-only':'')}>查看项目</a>
          </div>
        </section>
      )}
      {message && <output className="reading-feedback">{message}</output>}
      <section className="reading-related">
        <h3>相关内容</h3>
        <Jump title="旧照修复练习" cover="restore" target="work?item=restore" go={go} />
        <Jump title="旧照片修复：从判断破损到复查" target="tutorial" go={go} />
      </section>
      <ActionBar
        kind="resource"
        go={go}
        guest={state === 'guest'}
        failOnAction={state === 'action-error'}
      />
      <Comments go={go} kind="resource" guest={state === 'guest'} />
    </>
  );
}

export function ReadingPage({ page, state, go }: Props) {
  const p = { page, state, go };
  switch (page) {
    case 'aigc': return <CommunityLanding state={state} go={go} initialTab="works" desktop/>;
    case 'discussion': return <CommunityLanding state={state} go={go} initialTab="talk" desktop/>;
    case 'community':
      return (
        <div className="reading-page">
          <Community {...p} />
        </div>
      );
    case 'post':
      return (
        <div className="reading-page">
          <Post {...p} />
        </div>
      );
    case 'circles':
      return (
        <div className="reading-page">
          <CirclesPage {...p} />
        </div>
      );
    case 'circle':
      return (
        <div className="reading-page">
          <CirclePage {...p} />
        </div>
      );
    case 'tutorials':
      return (
        <div className="reading-page">
          <Tutorials {...p} />
        </div>
      );
    case 'tutorial':
      return (
        <div className="reading-page">
          <Tutorial {...p} />
        </div>
      );
    case 'work':
      return (
        <div className="reading-page">
          <Work {...p} />
        </div>
      );
    case 'search':
      return (
        <div className="reading-page">
          <Search {...p} />
        </div>
      );
    case 'author':
      return (
        <div className="reading-page">
          <Author {...p} />
        </div>
      );
    case 'resource':
      return (
        <div className="reading-page">
          <Resource {...p} />
        </div>
      );
    default:
      return null;
  }
}


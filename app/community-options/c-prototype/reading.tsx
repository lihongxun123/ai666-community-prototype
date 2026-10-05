'use client';
import {deletedTarget,hiddenPublicTarget} from './content-visibility';
import {SearchHighlight,searchSnippet} from './search-highlight';
import {countCharacters,searchRank} from './business-text';
import {MediaPreview} from './media-preview';
import {TransientFeedback} from './transient-feedback';
import {createPortal} from 'react-dom';
import {ActionBar,interactionTarget,openComments} from './content-actions';
export {ActionBar} from './content-actions';
import {SearchSuggestions,rememberSearch} from '../search-suggestions';
/* eslint-disable next/no-img-element -- Local prototype images are served from the existing public asset set. */

import {
  prototypeStore as sessionStorage, followedAuthor, setAuthorFollowing,
} from './storage';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import './reading.css';
import './post-image-preview.css';
import './author-concept.css';
import {TutorialDesktopList,TutorialDesktopDetail} from './tutorial-desktop';
import {CirclesPage,CirclePage,DesktopCircleCommunity,DiscoverCircles,PostCirclePanel} from './circle-pages';
import {WorkDetailsExtras,WorkMedia,remixWork,workCreationInfo} from './work-details-extras';
import {WorkFeed,workRatios} from './work-feed';
import {CommunityLanding,communityTutorials} from './community-landing';
import { useB } from '../b-prototype/store';
import {samplePosts,sampleCircles,postTarget,circleTarget} from './content-data';
const isDeletedTarget=deletedTarget;
const closedCircle=(id:string)=>{
  try{const rows=JSON.parse(sessionStorage.getItem('bp-op-circles')||'[]') as {id:string;status:string}[];return rows.some(r=>r.id==='ci-'+id&&r.status==='已关闭');}catch{return false;}
};
const currentCircles=()=>{
  try{const raw=sessionStorage.getItem('bp-op-circles');if(raw){const rows=JSON.parse(raw) as {id:string;title:string;detail?:string}[];const managed=rows.map(r=>({id:r.id.replace(/^ci-/,''),name:r.title,description:r.detail||'',cover:sampleCircles.find(c=>c.id===r.id.replace(/^ci-/,''))?.cover||'restore'}));return [...managed,...sampleCircles.filter(c=>!managed.some(r=>r.id===c.id))];}}catch{/* fixed local examples */}
  return sampleCircles;
};

const returnToContent=()=>{const q=new URLSearchParams(location.search),page=q.get('page');if(page==='tutorial')return ['tutorials','返回教程'];if(q.get('device')!=='pc')return ['community','返回社区'];return page==='work'?['aigc','返回作品']:page==='post'?['discussion','返回交流']:['home','返回首页'];};
type Props = { page: string; state: string; go: (page: string) => void };
type PageMeta = { id: string; title: string; module: string; states: string[] };

export const readingPages: PageMeta[] = [
  {id:'discover-circles',title:'发现圈子',module:'阅读与交流',states:['normal']},
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
    states: ['normal'],
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
    title: '教程',
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
    states: ['normal','work-image','work-video','work-text'],
  },
  {
    id: 'search',
    title: '搜索',
    module: '发现',
    states: ['normal', 'search-results', 'search-no-results'],
  },
  {
    id: 'author',
    title: '作者主页',
    module: '发现',
    states: ['normal'],
  },
];

const searchWorkCovers:Record<string,string>={'repair-portrait':'portrait','repair-interior':'interior','repair-color':'anime','repair-pet':'cat'};
const img = (name: string) => `/home-prototype/${searchWorkCovers[name]||name}.png`;
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
export const postImages = (id:string,cover:string) => ['restore','restore-color'].includes(id)?[cover,'portrait','girl']:[cover];

/** Shared local post images: a selected thumbnail opens its position in the full image group. */
export function PostImageGallery({images,title,compact=false,initialOpen=false}:{images:string[];title:string;compact?:boolean;initialOpen?:boolean}) {
  const [selected,setSelected]=useState<number|null>(null);
  const owner=useRef<HTMLDivElement>(null),dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{
    if(!initialOpen||compact)return;
    const frame=window.requestAnimationFrame(()=>{
      const node=owner.current;
      const first=Array.from(document.querySelectorAll<HTMLElement>('[data-post-image-owner="detail"]')).find(element=>element.getClientRects().length>0);
      if(node?.getClientRects().length&&first===node&&!document.querySelector('dialog:modal'))setSelected(0);
    });
    return()=>window.cancelAnimationFrame(frame);
  },[initialOpen,compact]);
  const close=()=>setSelected(null);
  const move=(step:number)=>setSelected(index=>index===null?null:(index+step+images.length)%images.length);
  return <div ref={owner} data-post-image-owner={compact?'list':'detail'} className={'post-images'+(compact?' is-compact':'')}>
    <div className="post-images-grid">{images.map((source,index)=><button key={source+index} type="button" aria-label={'查看帖子第'+(index+1)+'张图片'} onClick={event=>{trigger.current=event.currentTarget;setSelected(index);}}><img src={img(source)} alt={title+' · 图片 '+(index+1)}/></button>)}</div>
    <MediaPreview title="帖子图片预览" items={images.map((source,i)=>({src:img(source),name:title+" · "+(i+1)}))} index={selected} onIndexChange={setSelected} onClose={close}/>
  </div>;
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
  followable = false,
}: {
  go: (p: string) => void;
  aside?: string;
  followable?: boolean;
  name?: string;
}) {
  const [following,setFollowing]=useState(false);
  useEffect(()=>{setFollowing(followedAuthor(name))},[name]);
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
      {followable&&<button type="button" className="pc-work-follow" aria-pressed={following} onClick={()=>{if(!signedIn()){loginFor(go);return;}const next=!following;setFollowing(next);setAuthorFollowing(name,next)}}>{following?'已关注':'关注'}</button>}
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
      <Icon name="arrow-right-s" />
    </button>
  );
}

export function Comments({
  go,
  kind,
  guest = false,
  inline = false,
  target,
}: {
  go: (p: string) => void;
  kind: string;
  guest?: boolean;
  inline?: boolean;
  target?: string;
}) {
  const contentKey=target||interactionTarget()||kind;
  const circleDemo=kind==='post';
  const demoComments=[
    {name:'温白',text:'把尝试过程也记录下来很有帮助，尤其是调整前后的对比。',likes:12},
    {name:'小树影',text:'我之前也遇到过类似的问题。一次只改一个条件，更容易找到真正起作用的地方。',likes:8},
    {name:'南风',text:'收藏了，准备照着这个思路试一版，再来分享结果。',likes:5},
  ];
  const pendingKey = `reading-pending-comment:${contentKey}`;
  const inputRef=useRef<HTMLTextAreaElement>(null);
  const dialogRef=useRef<HTMLDialogElement>(null),previousOverflow=useRef(''),modalOpen=useRef(false);
  const [likes,setLikes]=useState<Record<string,boolean>>(()=>{try{return JSON.parse(sessionStorage.getItem('comment-likes:'+contentKey)||'{}')}catch{return {}}});
  const like=(id:string)=>{const next={...likes,[id]:!likes[id]};setLikes(next);sessionStorage.setItem('comment-likes:'+contentKey,JSON.stringify(next))};
  const show=()=>{if(inline){inputRef.current?.focus();return;}if(dialogRef.current?.open)return;previousOverflow.current=document.body.style.overflow;modalOpen.current=true;document.body.style.overflow='hidden';dialogRef.current?.showModal()};
  const close=()=>{dialogRef.current?.close();modalOpen.current=false;document.body.style.overflow=previousOverflow.current};
  useEffect(()=>{window.addEventListener('open-content-comments',show);if(new URLSearchParams(location.search).get('discussion')==='1')show();return()=>{window.removeEventListener('open-content-comments',show);if(modalOpen.current)document.body.style.overflow=previousOverflow.current}},[]);
  type Entry={id:string;text:string;reply:string;parentId?:string;image?:string;deleted?:boolean};
  const commentKey='reading-comments:'+contentKey;
  const [entries,setEntries]=useState<Entry[]>(()=>{try{const saved=sessionStorage.getItem(commentKey);if(saved)return JSON.parse(saved);const text=sessionStorage.getItem('reading-comment:'+contentKey);return text&&sessionStorage.getItem('reading-comment-deleted:'+contentKey)!=='1'?[{id:'legacy',text,reply:sessionStorage.getItem('reading-reply:'+contentKey)||''}]:[];}catch{return [];}});
  const persist=(next:Entry[])=>{sessionStorage.setItem(commentKey,JSON.stringify(next));setEntries(next);};
  const [confirmDelete,setConfirmDelete]=useState('');
  const [text, setText] = useState(() =>
    typeof window === 'undefined'
      ? ''
      : sessionStorage.getItem(pendingKey) || '',
  );
  const [replyTo, setReplyTo] = useState(()=>sessionStorage.getItem('reading-pending-reply:'+contentKey)||'');
  useEffect(()=>{sessionStorage.setItem('reading-pending-reply:'+contentKey,replyTo);},[replyTo,contentKey]);
  const [replyId,setReplyId]=useState(()=>sessionStorage.getItem('reading-pending-parent:'+contentKey)||'');
  useEffect(()=>{sessionStorage.setItem('reading-pending-parent:'+contentKey,replyId)},[replyId,contentKey]);
  const [attachment,setAttachment]=useState('');
  const [imagePreview,setImagePreview]=useState<string|null>(null);
  const [uploading,setUploading]=useState(false);
  const uploadRef=useRef<HTMLInputElement>(null);
  const chooseReply=(name:string,id='')=>{setReplyTo(name);setReplyId(id);focusEditor()};
  const uploadImage=async(file?:File)=>{
    if(!file)return;
    if(attachment){setError('每条评论最多1张图片，请先移除已有图片');return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||! /\.(jpe?g|png|webp)$/i.test(file.name)){setError('支持JPG、JPEG、PNG、WebP图片');return;}
    if(file.size>10*1024*1024){setError('图片不能超过10MB');return;}
    setUploading(true);setError('');
    try {const bitmap=await createImageBitmap(file);const scale=Math.min(1,1200/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d')!.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();setAttachment(canvas.toDataURL('image/webp',0.8));}catch{setError('图片无法读取，请选择有效图片');}finally{setUploading(false);}
  };
  const [error, setError] = useState('');
  const [expand, setExpand] = useState(circleDemo);
  const [demoReplies,setDemoReplies]=useState(true);
  const focusEditor = () => requestAnimationFrame(() => {
    const input = inputRef.current;
    input?.focus({preventScroll:true});
    input?.closest('.reading-comment-editor')?.scrollIntoView({behavior:'smooth',block:'center'});
  });
  const send = () => {
    const value = text.trim();
    if (!value && !attachment) {
      setError('请输入文字或添加图片');
      return;
    }
    if (countCharacters(value) > 1000) {
      setError(`已输入 ${countCharacters(value)} 字，最多 1000 字`);
      return;
    }
    if (guest || !signedIn()) {
      sessionStorage.setItem(pendingKey, value);
      loginFor(go);
      return;
    }
    if(replyId&&entries.find(e=>e.id===replyId)?.deleted){setError('该评论已删除，请取消回复后重试');return;}
    try{persist([...entries,{id:crypto.randomUUID(),text:value,reply:replyTo,parentId:replyId,image:attachment||undefined}]);}catch{setError('暂时无法保存，请保留输入后重试');return;}
    sessionStorage.removeItem(pendingKey);
    setReplyTo('');setReplyId('');setAttachment('');setText('');
    setError('评论已提交');
  };
  const renderEntry=(entry:Entry):React.ReactNode=>entry.deleted?entries.filter(child=>child.parentId===entry.id).map(child=>renderEntry({...child,parentId:entry.parentId,reply:''})):<div className={entry.parentId?'reading-reply':'reading-comment'} key={entry.id}>{!entry.parentId&&<span className="reading-avatar mini">我</span>}<div><strong>我 {entry.reply&&<small>回复 {entry.reply}</small>}</strong>{<><p>{entry.text}</p>{entry.image&&<button className="reading-comment-image" aria-label="预览评论图片" onClick={()=>setImagePreview(entry.image!)}><img src={entry.image} alt="评论图片"/></button>}<button type="button" className="reading-link" onClick={()=>chooseReply('我',entry.id)}>回复</button><button type="button" className="reading-link" onClick={()=>setConfirmDelete(entry.id)}>删除</button></>}{entries.filter(child=>child.parentId===entry.id).map(renderEntry)}</div></div>;
  return (
    <><section className="reading-comment-preview"><header><h2>评论 <span>{2+entries.filter(entry=>!entry.deleted).length+(circleDemo?5:0)+(inline&&kind==='work-girl'?8:0)}</span></h2><button onClick={show}>查看全部 <Icon name="arrow-right-s"/></button></header><button className="reading-comment-peek" onClick={show}><span className="reading-avatar mini">周</span><span><small>周末观察</small><span>这一步如果只有手机，先准备什么最合适？</span></span></button><button className="reading-comment-start" onClick={()=>{show();focusEditor()}}>写下你的看法</button></section>
    <dialog open={inline||undefined} ref={dialogRef} className={'reading-comments-dialog'+(inline?' is-inline':'')} aria-label="全部评论" onClose={()=>{modalOpen.current=false;document.body.style.overflow=previousOverflow.current}} onClick={e=>{if(!inline&&e.target===e.currentTarget)close()}}>
    <section id="reading-comments" className="reading-comments">
      <header className="reading-comments-heading"><h2>{inline?"评论":"全部评论"} <span>{2+entries.filter(entry=>!entry.deleted).length+(circleDemo?5:0)+(inline&&kind==='work-girl'?8:0)}</span></h2><button autoFocus={!inline} aria-label="关闭评论" onClick={close}><Icon name="close"/></button></header><div className="reading-comments-list">
      <div className="reading-comment">
        <span className="reading-avatar mini">周</span>
        <div>
          <strong>周末观察</strong><small className="reading-comment-time">{target?'1分钟前':'9月24日 11:00'}</small>
          <p>这一步如果只有手机，先准备什么最合适？</p>
          <button
            type="button"
            className="reading-link"
            onClick={() => {
              setReplyTo('周末观察');
              setReplyId('');setExpand(true);
              focusEditor();
            }}
          >
            回复
          </button>
          <button className="reading-link" aria-pressed={!!likes.sample} onClick={()=>like('sample')}>{likes.sample?'已赞 1':'赞'}</button>
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
              <p>先整理素材和目标效果，电脑操作的步骤可以稍后完成。</p><button type="button" className="reading-link" onClick={()=>{setReplyTo('林间');setReplyId('');focusEditor();}}>回复</button>
            </div>
          )}
        </div>
      </div>
{circleDemo&&demoComments.map((comment,i)=><div className="reading-comment" key={'circle-demo-'+i}><span className="reading-avatar mini">{comment.name[0]}</span><div><strong>{comment.name}</strong><small className="reading-comment-time">刚刚</small><p>{comment.text}</p><button className="reading-link" onClick={()=>{setReplyTo(comment.name);setReplyId('');focusEditor();}}>回复</button><button className="reading-link" aria-pressed={!!likes['circle-demo-'+i]} onClick={()=>like('circle-demo-'+i)}>{likes['circle-demo-'+i]?'已赞':'赞'} {comment.likes+(likes['circle-demo-'+i]?1:0)}</button>{i===0&&<><button className="reading-link" aria-expanded={demoReplies} onClick={()=>setDemoReplies(!demoReplies)}>{demoReplies?'收起 2 条回复':'查看 2 条回复'}</button>{demoReplies&&<div className="reading-reply">{[{name:'青禾',to:'温白',text:'赞同，我会把每一步的版本单独保存，回头比较方便很多。'},{name:'温白',to:'青禾',text:'这个方法好，下次也试试按步骤留存。'}].map(reply=><div key={reply.name} className="cd-demo-reply"><strong>{reply.name} <span>回复 {reply.to}</span></strong><small className="reading-comment-time">刚刚</small><p>{reply.text}</p><button className="reading-link" onClick={()=>{setReplyTo(reply.name);setReplyId('');focusEditor();}}>回复</button></div>)}</div>}</>}</div></div>)}
{inline&&kind==='work-girl'&&[
 ['南风','海边露台那张很舒服，和人物图放在一起有完整的旅行故事感。'],['山雀','喜欢蓝白配色，前景花朵让画面有了层次。'],['柠檬汽水','第二张的建筑线条很自然，请问是先生成场景再调整人物吗？'],['慢慢来','提示词已收藏，准备试试自己的城市街角。'],['青禾','四张里最喜欢日落，暖色作为结尾刚刚好。'],['木子','人物的裙摆细节很好，整体没有过分锐化。'],['云间','可以再延伸一组雨后的海边小镇，应该也很有氛围。'],['小岛','从人物切到静物再到风景，这样的组图比单张更有叙事感。']
].map(([name,body],i)=><div className="reading-comment" key={name}><span className="reading-avatar mini">{name[0]}</span><div><strong>{name}</strong><small className="reading-comment-time">9月25日 {10+i}:20</small><p>{body}</p><button className="reading-link" onClick={()=>chooseReply(name)}>回复</button><button className="reading-link" aria-pressed={!!likes['rich-'+i]} onClick={()=>like('rich-'+i)}>{likes['rich-'+i]?'已赞':'赞'} {12+i}</button></div></div>)}
      {entries.filter(entry=>!entry.parentId||!entries.some(parent=>parent.id===entry.parentId)).map(renderEntry)}
      <div className="reading-comment"><span className="reading-avatar mini">我</span><div><strong>我</strong><p className="reading-comment-unavailable">该评论暂不可见</p><small>内容未通过审核，请调整后重新发布。</small></div></div>
      {confirmDelete&&<div className="reading-delete-confirm" aria-label="删除评论确认"><span>删除这条评论？已有回复将保留。</span><button onClick={()=>setConfirmDelete('')}>取消</button><button onClick={()=>{try{persist(entries.map(e=>e.id===confirmDelete?{...e,text:'',image:undefined,deleted:true}:e));if(replyId===confirmDelete){setReplyId('');setReplyTo('');}setConfirmDelete('');}catch{setError('删除失败，请重试');}}}>删除</button></div>}
      </div><div className="reading-comment-editor">
      {replyTo && (
        <p className="reading-reply-target">
          回复 {replyTo}{' '}
          <button type="button" onClick={() => {setReplyTo('');setReplyId('')}}>
            取消
          </button>
        </p>
      )}
      <div className="reading-comment-input-box"><textarea
        id="reading-comment-input" ref={inputRef}
        className="reading-textarea" aria-label={replyTo?'回复 '+replyTo:'评论内容'}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          sessionStorage.setItem(pendingKey,e.target.value);
          setError('');
        }}
        placeholder={replyTo?'回复 '+replyTo:'写下你的看法'}
      />
      {attachment&&<div className="reading-comment-attachment"><button aria-label="预览待发布图片" onClick={()=>setImagePreview(attachment)}><img src={attachment} alt="待发布图片"/></button><button aria-label="移除评论图片" onClick={()=>{setAttachment('');setError('')}}><Icon name="close"/></button></div>}
      <input ref={uploadRef} type="file" accept=".jpg,.jpeg,.png,.webp" hidden aria-label="评论图片" onChange={e=>{void uploadImage(e.target.files?.[0]);e.target.value=''}}/>
      <div className="reading-compose"><button className="reading-image-upload" type="button" aria-label="添加图片" title="添加图片（最多1张，不超过10MB）" disabled={uploading||!!attachment} onClick={()=>uploadRef.current?.click()}><Icon name="image"/></button>
        <span className={countCharacters(text.trim()) > 1000 ? 'reading-over' : ''}>
          {countCharacters(text.trim())}/1000
        </span>
        <Button disabled={uploading||(!text.trim()&&!attachment)||countCharacters(text.trim())>1000} onClick={send}>{uploading?'处理中':'发送'}</Button>
      </div></div>
      </div>
      {error==='评论已提交'?<TransientFeedback message={error} onClear={()=>setError('')}/>:error&&<output className="reading-feedback" role="status">{error}</output>}
    </section></dialog><MediaPreview items={imagePreview?[{src:imagePreview,name:"评论图片"}]:[]} index={imagePreview?0:null} onIndexChange={()=>{}} onClose={()=>setImagePreview(null)} title="评论图片"/></>
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

  const id=typeof window==='undefined'?'restore':new URLSearchParams(window.location.search).get('item')||'restore';
  const post=samplePosts.find(p=>p.id===id);
  const desktop=typeof window!=='undefined'&&new URLSearchParams(location.search).get('device')==='pc';
  const db=useB();
  const cover = detailState({ page: 'post', state, go });
  if (cover) return cover;
  if(!post||(post.id==='restore'&&db.records.find(r=>r.id==='post-1')?.publicStatus!=='公开'))return <Panel title="帖子暂不可访问" action={returnToContent()[1]} onAction={()=>go(returnToContent()[0])}/>;
  const content = (
    <>
      <Head title="帖子" go={go} back="community" />
      <header className="reading-post-heading">{!desktop&&<div className="reading-post-pc-author"><Persona go={go} name={post.author}/></div>}<h2 className="reading-title">{post.title}</h2></header>
      <div className="reading-prose">
        {post.body.map(p=><p key={p}>{p}</p>)}
      </div>
      <PostImageGallery images={postImages(post.id,post.image)} title={post.title} initialOpen={typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('reviewOverlay')==='post-image'}/>
      <div className="reading-post-meta"><time>{post.date}</time>{post.circle&&sampleCircles.some(c=>c.name===post.circle)&&<button
        type="button"
        className="reading-link"
        onClick={() => go(circleTarget(sampleCircles.find(c=>c.name===post.circle)!.id))}
      >
        来自 · {currentCircles().find(c=>c.id===sampleCircles.find(c=>c.name===post.circle)?.id)?.name||post.circle}
      </button>}</div>
      {post.reference&&!isDeletedTarget(post.reference)&&(state === 'partial'||(post.reference==='work?item=restore'&&db.records.find(r=>r.id==='work-1')?.publicStatus!=='公开') ? (
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
      {!desktop&&<ActionBar
        kind="post" onComment={openComments} go={go}
        guest={state === 'guest'}
        failOnAction={state === 'action-error'}
      />}
      <div className={desktop?'pd-comments':undefined}><Comments go={go} kind={desktop?"post":"post-"+post.id} target={desktop?postTarget(post.id):undefined} inline={desktop} guest={state === 'guest'} /></div>
    </>
  );
 return desktop?<div className="pd-layout"><div className="pd-content">{content}</div><aside className="pd-sidebar"><section className="pd-author"><Persona go={go} name={post.author} followable aside="分享创作过程，记录日常灵感"/></section><ActionBar kind="post" target={postTarget(post.id)} title={post.title} go={go} guest={state==='guest'} onComment={()=>{document.querySelector('.pd-comments')?.scrollIntoView({behavior:'smooth',block:'start'});}} counts={{likes:36+samplePosts.indexOf(post)*17,favorites:8+samplePosts.indexOf(post)*3,comments:7}}/><PostCirclePanel circleName={post.circle} go={go}/></aside></div>:content;
}

function Tutorials({state,go}:Props){if(new URLSearchParams(location.search).get('device')==='pc')return <TutorialDesktopList go={go}/>;return <CommunityLanding state={state} go={go} initialTab="tutorials" desktop={new URLSearchParams(location.search).get('device')==='pc'}/>;}

const getTutorialItem = () => ({ 'work-image':'restore','work-video':'sea','work-text':'letter' } as Record<string,string>)[new URLSearchParams(window.location.search).get('state')||''] || new URLSearchParams(window.location.search).get('item') || 'restore';

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
  if(new URLSearchParams(location.search).get('device')==='pc')return <TutorialDesktopDetail id={item} go={go}/>;
  const liveSample=communityTutorials.find(t=>t.id===item&&t.sections.length>0);
  if(liveSample)return <><Tag>教程</Tag><h2 className="reading-title">{liveSample.title}</h2><p className="reading-muted">多元拾光官方 · {liveSample.topic}</p><Picture name={liveSample.cover} alt={liveSample.title}/><nav className="reading-toc" aria-label="教程目录"><strong>目录</strong>{liveSample.sections.map(([title],i)=><button key={title} type="button" onClick={()=>document.getElementById('tutorial-step-'+i)?.scrollIntoView({behavior:'smooth'})}>{i+1} {title}</button>)}</nav><div className="reading-prose">{liveSample.sections.map(([title,text],i)=><section id={'tutorial-step-'+i} key={title}><h3>{title}</h3><p>{text}</p></section>)}</div><ActionBar kind="tutorial" go={go} guest={state==='guest'} failOnAction={state==='action-error'}/><Comments kind={'tutorial-'+item} go={go} guest={state==='guest'}/></>;
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
            title="关联应用暂不可用"
            body="教程仍可阅读，应用当前暂不可用。"
          />
        ) : (
          <Jump
            title="旧照片修复"
            desc="查看修复效果与使用条件"
            tag="关联应用"
            cover="restore"
            target="app?item=restore"
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

export const workAuthors: Record<string, string> = {
 'repair-portrait':'修复笔记','repair-interior':'鹿与光','repair-color':'修复研究员','repair-pet':'小鹿',
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
 'repair-portrait':{title:'人像修复：保留自然肤色',description:'人像修复练习，比较肤色与明暗，保留原有神态。'},
 'repair-interior':{title:'空间照片修复练习',description:'修复背景中的杂乱边缘，保留空间光线。'},
 'repair-color':{title:'角色图像修复与配色',description:'调整图像局部色彩，修复不自然的边缘。'},
 'repair-pet':{title:'宠物照片细节修复',description:'保留毛发层次与表情，修复局部模糊。'},
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
    ({ 'work-image':'restore','work-video':'sea','work-text':'letter' } as Record<string,string>)[new URLSearchParams(window.location.search).get('state')||''] || new URLSearchParams(window.location.search).get('item') || 'restore';
  return requested in workVariants ? requested : 'restore';
};
const subscribeWorkItem = (onChange: () => void) => {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
};
export function PCWorkLayout({media,info,discussion}:{media:React.ReactNode;info:React.ReactNode;discussion:React.ReactNode}){return <div className="pc-work-detail"><div className="pc-work-main"><section className="pc-work-stage" aria-label="作品内容">{media}</section><section className="pc-work-discussion" aria-label="作品讨论">{discussion}</section></div><aside className="pc-work-aside" aria-label="作品信息与操作"><div className="pc-work-info">{info}</div></aside></div>}
export function WorkAuthor({name,go}:{name:string;go:Props['go']}){return <div className="reading-work-pc-author"><Persona followable={name!=='我'} aside={name==='我'?'我的作品':undefined} name={name} go={go}/></div>}
function Work({ state: requestedState, go }: Props) {
  const state=({'work-image':'normal','work-video':'video','work-text':'text'} as Record<string,string>)[requestedState]||requestedState;
  const db=useB();
  const desktop=useSyncExternalStore(()=>()=>{},()=>new URLSearchParams(location.search).get('device')==='pc',()=>false);
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
  if(desktop)return <PCWorkLayout media={<>      {state === 'text' || workItem === 'letter' ? null : videoMode ? (
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
        <WorkMedia image={img(workItem)} title={work.title} images={workItem==='girl'?[img('girl'),img('interior'),img('cup'),img('sea')]:undefined}/>
      )}
{(state==='text'||workItem==='letter')&&<article className="pc-work-text"><small>文本作品</small><h2>{work.title}</h2><p>海风穿过街角，晒热的石板路渐渐安静下来。我们把一天的好心情留在落日里，等下一次相遇。</p></article>}</>} info={<>      <h2 className="reading-title">{state === 'text' ? '写给夏天的一封信' : work.title}</h2>
      <div className="reading-work-pc-author"><Persona followable go={go} name={publicWork?.author||workAuthors[workItem] || '林间'} /></div>
      <ActionBar kind="work" onComment={()=>document.querySelector('.pc-work-discussion')?.scrollIntoView({behavior:'smooth',block:'start'})} go={go} guest={state==='guest'} failOnAction={state==='action-error'}/>

      <p className="reading-prose">{work.description}</p>
      <div className="reading-inline reading-work-meta"><time>9月24日</time>
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
            title="旧照片修复"
            desc="了解修复能力与使用条件"
            tag="AI 应用"
            cover="restore"
            target="app?item=restore"
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
</>} discussion={<Comments inline go={go} kind={'work-'+workItem} guest={state==='guest'}/>}/>;
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
      <div className="reading-work-pc-author"><Persona go={go} name={publicWork?.author||workAuthors[workItem] || '林间'} /></div>
      {(state === 'text' || workItem === 'letter') && (
        <article className="reading-text-work">
          <p>海风穿过街角，晒热的石板路渐渐安静下来。我们把一天的好心情留在落日里，等下一次相遇。</p>
        </article>
      )}
      <p className="reading-prose">{work.description}</p>
      <div className="reading-inline reading-work-meta"><time>9月24日</time>
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
            title="旧照片修复"
            desc="了解修复能力与使用条件"
            tag="AI 应用"
            cover="restore"
            target="app?item=restore"
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
        kind="work" onComment={openComments} primary={workCreationInfo[workItem]?{label:'一键同款',onClick:()=>{remixWork(workItem,state,go)}}:undefined}
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
 {label:'AI 应用',target:'app?item=repair-color',title:'照片色彩修复',cover:'portrait'},
 {label:'专题',target:'topic?theme=repair',title:'人像修复练习',cover:'portrait'},
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
function SearchContinuation({load}:{load:()=>void}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{
      if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();load();}
    },{rootMargin:'160px'});
    if(ref.current)observer.observe(ref.current);
    return ()=>observer.disconnect();
  },[load]);
  return <div ref={ref} style={{height:1}} aria-hidden="true"/>;
}
function Search({ state, go }: Props) {
  const [searchError,setSearchError]=useState('');
  const composing=useRef(false);
  const [searchSlot,setSearchSlot]=useState<HTMLElement|null>(null);
  useEffect(()=>{setSearchSlot(document.getElementById('community-search-slot'))},[]);
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
    const next={...searchCounts,[type]:(searchCounts[type]||4)+4};
    setSearchCounts(next);
    sessionStorage.setItem('cp-search-count-'+source,JSON.stringify(next));
  };
  const initialQuery =
    state === 'search-default' ? '' : state === 'search-results' ? '修复' : state === 'search-no-results' ? '不存在的创作关键词' : typeof window === 'undefined'
      ? null
      : new URLSearchParams(window.location.search).get('q');
  const query =
      typed ?? initialQuery ?? (state==='search-results'?'修复':state==='search-no-results'?'不存在的创作关键词':state==='idle'?'':old?.query) ?? (['empty','error'].includes(state) ? '修复' : ''),
    submitted =
      sent ??
      initialQuery ??
      (state==='search-results'?'修复':state==='search-no-results'?'不存在的创作关键词':state==='idle'?'':old?.submitted) ??
      (['empty','error'].includes(state) ? '修复' : ''),
    scope =
      chosen ?? (['作品','帖子','教程','AI 应用','专题','圈子','作者'].includes(old?.scope) ? old.scope : (source === 'community' ? '帖子' : '作品'));
  const persist = (q: string, term: string, sc: string) =>
    sessionStorage.setItem(
      'cp-search-' + source,
      JSON.stringify({ query: q, submitted: term, scope: sc }),
    );
  const visiblePosts=samplePosts.filter(p=>(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开'));
  const visibleAuthors=Array.from(new Set([...visiblePosts.map(p=>p.author),...Object.entries(workAuthors).filter(([id])=>id!=='restore'||db.records.find(r=>r.id==='work-1')?.publicStatus==='公开').map(([,name])=>name)]));
  const dynamicTypes=[...searchTypes.filter(x=>!['作品','帖子','教程','圈子','作者'].includes(x.label)),...Object.entries(workVariants).filter(([id])=>id!=='restore'||db.records.find(r=>r.id==='work-1')?.publicStatus==='公开').map(([id,w])=>({label:'作品',target:'work?item='+id,title:w.title,cover:id,summary:w.description})),...communityTutorials.filter(t=>t.id!=='restore'||db.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开').map(t=>({label:'教程',target:'tutorial?item='+t.id,title:t.title,cover:t.cover,summary:t.sections.flat().join(' ')})),...visiblePosts.map(p=>({label:'帖子',target:postTarget(p.id),title:p.title,cover:p.image,summary:p.summary})),...currentCircles().filter(c=>!closedCircle(c.id)).map(c=>({label:'圈子',target:circleTarget(c.id),title:c.name,cover:c.cover,summary:c.description})),...visibleAuthors.map(name=>({label:'作者',target:'author?name='+encodeURIComponent(name),title:name,cover:'girl',summary:''}))];
  const matches = dynamicTypes.filter(
    (x) =>
      (x.target!=='work'||db.records.find(r=>r.id==='work-1')?.publicStatus==='公开')&&
      (x.target!=='tutorial'||db.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开')&&
      (x.target!=='topic?theme=restore'||db.records.find(r=>r.id==='tutorial-1')?.publicStatus==='公开')&&
      (x.target!=='app?item=copy'||db.records.find(r=>r.id==='app-1')?.publicStatus==='公开')&&
      !hiddenPublicTarget(x.target)&&(x.label === scope) &&
      searchRank(x.title,'summary' in x?String(x.summary):'',submitted)<99,
  );
  matches.sort((a,b)=>searchRank(a.title,'summary' in a?String(a.summary):'',submitted)-searchRank(b.title,'summary' in b?String(b.summary):'',submitted)||a.target.localeCompare(b.target));
  const types = ['作品', '帖子', '教程', 'AI 应用', '专题', '圈子', '作者'];
  const ordered =
    source === 'community'
      ? ['帖子', '教程', '圈子', '作品', 'AI 应用', '专题', '作者']
      : types;
  const searchForm=(<form
        className="reading-search"
        onSubmit={(e) => {
          e.preventDefault();
          if(composing.current)return;
          if(!query.trim()){setSearchError('请输入搜索内容');setSent('');return;}
          if(countCharacters(query.trim())>50){setSearchError('搜索关键词最多50个字符');return;}
          setSearchError('');setRetried(true);setSent(query.trim());
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
          onCompositionStart={()=>{composing.current=true}} onCompositionEnd={()=>{composing.current=false}} onKeyDown={e=>{if(e.key==='Enter'&&(composing.current||e.nativeEvent.isComposing))e.preventDefault()}} onChange={(e) => {setTyped(e.target.value);setSearchError('');if(!e.target.value.trim()){setSent('');persist('','','作品')}}}
        />
        <button type="submit">搜索</button>
      </form>);
  return (
    <>
      {searchSlot?createPortal(searchForm,searchSlot):searchForm}{searchError&&<p role="alert" className="reading-feedback">{searchError}</p>}
      {submitted&&<div className="reading-tabs search-result-tabs" aria-label="搜索结果分类">
        {types.map((t) => (
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
        <section className="search-empty" role="status"><span className="search-empty-icon"><Icon name="search"/></span><h2>暂时无法搜索</h2><p>请稍后再试</p><button onClick={()=>setRetried(true)}>重新加载</button></section>
      ) : (state === 'empty'&&!retried) || !matches.length ? (
        <section className="search-empty" role="status"><span className="search-empty-icon"><Icon name="search"/></span><h2>暂无相关结果</h2></section>
      ) : (
        <>
          {ordered.map((t) => {
            const list = matches.filter((x) => x.label === t);
            return list.length ? (
              <section className="reading-result-group" key={t}>
                
                <div className={'search-native-list search-native-'+({'作品':'works','帖子':'posts','教程':'tutorials','AI 应用':'apps','专题':'topics','圈子':'circles','作者':'authors'}[t])}>
                {t==='作品'?<WorkFeed searchQuery={submitted} items={list.slice(0,searchCounts[t]||4).map(x=>({id:x.cover,title:x.title,summary:searchSnippet('summary' in x?String(x.summary):'',submitted),author:workAuthors[x.cover]||'林间',target:x.target,image:img(x.cover),ratio:workRatios[searchWorkCovers[x.cover]||x.cover],likes:18+list.indexOf(x)*7,type:x.cover==='sea'?'视频':x.cover==='letter'?'文字':'图片'}))} go={go}/>:list.slice(0,searchCounts[t]||4).map(x=>{
 const post=samplePosts.find(p=>postTarget(p.id)===x.target);
 if(t==='帖子'&&post)return <article className="cl-post" key={x.target}><button className="cl-author" onClick={()=>go('author?name='+encodeURIComponent(post.author))}><img src={img('portrait')} alt=""/><span><strong>{post.author}</strong><small>{post.date}</small></span></button><button className="cl-post-copy" onClick={()=>go(x.target)}><p>{<SearchHighlight text={x.title} query={submitted}/>}</p><span>{<SearchHighlight text={searchSnippet(post.summary,submitted)} query={submitted}/>}</span></button><button className="cl-post-media" onClick={()=>go(x.target)}><img src={img(x.cover)} alt={x.title}/></button><ActionBar kind="post" target={x.target} title={x.title} go={go} onComment={()=>go(x.target+'&discussion=1')}/></article>;
 if(t==='教程')return <button className="cl-tutorial" key={x.target} onClick={()=>go(x.target)}><img className="cl-tutorial-cover" src={img(x.cover)} alt=""/><span><strong>{<SearchHighlight text={x.title} query={submitted}/>}</strong><small><SearchHighlight text={searchSnippet('summary' in x?String(x.summary):'',submitted)} query={submitted}/></small><small>教程 · {communityTutorials.find(item=>'tutorial?item='+item.id===x.target)?.topic||'创作技巧'}</small></span><Icon name="arrow-right-s"/></button>;
 if(t==='AI 应用')return <button className="cp-app-effect" key={x.target} onClick={()=>go(x.target)}><img src={img(x.cover)} alt=""/><span className="cp-app-caption"><strong>{<SearchHighlight text={x.title} query={submitted}/>}</strong>{x.target==='app?item=restore'&&<small>暂不可用</small>}</span></button>;
 if(t==='专题')return <button className="search-topic-native" key={x.target} onClick={()=>go(x.target)}><img src={img(x.cover)} alt=""/><strong>{<SearchHighlight text={x.title} query={submitted}/>}</strong></button>;
 if(t==='圈子')return <button className="circle-list-card" key={x.target} onClick={()=>go(x.target)}><img src={img(x.cover)} alt=""/><span className="circle-list-copy"><strong>{<SearchHighlight text={x.title} query={submitted}/>}</strong><span>{<SearchHighlight text={searchSnippet('summary' in x?String(x.summary):'',submitted)} query={submitted}/>}</span><small>{({repair:326,image:1286,visual:963,writing:742,film:618,life:525,character:409} as Record<string,number>)[currentCircles().find(c=>circleTarget(c.id)===x.target)?.id||'']?.toLocaleString()||128} 人加入</small></span><span className="circle-list-arrow">›</span></button>;
 return <button className="search-author-native" key={x.target} onClick={()=>go(x.target)}><img src={img(x.cover)} alt=""/><span><strong>{<SearchHighlight text={x.title} query={submitted}/>}</strong><small>查看作者主页</small></span><Icon name="arrow-right-s"/></button>;
 })}</div>
 {list.length>(searchCounts[t]||4)&&<SearchContinuation key={t+':'+(searchCounts[t]||4)} load={()=>increase(t)}/>}
              </section>
            ) : null;
          })}
        </>
      )}
    </>
  );
}

function Author({ state, go }: Props) {
  const db=useB();
  const desktop=useSyncExternalStore(()=>()=>{},()=>new URLSearchParams(location.search).get('device')==='pc',()=>false);
  const name =
    typeof window === 'undefined'
      ? '林间'
      : new URLSearchParams(window.location.search).get('name') || '林间';
  const [tab, setTab] = useState('作品');
  const [following, setFollowing] = useState(false);
  useEffect(()=>{setFollowing(followedAuthor(name))},[name]);
  const [notice, setNotice] = useState('');
  const cover = detailState({ page: 'author', state, go });
  if (cover) return cover;
  const publicPosts = samplePosts.filter(p=>p.author===name&&(p.id!=='restore'||db.records.find(r=>r.id==='post-1')?.publicStatus==='公开'));
  // Public post associations establish participation; private account memberships are never read here.
  const participatingCircles = currentCircles().filter(c=>!closedCircle(c.id)&&publicPosts.some(p=>p.circle===c.name));
  const items: Record<
    string,
    { title: string; cover: string; target: string }[]
  > = {
    作品: Object.entries(workAuthors)
      .filter(([id,author])=>(db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.public?.author||author)===name&&(!db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))||db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.publicStatus==='公开'))
      .map(([id])=>({title:db.records.find(r=>r.id==='work-'+(id==='restore'?'1':id))?.public?.title||workVariants[id].title,cover:id==='letter'?'writing':id,target:'work?item='+id+(id==='sea'?'&state=video':'')})),
    帖子: publicPosts.map(p=>({title:p.title,cover:p.image,target:postTarget(p.id)})),
  };
  return (
    <>
      <Head title="作者主页" go={go} back="community" />
      <section className="author-public-profile"><div className="reading-author">
        <span className="reading-avatar large">{name.slice(0, 1)}</span>
        <div>
          <h2>{name}</h2>
          <p>AI 创作分享者</p>
        </div>
          <Button
            onClick={() => {
              if (state === 'guest' || !signedIn()) {
                loginFor(go);
                return;
              }
              setFollowing(!following);
              setAuthorFollowing(name,!following);
              setNotice('');
            }}
          >
            {following ? '已关注' : '关注'}
          </Button>
      </div>
      <p className="author-public-bio">{name==='林间'?'记录影像与日常创作的练习，分享作品背后的提示词、参考素材与尝试过程。':'分享 AI 创作中的作品、灵感与实践记录。'}</p>
      <div className="author-public-stats" aria-label="作者公开数据"><div><strong>128</strong><span>获赞</span></div><div><strong>24</strong><span>关注</span></div><div><strong>{following?37:36}</strong><span>粉丝</span></div><div><strong>{Object.values(items).reduce((total,list)=>total+list.length,0)}</strong><span>公开内容</span></div></div>
      </section>
      {notice && <p className="reading-feedback">{notice}</p>}
      <div className="reading-tabs author-public-tabs">
        {Object.keys(items).map((x) => (
          <button
            type="button"
            key={x}
            className={tab === x ? 'active' : ''}
            onClick={() => setTab(x)}
          >
            {x}<small>{items[x].length}</small>
          </button>
        ))}
      </div>
      {state === 'empty' || items[tab].length === 0 ? (
        <Panel title={`暂无公开${tab}`} body="可以查看作者的其他公开栏目。" />
      ) : (
        tab==='作品'?<WorkFeed items={items[tab].map((x,index)=>({id:new URLSearchParams(x.target.split('?')[1]).get('item')||x.cover,title:x.title,author:name,image:img(x.cover),likes:[128,96,72,54][index%4],type:x.target.includes('item=letter')?'文字':x.cover==='sea'?'视频':'图片',target:x.target}))} go={go}/>:!desktop?<div className="author-content-feed is-posts">{items[tab].map(x=><button key={x.target} onClick={()=>go(x.target)}><strong>{x.title}</strong><img src={img(x.cover)} alt=""/></button>)}</div>:<div className="author-posts-layout"><div className="author-posts-reading">{publicPosts.map(post=><article className={'author-post-reading'+(post.image?' has-media':'')} key={post.id}><button className="author-post-copy" onClick={()=>go(postTarget(post.id))}><strong>{post.title}</strong><p>{post.summary}</p></button>{post.image&&<PostImageGallery compact images={postImages(post.id,post.image)} title={post.title}/>}<div className="author-post-context">{post.circle&&participatingCircles.some(c=>c.name===post.circle)&&<button onClick={()=>go(circleTarget(participatingCircles.find(c=>c.name===post.circle)!.id))}># {post.circle}</button>}<time>{post.date}</time></div><ActionBar kind="post" target={postTarget(post.id)} title={post.title} go={go} guest={state==='guest'} onComment={()=>go(postTarget(post.id)+'&discussion=1')} counts={{likes:36+samplePosts.indexOf(post)*17,favorites:8+samplePosts.indexOf(post)*3,comments:7}}/></article>)}</div><aside className="author-participating-circles" aria-label="参与的圈子"><h3>参与的圈子</h3>{participatingCircles.length?participatingCircles.map(circle=><button key={circle.id} onClick={()=>go(circleTarget(circle.id))}><img src={img(circle.cover)} alt=""/><span><strong>{circle.name}</strong><small>{circle.description}</small></span></button>):<p>暂无公开圈子记录</p>}</aside></div>
      )}
    </>
  );
}

function ManagedContentDetail({go}: {go:Props['go']}) {
  const id=typeof window==='undefined'?'':new URLSearchParams(window.location.search).get('owned');
  let record:{id?:string;title?:string;body?:string;caseNote?:string;creationPrompt?:string;status?:string;reason?:string;media?:{url:string;type:string}[]}|null=null;
  try{record=JSON.parse((typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('ownedScope')==='unscoped'?window.sessionStorage.getItem('cp-owned-detail'):sessionStorage.getItem('cp-owned-detail'))||'null');}catch{}
  if(!record||record.id!==id)return <Panel title="内容暂不可访问" action="返回我的内容" onAction={()=>go('my-content')}/>;
  if(new URLSearchParams(location.search).get('device')==='pc'&&new URLSearchParams(location.search).get('page')==='work')return <PCWorkLayout media={<>{record.media?.some(m=>m.type.startsWith('video'))?record.media.filter(m=>m.type.startsWith('video')).map((m,i)=><video key={i} src={m.url} controls className="cp-cover"/>):!!record.media?.length&&<WorkMedia image={record.media[0].url} images={record.media.map(m=>m.url)} title={record.title||'作品'}/>}{!record.media?.length&&<article className="pc-work-text"><p>{record.body}</p></article>}</>} info={<><h2 className="reading-title">{record.title||'未命名作品'}</h2><WorkAuthor name="我" go={go}/><ActionBar kind="work" go={go} onComment={()=>document.querySelector('.pc-work-discussion')?.scrollIntoView({behavior:'smooth'})}/><p className="reading-muted">{record.status==='public'?'已公开':record.status==='rejected'?'未通过':record.status==='removed'?'已下架':'审核中'}</p>{!!record.media?.length&&record.body&&<p className="reading-prose">{record.body}</p>}<p className="reading-prose">{record.caseNote}</p><section className="wd-generation"><h3>提示词</h3><p>{record.creationPrompt||'提示词暂不可用'}</p>{record.creationPrompt&&<button onClick={()=>navigator.clipboard.writeText(record.creationPrompt!)}>复制</button>}</section>{record.reason&&record.status==='rejected'&&<p>{record.reason}</p>}</>} discussion={<Comments inline kind={'work-'+id} go={go}/>}/>;
  return <article className="reading-page"><h2 className="reading-title">{record.title||'未命名内容'}</h2><p className="reading-muted">{record.status==='public'?'已公开':record.status==='rejected'?'未通过':record.status==='removed'?'已下架':'审核中'}</p>{record.media?.map((m,i)=>m.type.startsWith('video')?<video key={i} src={m.url} controls className="cp-cover"/>:<img key={i} src={m.url} className="cp-cover" alt=""/>)}<div className="reading-prose">{record.body&&<p>{record.body}</p>}{record.caseNote&&<p>{record.caseNote}</p>}{record.creationPrompt&&<><h3>创作提示词</h3><p>{record.creationPrompt}</p></>}{record.reason&&record.status==='rejected'&&<p>{record.reason}</p>}</div></article>;
}
export function ReadingPage({ page, state, go }: Props) {
  const [,updateVisibility]=useState(0);
  useEffect(()=>{const refresh=()=>updateVisibility(n=>n+1);window.addEventListener('cp-content-change',refresh);return()=>window.removeEventListener('cp-content-change',refresh)},[]);
  if(['work','post'].includes(page)&&typeof window!=='undefined'){const q=new URLSearchParams(location.search);const target=page+(q.has('owned')?'?owned='+q.get('owned'):'?item='+(q.get('item')||'restore'));if(deletedTarget(target))return <Panel title="内容已删除" action="返回我的内容" onAction={()=>go('mine?panel=content')}/>;}

  if(['work','post'].includes(page)&&typeof window!=='undefined'&&new URLSearchParams(window.location.search).has('owned'))return <ManagedContentDetail go={go}/>;
  const p = { page, state, go };
  switch (page) {
    case 'aigc': return <CommunityLanding state={state} go={go} initialTab="works" desktop/>;
    case 'discussion': return <DesktopCircleCommunity state={state} go={go}/>;
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
    case 'discover-circles': return <DiscoverCircles {...p}/>;
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
    default:
      return null;
  }
}


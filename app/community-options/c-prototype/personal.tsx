'use client';
import {hiddenPublicTarget} from './content-visibility';
import {useB} from '../b-prototype/store';
import {persistentSubmissionMedia,submitCContent,useCSubmissions,changeCSubmissionState} from './c-submission-adapter';
import {MediaPreview} from './media-preview';
import {TransientFeedback} from './transient-feedback';
import {AccountBindings} from './account-bindings';
import {countCharacters} from './business-text';
import {mobileContentCategories} from './content-categories';
import {invitationRules, personalPointsSample, pointChange, demoInviteCode, readDemoInviter, bindDemoInviter} from './personal-benefits-data';
import {MessageCenter} from './messages';
/* oxlint-disable react/react-compiler -- The login/draft upload buffers and timestamps are mutated only by user actions in this local prototype. */
import { checkinRecords, pointBalance, taskHistory, type PrototypeTask, followedAuthor, followedAuthors, followingCount, setAuthorFollowing, subscribeAuthorFollowing } from './storage';
/* eslint-disable next/no-img-element, jsx-a11y/media-has-caption -- Bundled images and silent local media previews are intentional in this research prototype. */

import { prototypeStore as sessionStorage, getFavorites, toggleFavorite, currentTarget } from './storage';
import { sampleCircles, samplePosts, currentContentCircles, contentCircleId, contentCircleName } from './content-data';
import { readActivitySubmissions, saveActivitySubmissions } from '../b-prototype/operations-data';
import { readPublishedEventConfigs, type EventConfig } from '../b-prototype/retained-event-config';
import { readCActivities } from './retained-activities';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LightWorkbench, GenerationResult } from './light-workbench';
import { CreationEntry } from './creation-entry';
import { LoginOverlay } from './login-overlay';
import './personal.css';

const activityCode = () => { const code = sessionStorage.getItem('cp-activity-code'); return code === 'referral' ? 'invite_reward' : code; };
const publishedActivity = () => readPublishedEventConfigs().find((item) => item.code === activityCode());
const currentActivityTask = () => publishedActivity()?.tasks.find((task) => task.name === sessionStorage.getItem('cp-activity-task'));
const activityAllowsPosts = () => {
  const task = currentActivityTask();
  if (task) return task.event_filter.biz_type === 'post' || task.event_type.startsWith('post.') || task.name.includes('圈子帖子');
  return publishedActivity()?.extra_config.publish_config.biz_type === 'post' || activityCode() === 'meizhourenwu';
};

type Props = { page: string; state: string; go: (page: string) => void };
type Page = { id: string; title: string; module: string; states: string[] };

export const personalPages: Page[] = [
  { id: 'creation-entry', title: '创作与发布入口', module: '创作与发布', states: ['normal'] },
  {
    id: 'create',
    title: 'AIGC 生成',
    module: '创作与发布',
    states: ['normal', 'running', 'completed', 'failure'],
  },
  { id: 'create-result', title: 'AIGC 查看结果', module: '创作与发布', states: ['normal','result-text','result-video'] },
  {
    id: 'post-edit',
    title: '发布作品',
    module: '创作与发布',
    states: [
      'normal',
      'validation',
      'uploading',
      'upload-failed',
      'save-failed',
      'submit-failed',
      'conflict',
      'login-expired',
    ],
  },
  { id: 'post-publish', title: '发布帖子', module: '创作与发布', states: ['normal','validation','uploading','upload-failed','save-failed','submit-failed','login-expired'] },
  {
    id: 'mine',
    title: '我的',
    module: '个人管理',
    states: ['normal'],
  },
  { id: 'my-relations', title: '关注作者', module: '个人管理', states: ['normal'] },
  { id: 'my-fans', title: '我的粉丝', module: '个人管理', states: ['normal'] },
  { id: 'my-circles', title: '我的圈子', module: '个人管理', states: ['normal'] },
  { id: 'profile-edit', title: '编辑资料', module: '个人管理', states: ['normal'] },
  {
    id: 'login',
    title: '登录',
    module: '账户',
    states: [
      'normal',
    ],
  },
  {
    id: 'notifications',
    title: '消息中心',
    module: '账户',
    states: ['normal'],
  },
  {
    id: 'activities',
    title: '活动中心',
    module: '活动',
    states: ['normal', 'empty', 'failure'],
  },
  {
    id: 'activity',
    title: '活动详情',
    module: '活动',
    states: ['normal'],
  },
  {
    id: 'points',
    title: '积分中心',
    module: '既有业务',
    states: ['normal'],
  },
  {
    id: 'checkin',
    title: '每日签到',
    module: '既有业务',
    states: ['normal'],
  },
  {
    id: 'invite',
    title: '邀请有礼',
    module: '既有业务',
    states: ['normal'],
  },
  {
    id: 'shop',
    title: 'AI 商城',
    module: '既有业务',
    states: [
      'normal',
    ],
  },
  { id: 'shop-exchange', title: '兑换弹层', module: 'AI 商城', states: ['normal','exchange-confirm','exchange-success','exchange-insufficient','exchange-failure'] },
  { id: 'shop-records', title: '兑换记录', module: 'AI 商城', states: ['normal'] },
];

const ASSET = '/home-prototype/';
const img = (name: string) => `${ASSET}${name}.png`;
let pendingUploads: File[] = [];
let draftUploads: File[] = [];
let submissionUploads: File[] = [];

function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={'cp-button' + (secondary ? ' cp-personal-secondary' : '')}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Head({ title, subtitle }: { title: string; subtitle?: string }) {
  void title;
  return subtitle ? <p className="cp-personal-head cp-muted">{subtitle}</p> : null;
}
function Notice({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode;
  tone?: 'neutral' | 'warn' | 'error' | 'success';
}) {
  return (
    <output className={`cp-personal-notice cp-personal-${tone}`}>
      {children}
    </output>
  );
}
function Empty({
  title,
  detail,
  action,
  onAction,
  creationGo,
}: {
  title: string;
  detail?: string;
  action?: string;
  onAction?: () => void;
  creationGo?: (page: string) => void;
}) {
  return (
    <div className="cp-card cp-personal-empty">
      <h2>{title}</h2>
      <p className="cp-muted">{detail}</p>
      {creationGo ? <CreationEntry go={creationGo} label={action || "去创作"} /> : action && onAction && <Button onClick={onAction}>{action}</Button>}
    </div>
  );
}
function Failure({ go }: { go: (page: string) => void }) {
  return (
    <Empty
      title="暂时无法载入"
      detail="已显示的内容仍可查看。请稍后重试。"
      action="返回我的"
      onAction={() => go('mine')}
    />
  );
}
function NeedLogin({ go }: { go: (page: string) => void }) {
  return (
    <Empty
      title="登录状态已过期"
      detail="重新登录后会回到当前操作；发布和投稿仍需你确认。"
      action="重新登录"
      onAction={() => {
        sessionStorage.setItem('cp-return', currentTarget());
        go('login');
      }}
    />
  );
}
function Gate({
  state,
  go,
  children,
  requiresAccount = true,
}: {
  state: string;
  go: (page: string) => void;
  children: React.ReactNode;
  requiresAccount?: boolean;
}) {
  if (state === 'failure') return <Failure go={go} />;
  if (state === 'login-expired') return <NeedLogin go={go} />;
  const reviewFixture=typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('embed')==='1';
  if(requiresAccount&&!reviewFixture&&sessionStorage.getItem('cp-auth')!=='1')
    return <Empty title="登录后查看" detail="" action="去登录" onAction={()=>{
      sessionStorage.setItem('cp-return',currentTarget());
      go('login');
    }}/>;
  return <>{children}</>;
}

function Create({ state, go }: Props) { return <LightWorkbench state={state} go={go} />; }

function PostEdit({ page, state: requestedState, go }: Props) {
  const state = ['activity','review','activity-ended','permission','rejected'].includes(requestedState) ? 'normal' : requestedState;
  const joinedCircles=currentContentCircles().filter(c=>c.status!=='已关闭'&&(sessionStorage.getItem('cp-circle-joined:'+c.id)==='1'||(c.id==='image'&&sessionStorage.getItem('cp-circle-joined')==='1')||sessionStorage.getItem('cp-circle')===c.name||sessionStorage.getItem('cp-circle-id')===c.id));
  const kind = page === 'post-publish' ? 'post' : 'work';
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [workType, setWorkType] = useState<'image'|'video'|'text'>('image');
  const [topics, setTopics] = useState<string[]>([]);
  const [titleOpen, setTitleOpen] = useState(true);
  const [imagePreview, setImagePreview] = useState<{url:string;name:string}|null>(null);
  const editorRoot=useRef<HTMLDivElement>(null);
  const editingOrigin=useRef<SubmissionSnapshot|null>(null);
  const [invalidField,setInvalidField]=useState('');
  const fieldError=(name:string)=>invalidField===name?<small role="alert" className="cp-field-error">{message}</small>:null;
  const [referenceOpen, setReferenceOpen] = useState(false);
  const topicDropdown = useRef<HTMLDetailsElement>(null);
  useEffect(()=>{const close=(e:PointerEvent)=>{if(topicDropdown.current && !topicDropdown.current.contains(e.target as Node)) topicDropdown.current.open=false;};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
  const referenceDB=useB();
  const referenceAvailable=(target:string)=>{if(hiddenPublicTarget(target))return false;const [kind,query]=target.split('?');const item=new URLSearchParams(query||'').get('item');const id=kind+'-'+(!item||item==='restore'||item==='copy'?'1':item);const record=referenceDB.records.find(r=>r.id===id);return !record||record.publicStatus==='公开'};
  const references = [{id:'work?item=perfume',title:'一瓶夏日晴光',type:'作品'}, ...samplePosts.slice(0,5).map(p=>({id:'post?item='+p.id,title:p.title,type:'帖子'})),{id:'app',title:'文案改写',type:'AI应用'}];
  const activityUnavailable = (item: ReturnType<typeof readCActivities>[number]) => {
    const config = readPublishedEventConfigs().find(c=>c.code===item.code)?.extra_config.publish_config;
    const type = workType === 'image' ? 2 : workType === 'video' ? 3 : 4;
    return item.status !== '进行中' || item.locked || (kind === 'post' ? item.publishKind !== 'post' && item.code !== 'meizhourenwu' : config?.biz_type === 'post' || Boolean(config?.content_types.length && !config.content_types.includes(type)));
  };
  const [, setActivitySelection] = useState('');
  const [body, setBody] = useState('');
  const [relation, setRelation] = useState('');
  const [scene, setScene] = useState('');
  const [model, setModel] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [creationPrompt, setCreationPrompt] = useState('');
  const [circleId,setCircleId]=useState(()=>sessionStorage.getItem('cp-circle')?(sessionStorage.getItem('cp-circle-id')||''):'');
  const [circle, setCircle] = useState(
    () => contentCircleName(sessionStorage.getItem('cp-circle') || '',sessionStorage.getItem('cp-circle')?sessionStorage.getItem('cp-circle-id')||undefined:undefined),
  );
  const [files, setFiles] = useState<
    { name: string; url: string; type: string; size: number; source?: File }[]
  >([]);
  const urls = useRef<string[]>([]);
  const [message, setMessage] = useState(
    state === 'save-failed'
      ? '保存失败，输入仍在。请重试。'
      : state === 'submit-failed'
        ? '提交失败，输入仍在。请重试。'
        : '',
  );
  useEffect(()=>{if(invalidField){const input=editorRoot.current?.querySelector<HTMLElement>('[data-field="'+invalidField+'"]');input?.focus();input?.scrollIntoView({block:'center',behavior:'smooth'});}},[invalidField,message]);
  const [activity, setActivity] = useState(
    state === 'activity' || state === 'activity-ended',
  );
  useEffect(
    () => () => urls.current.forEach((url) => URL.revokeObjectURL(url)),
    [],
  );
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const activityLinked =
        state === 'activity' ||
        state === 'activity-ended' ||
        sessionStorage.getItem('cp-activity') === '1';
      setActivity(activityLinked);
      const source = sessionStorage.getItem('cp-pending-edit') || sessionStorage.getItem('cp-open-draft') === '1' ? null : sessionStorage.getItem('cp-source');
      if (source) {
        const result = JSON.parse(
          sessionStorage.getItem('cp-result') || 'null',
        ) as {
          prompt?: string;
          model?: string;
          kind?: string;
          text?: string;
          image?: string;
          video?: string;
          title?: string;
          app?: string;
          project?: string;
          version?: string;
          origin?: string;
          attempt?: string;
        } | null;
        if(result?.project&&result?.version)setRelation(result.project+' · 版本 '+result.version);
        const task = JSON.parse(
          sessionStorage.getItem('cp-task') || 'null',
        ) as { item?: string; input?: string; activityCode?:string; activityName?:string; activityTask?:string } | null;
        if(source==='light-result'){
          setCreationPrompt(result?.prompt || task?.input || '');
          setModel(result?.model || '');
          if(task?.activityTask) sessionStorage.setItem('cp-activity-task',task.activityTask); else sessionStorage.removeItem('cp-activity-task');
          if(task?.activityCode&&task?.activityName){
            sessionStorage.setItem('cp-activity','1');
            sessionStorage.setItem('cp-activity-code',task.activityCode);
            sessionStorage.setItem('cp-activity-name',task.activityName);
            setActivity(true);
          }else{
            ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(key=>sessionStorage.removeItem(key));
            setActivity(false);
          }
        }
        if (result?.kind) setWorkType(result.kind === 'text' ? 'text' : result.kind === 'video' ? 'video' : 'image');
        if (result?.kind === 'text') {
          setTitle(result.title || '文字创作结果');
          setBody(result.text || '');
        } else if (result?.kind === 'image' && result.image) {
          setTitle(result.title || '图片创作结果');
          setFiles([
            {
              name: '已选择的成果',
              url: result.image,
              type: 'image/png',
              size: 0,
            },
          ]);
        } else if (result?.kind === 'video' && result.video) {
          setTitle(result.title || '视频创作结果');
          setFiles([{ name: '已选择的成果', url: result.video, type: 'video/mp4', size: 0 }]);
        } else {
          const file =
            source === 'MakeNow'
              ? 'perfume'
              : task?.item === 'background'
                ? 'perfume'
                : task?.item === 'restore'
                  ? 'restore'
                  : 'sea';
          setTitle(
            source === 'MakeNow'
              ? '一瓶夏日晴光'
              : file === 'restore'
                ? '修复后的照片'
                : file === 'sea'
                  ? '产品短片制作'
                  : '产品换背景',
          );
          setFiles([
            {
              name: '已选择的成果',
              url: img(file),
              type: 'image/png',
              size: 0,
            },
          ]);
        }
        setMessage('');
      }
      const pending = sessionStorage.getItem('cp-pending-edit');
      if (pending && new URLSearchParams(window.location.search).get('page') !== 'login') {
        try {
          const value = JSON.parse(pending);
          editingOrigin.current=value.contentId?value:null;
          setTitle(value.title || '');
          setCategory(value.category || '');
          setWorkType(value.workType || (value.media?.[0]?.type?.startsWith('video/') ? 'video' : 'image'));
          setTopics(value.topics || []);
          setTitleOpen(true);
          setBody(value.body || '');
          setRelation(value.relation || '');
          setScene(value.scene || '');
          setModel(value.model || '');
          setCaseNote(value.caseNote || '');
          setCreationPrompt(value.creationPrompt || '');
          setCircleId(value.circleId||contentCircleId(value.circle||'')||'');setCircle(contentCircleName(value.circle||'',value.circleId));
          setFiles(value.media || []);
          if (value.fileCount > (value.media?.length || 0) && !pendingUploads.length) setMessage('原本地素材需要重新选择，文字和发布信息已恢复。');
        } catch {}
        sessionStorage.removeItem('cp-pending-edit');
        if (pendingUploads.length) {
          const restoredUploads = pendingUploads.map((file) => {
              const url = URL.createObjectURL(file);
              urls.current.push(url);
              return {
                name: file.name,
                url,
                type: file.type,
                size: file.size,
                source: file,
              };
            });
          setFiles(previous => [...previous, ...restoredUploads]);
          pendingUploads = [];
        }
      }
      if (sessionStorage.getItem('cp-open-draft') === '1') {
        sessionStorage.removeItem('cp-open-draft');
        try {
          const draft = JSON.parse(
            sessionStorage.getItem('cp-draft') || 'null',
          );
          if (draft && draft.expiresAt > Date.now()) {
            editingOrigin.current=draft.contentId?draft:null;
            if (draft.activityCode) {
              sessionStorage.setItem('cp-activity', '1');
              sessionStorage.setItem('cp-activity-code', draft.activityCode);
              sessionStorage.setItem('cp-activity-name', draft.activityName || '');
              sessionStorage.setItem('cp-activity-task', draft.activityTask || '');
              setActivity(true);
            }
            setTitle(draft.title || '');
            setCategory(draft.category || '');
          setWorkType(draft.workType || (draft.media?.[0]?.type?.startsWith('video/') ? 'video' : 'image'));
          setTopics(draft.topics || []);
          setTitleOpen(true);
            setBody(draft.body || '');
            setRelation(draft.relation || '');
            setScene(draft.scene || '');
            setModel(draft.model || '');
            setCaseNote(draft.caseNote || '');
            setCreationPrompt(draft.creationPrompt || '');
            setCircleId(draft.circleId||contentCircleId(draft.circle||'')||'');setCircle(contentCircleName(draft.circle||'',draft.circleId));
            setFiles(draft.media || []);
            if (draft.fileCount > (draft.media?.length || 0) && !draftUploads.length) setMessage('本地文件无法跨浏览器刷新保留，请重新选择素材。');
            if (draftUploads.length)
              setFiles(previous => [...previous,
                ...draftUploads.map((file) => {
                  const url = URL.createObjectURL(file);
                  urls.current.push(url);
                  return {
                    name: file.name,
                    url,
                    type: file.type,
                    size: file.size,
                    source: file,
                  };
                }),
              ]);
          }
        } catch {}
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state]);
  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;
    if (kind === 'work' && incoming.some(f => workType === 'image' ? !f.type.startsWith('image/') : workType === 'video' ? !f.type.startsWith('video/') : true)) { setMessage('请选择与作品类型一致的素材。'); return; }
    const existingVideo = files.some((f) => f.type.startsWith('video/'));
    const nextVideo = incoming.some((f) => f.type.startsWith('video/'));
    if ((existingVideo || nextVideo) && files.length + incoming.length > 1) {
      setMessage('图片和视频不能混用；每次最多 1 段视频。');
      return;
    }
    if (files.length + incoming.length > 4) {
      setMessage('图片最多 4 张。');
      return;
    }
    const bad = incoming.find((f) =>
      f.type.startsWith('image/')
        ? f.size > 20 * 1024 * 1024
        : f.type.startsWith('video/')
          ? f.size > 300 * 1024 * 1024
          : true,
    );
    if (bad) {
      setMessage('图片单张不超过 20 MB；视频单条不超过 300 MB。');
      return;
    }
    setFiles((v) => [
      ...v,
      ...incoming.map((f) => {
        const url = URL.createObjectURL(f);
        urls.current.push(url);
        return { name: f.name, url, type: f.type, size: f.size, source: f };
      }),
    ]);
    setInvalidField('');
    setMessage('');
    event.target.value = '';
  };
  const validate = () => {
    if(relation&&(!references.some(r=>r.id===relation)||!referenceAvailable(relation)))return '引用内容已失效，请移除或重新选择。';
    if (kind === 'work' && !creationPrompt.trim()) return '请填写提示词。';
    if (files.length > 4) return '图片最多 4 张，请移除多余素材。';
    const code = activityCode();
    const activityTask = sessionStorage.getItem('cp-activity-task') || '';
    const event = activity ? readCActivities().find((item) => item.code === code) : undefined;
    if (activity && (!event || event.status !== '进行中' || event.locked)) return '当前活动暂不能新投稿，请查看活动详情。';
    if (kind === 'work' && !title.trim()) return '请填写作品标题。';
    if (countCharacters(title) > 60) return '标题最多 60 字。';
    if (kind === 'work' && (workType === 'text' ? files.length > 0 : files.some(f=>!f.type.startsWith(workType + '/')))) return '素材与作品类型不一致，请重新选择。';
    if (kind === 'work' && workType !== 'text' && !files.length) return '请添加作品素材。';
    if (kind === 'work' && workType === 'text' && !body.trim()) return '请填写文本正文。';
    if (activity && kind === 'post' && !activityAllowsPosts()) return '活动只能投稿作品。';
    if (activity && code === 'meizhourenwu') {
      if (activityTask.includes('纯文字') && (kind !== 'post' || files.length)) return '本次任务需提交纯文字圈子帖子。';
      if (activityTask.includes('图片圈子') && (kind !== 'post' || !files.some(f => f.type.startsWith('image/')))) return '本次任务需提交带图片的圈子帖子。';
      if (activityTask.includes('图片作品') && (kind !== 'work' || !files.some(f => f.type.startsWith('image/')))) return '本次任务需提交图片作品。';
    }
    if (activity && ['ai_image_challenge', 'prompt_co_creation'].includes(code || '')) {
      if (kind !== 'work') return '当前活动只接受作品。';
      if (countCharacters(title.trim()) < 4) return '活动作品标题至少 4 字。';
      if (!scene.trim() || !model.trim()) return '请填写创作场景与使用模型。';
      if (code === 'ai_image_challenge' && (!files.some(f => f.type.startsWith('image/')) || !(topics.includes('生图挑战') || body.includes('#生图挑战')) || (body.match(/[\u3400-\u9fff]/g) || []).length < 30)) return '生图挑战需图片、#生图挑战，正文至少 30 个汉字。';
      if (code === 'prompt_co_creation' && (!files.length || !caseNote.trim() || ((body.match(/[\u3400-\u9fff]/g) || []).length < 30 && (body.match(/[A-Za-z]+/g) || []).length < 20))) return 'Prompt 共创需素材、案例和足量正文（中文 30 字或英文 20 词）。';
    }
    if (activity) {
      const config = publishedActivity();
      if (!config) return '活动配置未发布，暂不能投稿。';
      const publish = config.extra_config.publish_config;
      if (publish.required_category && !category) return '请选择内容分类。';
      if (publish.required_topic && !topics.length && !body.includes('#')) return '请选择活动话题。';
      if (publish.required_model && !model.trim()) return '请填写使用模型。';
      if (publish.required_scene && !scene.trim()) return '请填写创作场景。';
      if (publish.biz_type === 'prompt' && !creationPrompt.trim()) return '请填写提示词。';
      const task = currentActivityTask();
      if (publish.biz_type === 'post' && kind !== 'post') return '当前活动只接受帖子。';
      if (publish.require_join_token && sessionStorage.getItem('cp-joined-' + code) !== '1') return '请先在活动详情参与，再提交内容。';
      const titleMin = Math.max(publish.title_min_len, task?.validation_rule.title_min_len || 0);
      if (kind === 'work' && countCharacters(title.trim()) < titleMin) return `活动标题至少 ${titleMin} 字。`;
      const imageCount = files.filter((file) => file.type.startsWith('image/')).length;
      const videoCount = files.filter((file) => file.type.startsWith('video/')).length;
      if (imageCount < Math.max(publish.min_image_count, task?.event_filter.min_image_count || 0)) return '活动图片数量不足，请核对活动要求。';
      if (videoCount < publish.min_video_count) return '活动视频数量不足，请核对活动要求。';
      if ((imageCount > 0 && !publish.media_types.includes('image')) || (videoCount > 0 && !publish.media_types.includes('video'))) return '所选媒体类型不符合活动投稿要求。';
      const contentType = kind === 'post' ? files.length ? 2 : 1 : videoCount ? 3 : imageCount ? 2 : publish.biz_type === 'prompt' ? 1 : 4;
      const allowedTypes = task?.event_filter.content_types?.length ? task.event_filter.content_types : publish.content_types;
      if (!(kind === 'post' && code === 'meizhourenwu' && !task?.event_filter.content_types?.length) && !allowedTypes.includes(contentType)) return '当前内容类型不符合活动投稿要求，请核对图片、视频或文字成果。';
      if (publish.topic_codes.length && !publish.topic_codes.some((topic) => (topics.includes(topic) || body.includes('#' + topic)))) return '请选择活动指定话题。';
      if (publish.category_codes.length && !publish.category_codes.includes(category)) return '请选择活动要求的内容分类。';
      if (publish.model_codes.length && !publish.model_codes.includes(model.trim())) return '所选模型不符合活动要求。';
      if (publish.scene_codes.length && !publish.scene_codes.includes(scene.trim())) return '创作场景不符合活动要求。';
      const required = task?.validation_rule.required_fields || [];
      if (required.includes('scene') && !scene.trim()) return '请填写创作场景。';
      if (required.includes('model') && !model.trim()) return '请填写使用模型。';
      if (required.includes('case') && !caseNote.trim()) return '请填写案例说明。';
      const minContent = task?.validation_rule.content_min_cn_chars || 0;
      if (minContent && code !== 'prompt_co_creation' && (body.match(/[\u3400-\u9fff]/g) || []).length < minContent) return `活动正文至少 ${minContent} 个汉字。`;
    }
    if (kind === 'post' && !body.trim()) return '请填写帖子正文。';
    if (kind === 'post' && circle && !joinedCircles.some(c=>c.name===circle)) return '所选圈子已不可用，请重新选择。';
    if (countCharacters(body) > 20000) return '正文最多 20,000 字。';
    if (state === 'activity-ended' && activity)
      return '活动已结束。可保留草稿，或主动取消活动关联后普通发布。';
    return '';
  };
  const save = () => {
    if (sessionStorage.getItem('cp-auth') !== '1') {
      sessionStorage.setItem('cp-return', kind === 'post' ? 'post-publish' : 'post-edit');
      sessionStorage.setItem(
        'cp-pending-edit',
        JSON.stringify({ contentId:editingOrigin.current?.contentId, firstPublishedAt:editingOrigin.current?.firstPublishedAt, kind, title, category, workType, topics, body, relation, circle, circleId, scene, model, caseNote, creationPrompt, fileCount: files.length, media: files.filter(file => !file.url.startsWith('blob:')).map(({name,url,type,size}) => ({name,url,type,size})) }),
      );
      pendingUploads = files.flatMap((file) =>
        file.source ? [file.source] : [],
      );
      go('login');
      return false;
    }
    if (state === 'save-failed') {
      setMessage('保存失败，当前输入和已选素材仍在。可重试。');
      return false;
    }
    const savedAt = Date.now();
    draftUploads = files.flatMap((file) => (file.source ? [file.source] : []));
    sessionStorage.setItem(
      'cp-draft',
      JSON.stringify({
        contentId:editingOrigin.current?.contentId,
        firstPublishedAt:editingOrigin.current?.firstPublishedAt,
        kind,
        title,
        category,
        workType,
        topics,
        body,
        relation,
        circle, circleId:circle?contentCircleId(circle,circleId):undefined,
        scene,
        model,
        caseNote,
        creationPrompt,
        activityCode: activity ? sessionStorage.getItem('cp-activity-code') : null,
        activityName: activity ? sessionStorage.getItem('cp-activity-name') : null,
        activityTask: activity ? sessionStorage.getItem('cp-activity-task') : null,
        fileCount: files.length,
        media: files.filter(f=>!f.url.startsWith('blob:')).map(({name,url,type,size})=>({name,url,type,size})),
        savedAt,
        expiresAt: savedAt + 30 * 86400000,
      }),
    );
    setMessage('草稿已保存');
    return true;
  };
  const submit = async () => {
    const error = validate();
    if (error) {
      setMessage(error);
      setInvalidField(error.includes('提示词')?'prompt':error.includes('标题')?'title':error.includes('分类')?'category':error.includes('素材')||error.includes('图片数量')||error.includes('视频数量')||error.includes('媒体类型')?'media':error.includes('模型')?'model':error.includes('场景')?'scene':error.includes('话题')?'topic':error.includes('圈子')?'circle':error.includes('活动')?'activity':'body');
      return;
    }
    if (sessionStorage.getItem('cp-auth') !== '1') {
      sessionStorage.setItem('cp-return', kind === 'post' ? 'post-publish' : 'post-edit');
      sessionStorage.setItem(
        'cp-pending-edit',
        JSON.stringify({ kind, title, category, workType, topics, body, relation, circle, circleId, scene, model, caseNote, creationPrompt, fileCount: files.length, media: files.filter(file => !file.url.startsWith('blob:')).map(({name,url,type,size}) => ({name,url,type,size})) }),
      );
      pendingUploads = files.flatMap((file) =>
        file.source ? [file.source] : [],
      );
      go('login');
      return;
    }
    if (state === 'submit-failed') {
      setMessage('提交未成功，输入仍在。请先核对状态，再重试同一次提交。');
      return;
    }
    submissionUploads = files.flatMap(file => file.source ? [file.source] : []);
    const original=editingOrigin.current;
    const contentId=original?.contentId||kind+'-'+crypto.randomUUID().slice(0,8);
    let savedMedia;try{savedMedia=await persistentSubmissionMedia(files);}catch(error){setMessage(error instanceof Error?error.message:'素材保存失败，请重试');return;}
    try{submitCContent({contentId,kind,title,category,workType,topics,body,circle,circleId:circle?contentCircleId(circle,circleId):undefined,scene,creationPrompt,model,submittedAt:Date.now(),firstPublishedAt:original?.firstPublishedAt,media:savedMedia,status:'review'},sessionStorage.getItem('cp-profile-name')||'林间');}catch{setMessage('提交失败，输入已保留，请重试');return;}
    sessionStorage.setItem(
      'cp-submission',
      JSON.stringify({ contentId, firstPublishedAt:original?.firstPublishedAt, kind, title, category, workType, topics, body, relation, circle, circleId, scene, caseNote, creationPrompt, model, activity, activityCode: activity ? sessionStorage.getItem('cp-activity-code') : null, activityName: activity ? sessionStorage.getItem('cp-activity-name') : null, activityTask: activity ? sessionStorage.getItem('cp-activity-task') : null, submittedAt: Date.now(), fileCount: files.length, media: savedMedia, status: 'review' }),
    );
    const managed=JSON.parse(sessionStorage.getItem('cp-personal-content-state')||'{}');
    managed[contentId]={status:'review',modified:true};
    sessionStorage.setItem('cp-personal-content-state',JSON.stringify(managed));
    window.dispatchEvent(new Event('cp-content-change'));
    if (activity) {
      const activitySubmission = { id: 'submission-'+Date.now(), title, body, kind, activityCode: sessionStorage.getItem('cp-activity-code'), activityName: sessionStorage.getItem('cp-activity-name'), contentStatus: 'review', eligibility: 'pending', reward: 'pending', submittedAt: Date.now() };
      sessionStorage.setItem(
        'cp-activity-submission',
        JSON.stringify(activitySubmission),
      );
      saveActivitySubmissions([activitySubmission, ...readActivitySubmissions()]);
    }
    sessionStorage.removeItem('cp-source');
    sessionStorage.removeItem('cp-result');
    sessionStorage.removeItem('cp-draft');
    draftUploads = [];
    setMessage('已提交。');
    go('my-content');
  };
  if (state === 'login-expired')
    return (
      <>
        <Head title={kind === 'post' ? '发布帖子' : '发布作品'} />
        <NeedLogin go={go} />
      </>
    );
  return (
    <>
      <Head title={kind === 'post' ? '发布帖子' : '发布作品'} />
      {state === 'activity-ended' && activity && (
        <Notice tone="warn">
          活动已结束。可保存私人草稿；普通发布需主动解除活动关联。
          <Button
            secondary
            onClick={() => {
              sessionStorage.removeItem('cp-activity');
              setActivity(false);
            }}
          >
            解除关联
          </Button>
        </Notice>
      )}
      {state === 'review' && (
        <Notice>修改审核中。若需继续编辑，请先撤回本次提交。</Notice>
      )}
      {state === 'permission' && (
        <Notice tone="warn">当前无提交权限。你可以复制本次输入后离开。</Notice>
      )}
      {state === 'conflict' && (
        <Notice tone="warn">
          此内容已有较新版本。不能用当前表单覆盖。
          <span className="cp-actions">
            <Button secondary onClick={() => go('my-content')}>
              查看当前版本
            </Button>
            <Button
              secondary
              onClick={() =>
                navigator.clipboard?.writeText([title, body].join('\n'))
              }
            >
              复制本次文字
            </Button>
            <Button
              secondary
              onClick={() => setMessage('请确认已复制文字，再刷新并重新编辑。')}
            >
              刷新后继续
            </Button>
          </span>
        </Notice>
      )}
      {state === 'uploading' && <Notice>素材处理中；完成前暂不能提交。</Notice>}
      {state === 'upload-failed' && (
        <Notice tone="error">
          有素材上传失败。移除失败项或重新选择后，再由你确认提交。
        </Notice>
      )}
      {state === 'validation' && (
        <Notice tone="warn">
          请检查必填内容和媒体限制；不会截断已输入内容。
        </Notice>
      )}
      <MediaPreview title="素材预览" items={imagePreview?[{src:imagePreview.url,name:imagePreview.name}]:[]} index={imagePreview?0:null} onIndexChange={()=>{}} onClose={()=>setImagePreview(null)}/>
      {kind === 'work' && <nav className="cp-work-type-tabs" aria-label="作品类型">{(['image','video','text'] as const).map(type => <button key={type} type="button" aria-pressed={workType === type} onClick={()=>{if(files.length && type !== workType){setMessage('请先移除当前素材，再切换作品类型；已填写的文字会保留。');return;}setWorkType(type);setMessage('');}}>{{image:'图片',video:'视频',text:'文本'}[type]}</button>)}</nav>}
      <div ref={editorRoot} onChange={e=>{const field=e.target as HTMLInputElement;if(field.type!=='file'&&field.dataset.field===invalidField){setInvalidField('');setMessage('')}}} className={'cp-card cp-personal-form cp-publish-editor is-' + kind}>
        <section className="cp-editor-content" aria-label="编辑正文">
        {(kind === 'post' || workType !== 'text') && <div className="cp-editor-media-section">
        <div className="cp-editor-section-heading"><strong>{kind === 'post' ? '添加图片 / 视频（选填）' : workType === 'video' ? '视频素材' : '图片素材'}</strong><small>{files.length}/{kind === 'work' && workType === 'video' || files.some(f=>f.type.startsWith('video/')) ? 1 : 4}</small></div>
        {fieldError('media')}<div className="cp-editor-media-grid">
          {files.map((f, i) => <div className="cp-editor-media-tile" key={f.url}>
            {f.type.startsWith('image/') ? <button type="button" className="cp-editor-image-open" aria-label={'预览图片 ' + (i + 1)} onClick={()=>setImagePreview({url:f.url,name:f.name})}><img src={f.url} alt={f.name} /></button> : <video src={f.url} controls />}
            {i === 0 && f.type.startsWith('image/') && <span className="cp-editor-cover">封面</span>}
            <button type="button" className="cp-editor-remove" aria-label={'移除素材 ' + (i + 1)} onClick={() => setFiles(v => v.filter((_, n) => n !== i))}>×</button>
          </div>)}
          {!files.some(f => f.type.startsWith('video/')) && files.length < 4 && <label className="cp-personal-upload cp-editor-upload">
            <img src="/home-prototype/icons/add-line.svg" alt="" /><strong>{kind === 'work' ? workType === 'video' ? '添加视频' : '添加图片' : files.length ? '添加图片' : '添加图片 / 视频'}</strong>
            <input data-field="media" aria-invalid={invalidField==='media'} aria-label="选择图片或视频" type="file" accept={kind === 'work' ? workType === 'video' ? 'video/*' : 'image/*' : files.length ? 'image/*' : 'image/*,video/*'} multiple onChange={chooseFiles} />
          </label>}
        </div>

        </div>}
        {kind === 'post' && !titleOpen && !title && <button type="button" className="cp-add-title" onClick={()=>setTitleOpen(true)}>＋ 添加标题（选填）</button>}
        {(kind === 'work' || titleOpen || Boolean(title)) && <label className="cp-editor-title">
          <span>标题 {kind === 'post' && <small className="cp-muted">选填</small>}</span>
          <input
            className="cp-input"
            data-field="title" aria-invalid={invalidField==='title'} value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === 'work' ? '给作品起个名字' : '可选：概括讨论主题'
            }
          />
          <small className="cp-muted">{countCharacters(title)} / 60 字</small>
          {fieldError('title')}
        </label>}
        <label className="cp-editor-body">
          {kind === 'post' ? '正文' : workType === 'text' ? '文本正文' : '作品介绍（选填）'}
          <textarea
            className="cp-input"
            data-field="body" aria-invalid={invalidField==='body'} value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              kind === 'post'
                ? '写下问题、过程或经验'
                : workType === 'text' ? '填写你的文本作品' : '介绍作品内容或创作思路'
            }
            rows={6}
          /><small className="cp-muted">{countCharacters(body)} / 20,000 字</small>{fieldError('body')}
        </label>
        {kind === 'work' && <section className="cp-creation-info"><h2>创作信息</h2><label>提示词（必填）<textarea required aria-required="true" className="cp-input" data-field="prompt" aria-invalid={invalidField==='prompt'} value={creationPrompt} onChange={e=>setCreationPrompt(e.target.value)} rows={3} placeholder="分享创作时使用的提示词" />{fieldError('prompt')}</label><label>使用模型（选填）<input className="cp-input" data-field="model" aria-invalid={invalidField==='model'} value={model} onChange={e=>setModel(e.target.value)} placeholder="填写实际使用的模型" />{fieldError('model')}</label></section>}
        </section>
        <section className="cp-editor-details" aria-label="发布设置">
        <h2>发布设置</h2>
        <label className="cp-setting-activity">投稿活动<select data-field="activity" aria-invalid={invalidField==='activity'} className="cp-input" value={activity ? activityCode() || '' : ''} onChange={e => {
          const selected = readCActivities().find(item => item.code === e.target.value);
          setActivitySelection(e.target.value);
          ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(key => sessionStorage.removeItem(key));
          if (selected) { sessionStorage.setItem('cp-activity','1'); sessionStorage.setItem('cp-activity-code',selected.code); sessionStorage.setItem('cp-activity-name',selected.name); }
          setActivity(Boolean(selected)); setMessage('');
        }}><option value="">不参与活动</option>{readCActivities().filter(item => (kind !== 'work' || item.status === '进行中') && item.tasks.some(task => task.action?.includes('发布') || task.action === '去创作')).map(item => <option key={item.code} value={item.code} disabled={activityUnavailable(item)}>{item.name}{item.status !== '进行中' ? ' · ' + item.status : item.locked ? ' · 暂不可参与' : activityUnavailable(item) ? ' · 类型不符' : ''}</option>)}</select>{fieldError('activity')}</label>
        <label className="cp-setting-category">内容分类<select className="cp-input" data-field="category" aria-invalid={invalidField==='category'} value={category} onChange={e => setCategory(e.target.value)}><option value="">请选择内容分类</option>{[...new Set([...mobileContentCategories.filter(x=>x!=='全部'),...(category ? [category] : []),...(activity ? publishedActivity()?.extra_config.publish_config.category_codes || [] : [])])].map(item => <option key={item} value={item}>{item}</option>)}</select>{fieldError('category')}</label>
        <div className="cp-topic-field"><span id="publish-topics-label">话题（选填）</span><details ref={topicDropdown} className="cp-topic-dropdown" onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();}}}>
          <summary data-field="topic" aria-invalid={invalidField==='topic'} aria-label="选择话题，可多选"><span>{topics.length ? topics.join('、') : '请选择话题，可多选'}</span></summary>
          <div className="cp-topic-menu" role="group" aria-labelledby="publish-topics-label">
          {[...new Set(['创作交流','经验分享','生图挑战',...topics,...(activity ? publishedActivity()?.extra_config.publish_config.topic_codes || [] : [])])].map(topic=><label key={topic}><input type="checkbox" checked={topics.includes(topic)} onChange={e=>setTopics(v=>e.target.checked?[...v,topic]:v.filter(t=>t!==topic))} />{topic}</label>)}
          <button type="button" onClick={()=>{if(topicDropdown.current)topicDropdown.current.open=false;}}>完成</button></div>
        </details>{fieldError('topic')}</div>
        <div className="cp-reference-field"><button type="button" className="cp-add-title" onClick={()=>setReferenceOpen(!referenceOpen)}>＋ {relation ? '更换引用' : '添加引用内容'}</button>
          {referenceOpen && <label>选择引用<select className="cp-input" value={relation} onChange={e=>{setRelation(e.target.value);setReferenceOpen(false);}}><option value="">不引用内容</option>{references.filter(r=>referenceAvailable(r.id)).map(r=><option key={r.id} value={r.id}>{r.type} · {r.title}</option>)}</select></label>}
          {relation && <div className="cp-reference-card"><button type="button" disabled={!references.some(r=>r.id===relation)||!referenceAvailable(relation)} onClick={()=>{if(references.some(r=>r.id===relation)) go(relation);}}>{referenceAvailable(relation)?references.find(r=>r.id===relation)?.title||'引用内容已失效':'引用内容已失效，请移除或重选'}</button><button type="button" onClick={()=>setRelation('')}>移除引用</button></div>}
        </div>
        {activity && (['ai_image_challenge', 'prompt_co_creation'].includes(sessionStorage.getItem('cp-activity-code') || '') || publishedActivity()?.extra_config.publish_config.required_scene) && <>
          <label>创作场景<input className="cp-input" data-field="scene" aria-invalid={invalidField==='scene'} value={scene} onChange={e => setScene(e.target.value)} placeholder="作品用于什么场景" />{fieldError('scene')}</label>

          {sessionStorage.getItem('cp-activity-code') === 'prompt_co_creation' && <label>案例说明<textarea className="cp-input" value={caseNote} onChange={e => setCaseNote(e.target.value)} rows={3} placeholder="说明 Prompt 的使用结果" /></label>}
        </>}
        {kind === 'post' && (
          <label className="cp-setting-circle">
            圈子{' '}
            <select
              className="cp-input"
              data-field="circle" aria-invalid={invalidField==='circle'} value={circle}
              onChange={(e) => {setCircle(e.target.value);setCircleId(contentCircleId(e.target.value)||'');}}
            ><option value="">不选择圈子</option>{joinedCircles.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
            {fieldError('circle')}{!joinedCircles.length&&<Button secondary onClick={()=>go('circles')}>发现圈子</Button>}
          </label>
        )}
        </section>
        <TransientFeedback message={message==='草稿已保存'?message:''} onClear={()=>setMessage('')}/><div className="cp-editor-feedback">
        {message && !invalidField && message!=='草稿已保存' && (
          <Notice
            tone={
              message.includes('失败') || message.includes('请')
                ? 'warn'
                : 'success'
            }
          >
            {message}
          </Notice>
        )}
        </div>
        <div className="cp-actions cp-editor-actions">
          <Button secondary onClick={save}>
            保存草稿
          </Button>
          <Button
            onClick={submit}
            disabled={
              state === 'uploading' ||
              state === 'review' ||
              state === 'permission' ||
              state === 'conflict'
            }
          >
            {kind === 'post' ? '发布帖子' : '发布作品'}
          </Button>

        </div>
      </div>
    </>
  );
}

type SubmissionSnapshot = {
  kind?: string; title?: string; category?: string; workType?: string; topics?: string[]; body?: string; relation?: string; circle?: string; circleId?: string;
  scene?: string; model?: string; caseNote?: string; creationPrompt?: string;
  activity?: boolean; activityCode?: string; activityName?: string; activityTask?: string; activityPeriod?:string;
  firstPublishedAt?: number; contentId?: string; submittedAt?: number; fileCount?: number; media?: {name:string;url:string;type:string;size:number}[];
  reason?: string; status?: string;
};
function MineMobile({state,go,canMaintain}:{state:string;go:Props['go'];canMaintain:boolean}) {
  const followCount=useSyncExternalStore(subscribeAuthorFollowing,followingCount,()=>24);
  const name=sessionStorage.getItem('cp-profile-name')||'林间';
  const query=typeof window==='undefined'?'':window.location.search;
  const selected=new URLSearchParams(query).get('panel')||'content';
  const desktop=new URLSearchParams(query).get('device')==='pc'||Boolean(document.querySelector('.cp-desktop'));
  const panel=['content','submissions','drafts','records','favorites','following','fans','circles'].includes(selected)?selected:'content';
  const setPanel=(id:string)=>go('mine?panel='+id);
  useEffect(()=>{
    const scroller=document.querySelector<HTMLElement>('.cp-desktop-workspace');
    if(!scroller)return;
    const key='cp-mine-scroll:'+panel;
    scroller.scrollTop=Number(sessionStorage.getItem(key)||0);
    const save=()=>sessionStorage.setItem(key,String(scroller.scrollTop));
    scroller.addEventListener('scroll',save,{passive:true});
    return()=>scroller.removeEventListener('scroll',save);
  },[panel]);
  return <Gate state={state} go={go}><div className="cp-mine-mobile">
    <header className="cp-mine-identity">
      <div className="cp-mine-person"><span className="cp-avatar">{sessionStorage.getItem('cp-profile-avatar')?<img src={sessionStorage.getItem('cp-profile-avatar')||''} alt="头像"/>:name.slice(0,1)}</span><div><h2>{name}</h2><p>{sessionStorage.getItem('cp-profile-bio')||'记录 AI 创作中的小发现'}</p></div><button className="cp-mine-edit" aria-label="编辑资料" onClick={()=>go('profile-edit')}><img src="/home-prototype/icons/edit-line.svg" alt=""/><span className="cp-mine-pc-only">编辑资料</span></button></div>
    </header>
    <div className="cp-mine-social" aria-label="个人数据"><div><strong>128</strong><span>获赞</span></div><button onClick={()=>desktop?setPanel('following'):go('my-relations')}><strong>{followCount}</strong><span>关注</span></button><button onClick={()=>desktop?setPanel("fans"):go("my-fans")}><strong>36</strong><span>粉丝</span></button><button onClick={()=>desktop?setPanel('circles'):go('my-circles')}><strong>{sampleCircles.filter(c=>sessionStorage.getItem('cp-personal-relations-seeded')!=='1'?['image','visual'].includes(c.id):sessionStorage.getItem('cp-circle-joined:'+c.id)==='1').length}</strong><span>圈子</span></button></div>
    <nav className="cp-mine-service-grid" aria-label="活动与服务">{[['积分中心','points','star-line'],['活动中心','activities','gift-line'],['每日签到','checkin','time-line'],['AI 商城','shop','shopping-bag-3-line'],['邀请有礼','invite','user-add-line']].map(([label,target,file])=><button key={target} className={desktop&&target==='points'?'cp-mine-points-shortcut':undefined} onClick={()=>go(target)}><img src={`/home-prototype/icons/${desktop&&target==='points'?'coin-line':file}.svg`} alt=""/>{desktop&&target==='points'?<span>积分 <strong>{pointBalance().toLocaleString('zh-CN')}</strong><small aria-hidden="true">›</small></span>:<span>{label}</span>}</button>)}</nav>
    <section className="cp-mine-dashboard" aria-label="内容管理">
      <div className="cp-mine-panel-tabs" role="tablist" aria-label="管理类型">{[['content','我的内容'],['submissions','我的投稿'],['drafts','草稿箱'],['records','生成记录'],['favorites','收藏'],...(desktop?[['following','我的关注'],['fans','我的粉丝'],['circles','我的圈子']]:[])].map(([id,label])=><button key={id} role="tab" id={`mine-tab-${id}`} aria-selected={panel===id} aria-controls="mine-panel" onClick={()=>setPanel(id)}><img className="cp-mine-pc-only" src={"/home-prototype/icons/"+({content:"image-line",submissions:"send-plane-line",drafts:"file-text-line",records:"time-line",favorites:"star-line",following:"user-add-line",fans:"user-line",circles:"group-line"} as Record<string,string>)[id]+".svg?v=mine-nav-2"} alt=""/>{label}</button>)}</div>
      <div id="mine-panel" role="tabpanel" aria-labelledby={`mine-tab-${panel}`}><h2 className="cp-mine-pc-only cp-mine-panel-title">{({content:"我的内容",submissions:"我的投稿",drafts:"草稿箱",records:"生成记录",favorites:"收藏",following:"我的关注",fans:"我的粉丝",circles:"我的圈子"} as Record<string,string>)[panel]}</h2>
        {panel==='fans'?<MyFans page="my-fans" state={state} go={go}/>:panel==='following'||panel==='circles'?<MyRelations key={panel} page={panel==='circles'?'my-circles':'my-relations'} state={state} go={go}/>:panel==='content'?<MyContent page="my-content" state={state} go={go} embedded/>:panel==='submissions'?<Submissions page="submissions" state={state} go={go} embedded/>:panel==='drafts'?<Drafts page="drafts" state={state} go={go}/>:panel==='records'?<Records page="records" state={state} go={go}/>:<Favorites page="favorites" state={state} go={go}/>}
      </div>
    </section>
    {canMaintain&&state!=='restricted'&&<button className="cp-mine-maintain" onClick={()=>window.location.assign('/community-options/cross-prototype?page=maintain&source=mine')}>内容维护 <span aria-hidden="true">›</span></button>}
  </div></Gate>;
}
function Mine({ state, go }: Props) {
  const canMaintain = useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const saved = JSON.parse(
          window.sessionStorage.getItem('cross-prototype-v1') || 'null',
        );
        const b = JSON.parse(
          window.localStorage.getItem('b-prototype') || 'null',
        );
        const authorRecords =
          b?.records?.filter((record: { id: string }) =>
            ['tutorial-author', 'resource-author'].includes(record.id),
          ) || [];
        return (
          saved?.maintenance?.qualified === true &&
          authorRecords.some(
            (record: { authorized: boolean }) => record.authorized,
          )
        );
      } catch {
        return false;
      }
    },
    () => true,
  );
  return <MineMobile state={state} go={go} canMaintain={canMaintain}/>;
}

function useHiddenSamples(key: string): [string[], (ids:string[])=>void] {
  const [hidden,setHidden]=useState<string[]>(()=>{try{return JSON.parse(sessionStorage.getItem(key)||'[]');}catch{return [];}});
  return [hidden,ids=>{setHidden(ids);sessionStorage.setItem(key,JSON.stringify(ids.filter(id=>id!=='current')));}];
}

function ConfirmDelete({id,title,detail,onCancel,onConfirm,confirmLabel='删除'}:{id:string;title:string;detail:string;onCancel:()=>void;onConfirm:()=>void;confirmLabel?:string}) {
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
  return <dialog ref={dialog} className="cp-personal-modal cp-delete-dialog" aria-labelledby={id} aria-describedby={id+'-description'} onCancel={onCancel}><button type="button" className="cp-personal-modal-close" aria-label="关闭确认" onClick={onCancel}>×</button><h2 id={id}>{title}</h2><p id={id+'-description'}>{detail}</p><div className="cp-delete-actions"><button type="button" autoFocus onClick={onCancel}>取消</button><button type="button" className="is-destructive" onClick={onConfirm}>{confirmLabel}</button></div></dialog>;
}

function MyFans({state,go}:Props) {
  useSyncExternalStore(subscribeAuthorFollowing,followingCount,()=>24);
  const fans=[['温白','把日常变成创作灵感'],['周末观察','用影像记录生活'],['青禾','探索 AI 与设计的更多可能'],['陈屿','分享摄影与创作心得']];
  return <Gate state={state} go={go}><section className="cp-personal-manager cp-relations cp-fans-list">{fans.map(([name,bio])=><article className="cp-personal-record" key={name}><span className="cp-record-type">{name.slice(0,1)}</span><div><strong>{name}</strong><small>{bio}</small></div><div className="cp-personal-record-actions"><button onClick={()=>go('author?name='+encodeURIComponent(name))}>查看</button><button aria-pressed={followedAuthor(name)} onClick={()=>{setAuthorFollowing(name,!followedAuthor(name));}}>{followedAuthor(name)?'互相关注':'回关'}</button></div></article>)}</section></Gate>;
}

function MyRelations({ page, state, go }: Props) {
  useSyncExternalStore(subscribeAuthorFollowing,followingCount,()=>24);
  const [hidden,setHidden]=useHiddenSamples('cp-personal-hidden-relations'),[notice,setNotice]=useState('');
  const [,setRelationReady]=useState(false);
  useEffect(()=>{const timer=window.setTimeout(()=>{if(sessionStorage.getItem('cp-personal-relations-seeded')!=='1'){for(const id of ['image','visual'])if(!sessionStorage.getItem('cp-circle-joined:'+id))sessionStorage.setItem('cp-circle-joined:'+id,'1');sessionStorage.setItem('cp-personal-relations-seeded','1');}setRelationReady(true);},0);return()=>window.clearTimeout(timer);},[]);
  const circles=sampleCircles.filter(c=>sessionStorage.getItem('cp-circle-joined:'+c.id)==='1'||(['image','visual'].includes(c.id)&&sessionStorage.getItem('cp-circle-joined:'+c.id)===null&&sessionStorage.getItem('cp-personal-relations-seeded')!=='1'&&!hidden.includes(c.id)));
  return <Gate state={state} go={go}><section className="cp-personal-manager cp-relations">{page==='my-circles'?<><div className="cp-personal-records">{circles.map(c=><article key={c.id} className="cp-personal-record"><span className="cp-record-type">圈子</span><div><strong>{c.name}</strong><small>浏览圈内公开帖子</small></div><div className="cp-personal-record-actions"><button onClick={()=>go('circle?item='+c.id)}>查看</button><button onClick={()=>{sessionStorage.setItem('cp-circle-joined:'+c.id,'0');if(c.id==='image')sessionStorage.setItem('cp-circle-joined','0');setHidden([...hidden,c.id]);setNotice('已退出圈子。已有帖子保留。');}}>退出圈子</button></div></article>)}</div>{!circles.length&&<Empty title="还没有加入圈子" action="发现圈子" onAction={()=>go('circles')}/>}
    </>:<>{followedAuthors().length?followedAuthors().map(name=><article className="cp-personal-record" key={name}><span className="cp-record-type">{name.slice(0,1)}</span><div><strong>{name}</strong><small>查看作者公开主页</small></div><div className="cp-personal-record-actions"><button onClick={()=>go('author?name='+encodeURIComponent(name))}>查看</button><button onClick={()=>{setAuthorFollowing(name,false);setNotice('已取消关注。');}}>取消关注</button></div></article>):<Empty title="还没有关注作者" action="浏览社区" onAction={()=>go('community')}/>}</>} <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
  </section></Gate>;
}

function ProfileEdit({ state, go }: Props) {
  const [name,setName]=useState(()=>sessionStorage.getItem('cp-profile-name')||'林间');
  const [bio,setBio]=useState(()=>sessionStorage.getItem('cp-profile-bio')||'');
  const [gender,setGender]=useState(()=>sessionStorage.getItem('cp-profile-gender')||'');
  const [avatar,setAvatar]=useState(()=>sessionStorage.getItem('cp-profile-avatar')||'');
  const [error,setError]=useState('');
  const [avatarError,setAvatarError]=useState('');
  const [saving,setSaving]=useState(false);
  const [notice,setNotice]=useState('');
  const uploadAvatar=async(file?:File)=>{
    if(!file)return;
    setNotice('');
    if(!['image/jpeg','image/png'].includes(file.type)||file.size>5*1024*1024){setAvatarError('请选择不超过 5MB 的 JPG 或 PNG 图片');return;}
    const reader=new FileReader();
    reader.onload=()=>{const image=new Image();image.onload=()=>{const canvas=document.createElement('canvas');const size=Math.min(image.width,image.height);canvas.width=256;canvas.height=256;const ctx=canvas.getContext('2d');if(!ctx){setAvatarError('图片读取失败，请重新选择');return;}ctx.drawImage(image,(image.width-size)/2,(image.height-size)/2,size,size,0,0,256,256);setAvatar(canvas.toDataURL('image/jpeg',.85));setAvatarError('');};image.onerror=()=>setAvatarError('图片读取失败，请重新选择');image.src=String(reader.result);};
    reader.onerror=()=>setAvatarError('图片读取失败，请重新选择');reader.readAsDataURL(file);
  };
  return <><Head title="编辑资料"/><Gate state={state} go={go}>
    <div className="cp-profile-editor"><form id="cp-profile-form" className="cp-profile-fields" onSubmit={e=>{e.preventDefault();if(saving)return;if(!name.trim()){setError('请填写昵称');return;}if(countCharacters(name.trim())>20){setError('昵称最多20字');return;}if(countCharacters(bio)>80){setError('个人简介最多80字');return;}setSaving(true);try{sessionStorage.setItem('cp-profile-name',name.trim());sessionStorage.setItem('cp-profile-bio',bio.trim());sessionStorage.setItem('cp-profile-gender',gender);sessionStorage.setItem('cp-profile-avatar',avatar);setNotice('资料已保存');setError('');}catch{setError('保存失败，请重试');}finally{setSaving(false);}}}>
      <div className="cp-profile-avatar-field"><label className="cp-profile-avatar-picker" aria-label="更换头像">{avatar?<img src={avatar} alt="当前头像"/>:<span>{name.trim().slice(0,1)||'我'}</span>}<input type="file" accept="image/jpeg,image/png" aria-label="选择新头像" onChange={e=>{void uploadAvatar(e.target.files?.[0]);e.target.value='';}}/></label><strong>更换头像</strong><small>支持 JPG、PNG，不超过 5MB</small>{avatarError&&<small role="alert" className="cp-field-error">{avatarError}</small>}</div>
      <label className="cp-profile-field">昵称<input className="cp-input" value={name} placeholder="请输入昵称" aria-invalid={Boolean(error)} onChange={e=>{setName(e.target.value);setError('');setNotice('');}}/><small>{countCharacters(name)}/20</small></label>
      <fieldset className="cp-profile-gender"><legend>性别</legend>{['男','女'].map(value=><label key={value} className={gender===value?'selected':''}><input type="radio" name="profile-gender" value={value} checked={gender===value} onChange={()=>{setGender(value);setNotice('');}}/>{value}</label>)}</fieldset>
      <label className="cp-profile-field">个人简介<textarea className="cp-input" rows={4} value={bio} placeholder="介绍一下自己吧" onChange={e=>{setBio(e.target.value);setNotice('');}}/><small>{countCharacters(bio)}/80</small></label>
    </form>
    <AccountBindings/>
      {error&&<p role="alert" className="cp-field-error">{error}</p>}<TransientFeedback message={notice} onClear={()=>setNotice('')}/>
      <button type="submit" form="cp-profile-form" className="cp-button cp-profile-save" disabled={saving}>{saving?'保存中…':'保存资料'}</button>
    </div>
  </Gate></>;
}
function ManagementOpen({label,onOpen}:{label:string;onOpen:()=>void}) { return <button className="cp-management-open" aria-label={label} onClick={onOpen}/>; }
function ManagementEdit({onEdit}:{onEdit:()=>void}) {return <button className="cp-management-delete" aria-label="编辑" title="编辑" onClick={onEdit}><img src="/home-prototype/icons/edit-line.svg" alt=""/></button>;}
function openManagedContent(row:SubmissionSnapshot & {id?:string},go:Props['go']) {
  if((row.id==='published'||row.id==='sample-reward')&&row.status==='public'){go('work?item=restore');return;}
  const id=row.id||'current';sessionStorage.setItem('cp-owned-detail',JSON.stringify({...row,id}));go((row.kind==='post'?'post':'work')+'?owned='+encodeURIComponent(id)+(new URLSearchParams(window.location.search).get('embed')==='1'?'':'&ownedScope=unscoped'));
}
function ManagementStatus({label}:{label:string}) {
  const tone=['已公开','已完成','已通过','已发放'].includes(label)?'success':['未通过','失败','未受理'].includes(label)?'danger':['审核中','生成中','即将到期','待补正','待发放','待核实','待评审','待确认'].includes(label)?'pending':'neutral';
  return <span className={'cp-management-status is-'+tone}>{label}</span>;
}
function ManagementCover({src,label}:{src?:string;label:string}) {
  return src?<img className="cp-management-cover" src={src} alt=""/>:<span className="cp-management-cover cp-management-placeholder">{label}</span>;
}
type ContentOverride = {status:string;removalSource?:'author'|'governance';modified?:boolean};
const contentPeriod = (config:EventConfig) => config.unlock_rule.period_code || config.start_time || 'continuous';
const relationId = (id:string,config:EventConfig) => 'existing-content:'+encodeURIComponent(id)+':'+config.code+':'+encodeURIComponent(contentPeriod(config));
function appendEligibility(row:SubmissionSnapshot & {id:string}, config:EventConfig) {
  const current=readCActivities().find(item=>item.code===config.code), now=Date.now(), rule=config.extra_config.publish_config;
  if(row.kind!=='work'||row.status!=='public')return '仅已公开的本人作品可以追加投稿';
  if(!current||current.status!=='进行中'||current.locked)return '活动未开始、已结束或尚未解锁';
  if(config.start_time&&now<Date.parse(config.start_time)||config.end_time&&now>=Date.parse(config.end_time))return '不在活动有效期内';
  const first=row.firstPublishedAt;
  if(!first)return '首次公开时间待核对，暂不能投稿';
  if(config.start_time&&first<Date.parse(config.start_time))return '作品首次公开早于活动开始';
  if(rule.biz_type==='post'||!config.tasks.some(task=>task.event_type==='work.publish'))return '本活动没有作品投稿任务';
  if(readActivitySubmissions().some(item=>item.id===relationId(row.id,config)))return '本作品已参加本活动本期';
  if(row.activityCode===config.code&&(!row.activityPeriod||row.activityPeriod===contentPeriod(config)))return '本作品已关联该活动本期，请查看原投稿';
  if(rule.require_join_token&&sessionStorage.getItem('cp-joined-'+config.code)!=='1')return '请先进入活动详情参与';
  const media=row.media||[],images=media.filter(item=>item.type.startsWith('image/')).length,videos=media.filter(item=>item.type.startsWith('video/')).length;
  const contentType=row.workType==='video'?3:row.workType==='text'?4:2;
  if(!rule.content_types.includes(contentType)||images<rule.min_image_count||videos<rule.min_video_count)return '作品类型或素材数量不符合活动要求';
  if(images&&!rule.media_types.includes('image')||videos&&!rule.media_types.includes('video'))return '素材类型不符合活动要求';
  if(countCharacters((row.title||'').trim())<rule.title_min_len)return '标题长度不符合活动要求';
  if(rule.required_category&&!row.category||rule.category_codes.length&&!rule.category_codes.includes(row.category||''))return '作品分类不符合活动要求';
  if(rule.required_model&&!row.model||rule.model_codes.length&&!rule.model_codes.includes(row.model||''))return '使用模型不符合活动要求';
  if(rule.required_scene&&!row.scene||rule.scene_codes.length&&!rule.scene_codes.includes(row.scene||''))return '创作场景不符合活动要求';
  const topics=row.topics||[],body=row.body||'';
  if(rule.required_topic&&!topics.length&&!body.includes('#')||rule.topic_codes.length&&!rule.topic_codes.some(topic=>topics.includes(topic)||body.includes('#'+topic)))return '缺少活动指定话题';
  if(config.code==='ai_image_challenge'&&(!(topics.includes('生图挑战')||body.includes('#生图挑战'))||(body.match(/[\u3400-\u9fff]/g)||[]).length<30))return '生图挑战需指定话题与至少30个汉字正文';
  if(rule.biz_type==='prompt'&&(!row.creationPrompt||!row.caseNote||((body.match(/[\u3400-\u9fff]/g)||[]).length<30&&(body.match(/[A-Za-z]+/g)||[]).length<20)))return 'Prompt 共创需提示词、案例与足量正文';
  const matchingTask=config.tasks.some(task=>{
    if(task.event_type!=='work.publish'||task.event_filter.biz_type==='post')return false;
    if(task.event_filter.content_types?.length&&!task.event_filter.content_types.includes(contentType))return false;
    if(images<(task.event_filter.min_image_count||0)||countCharacters(row.title||'')<(task.validation_rule.title_min_len||0))return false;
    const joinedAt=Number(sessionStorage.getItem('cp-joined-at-'+config.code)),day=task.unlock_day||task.day_index;
    if(day&&(!joinedAt||Math.floor((now-joinedAt)/86400000)+1<day))return false;
    if(config.code!=='prompt_co_creation'&&(body.match(/[\u3400-\u9fff]/g)||[]).length<(task.validation_rule.content_min_cn_chars||0))return false;
    const values:Record<string,string|undefined>={title:row.title,content:row.body,case:row.caseNote,scene:row.scene,model:row.model,prompt:row.creationPrompt,category:row.category};
    return (task.validation_rule.required_fields||[]).every(field=>Boolean(values[field]?.trim()));
  });
  return matchingTask?'':'作品不符合当前可参与任务的条件';
}
function MyContent({ state, go }: Props & {embedded?:boolean}) {
  const linkedSubmissions=useCSubmissions();
  let submitted:SubmissionSnapshot|null=null;
  try{submitted=JSON.parse(sessionStorage.getItem('cp-submission')||'null');}catch{}
  const [notice,setNotice]=useState(''),[filter,setFilter]=useState('全部');
  const [hidden,setHidden]=useHiddenSamples('cp-personal-hidden-content');
  const [overrides,setOverrides]=useState<Record<string,ContentOverride>>(()=>{try{return JSON.parse(sessionStorage.getItem('cp-personal-content-state')||'{}');}catch{return {};}});
  const [action,setAction]=useState<{id:string;kind:'delete'|'remove'|'restore'}|null>(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('reviewOverlay')==='content-delete'?{id:'published',kind:'delete'}:null);
  const [appending,setAppending]=useState<string|null>(null),[selectedActivity,setSelectedActivity]=useState(''),[appendError,setAppendError]=useState('');
  const demoPublishedAt=Date.parse('2026-10-04T09:00:00+08:00');
  const rows:(SubmissionSnapshot & {id:string;target?:string})[]=[
    ...linkedSubmissions.map(row=>({...row,id:row.contentId})),
    ...(submitted?[{...submitted,id:submitted.contentId||'current'}]:[]),
    {id:'published',kind:'work',title:'旧照修复练习',status:'public',target:'work?item=restore',submittedAt:demoPublishedAt,firstPublishedAt:demoPublishedAt,workType:'image',media:[{name:'旧照修复',url:img('restore'),type:'image/png',size:0}],category:'创作交流',model:'标准模型',scene:'旧照修复',topics:['生图挑战'],body:'用柔和的光线修复旧照片，保留人物面部细节与原有色彩，分享这次图像修复的经验和创作思路。',creationPrompt:'修复旧照片，保留真实细节',caseNote:'旧照修复前后对比'},
    {id:'review',kind:'post',title:'第一次尝试柔和光线的产品图',body:'记录这次产品图的制作过程。',status:'review',submittedAt:Date.now()-172800000},
    {id:'rejected',kind:'work',title:'夏日海岸',body:'海边日落，浪花映着暖金色的光。',status:'rejected',submittedAt:Date.now()-259200000,reason:'请补充创作信息后重新提交。',workType:'image',media:[{name:'夏日海岸',url:img('sea'),type:'image/png',size:0}]},
    {id:'removed',kind:'post',title:'一段海岸练习笔记',status:'removed',submittedAt:Date.now()-345600000,reason:'内容已被治理下架，请按处理说明核对。'},
  ].filter((row,index,list)=>!hidden.includes(row.id)&&list.findIndex(item=>item.id===row.id)===index).map(row=>({...row,...overrides[row.id],...linkedSubmissions.find(item=>item.contentId===row.id)}));
  const visible=state==='empty'?[]:rows.filter(row=>filter==='全部'||filter===(row.kind==='post'?'帖子':'作品'));
  const update=(id:string,value:ContentOverride)=>{const next={...overrides,[id]:value};sessionStorage.setItem('cp-personal-content-state',JSON.stringify(next));setOverrides(next);window.dispatchEvent(new Event('cp-content-change'));};
  const edit=(row:SubmissionSnapshot & {id:string})=>{
    sessionStorage.removeItem('cp-source');sessionStorage.removeItem('cp-result');sessionStorage.removeItem('cp-open-draft');
    ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(key=>sessionStorage.removeItem(key));
    if(row.status==='review'){changeCSubmissionState(row.id,'withdraw');update(row.id,{status:'withdrawn',modified:true});setNotice('已撤回该次审核，进入编辑');}
    sessionStorage.setItem('cp-pending-edit',JSON.stringify({...row,contentId:row.id}));pendingUploads=submitted&&(submitted.contentId||'current')===row.id?[...submissionUploads]:[];
    go((row.kind==='post'?'post-publish':'post-edit')+'?entry=return-'+Date.now());
  };
  const activeRow=rows.find(row=>row.id===appending), activities=readPublishedEventConfigs().filter(config=>config.status!=='草稿'&&config.tasks.some(task=>task.event_type==='work.publish'));
  const selected=activities.find(config=>config.code===selectedActivity),blocked=activeRow&&selected?appendEligibility(activeRow,selected):'请选择活动';
  const confirmAction=()=>{
    if(!action)return;const row=rows.find(item=>item.id===action.id);if(!row){setAction(null);return;}
    try{
      if(action.kind==='delete'){
        changeCSubmissionState(row.id,'delete');
        const target=row.target||(row.kind==='post'?'post':'work')+'?owned='+encodeURIComponent(row.id);
        const deleted=JSON.parse(sessionStorage.getItem('cp-personal-deleted-targets')||'[]') as string[];
        sessionStorage.setItem('cp-personal-deleted-targets',JSON.stringify([...new Set([...deleted,target])]));
        update(row.id,{status:'deleted'});setHidden([...hidden,row.id]);
        if(submitted&&(submitted.contentId||'current')===row.id)sessionStorage.removeItem('cp-submission');
        saveActivitySubmissions(readActivitySubmissions().map(item=>item.id.startsWith('existing-content:'+encodeURIComponent(row.id)+':')||row.activityCode&&item.activityCode===row.activityCode&&item.title===row.title?{...item,contentStatus:'deleted'}:item));
        setNotice('内容已删除，参与及奖励记录保留');
      }else{
        const status=changeCSubmissionState(row.id,action.kind)|| (action.kind==='remove'?'removed':overrides[row.id]?.modified?'review':'public');
        update(row.id,{status,removalSource:'author',modified:overrides[row.id]?.modified});
        saveActivitySubmissions(readActivitySubmissions().map(item=>item.id.startsWith('existing-content:'+encodeURIComponent(row.id)+':')?{...item,contentStatus:status}:item));
        setNotice(status==='removed'?'已下架，原投稿记录保留':status==='review'?'已提交重新审核':'已恢复公开，首次发布时间保持');
      }
      setAction(null);
    }catch(error){setNotice(error instanceof Error?error.message:'操作失败，请重试');}
  };
  return <Gate state={state} go={go}><section className="cp-personal-manager">
    <div className="cp-personal-tabs">{['全部','作品','帖子'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div>
    <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
    <div className="cp-personal-records">{visible.map(row=>{const status=row.status||'review',authorRemoved=overrides[row.id]?.removalSource==='author';const label=status==='public'?'已公开':status==='rejected'?'未通过':status==='removed'?'已下架':'审核中';
      return <article className="cp-personal-record" key={row.id}>{(status!=='removed'||authorRemoved)&&<ManagementOpen label={'查看'+(row.title||'内容详情')} onOpen={()=>openManagedContent(row,go)}/>}<ManagementCover src={status==='removed'&&!authorRemoved?undefined:row.media?.[0]?.url||(row.id==='published'?img('restore'):undefined)} label={row.kind==='post'?'帖子':'作品'}/><div><strong>{row.title||row.body?.slice(0,24)||'未命名内容'}</strong><small>{row.kind==='post'?'帖子':'作品'} · {row.submittedAt?new Date(row.submittedAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'}):'提交时间待确认'}</small><ManagementStatus label={status==='withdrawn'?'已撤回':label}/></div><div className="cp-personal-record-actions">
        {(status!=='removed'||authorRemoved)&&<ManagementEdit onEdit={()=>edit(row)}/>}
        <details className="cp-content-menu"><summary aria-label={'管理'+row.title}>•••</summary><div>
          {row.kind==='work'&&status==='public'&&<button onClick={()=>{setAppending(row.id);setSelectedActivity('');setAppendError('');}}>追加投稿</button>}
          {status==='public'&&<button onClick={()=>setAction({id:row.id,kind:'remove'})}>主动下架</button>}
          {status==='removed'&&authorRemoved&&<button onClick={()=>setAction({id:row.id,kind:'restore'})}>重新发布</button>}
          <button onClick={()=>setAction({id:row.id,kind:'delete'})}>删除内容</button>
        </div></details></div>{(status==='rejected'||status==='removed'&&!authorRemoved)&&row.reason&&<p className="cp-management-reason">{row.reason}</p>}</article>;
    })}</div>
    {!visible.length&&<Empty title="暂无内容" detail="发布作品或帖子后可在这里查看。" action="去发布" creationGo={go}/>}
    {action&&<ConfirmDelete id="content-delete-title" title={action.kind==='delete'?'删除这条内容？':action.kind==='remove'?'下架这条内容？':'重新发布这条内容？'} detail={action.kind==='delete'?'删除后无法恢复，原详情、评论与互动不再公开；生成资产和必要参与、奖励记录保留。':action.kind==='remove'?'下架后其他人无法访问，原投稿记录保留；要求公开的奖励发放前重新校验。':'保留原内容身份和首次发布时间。修改过的内容重新审核；恢复不重复投稿、发奖或补发已结束活动奖励。'} confirmLabel={action.kind==='delete'?'确认删除':action.kind==='remove'?'确认下架':'确认重新发布'} onCancel={()=>setAction(null)} onConfirm={confirmAction}/>}
    {activeRow&&<AppendActivityDialog title={activeRow.title||'作品'} onClose={()=>setAppending(null)}><p>选择活动后再次核对资格。同一作品可参加多个活动，每个活动同一期仅投稿一次。</p><label>选择活动<select className="cp-input" value={selectedActivity} onChange={e=>{setSelectedActivity(e.target.value);setAppendError('');}}><option value="">请选择活动</option>{activities.map(config=><option key={config.code} value={config.code}>{config.name}</option>)}</select></label>{blocked&&<output>{blocked}</output>}{selected&&<button onClick={()=>go('activity?item='+selected.code)}>查看活动要求与参与入口</button>}{appendError&&<p role="alert">{appendError}</p>}<div className="cp-delete-actions"><button onClick={()=>setAppending(null)}>取消</button><button disabled={Boolean(blocked)} onClick={()=>{if(!selected)return;const reason=appendEligibility(activeRow,selected);if(reason){setAppendError(reason);return;}try{saveActivitySubmissions([{id:relationId(activeRow.id,selected),title:activeRow.title||'作品',kind:'work',activityCode:selected.code,activityName:selected.name,contentStatus:'public',eligibility:'pending',reward:'pending',submittedAt:Date.now()},...readActivitySubmissions()]);setAppending(null);setNotice('投稿已提交，资格与奖励待核对');}catch{setAppendError('投稿结果待核对，请查看原投稿记录');}}}>确认投稿</button></div></AppendActivityDialog>}
  </section></Gate>;
}
function AppendActivityDialog({title,onClose,children}:{title:string;onClose:()=>void;children:React.ReactNode}){
  const dialog=useRef<HTMLDialogElement>(null);useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
  return <dialog ref={dialog} className="cp-personal-modal cp-append-activity-dialog" aria-labelledby="append-activity-title" onCancel={onClose}><button className="cp-personal-modal-close" aria-label="关闭追加投稿" onClick={onClose}>×</button><h2 id="append-activity-title">追加投稿</h2><strong>{title}</strong>{children}</dialog>;
}

function Drafts({ state, go }: Props) {
  const [filter,setFilter]=useState('全部'), [hidden,setHidden]=useHiddenSamples('cp-personal-hidden-drafts'), [removing,setRemoving]=useState<string|null>(null);
  const [draft,setDraft]=useState<(SubmissionSnapshot & {kind:string;title:string;body:string;savedAt:number;expiresAt:number})|null>(null);
  useEffect(()=>{const timer=window.setTimeout(()=>{try{setDraft(JSON.parse(sessionStorage.getItem('cp-draft')||'null'));}catch{}},0);return()=>window.clearTimeout(timer);},[]);
  const now=Date.now(),day=86400000;
  const rows=[...(draft?[{...draft,id:'current'}]:[]),
    {id:'work',kind:'work',title:'海边日落练习',body:'海边日落，暖金色的光。',workType:'image',savedAt:now-day,expiresAt:now+24*day},
    {id:'post',kind:'post',title:'产品图制作笔记',body:'整理参考素材与制作步骤。',savedAt:now-26*day,expiresAt:now+4*day},
    {id:'expired',kind:'post',title:'旧照修复心得',body:'',savedAt:now-31*day,expiresAt:now-day},
  ].filter(row=>!hidden.includes(row.id)&&(filter==='全部'||filter===(row.kind==='post'?'帖子':'作品'))).sort((a,b)=>b.savedAt-a.savedAt||a.id.localeCompare(b.id));
  return <Gate state={state} go={go}><section className="cp-personal-manager">
    <div className="cp-personal-list-toolbar"><div className="cp-personal-tabs">{['全部','作品','帖子'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div></div>
    <div className="cp-personal-records">{rows.map(row=>{const expired=row.expiresAt<=now,soon=row.expiresAt-now<7*day;const resume=()=>{if(row.id!=='current')sessionStorage.setItem('cp-draft',JSON.stringify(row));sessionStorage.setItem('cp-open-draft','1');go(row.kind==='post'?'post-publish':'post-edit');};return <article key={row.id} className="cp-personal-record">{!expired&&<ManagementOpen label={'继续编辑'+row.title} onOpen={resume}/>}<ManagementCover label={row.kind==='post'?'帖子':'作品'}/><div><strong>{row.title||'未命名草稿'}</strong><small>{row.kind==='post'?'帖子':'作品'} · 保存于 {new Date(row.savedAt).toLocaleDateString('zh-CN',{timeZone:'Asia/Shanghai'})}</small><ManagementStatus label={expired?'已到期':soon?'即将到期':'私人草稿'}/></div><div className="cp-personal-record-actions">{!expired&&<ManagementEdit onEdit={resume}/>}<button className="cp-management-delete" aria-label="删除" title="删除" onClick={()=>setRemoving(row.id)}><img src="/home-prototype/icons/delete-bin-line.svg" alt=""/></button></div></article>;})}</div>
    {!rows.length&&<Empty title="没有符合条件的草稿" action="去创作" creationGo={go}/>}
    <p className="cp-muted cp-personal-footnote">草稿每次保存后保留 30 天，到期后不能继续编辑。</p>
    {removing&&<ConfirmDelete id="draft-delete-title" title="删除这份草稿？" detail="删除后无法恢复。" onCancel={()=>setRemoving(null)} onConfirm={()=>{setHidden([...hidden,removing]);if(removing==='current'){sessionStorage.removeItem('cp-draft');setDraft(null);}setRemoving(null);}}/>}
  </section></Gate>;
}

function Records({ state, go }: Props) {
  const [tasks,setTasks]=useState<PrototypeTask[]>([]),[filter,setFilter]=useState('全部');
  useEffect(()=>{const refresh=()=>{const now=new Date();const date=(days:number,hour:number)=>{const value=new Date(now);value.setDate(value.getDate()-days);value.setHours(hour,0,0,0);return value.getTime();};setTasks([...taskHistory().filter(t=>t.item?.startsWith('light-')&&!t.id?.startsWith('sample-light-')),
    {id:'sample-light-image-complete',item:'light-image',input:'海边日落，浪花映着暖金色的光',status:'completed',createdAt:date(0,9)},
    {id:'sample-light-video-running',item:'light-video',input:'镜头沿海岸缓缓推进',status:'running',createdAt:date(0,8)},
    {id:'sample-light-text-complete',item:'light-text',input:'寻找晨光的海边短片剧本',status:'completed',createdAt:date(1,16)},
    {id:'sample-light-image-failed',item:'light-image',input:'柔和光线下的海边构图',status:'failed',createdAt:date(1,10)},
  ].sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)));};const timer=window.setTimeout(refresh,0);window.addEventListener('cp-task-change',refresh);return()=>{window.clearTimeout(timer);window.removeEventListener('cp-task-change',refresh);};},[]);
  const types:Record<string,string>={'light-image':'图片','light-text':'剧本','light-video':'视频'};
  const rows=tasks.filter(task=>filter==='全部'||types[task.item||'']===filter);
  return <Gate state={state} go={go}><section className="cp-personal-manager"><div className="cp-personal-tabs">{['全部','图片','视频','剧本'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="cp-personal-records">{rows.map((task,index)=>{const status=task.status;const label=status==='failed'?'失败':status==='cancelled'?'已取消':status==='unaccepted'?'未受理':['queued','running','submitting','unknown','cancelling','cancel-failed'].includes(status)?'生成中':'已完成';return <article key={task.id||index} className="cp-personal-record cp-generation-record"><ManagementOpen label={'查看生成任务：'+task.input} onOpen={()=>go('create?task='+encodeURIComponent(task.id||''))}/><ManagementCover src={types[task.item||'']==='图片'&&status==='completed'?img('sea'):undefined} label={types[task.item||'']||'生成'}/><div><strong>{task.input||'未填写提示词'}</strong><small>{types[task.item||'']} · {task.createdAt?new Date(task.createdAt).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai',month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):'时间待确认'}</small><ManagementStatus label={label}/>{status==='failed'&&<p>生成未完成，可调整参数后重试。</p>}</div><div className="cp-personal-record-actions">{label!=='生成中'&&<ManagementEdit onEdit={()=>{['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'].forEach(k=>sessionStorage.removeItem(k));if(task.activityCode){sessionStorage.setItem('cp-activity','1');sessionStorage.setItem('cp-activity-code',task.activityCode);sessionStorage.setItem('cp-activity-name',task.activityName||'');}sessionStorage.setItem('cp-light-create-draft',JSON.stringify({type:task.item?.replace('light-','')||'image',prompt:task.input,ratio:task.ratio||'1:1',model:task.model?.split(' · ')[1]||'标准模型'}));go('create?editTask='+encodeURIComponent(task.id||''));}}/>}</div></article>;})}</div>{!rows.length&&<Empty title="暂无生成记录" action="开始创作" onAction={()=>go('create')}/>}</section></Gate>;
}

function Favorites({ state, go }: Props) {
  const [filter,setFilter]=useState('全部'),[hidden,setHidden]=useHiddenSamples('cp-personal-hidden-favorites');
  const rows=[...getFavorites(),{target:'work?item=restore',title:'旧照修复练习',type:'作品'},{target:'post?item=restore',title:'修复旧照的几个小技巧',type:'帖子'},{target:'tutorial?item=product',title:'产品背景与光线的搭配',type:'教程'},{target:'app',title:'文案改写',type:'AI 应用'},{target:'unavailable',title:'内容已不可访问',type:'AI 应用'}].map(item=>{const [page,query='']=item.target.split('?');const params=new URLSearchParams(query);const known=page==='resource'&&(!query||(!params.has('item')&&params.get('id')==='resource-1')||(!params.has('id')&&params.get('item')==='restore'));const unavailable=page==='resource'&&!known;return {...item,sourceTarget:item.target,type:unavailable?'历史收藏':item.type==='资源'?'AI 应用':item.type,target:known?'app?item=restore':unavailable?'unavailable':item.target};}).filter((x,i,all)=>all.findIndex(y=>y.sourceTarget===x.sourceTarget)===i&&(!hidden.includes(x.sourceTarget)||getFavorites().some(f=>f.target===x.sourceTarget))&&(filter==='全部'||x.type===filter));
  return <Gate state={state} go={go}><section className="cp-personal-manager"><div className="cp-personal-tabs">{['全部','作品','帖子','教程','AI 应用'].map(x=><button key={x} className={filter===x?'active':''} onClick={()=>setFilter(x)}>{x}</button>)}</div><div className="cp-personal-records">{rows.map(x=><article key={x.sourceTarget} className="cp-personal-record">{x.target!=='unavailable'&&<ManagementOpen label={'查看'+x.title} onOpen={()=>go(x.target)}/>}<ManagementCover src={x.target==='work?item=restore'?img('restore'):undefined} label={x.type}/><div><strong>{x.title}</strong><small>{x.type}</small>{x.target==='unavailable'&&<ManagementStatus label="收藏已失效"/>}</div><div className="cp-personal-record-actions"><button className="cp-management-delete" aria-label="移除收藏" title="移除收藏" onClick={()=>{if(getFavorites().some(y=>y.target===x.sourceTarget))toggleFavorite({...x,target:x.sourceTarget});setHidden([...hidden,x.target,x.sourceTarget]);}}><img src="/home-prototype/icons/delete-bin-line.svg" alt=""/></button></div></article>)}</div>{!rows.length&&<Empty title="还没有收藏" action="浏览社区" onAction={()=>go('community')}/>}</section></Gate>;
}

function Notifications({state,go}:Props){return <Gate state={state} go={go}><MessageCenter state={state} go={go}/></Gate>;}

function Activities({ state, go }: Props) {
  return (
    <>
      <Head title="活动中心" />
      <Gate state={state} go={go}>
        {state === 'empty' ? (
          <Empty
            title="暂无可参与活动"
            detail="活动列表为空；历史投稿仍可从我的查看。"
            action="我的投稿"
            onAction={() => go('submissions')}
          />
        ) : (
          <div className="cp-grid cp-personal-choice">
            <button
              type="button"
              className="cp-card cp-personal-event"
              onClick={() => go('activity')}
            >
              <img className="cp-cover" src={img('sea')} alt="" />
              <span className="cp-tag">征集进行中</span>
              <strong>一起画个夏天</strong>
              <small>查看时间、投稿要求与参与条件</small>
            </button>
            <button
              type="button"
              className="cp-card cp-personal-event"
              onClick={() => go('activity?state=ended')}
            >
              <img className="cp-cover" src={img('portrait')} alt="" />
              <span className="cp-tag">已结束</span>
              <strong>一起画个夏天 · 往期</strong>
              <small>查看活动结果与历史投稿</small>
            </button>
          </div>
        )}
      </Gate>
    </>
  );
}

function Activity({ state: requestedState, go }: Props) {
  const state =
    requestedState === 'normal' &&
    sessionStorage.getItem('cp-activity-submission')
      ? 'submitted'
      : requestedState;
  if (state === 'removed')
    return (
      <>
        <Head title="活动详情" />
        <Empty
          title="活动暂不可访问"
          detail="这场活动已下架。你仍可查看自己的投稿记录。"
          action="返回活动中心"
          onAction={() => go('activities')}
        />
        <Button secondary onClick={() => go('submissions')}>
          我的投稿
        </Button>
      </>
    );
  return (
    <>
      <Head title="一起画个夏天" />
      <Gate state={state} go={go}>
        <img
          className="cp-personal-hero"
          src={img('sea')}
          alt="夏日海边创作示例"
        />
        <div className="cp-card">
          <h2>参与方式</h2>
          <p>上传现有作品，或先生成结果再投稿。投稿需要本人主动提交。</p>
          <p className="cp-muted">
            {state === 'ended' ? '8月1日—8月31日' : '9月26日—10月20日'} ·
            每人可投稿一件原创图片或视频作品。奖励请查看活动公告。
          </p>
          {state === 'ended' && (
            <Notice tone="warn">
              活动已结束。可查看历史投稿，不能创建新投稿。
            </Notice>
          )}
          {state === 'ineligible' && (
            <Notice tone="warn">
              当前不符合投稿资格。已填写内容保持私有，可查看具体规则。
            </Notice>
          )}
          {state === 'submitted' && (
            <Notice>内容已提交；投稿资格、评审和奖励仍需分别查询。</Notice>
          )}
          {state === 'review' && (
            <Notice>投稿材料审核中，不能视为已公开或获奖。</Notice>
          )}
          <div className="cp-actions">
            <Button
              onClick={() => {
                sessionStorage.setItem('cp-activity', '1');
                sessionStorage.setItem('cp-post-kind', 'work');
                go('activity');
              }}
              disabled={['ended', 'ineligible', 'submitted', 'review'].includes(
                state,
              )}
            >
              直接投稿或生成后投稿
            </Button>
            <Button secondary onClick={() => go('submissions')}>
              我的投稿
            </Button>
          </div>
        </div>
      </Gate>
    </>
  );
}

function Submissions({ state, go, embedded=false }: Props & {embedded?:boolean}) {
  let records: Array<{id?:string; title: string; body?:string; kind: string; activityCode: string|null; activityName: string|null; contentStatus: string; eligibility: string; reward: string;reviewReason?:string}> = readActivitySubmissions();
  if (!records.length) {
    try { const previous = JSON.parse(sessionStorage.getItem('cp-activity-submission') || 'null'); if (previous) records = [previous]; } catch {}
  }
  records = [...records,
    {id:'sample-review',title:'夏日海岸',kind:'work',activityCode:'ai_image_challenge',activityName:'AI 生图挑战',contentStatus:'review',eligibility:'pending',reward:'pending'},
    ...(!records.some(record=>record.id?.startsWith('existing-content:published:ai_image_challenge:'))?[{id:'sample-reward',title:'旧照修复练习',kind:'work',activityCode:'ai_image_challenge',activityName:'AI 生图挑战',contentStatus:'approved',eligibility:'passed',reward:'ready'}]:[]),
    {id:'sample-ineligible',title:'产品图练习笔记',kind:'post',activityCode:'meizhourenwu',activityName:'每周创作任务',contentStatus:'public',eligibility:'failed',reward:'pending',reviewReason:'投稿未满足本期活动条件。'},
    {id:'sample-awarded',title:'清晨的海边',kind:'work',activityCode:'ai_image_challenge',activityName:'AI 生图挑战',contentStatus:'approved',eligibility:'passed',reward:'issued'},
  ];
  return (
    <>
      {!embedded&&<Head title="我的投稿" />}
      <Gate state={state} go={go}>
        {(state === 'empty' || (state === 'normal' && !records.length)) ? (
          <Empty
            title="还没有投稿"
            detail="参与活动后，在这里查看进度。"
            action="查看活动"
            onAction={() => go('activities')}
          />
        ) : (
          <>
            {records.map((record,index)=>{
              const ownedId=record.id?.startsWith('existing-content:')?decodeURIComponent(record.id.split(':')[1]):record.id==='sample-reward'?'published':record.id;
              let override:ContentOverride|undefined;try{override=JSON.parse(sessionStorage.getItem('cp-personal-content-state')||'{}')[ownedId||''];}catch{}
              const status=override?.status||record.contentStatus,deleted=status==='deleted',limited=status==='removed'&&override?.removalSource!=='author';
              const open=()=>{let current:SubmissionSnapshot|null=null;try{current=JSON.parse(sessionStorage.getItem('cp-submission')||'null');}catch{};openManagedContent({...record,...((current?.contentId===ownedId)?current:{}),id:ownedId,activityCode:record.activityCode||undefined,activityName:record.activityName||undefined,status:status==='approved'?'public':status},go);};
              return <article className="cp-personal-record cp-submission" key={record.id||index}>{!deleted&&!limited&&<ManagementOpen label={'查看'+record.title} onOpen={open}/>}<ManagementCover src={!deleted&&!limited&&record.id==='sample-reward'?img('restore'):undefined} label={record.kind==='post'?'帖子':'作品'}/><div className="cp-management-info"><strong>{record.title||'未命名内容'}</strong><small>{record.kind==='post'?'帖子':'作品'} · {record.activityName||'活动'}</small><ManagementStatus label={deleted?'原内容已删除':status==='removed'?'原内容已下架':['public','approved'].includes(status)?'已公开':status==='rejected'?'未通过':status==='withdrawn'?'已撤回':'审核中'}/></div><div className="cp-personal-record-actions">{record.activityCode&&<button onClick={()=>go('activity?item='+record.activityCode)}>查看活动</button>}</div>{record.reviewReason&&<p className="cp-management-reason">{record.reviewReason}</p>}</article>;
            })}

          </>
        )}
      </Gate>
    </>
  );
}

function Points({state,go}:Props){
  if(state==='records'||state==='expiry')return <PointsLedger page="points" state={state} go={go}/>;
  const sample=personalPointsSample();
  const {todayEarned,weekEarned}=sample;
  const pending=sample.occupied;
  const nextExpiry=sample.expiries[0];
  const expirySummary=<button className="cp-points-expiry" onClick={()=>go('points?state=expiry')}><span>{nextExpiry?<><strong>{nextExpiry.points} 积分</strong>将于 {nextExpiry.expiresAt} 到期</>:'暂无即将到期的积分'}</span><b>到期明细 ›</b></button>;
  if(new URLSearchParams(window.location.search).get('device')==='pc')return <Gate state={state} go={go}><section className="pc-benefits pc-points">
    <div className="pc-points-overview"><section><small>可用积分</small><strong className="pc-points-total">{pointBalance().toLocaleString('zh-CN')}</strong><dl><div><dt>今日获得</dt><dd>+{todayEarned}</dd></div><div><dt>近 7 日获得</dt><dd>+{weekEarned}</dd></div><div><dt>待到账</dt><dd>{sample.pendingReward===null?'待确认':sample.pendingReward}</dd></div></dl></section><section className="pc-points-shop"><img src="/home-prototype/icons/gift-line.svg" alt=""/><h2>AI 商城</h2><h3>用积分兑换创作权益</h3><p>发现可兑换的 AI 体验权益</p><Button onClick={()=>go('shop')}>去兑换</Button></section></div>
    {expirySummary}
    {pending!==0&&<p className="cp-muted">生成任务占用 {pending===null?'数量待确认':pending} 积分 <button onClick={()=>go('mine?panel=records')}>查看生成记录</button></p>}
    <div className="pc-points-columns"><section className="pc-benefit-section"><header><h2>赚积分</h2><button onClick={()=>go('activities')}>全部任务 ›</button></header>{[['每日签到',todayEarned?'今日已获得 '+todayEarned+' 积分':'查看本周签到与奖励','checkin','calendar-check',todayEarned?'已签到':'去签到'],['国庆七天乐','查看今日任务与参与进度','activity?item=guoqing_qitianle_20261001','gift','去参与'],['邀请有礼','邀请好友一起创作','invite','user-add','去邀请']].map(([title,desc,target,icon,label])=><article className="pc-earn-row" key={title}><img src={'/home-prototype/icons/'+icon+'-line.svg'} alt=""/><div><h3>{title}</h3><p>{desc}</p></div><button className={'cp-button'+(label==='已签到'?' secondary':'')} onClick={()=>go(target)}>{label}</button></article>)}</section>
    <section className="pc-benefit-section"><header><h2>最近积分记录</h2><button onClick={()=>go('points?state=records')}>查看全部 ›</button></header><table><thead><tr><th>时间</th><th>动作</th><th>变化</th></tr></thead><tbody>{sample.rows.slice(0,4).map(r=><tr key={r.id}><td>{r.date==='legacy'?'时间待确认':r.date}</td><td>{r.title}<small className="cp-points-row-status">{r.status}</small></td><td className={r.points!==null&&r.points>0?'is-income':'is-expense'}>{pointChange(r.points)}</td></tr>)}</tbody></table></section></div></section></Gate>;
  return <Gate state={state} go={go}><section className="cp-points-center">
    <section className="cp-points-balance" aria-label="积分概览"><button type="button" className="cp-desktop-only cp-points-detail-link" onClick={()=>go('points?state=records')}>积分明细 ›</button><span>可用积分</span><strong>{pointBalance().toLocaleString('zh-CN')}</strong><dl><div><dt>今日获得</dt><dd>+{todayEarned}</dd></div><div><dt>近 7 日</dt><dd>+{weekEarned}</dd></div><div><dt>待到账</dt><dd>{sample.pendingReward===null?'待确认':sample.pendingReward}</dd></div></dl>{expirySummary}</section>
    {pending!==0&&<p className="cp-points-pending">生成任务占用 {pending===null?'数量待确认':pending} 积分，可在生成记录查看处理结果。<button onClick={()=>go('records')}>查看记录 ›</button></p>}
    <button className="cp-points-shop" onClick={()=>go('shop')}><span><small>AI 商城</small><strong>用积分，换创作力</strong><em>发现可兑换的 AI 体验权益</em></span><b>去兑换 ›</b></button>
    <section className="cp-points-earn"><header><h3>继续赚积分</h3><button onClick={()=>go('activities')}>全部任务 ›</button></header>
      <button className="cp-points-featured" onClick={()=>go('activity?item=guoqing_qitianle_20261001')}><span><small>七日创作任务</small><strong>国庆七天乐</strong><em>查看每日任务与参与进度</em></span><b>去参与 ›</b></button>
      { [['每日签到','查看本周签到与奖励','checkin','time-line'],['Prompt 共创计划','分享创作思路，参与主题共创','activity?item=prompt_co_creation','image-line'],['邀请有礼','邀请好友，查看奖励条件','invite','user-add-line']].map(([title,description,target,icon])=><button aria-label={title} className="cp-points-task" key={title} onClick={()=>go(target)}><img src={`/home-prototype/icons/${icon}.svg`} alt=""/><span><strong>{title}</strong><small>{description}</small></span><img src="/home-prototype/icons/arrow-right-s-line.svg" alt=""/></button>)}
    </section>
  </section></Gate>;
}
function PointsLedger({ state, go }: Props) {
  const sample=personalPointsSample();
  if(state==='expiry')return <Gate state={state} go={go}><section className="cp-points-ledger"><header className="cp-points-ledger-heading"><h2>积分到期明细</h2><button onClick={()=>go('points')}>返回积分中心</button></header>{sample.expiries.length?sample.expiries.map(row=><article key={row.id}><div><strong>{row.title}</strong><small>{row.expiresAt} 到期</small></div><b>{row.points} 积分</b></article>):<Empty title="暂无待到期积分"/>}<p className="cp-muted">每笔奖励按对应有效期到期，消费优先使用最早到期的积分。</p></section></Gate>;
  return <Gate state={state} go={go}><section className="cp-points-ledger"><header className="cp-points-ledger-heading"><h2>积分明细</h2><button onClick={()=>go('points?state=expiry')}>查看到期明细 ›</button></header>{state==='empty'?<Empty title="暂无积分记录"/>:sample.rows.map(row=><button className="cp-points-ledger-row" key={row.id} onClick={()=>go(row.target)}><span><strong>{row.title}</strong><small>{row.date==='legacy'?'时间待确认':row.date} · {row.status}</small></span><b className={row.points!==null&&row.points>0?'is-income':'is-expense'}>{pointChange(row.points)}</b></button>)}</section></Gate>;
}
function Checkin({ state, go }: Props) {
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date());
  const weekday=(new Date(today+'T12:00:00+08:00').getUTCDay()+6)%7;
  const [done,setDone]=useState(state==='done'||checkinRecords().some(record=>record.date===today));
  const [notice,setNotice]=useState('');
  const submitting=useRef(false),dialog=useRef<HTMLDialogElement>(null);
  const close=()=>go(sessionStorage.getItem('cp-checkin-background')||'mine');
  useEffect(()=>{const node=dialog.current;node?.showModal();return()=>node?.close();},[]);
  const week=Array.from({length:7},(_,i)=>{const date=new Date(today+'T12:00:00+08:00');date.setUTCDate(date.getUTCDate()-weekday+i);const key=date.toISOString().slice(0,10);return {key,day:date.getUTCDate(),checked:checkinRecords().some(r=>r.date===key)||(i===weekday&&done),points:i<5?20:50};});
  let streak=0;for(let i=done?weekday:weekday-1;i>=0&&week[i].checked;i--)streak++;
  const next=[3,5,7].find(n=>n>streak),bonus=({3:20,5:30,7:50} as Record<number,number>)[streak+1]||0;
  const reward=week[weekday].points+bonus;
  return <dialog ref={dialog} className="cp-checkin-dialog" aria-labelledby="cp-checkin-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}}>
    <header className="cp-checkin-header"><h2 id="cp-checkin-title">每日签到</h2><button type="button" aria-label="关闭签到弹层" onClick={close}><img src="/home-prototype/icons/close-line.svg" alt=""/></button></header>
    <p className="cp-checkin-intro">每天签到获得积分，本周奖励一目了然。</p>
    <div className="cp-checkin-summary"><div><span>本周签到</span><strong>{week.filter(d=>d.checked).length}<small> / 7</small></strong></div><span>本周最多 <b>+{week.reduce((sum,day)=>sum+day.points,0)+100}</b> 积分</span></div>
    <div className="cp-checkin-calendar">{week.map((day,i)=><div key={day.key} className={i===weekday?'is-today':day.checked?'is-checked':i<weekday?'is-missed':'is-future'}><small>{['一','二','三','四','五','六','日'][i]}</small><div><b>+{day.points}</b><img src={'/home-prototype/icons/'+(day.checked?'checkbox-circle-line':'star-line')+'.svg'} alt={day.checked?'已签到':'未签到'}/><span>{i===weekday?'今天':day.day}</span></div></div>)}</div>
    <section className="cp-checkin-streak"><h3>连签奖励</h3><p>{streak? '已连签 '+streak+' 天，':''}{next?'再连 '+(next-streak)+' 天可得 +'+({3:20,5:30,7:50} as Record<number,number>)[next]:'本周连签奖励已完成'}</p><div>{[[3,20],[5,30],[7,50]].map(([days,points])=><div key={days} className={streak>=days?'is-achieved':''}><span>连签 {days} 天{streak>=days&&<small> · 已达成</small>}</span><b>+{points}</b></div>)}</div></section>
    {state==='unavailable'&&<Notice tone="warn">签到暂不可用，请稍后再试。</Notice>}
    <Button disabled={done||state==='unavailable'} onClick={()=>{if(done||submitting.current)return;submitting.current=true;const records=checkinRecords();if(!records.some(record=>record.date===today))sessionStorage.setItem('cp-checkins',JSON.stringify([{date:today,points:reward},...records]));sessionStorage.setItem('cp-checkin','done');sessionStorage.setItem('cp-checkin-date',today);setDone(true);setNotice('签到成功，+'+reward+' 积分');}}>{done?'今日已签到':'签到 +'+reward+' 积分'}</Button>
    <TransientFeedback message={notice} onClear={()=>setNotice('')}/>
  </dialog>;
}
function InviteRules({dialog,desktop=false,onClose}:{dialog:React.RefObject<HTMLDialogElement|null>;desktop?:boolean;onClose:()=>void}) {
  return <dialog ref={dialog} className={'cp-invite-rules-dialog'+(desktop?' pc-invite-rules':' cp-mobile-invite-rules')} aria-labelledby="invite-rules-title" aria-describedby="invite-rules-intro" onCancel={onClose}><header><div><h2 id="invite-rules-title">邀请规则</h2><p id="invite-rules-intro">{invitationRules.introduction}</p></div><button aria-label="关闭邀请规则" onClick={onClose}><img src="/home-prototype/icons/close-line.svg" alt=""/></button></header><div className="pc-invite-rules-body" role="region" tabIndex={0} aria-label="邀请规则正文">
    <section><h3>分阶段奖励</h3>{desktop?<table><thead><tr><th>好友行为阶段</th><th>邀请人奖励</th><th>奖励发放条件</th></tr></thead><tbody>{invitationRules.stages.map(row=><tr key={row.title}><td>{row.title}</td><td className="pc-rule-reward">+{row.points} 积分</td><td>{row.description}</td></tr>)}</tbody></table>:<ol>{invitationRules.stages.map(row=><li key={row.title}><strong>{row.title}<span>+{row.points} 积分</span></strong><p>{row.description}</p></li>)}</ol>}</section>
    <section><h3>每日 / 每月限额</h3><div className="pc-rule-limits">{invitationRules.limits.map(row=><article key={row.title}><div><h4>{row.title}</h4><strong>{row.points.toLocaleString('zh-CN')} <small>积分</small></strong></div><p>{row.description}</p></article>)}</div></section>
    <section><h3>有效与异常处理</h3><dl className="pc-rule-conditions">{invitationRules.conditions.map(row=><div key={row.title}><dt>{row.title}</dt><dd>{row.description}</dd></div>)}</dl></section>
  </div></dialog>;
}
function InviterBinding(){
  const [referrer,setReferrer]=useState(readDemoInviter),[bound,setBound]=useState(()=>Boolean(readDemoInviter())),[error,setError]=useState(''),[notice,setNotice]=useState('');
  const submitting=useRef(false);
  return <form onSubmit={e=>{e.preventDefault();if(bound||submitting.current)return;submitting.current=true;try{const result=bindDemoInviter(referrer);if(result.ok){setReferrer(readDemoInviter());setBound(true);setError('');setNotice(result.message);}else setError(result.message);}finally{submitting.current=false;}}}><label htmlFor="cp-inviter">我的邀请人</label><div><input id="cp-inviter" className="cp-input" value={referrer} disabled={bound} placeholder="输入邀请码" onChange={e=>{setReferrer(e.target.value);setError('');}}/><button type="submit" className="cp-button" disabled={bound}>{bound?'已绑定':'绑定'}</button></div>{error&&<p className="cp-field-error" role="alert">{error}</p>}<TransientFeedback message={notice} onClear={()=>setNotice('')}/></form>;
}
function Invite({ state, go }: Props) {
  const [notice,setNotice]=useState(''),[rules,setRules]=useState(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('reviewOverlay')==='invite-rules');
  useEffect(()=>{if(!notice||notice.startsWith('复制失败'))return;const timer=window.setTimeout(()=>setNotice(''),2500);return()=>window.clearTimeout(timer);},[notice]);
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const node=dialog.current;if(rules)node?.showModal();return()=>node?.close();},[rules]);
  const inviteCode=demoInviteCode;
  const inviteLink=typeof window==='undefined'?'':window.location.origin+'/community-options/c-prototype?page=login&invite='+inviteCode;
  const copy=async(value:string,label:string)=>{try{await navigator.clipboard.writeText(value);setNotice(label+'已复制');}catch{setNotice('复制失败，请长按选中下方链接复制。');}};
  const records=state==='empty'?[]:[{name:'拾光伙伴 A',time:'10月1日',progress:'已完成首次发布',points:300},{name:'拾光伙伴 B',time:'9月30日',progress:'已注册 · 待首次互动',points:100},{name:'拾光伙伴 C',time:'9月29日',progress:'已完成首次互动 · 待首次发布',points:200}];
  const earned=records.reduce((sum,r)=>sum+r.points,0),ledger=state==='records';
  if(new URLSearchParams(window.location.search).get('device')==='pc')return <Gate state={state} go={go}><section className="pc-benefits pc-invite">
    {!ledger&&<div className="pc-invite-top"><section className="pc-invite-explainer"><div className="pc-invite-explainer-heading"><h2>邀请好友，一起创作</h2><button onClick={()=>setRules(true)}>查看完整规则 ›</button></div><p>好友完成任务，每位最高可得 300 积分。</p><div className="pc-invite-rewards">{[['user','注册','好友完成注册并绑定邀请码'],['chat-3','首次互动','好友完成首次有效点赞或评论'],['edit','首次发布','好友首次发布作品并通过审核']].map(([icon,title,desc])=><article key={title}><img src={'/home-prototype/icons/'+icon+'-line.svg'} alt=""/><div><h3>{title}</h3><p>{desc}</p></div><strong>+100 <small>积分</small></strong></article>)}</div></section>
    <section className="pc-invite-code"><h3><img src="/home-prototype/icons/mail-open-line.svg" alt=""/>我的邀请码</h3><strong>{inviteCode}</strong><button className="pc-copy-code" onClick={()=>copy(inviteCode,'邀请码')}><img src="/home-prototype/icons/file-copy-line.svg" alt=""/>复制邀请码</button><Button onClick={()=>copy(inviteLink,'邀请链接')}>复制邀请链接</Button><InviterBinding/></section></div>}
    <dl className="pc-invite-metrics"><div><dt>邀请好友</dt><dd>{records.length}<small> 位</small></dd></div><div><dt>累计获得</dt><dd>{earned}<small> 积分</small></dd></div><div><dt>处理中</dt><dd>0<small> 积分</small></dd></div></dl>
    <section className="pc-invite-table"><header><h2>{ledger?'邀请记录':'好友任务进度'}</h2>{!ledger&&<button onClick={()=>go('invite?state=records')}>邀请明细 ›</button>}</header><table><thead><tr>{['好友','注册','互动','首次发布','已获积分'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{records.map(r=><tr key={r.name}><td><span className="pc-friend-avatar">{r.name.slice(-1)}</span>{r.name}</td>{[100,200,300].map(n=><td key={n} className={r.points>=n?'is-income':'is-pending'}>{r.points>=n?'✓ 已完成':'待完成'}</td>)}<td>{r.points}</td></tr>)}</tbody></table>{!records.length&&<p className="cp-muted">暂无邀请记录</p>}</section><p className="pc-benefits-footnote">奖励在达成条件后自动发放，实际规则以活动说明为准。</p>
    <TransientFeedback message={notice} onClear={()=>setNotice('')}/>{notice.startsWith('复制失败')&&<input className="cp-input" aria-label="邀请链接" readOnly value={inviteLink}/>}
    {rules&&<InviteRules dialog={dialog} desktop onClose={()=>setRules(false)}/>}
  </section></Gate>;
  return <Gate state={state} go={go}><section className="cp-invite-v2">
    {ledger?<header className="cp-invite-ledger-head"><span>已邀请 {records.length} 位好友</span><strong>累计获得 {earned} 积分</strong></header>:<>
      <header className="cp-invite-hero"><h2>把这束灵感<br/>递给下一位创作者</h2><p>邀请好友，一起探索 AI 创作</p><button className="cp-invite-pc-detail" onClick={()=>go('invite?state=records')}>邀请明细 →</button></header>
      <section className="cp-invite-pass" aria-label="创作者邀请函"><img className="cp-invite-pass-mark" src="/home-prototype/icons/mail-open-line.svg" alt=""/><span>多元拾光 · 创作者邀请函</span><strong>{inviteCode}</strong><button onClick={()=>copy(inviteCode,'邀请码')}><img src="/home-prototype/icons/file-copy-line.svg" alt=""/>复制邀请码</button><p><b>{records.length}</b> 位好友已加入</p></section>
      <section className="cp-invite-reward" aria-label="邀请奖励进度"><span>累计获得 <strong>{earned}</strong> 积分</span><small>好友完成首次发布<br/>再得 <b>100</b> 积分</small></section>
      <ol className="cp-invite-flow" aria-label="邀请流程">{['复制邀请链接','好友成长创作','邀请积分到账'].map((label,i)=><li key={label}><span>0{i+1}</span><strong>{label}</strong></li>)}</ol>
    </>}
    {!ledger&&<section className="cp-invite-pass"><InviterBinding/></section>}
    <section className="cp-invite-progress"><header><h3>{ledger?'邀请记录':'最近进度'}</h3><span>{records.length} 位好友</span></header>{records.map(r=><article key={r.name}><span className="cp-invite-avatar">{r.name.slice(-1)}</span><div><strong>{r.name}</strong><small>{r.progress}{ledger?' · '+r.time:''}</small></div><b>+{r.points}<small>已到账</small></b></article>)}{!records.length&&<p className="cp-muted">暂无邀请进度，分享链接邀请第一位好友。</p>}</section>
    {!ledger&&<button className="cp-invite-rules-link" onClick={()=>setRules(true)}>查看邀请规则 <span>›</span></button>}
    {notice&&<output className="cp-invite-notice" role="status">{notice}</output>}
    {notice.startsWith('复制失败')&&<input className="cp-input" aria-label="邀请链接" readOnly value={inviteLink}/>}
    {!ledger&&<footer className="cp-invite-actions"><Button onClick={()=>copy(inviteLink,'邀请链接')}>复制邀请链接</Button></footer>}
    {rules&&<InviteRules dialog={dialog} onClose={()=>setRules(false)}/>}
  </section></Gate>;
}
function Shop({ state, go }: Props) {
  const [confirm, setConfirm] = useState(state === 'confirm');
  const [done, setDone] = useState(state === 'done');
  const [notice, setNotice] = useState('');
  const redeemed = sessionStorage.getItem('cp-redeemed') === '1';
  return (
    <Gate state={state} go={go}>
      <div className="cp-actions">
        <Button secondary onClick={() => go('points')}>
          积分中心
        </Button>
        <Button secondary onClick={() => go('shop?state=records')}>
          兑换记录
        </Button>
      </div>
      {state === 'empty' ? (
        <Empty title="暂无商品" />
      ) : state === 'records' ? (
        redeemed ? (
          <div className="cp-card">
            <h2>AI 体验权益</h2>
            <p>50 积分 · 已兑换</p>
            <p>卡密：DEMO-NOT-VALID</p>
          </div>
        ) : (
          <Empty title="暂无兑换记录" />
        )
      ) : done ? (
        <div className="cp-card">
          <h2>兑换成功</h2>
          <p>AI 体验权益 · 50 积分</p>
          <p>卡密：DEMO-NOT-VALID</p>
          <Button onClick={() => go('shop?state=records')}>查看兑换记录</Button>
        </div>
      ) : (
        <div className="cp-card">
          <h2>AI 体验权益</h2>
          <p>50 积分</p>
          <p className="cp-muted">兑换后在记录中查看卡密。</p>
          {state === 'unavailable' && (
            <Notice tone="warn">商品暂不可兑换。</Notice>
          )}
          {state === 'insufficient' && <Notice tone="warn">积分不足。</Notice>}
          {confirm && <Notice>确认使用 50 积分兑换？</Notice>}
          <Button
            disabled={
              state === 'unavailable' ||
              state === 'insufficient' ||
              state === 'unknown' ||
              redeemed
            }
            onClick={() => {
              if (!confirm) {
                setConfirm(true);
                return;
              }
              if (state === 'unknown') {
                setNotice('兑换结果待确认，请勿重复兑换。');
                return;
              }
              sessionStorage.setItem('cp-redeemed', '1');
              setDone(true);
            }}
          >
            {redeemed ? '已兑换' : confirm ? '确认兑换' : '兑换'}
          </Button>
          {confirm && (
            <Button secondary onClick={() => setConfirm(false)}>
              取消
            </Button>
          )}
          {(notice || state === 'unknown') && (
            <Notice>{notice || '兑换结果待确认，请查看兑换记录。'}</Notice>
          )}
        </div>
      )}
    </Gate>
  );
}

export function PersonalPage({ page, state, go }: Props) {
  useEffect(() => {
    if (state !== 'account-switched') return;
    for (const key of Array.from({ length: sessionStorage.length }, (_, i) =>
      sessionStorage.key(i),
    ).filter((key): key is string => !!key)) {
      if (
        key.startsWith('cp-') ||
        key.startsWith('reading-') ||
        [
          'cp-auth',
          'cp-return',
          'cp-task',
          'cp-result',
          'cp-source',
          'cp-linked',
          'cp-activity',
          'cp-post-kind',
          'cp-draft',
          'cp-open-draft',
          'cp-pending-edit',
          'cp-submission',
        ].includes(key)
      )
        sessionStorage.removeItem(key);
    }
    pendingUploads = [];
    draftUploads = [];
  }, [state]);
  const props = { page, state, go };
  switch (page) {
    case 'create-result':
      return <GenerationResult state={state} go={go}/>;
    case 'create':
      return <Create {...props} />;

    case 'post-edit':
    case 'post-publish':
      return <PostEdit key={page} {...props} />;

    case 'mine':
      return <Mine {...props} />;
    case 'my-fans':
      return <MyFans {...props}/>;
    case 'my-circles':
    case 'my-relations':
      return <MyRelations {...props} />;
    case 'profile-edit':
      return <ProfileEdit {...props} />;
     case 'login':
       return <LoginOverlay state={state} go={go} />;
    case 'notifications':
      return <Notifications {...props} />;
    case 'activities':
      return <Activities {...props} />;
    case 'activity':
      return <Activity {...props} />;
    case 'points':
      return <Points {...props} />;
    case 'checkin':
      return <Checkin {...props} />;
    case 'invite':
      return <Invite {...props} />;
    case 'shop':
      return <Shop {...props} />;
    default:
      return (
        <Empty
          title="页面未找到"
          detail="请从我的返回。"
          action="返回我的"
          onAction={() => go('mine')}
        />
      );
  }
}

'use client';
/* oxlint-disable react/react-compiler -- The login/draft upload buffers and timestamps are mutated only by user actions in this local prototype. */
import { pointBalance, shopRecords, taskHistory, type PrototypeTask } from './storage';
/* eslint-disable next/no-img-element, jsx-a11y/media-has-caption -- Bundled images and silent local media previews are intentional in this research prototype. */

import { prototypeStore as sessionStorage, getFavorites, currentTarget } from './storage';
import { sampleCircles } from './content-data';
import { readActivitySubmissions, saveActivitySubmissions } from '../b-prototype/operations-data';
import { readPublishedEventConfigs } from '../b-prototype/retained-event-config';
import { readCActivities } from './retained-activities';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { LightWorkbench } from './light-workbench';
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
  {
    id: 'create',
    title: 'AI 创作',
    module: '创作与发布',
    states: ['normal', 'activity', 'expired', 'failure'],
  },
  {
    id: 'publish',
    title: '选择发布方式',
    module: '创作与发布',
    states: ['normal', 'activity', 'expired', 'login-expired'],
  },
  {
    id: 'post-edit',
    title: '编辑内容',
    module: '创作与发布',
    states: [
      'normal',
      'post',
      'activity',
      'validation',
      'uploading',
      'upload-failed',
      'save-failed',
      'submit-failed',
      'conflict',
      'review',
      'rejected',
      'activity-ended',
      'permission',
      'login-expired',
    ],
  },
  {
    id: 'publish-status',
    title: '发布状态',
    module: '创作与发布',
    states: [
      'review',
      'public',
      'rejected',
      'removed',
      'unknown',
      'failure',
      'activity',
      'activity-ended',
    ],
  },
  {
    id: 'mine',
    title: '我的',
    module: '个人管理',
    states: ['normal', 'empty', 'login-expired', 'restricted'],
  },
  { id: 'my-relations', title: '我的关注', module: '个人管理', states: ['normal', 'empty', 'login-expired'] },
  { id: 'profile-edit', title: '编辑资料', module: '个人管理', states: ['normal', 'validation', 'login-expired'] },
  {
    id: 'my-content',
    title: '我的内容',
    module: '个人管理',
    states: ['normal', 'empty', 'review', 'rejected', 'removed', 'failure'],
  },
  {
    id: 'drafts',
    title: '草稿箱',
    module: '个人管理',
    states: [
      'normal',
      'empty',
      'expiring',
      'expired',
      'failure',
      'account-switched',
    ],
  },
  {
    id: 'records',
    title: '生成记录',
    module: '个人管理',
    states: [
      'normal',
      'empty',
      'running',
      'failed',
      'failure',
      'account-switched',
    ],
  },
  {
    id: 'favorites',
    title: '我的收藏',
    module: '个人管理',
    states: ['normal', 'empty', 'removed', 'failure', 'account-switched'],
  },
  {
    id: 'login',
    title: '登录',
    module: '账户',
    states: [
      'normal',
      'return',
      'expired',
      'cancelled',
      'object-gone',
      'activity-ended',
      'account-switched',
    ],
  },
  {
    id: 'notifications',
    title: '通知',
    module: '账户',
    states: ['normal', 'empty', 'removed', 'failure', 'login-expired'],
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
    states: [
      'normal',
      'ended',
      'removed',
      'ineligible',
      'submitted',
      'review',
      'failure',
    ],
  },
  {
    id: 'submissions',
    title: '我的投稿',
    module: '活动',
    states: ['normal', 'empty', 'review', 'ineligible', 'awarded', 'failure'],
  },
  {
    id: 'points',
    title: '积分中心',
    module: '既有业务',
    states: ['normal', 'empty', 'pending', 'failure', 'login-expired'],
  },
  {
    id: 'checkin',
    title: '每日签到',
    module: '既有业务',
    states: ['normal', 'done', 'unavailable', 'failure', 'login-expired'],
  },
  {
    id: 'invite',
    title: '邀请有礼',
    module: '既有业务',
    states: ['normal', 'empty', 'pending', 'failure', 'login-expired'],
  },
  {
    id: 'shop',
    title: 'AI 商城',
    module: '既有业务',
    states: [
      'normal',
      'empty',
      'confirm',
      'done',
      'records',
      'insufficient',
      'unknown',
      'unavailable',
      'failure',
      'login-expired',
    ],
  },
  { id: 'shop-records', title: '兑换记录', module: 'AI 商城', states: ['normal','empty','pending','failure','login-expired'] },
];

const ASSET = '/home-prototype/';
const img = (name: string) => `${ASSET}${name}.png`;
let pendingUploads: File[] = [];
let draftUploads: File[] = [];

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
function LinkRow({
  title,
  detail,
  onClick,
  tag,
}: {
  title: string;
  detail?: string;
  onClick: () => void;
  tag?: string;
}) {
  return (
    <button type="button" className="cp-row cp-personal-row" onClick={onClick}>
      <span>
        <strong>{title}</strong>
        {detail && <small className="cp-muted">{detail}</small>}
      </span>
      {tag && <span className="cp-tag">{tag}</span>}
      <b aria-hidden="true">›</b>
    </button>
  );
}
function Empty({
  title,
  detail,
  action,
  onAction,
}: {
  title: string;
  detail?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="cp-card cp-personal-empty">
      <h2>{title}</h2>
      <p className="cp-muted">{detail}</p>
      {action && onAction && <Button onClick={onAction}>{action}</Button>}
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

function Publish({ state, go }: Props) {
  const [linked, setLinked] = useState(state === 'activity');
  useEffect(() => {
    const timer = window.setTimeout(
      () => setLinked(sessionStorage.getItem('cp-activity') === '1'),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <>
      <Head title="选择发布方式" />
      <Gate state={state} go={go} requiresAccount={false}>
        {(state === 'activity' || linked) && <Notice>已选择活动投稿。</Notice>}
        {state === 'expired' && (
          <Notice tone="warn">
            当前活动已结束，不能继续投稿。原素材不会自动转成普通发布。
          </Notice>
        )}
        <div className="cp-grid cp-personal-choice">
          <div className="cp-card">
            <h2>直接发布作品</h2>
            <p className="cp-muted">上传图片、视频或文字成果。</p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('cp-source');
                sessionStorage.removeItem('cp-result');
                sessionStorage.removeItem('cp-circle');
                sessionStorage.setItem('cp-post-kind', 'work');
                go('post-edit');
              }}
              disabled={state === 'expired'}
            >
              编辑作品
            </Button>
          </div>
          <div className="cp-card">
            <h2>生成后发布</h2>
            <p className="cp-muted">先生成，再从结果中选择发布。</p>
            <Button onClick={() => {
              const code=sessionStorage.getItem('cp-activity-code');
               go(linked&&code?'create?activity='+encodeURIComponent(code):'create');
            }} disabled={state === 'expired'}>
              AIGC 生成
            </Button>
          </div>
          <div className="cp-card">
            <h2>发布帖子</h2>
            <p className="cp-muted">分享问题、过程或经验。</p>
            <Button
              onClick={() => {
                sessionStorage.removeItem('cp-source');
                sessionStorage.removeItem('cp-result');
                sessionStorage.setItem('cp-post-kind', 'post');
                go('post-edit');
              }}
              disabled={state === 'expired' || ((linked || state === 'activity') && !activityAllowsPosts())}
            >
              编辑帖子
            </Button>
          </div>
        </div>
        {state === 'expired' && (
          <Button secondary onClick={() => go('activity')}>
            返回活动查看规则
          </Button>
        )}
      </Gate>
    </>
  );
}

function PostEdit({ state, go }: Props) {
  const joinedCircles=sampleCircles.filter(c=>sessionStorage.getItem('cp-circle-joined:'+c.id)==='1'||(c.id==='image'&&sessionStorage.getItem('cp-circle-joined')==='1')||sessionStorage.getItem('cp-circle')===c.name);
  const [kind, setKind] = useState<'work' | 'post'>('work');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [relation, setRelation] = useState('');
  const [scene, setScene] = useState('');
  const [model, setModel] = useState('');
  const [caseNote, setCaseNote] = useState('');
  const [circle, setCircle] = useState(
    () => sessionStorage.getItem('cp-circle') || '',
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
  const [preview, setPreview] = useState(false);
  const [activity, setActivity] = useState(
    state === 'activity' || state === 'activity-ended',
  );
  const [leaving, setLeaving] = useState(false);
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
       if (state === 'post' || sessionStorage.getItem('cp-post-kind') === 'post')
         setKind('post');
      const source = sessionStorage.getItem('cp-source');
      if (source) {
        const result = JSON.parse(
          sessionStorage.getItem('cp-result') || 'null',
        ) as {
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
        if(source==='app-result'){
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
        } else if (source === 'app-result' && task?.item === 'copy') {
          setTitle('文案改写结果');
          setBody(
            '用清晰的表达记录创作想法。\n从一张图片开始，整理素材、尝试不同背景，再选择适合的效果。',
          );
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
        setMessage('成果已带入，请检查后提交。');
      }
      const pending = sessionStorage.getItem('cp-pending-edit');
      if (pending && new URLSearchParams(window.location.search).get('page') !== 'login') {
        try {
          const value = JSON.parse(pending);
          setTitle(value.title || '');
          setBody(value.body || '');
          setRelation(value.relation || '');
          setScene(value.scene || '');
          setModel(value.model || '');
          setCaseNote(value.caseNote || '');
          setCircle(value.circle || '');
          setKind(value.kind === 'post' && (!activityLinked || activityAllowsPosts()) ? 'post' : 'work');
        } catch {}
        sessionStorage.removeItem('cp-pending-edit');
        if (pendingUploads.length) {
          setFiles(
            pendingUploads.map((file) => {
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
          );
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
            if (draft.activityCode) {
              sessionStorage.setItem('cp-activity', '1');
              sessionStorage.setItem('cp-activity-code', draft.activityCode);
              sessionStorage.setItem('cp-activity-name', draft.activityName || '');
              sessionStorage.setItem('cp-activity-task', draft.activityTask || '');
              setActivity(true);
            }
            setTitle(draft.title || '');
            setBody(draft.body || '');
            setRelation(draft.relation || '');
            setScene(draft.scene || '');
            setModel(draft.model || '');
            setCaseNote(draft.caseNote || '');
            setCircle(draft.circle || '');
            setKind(draft.kind === 'post' && (!draft.activityCode || activityAllowsPosts()) ? 'post' : 'work');
            if (draft.fileCount > 0 && !draftUploads.length) setMessage('本地文件无法跨浏览器刷新保留，请重新选择素材。');
            if (draftUploads.length)
              setFiles(
                draftUploads.map((file) => {
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
              );
          }
        } catch {}
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [state]);
  const chooseFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    if (!incoming.length) return;
    const existingVideo = files.some((f) => f.type.startsWith('video/'));
    const nextVideo = incoming.some((f) => f.type.startsWith('video/'));
    if ((existingVideo || nextVideo) && files.length + incoming.length > 1) {
      setMessage('图片和视频不能混用；每次最多 1 段视频。');
      return;
    }
    if (files.length + incoming.length > 9) {
      setMessage('图片最多 9 张。');
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
    setMessage('素材已选取。');
    event.target.value = '';
  };
  const validate = () => {
    const code = activityCode();
    const activityTask = sessionStorage.getItem('cp-activity-task') || '';
    const event = activity ? readCActivities().find((item) => item.code === code) : undefined;
    if (activity && (!event || event.status !== '进行中' || event.locked)) return '当前活动暂不能新投稿，请查看活动详情。';
    if (kind === 'work' && !title.trim()) return '请填写作品标题。';
    if (title.length > 60) return '标题最多 60 字。';
    if (kind === 'work' && !files.length && !body.trim())
      return '请选择成果或填写文字成果。';
    if (activity && kind === 'post' && !activityAllowsPosts()) return '活动只能投稿作品。';
    if (activity && code === 'meizhourenwu') {
      if (activityTask.includes('纯文字') && (kind !== 'post' || files.length)) return '本次任务需提交纯文字圈子帖子。';
      if (activityTask.includes('图片圈子') && (kind !== 'post' || !files.some(f => f.type.startsWith('image/')))) return '本次任务需提交带图片的圈子帖子。';
      if (activityTask.includes('图片作品') && (kind !== 'work' || !files.some(f => f.type.startsWith('image/')))) return '本次任务需提交图片作品。';
    }
    if (activity && ['ai_image_challenge', 'prompt_co_creation'].includes(code || '')) {
      if (kind !== 'work') return '当前活动只接受作品。';
      if (title.trim().length < 4) return '活动作品标题至少 4 字。';
      if (!scene.trim() || !model.trim()) return '请填写创作场景与使用模型。';
      if (code === 'ai_image_challenge' && (!files.some(f => f.type.startsWith('image/')) || !body.includes('#生图挑战') || (body.match(/[\u3400-\u9fff]/g) || []).length < 30)) return '生图挑战需图片、#生图挑战，正文至少 30 个汉字。';
      if (code === 'prompt_co_creation' && (!files.length || !caseNote.trim() || ((body.match(/[\u3400-\u9fff]/g) || []).length < 30 && (body.match(/[A-Za-z]+/g) || []).length < 20))) return 'Prompt 共创需素材、案例和足量正文（中文 30 字或英文 20 词）。';
    }
    if (activity) {
      const config = publishedActivity();
      if (!config) return '活动配置未发布，暂不能投稿。';
      const publish = config.extra_config.publish_config;
      const task = currentActivityTask();
      if (publish.biz_type === 'post' && kind !== 'post') return '当前活动只接受帖子。';
      if (publish.require_join_token && sessionStorage.getItem('cp-joined-' + code) !== '1') return '请先在活动详情参与，再提交内容。';
      const titleMin = Math.max(publish.title_min_len, task?.validation_rule.title_min_len || 0);
      if (kind === 'work' && title.trim().length < titleMin) return `活动标题至少 ${titleMin} 字。`;
      const imageCount = files.filter((file) => file.type.startsWith('image/')).length;
      const videoCount = files.filter((file) => file.type.startsWith('video/')).length;
      if (imageCount < Math.max(publish.min_image_count, task?.event_filter.min_image_count || 0)) return '活动图片数量不足，请核对活动要求。';
      if (videoCount < publish.min_video_count) return '活动视频数量不足，请核对活动要求。';
      if ((imageCount > 0 && !publish.media_types.includes('image')) || (videoCount > 0 && !publish.media_types.includes('video'))) return '所选媒体类型不符合活动投稿要求。';
      const contentType = kind === 'post' ? files.length ? 2 : 1 : videoCount ? 3 : imageCount ? 2 : publish.biz_type === 'prompt' ? 1 : 4;
      const allowedTypes = task?.event_filter.content_types?.length ? task.event_filter.content_types : publish.content_types;
      if (!(kind === 'post' && code === 'meizhourenwu' && !task?.event_filter.content_types?.length) && !allowedTypes.includes(contentType)) return '当前内容类型不符合活动投稿要求，请核对图片、视频或文字成果。';
      if (publish.topic_codes.length && !publish.topic_codes.some((topic) => body.includes('#' + topic))) return '请在正文中带上活动指定话题。';
      if (publish.category_codes.length) return '当前表单暂不能核验活动指定分类，请从活动详情返回。';
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
    if (body.length > 20000) return '正文最多 20,000 字。';
    if (state === 'activity-ended' && activity)
      return '活动已结束。可保留草稿，或主动取消活动关联后普通发布。';
    return '';
  };
  const save = () => {
    if (sessionStorage.getItem('cp-auth') !== '1') {
      sessionStorage.setItem('cp-return', 'post-edit');
      sessionStorage.setItem(
        'cp-pending-edit',
        JSON.stringify({ kind, title, body, relation, circle, scene, model, caseNote }),
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
        kind,
        title,
        body,
        relation,
        circle,
        scene,
        model,
        caseNote,
        activityCode: activity ? sessionStorage.getItem('cp-activity-code') : null,
        activityName: activity ? sessionStorage.getItem('cp-activity-name') : null,
        activityTask: activity ? sessionStorage.getItem('cp-activity-task') : null,
        fileCount: files.length,
        savedAt,
        expiresAt: savedAt + 30 * 86400000,
      }),
    );
    setMessage('草稿已保存。保留至最近一次成功保存后 30 天。');
    return true;
  };
  const submit = () => {
    const error = validate();
    if (error) {
      setMessage(error);
      return;
    }
    if (sessionStorage.getItem('cp-auth') !== '1') {
      sessionStorage.setItem('cp-return', 'post-edit');
      sessionStorage.setItem(
        'cp-pending-edit',
        JSON.stringify({ kind, title, body, relation, circle, scene, model, caseNote }),
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
    sessionStorage.setItem(
      'cp-submission',
      JSON.stringify({ kind, title, body, activity, activityCode: sessionStorage.getItem('cp-activity-code'), activityName: sessionStorage.getItem('cp-activity-name'), status: 'review' }),
    );
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
    setMessage('已提交。可在发布状态查看进度。');
    go('publish-status');
  };
  if (state === 'login-expired')
    return (
      <>
        <Head title="编辑内容" />
        <NeedLogin go={go} />
      </>
    );
  return (
    <>
      <Head title="编辑内容" />
      <div className="cp-tabs cp-personal-tabs">
        <button
          type="button"
          className={kind === 'work' ? 'active' : ''}
          onClick={() => setKind('work')}
        >
          作品
        </button>
        <button
          type="button"
          className={kind === 'post' ? 'active' : ''}
          onClick={() => setKind('post')}
          disabled={activity && !activityAllowsPosts()}
        >
          帖子
        </button>
      </div>
      {activity && state !== 'activity-ended' && (
        <Notice>活动投稿：{sessionStorage.getItem("cp-activity-name") || "当前活动"}</Notice>
      )}
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
      {state === 'rejected' && (
        <Notice tone="warn">提交未通过。查看原因后可修改重提。</Notice>
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
      <div className="cp-card cp-personal-form">
        <label>
          标题 {kind === 'post' && <small className="cp-muted">选填</small>}
          <input
            className="cp-input"
            value={title}
            maxLength={61}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              kind === 'work' ? '给作品起个名字' : '可选：概括讨论主题'
            }
          />
        </label>
        <label>
          {kind === 'post' ? '正文' : '文字成果或创作说明'}
          <textarea
            className="cp-input"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              kind === 'post'
                ? '写下问题、过程或经验'
                : '可填写文字成果、说明或创作心得'
            }
            rows={6}
          />
        </label>
        <label className="cp-personal-upload">
          选择图片或视频
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={chooseFiles}
          />
        </label>
        <p className="cp-muted">
          图片最多 9 张、单张 20 MB，或视频 1 段、不超过 300 MB 和 10 分钟。
        </p>
        {files.length > 0 && (
          <div className="cp-personal-media">
            {files.map((f, i) => (
              <div key={f.url}>
                {f.type.startsWith('image/') ? (
                  <img src={f.url} alt={f.name} />
                ) : (
                  <video src={f.url} controls />
                )}
                <small>{f.name}</small>
                <button
                  type="button"
                  onClick={() => setFiles((v) => v.filter((_, n) => n !== i))}
                >
                  移除
                </button>
              </div>
            ))}
          </div>
        )}
        <label>
          关联内容{' '}
          <input
            className="cp-input"
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            placeholder="按需关联已有作品、应用或资源"
          />
        </label>
        {activity && ['ai_image_challenge', 'prompt_co_creation'].includes(sessionStorage.getItem('cp-activity-code') || '') && <>
          <label>创作场景<input className="cp-input" value={scene} onChange={e => setScene(e.target.value)} placeholder="作品用于什么场景" /></label>
          <label>使用模型<input className="cp-input" value={model} onChange={e => setModel(e.target.value)} placeholder="填写实际使用的模型" /></label>
          {sessionStorage.getItem('cp-activity-code') === 'prompt_co_creation' && <label>案例说明<textarea className="cp-input" value={caseNote} onChange={e => setCaseNote(e.target.value)} rows={3} placeholder="说明 Prompt 的使用结果" /></label>}
        </>}
        {kind === 'post' && (
          <label>
            圈子{' '}
            <select
              className="cp-input"
              value={circle}
              onChange={(e) => setCircle(e.target.value)}
            ><option value="">不选择圈子</option>{joinedCircles.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select>
            {!joinedCircles.length&&<Button secondary onClick={()=>go('circles')}>发现圈子</Button>}
          </label>
        )}
        <p className="cp-muted">草稿保存后保留 30 天。</p>
        {message && (
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
        <div className="cp-actions">
          <Button secondary onClick={save}>
            保存草稿
          </Button>
          <Button secondary onClick={() => setPreview((v) => !v)}>
            预览
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
            主动提交
          </Button>
          <Button secondary onClick={() => setLeaving(true)}>
            离开
          </Button>
        </div>
      </div>
      {preview && (
        <div className="cp-card cp-personal-preview">
          <h2>{title || '未填写标题'}</h2>
          <p>{body || '暂无正文'}</p>
          {files.map((f) =>
            f.type.startsWith('image/') ? (
              <img key={f.url} src={f.url} alt={f.name} />
            ) : (
              <video key={f.url} src={f.url} controls />
            ),
          )}
        </div>
      )}
      {leaving && (
        <div className="cp-card cp-personal-leave">
          <strong>离开前处理当前修改</strong>
          <div className="cp-actions">
            <Button
              onClick={() => {
                if (save()) go('drafts');
              }}
            >
              保存草稿并离开
            </Button>
            <Button secondary onClick={() => go('mine')}>
              放弃修改
            </Button>
            <Button secondary onClick={() => setLeaving(false)}>
              继续编辑
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

function PublishStatus({ state, go }: Props) {
  const [submission] = useState<{
    kind?: string;
    title?: string;
    body?: string;
    activity?: boolean;
    activityName?: string;
  } | null>(()=>{try{return JSON.parse(sessionStorage.getItem('cp-submission')||'null')}catch{return null}});
  const title: Record<string, string> = {
    review: '已提交，审核中',
    public: '内容已公开',
    rejected: '本次提交未通过',
    removed: '内容已下架',
    unknown: '提交结果待确认',
    failure: '提交失败',
    activity: '内容已提交',
    'activity-ended': '活动关联已失效',
  };
  return (
    <>
      <Head title="发布状态" />
      <Notice
        tone={
          state === 'public'
            ? 'success'
            : state === 'rejected' || state === 'removed' || state === 'failure'
              ? 'error'
              : 'neutral'
        }
      >
        {title[state] || title.review}
      </Notice>
      <div className="cp-card">
        <h2>
          {submission?.kind === 'post' ? '帖子' : '作品'} ·{' '}
          {submission?.title || (submission?.kind==='post' ? submission?.body?.trim().slice(0,24) || '新帖子' : '新提交的作品')}
        </h2>
        <p className="cp-muted">提交时间：刚刚</p>
        {(state === 'activity' || submission?.activity) && (
          <p>活动投稿：{submission?.activityName || "当前活动"} · 资格与评审可在投稿记录查看。</p>
        )}
        {state === 'activity-ended' && <p>活动已结束，此次投稿仍可查看。</p>}
        {state === 'rejected' && <p>修改未通过，请查看原因后重新提交。</p>}
        {state === 'removed' && <p>内容暂不可公开访问，可从我的内容查看当前状态。</p>}
        {state === 'unknown' && <p>提交状态暂未确定。请稍后刷新。</p>}
        {state === 'failure' && <p>输入与素材保留在编辑页，可检查后重试。</p>}
        <div className="cp-actions">
          <Button
            onClick={() =>
              go(
                state === 'rejected' || state === 'failure'
                  ? 'post-edit'
                  : 'my-content',
              )
            }
          >
            {state === 'rejected' || state === 'failure'
              ? '返回编辑'
              : '查看我的内容'}
          </Button>
          {submission?.activity && (
            <Button secondary onClick={() => go('submissions')}>
              查看投稿进度
            </Button>
          )}
        </div>
      </div>
    </>
  );
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
  return (
    <>
      <Head title="我的" />
      <Gate state={state} go={go}>
        {state === 'restricted' && (
          <Notice tone="warn">
            账号暂不能发布或投稿。你仍可查看已有记录。
          </Notice>
        )}
        <div className="cp-card cp-personal-profile">
          <span className="cp-avatar">拾</span>
          <div>
            <strong>{sessionStorage.getItem('cp-profile-name') || '林间'}</strong>
            <p className="cp-muted">{sessionStorage.getItem('cp-profile-bio') || '个人内容与账户服务'}</p>
          </div>
          <div className="cp-personal-profile-actions">
            <Button secondary onClick={() => go('author')}>公开作者主页</Button>
            <Button secondary onClick={() => go('profile-edit')}>编辑资料</Button>
          </div>
        </div>
        <div className="cp-grid cp-personal-shortcuts">
          {[
            ['我的内容', 'my-content'],
            ['草稿箱', 'drafts'],
            ['生成记录', 'records'],
            ['我的收藏', 'favorites'],
            ['已加入圈子与关注', 'my-relations'],
            ['我的投稿', 'submissions'],
            ['通知', 'notifications'],
          ].map(([label, id]) => (
            <LinkRow key={id} title={label} onClick={() => go(id)} />
          ))}
          {canMaintain && state !== 'restricted' && (
            <LinkRow
              title="内容维护"
              onClick={() =>
                window.location.assign(
                  '/community-options/cross-prototype?page=maintain&source=mine',
                )
              }
            />
          )}
        </div>
        <div className="cp-section cp-personal-services">
          <h2>账户服务</h2>
          {[
            ['积分中心', 'points'],
            ['每日签到', 'checkin'],
            ['邀请有礼', 'invite'],
            ['AI 商城', 'shop'],
          ].map(([label, id]) => (
            <LinkRow key={id} title={label} onClick={() => go(id)} />
          ))}
        </div>
        {state === 'empty' && <Notice>还没有发布内容。</Notice>}
        <CreationEntry go={go} label="去创作" />
      </Gate>
    </>
  );
}

function MyRelations({ state, go }: Props) {
  const joinedImage = sessionStorage.getItem('cp-circle-joined:image') === '1' || sessionStorage.getItem('cp-circle-joined') === '1';
  const joinedVisual = sessionStorage.getItem('cp-circle-joined:visual') === '1';
  const following = sessionStorage.getItem('cp-following:林间') === '1';
  return <>
    <Head title="已加入圈子与关注" />
    <Gate state={state} go={go}>
      <section className="cp-section">
        <h2>已加入圈子</h2>
        {state !== 'empty' && (joinedImage || joinedVisual) ? <div className="cp-list">
          {joinedImage && <LinkRow title="影像练习圈" detail="可继续浏览圈内公开帖子" onClick={() => go('circle?item=image')} />}
          {joinedVisual && <LinkRow title="视觉创作圈" detail="可继续浏览圈内公开帖子" onClick={() => go('circle?item=visual')} />}
        </div> : <Empty title="还没有加入圈子" action="发现圈子" onAction={() => go('circles')} />}
      </section>
      <section className="cp-section">
        <h2>关注的作者</h2>
        {state !== 'empty' && following ? <LinkRow title="林间" detail="查看公开作者主页" onClick={() => go('author')} /> : <Empty title="还没有关注作者" action="浏览社区" onAction={() => go('community')} />}
      </section>
    </Gate>
  </>;
}

function ProfileEdit({ state, go }: Props) {
  const [name, setName] = useState(() => sessionStorage.getItem('cp-profile-name') || '林间');
  const [bio, setBio] = useState(() => sessionStorage.getItem('cp-profile-bio') || '');
  const [notice, setNotice] = useState('');
  return <>
    <Head title="编辑资料" />
    <Gate state={state} go={go}>
      <div className="cp-card cp-personal-form">
        <label>昵称<input className="cp-input" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} /></label>
        <label>个人介绍<textarea className="cp-input" value={bio} maxLength={160} rows={4} onChange={(e) => setBio(e.target.value)} /></label>
        {notice && <Notice tone={notice.startsWith('请') ? 'warn' : 'success'}>{notice}</Notice>}
        <div className="cp-actions">
          <Button onClick={() => {
            if (!name.trim()) { setNotice('请填写昵称。'); return; }
            if (sessionStorage.getItem('cp-auth') !== '1') {
              sessionStorage.setItem('cp-return', 'profile-edit');
              go('login');
              return;
            }
            sessionStorage.setItem('cp-profile-name', name.trim());
            sessionStorage.setItem('cp-profile-bio', bio.trim());
            setNotice('资料已保存。');
          }}>保存资料</Button>
          <Button secondary onClick={() => go('mine')}>返回我的</Button>
        </div>
      </div>
    </Gate>
  </>;
}

function MyContent({ state, go }: Props) {
  let submitted: { title: string; kind: string } | null = null;
  try {
    submitted = JSON.parse(sessionStorage.getItem('cp-submission') || 'null');
  } catch {}
  const [filter, setFilter] = useState('全部');
  const visible = submitted && (filter === '全部' || filter === (submitted.kind === 'post' ? '帖子' : '作品'));
  const status = state === 'rejected' ? '未通过' : state === 'removed' ? '已下架' : state === 'review' ? '审核中' : '审核中';
  return (
    <>
      <Head title="我的内容" />
      <Gate state={state} go={go}>
        <div className="cp-tabs cp-personal-tabs">
          {['全部', '作品', '帖子'].map((x) => (
            <button
              key={x}
              type="button"
              className={filter === x ? 'active' : ''}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ))}
        </div>
        {state === 'empty' || !submitted ? (
          <Empty
            title="暂无内容"
            detail="可直接发布作品，或在社区分享帖子。"
            action="去发布"
            onAction={() => go('publish')}
          />
        ) : (
          <div className="cp-list">
            {visible && (
                <LinkRow
                  title={submitted.title}
                  detail={submitted.kind === 'post' ? '帖子' : '作品'}
                  tag={status}
                  onClick={() => go('publish-status?state=' + (state === 'rejected' ? 'rejected' : state === 'removed' ? 'removed' : 'review'))}
                />
              )}
            {!visible && <Empty title="此分类暂无内容" />}
          </div>
        )}
        <div className="cp-actions">
          <Button secondary onClick={() => go('drafts')}>
            查看草稿
          </Button>
          <Button secondary onClick={() => go('author')}>
            查看公开主页
          </Button>
        </div>
      </Gate>
    </>
  );
}

function Drafts({ state, go }: Props) {
  const [filter, setFilter] = useState('全部');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<{
    kind: string;
    title: string;
    body: string;
    savedAt: number;
    expiresAt: number;
  } | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = JSON.parse(sessionStorage.getItem('cp-draft') || 'null');
        setDraft(saved && saved.expiresAt > Date.now() ? saved : null);
      } catch {
        setDraft(null);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  const visibleDraft = state !== 'expired' && draft && (filter === '全部' || filter === (draft.kind === 'post' ? '帖子' : '作品')) && (!query || `${draft.title} ${draft.body}`.includes(query));
  return (
    <>
      <Head title="草稿箱" />
      <Gate state={state} go={go}>
        {state === 'account-switched' ? (
          <Empty
            title="已切换账号"
            detail="前一账号的草稿和搜索缓存已清除，请以当前账号重新载入。"
            action="返回我的"
            onAction={() => go('mine')}
          />
        ) : state === 'empty' ? (
          <Empty
            title="没有草稿"
            detail="作品和帖子可在编辑时手动保存。"
            action="去创作"
            onAction={() => go('publish')}
          />
        ) : (
          <>
            <div className="cp-tabs cp-personal-tabs">
              {['全部', '作品', '帖子'].map((x) => (
                <button
                  key={x}
                  type="button"
                  className={filter === x ? 'active' : ''}
                  onClick={() => setFilter(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            <input
              className="cp-input"
              placeholder="搜索本人草稿标题或正文"
              aria-label="搜索本人草稿"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {state === 'expiring' && (
              <Notice tone="warn">
                草稿剩余不足 7 天，请及时继续编辑并手动保存。
              </Notice>
            )}
            {state === 'expired' && (
              <Notice tone="warn">这份草稿已到期，无法继续编辑。</Notice>
            )}
            <div className="cp-list">
              {visibleDraft && (
                  <LinkRow
                    title={draft.title || '未命名草稿'}
                    detail={`${draft.kind === 'post' ? '帖子' : '作品'} · 最近保存 ${new Date(draft.savedAt).toLocaleDateString('zh-CN')} · 到期 ${new Date(draft.expiresAt).toLocaleDateString('zh-CN')}`}
                    tag="私人草稿"
                    onClick={() => {
                      sessionStorage.setItem('cp-open-draft', '1');
                      go('post-edit');
                    }}
                  />
                )}
              {!visibleDraft && <Empty title={state === 'expired' ? '草稿已到期' : '没有符合条件的草稿'} action="去创作" onAction={() => go('publish')} />}
            </div>
            {draft && <p className="cp-muted">草稿保存后保留 30 天。</p>}
          </>
        )}
      </Gate>
    </>
  );
}

function Records({ state, go }: Props) {
  const [tasks, setTasks] = useState<PrototypeTask[]>([]);
  useEffect(() => {
    const refresh = () => setTasks(taskHistory());
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener('cp-task-change', refresh);
    return () => { window.clearTimeout(timer); window.removeEventListener('cp-task-change', refresh); };
  }, []);
  const labels: Record<string, string> = { copy: '文案改写', background: '产品换背景', video: '产品短片制作', restore: '照片修复', 'light-image': '图片创作', 'light-text': '剧本创作', 'light-video': '视频创作' };
  const waiting = ['queued', 'running', 'submitting', 'unknown', 'cancelling', 'cancel-failed'];
  return (
    <>
      <Head title="生成记录" />
      <Gate state={state} go={go}>
        {state === 'account-switched' ? (
          <Empty
            title="已切换账号"
            detail="前一账号的私有生成记录已从当前页面清除。"
            action="返回我的"
            onAction={() => go('mine')}
          />
        ) : state === 'empty' || tasks.length === 0 ? (
          <Empty
            title="暂无生成记录"
            detail="使用 AI 应用后，可在这里查看任务。"
            action="浏览应用"
            onAction={() => go('apps')}
          />
        ) : <div className="cp-list">{tasks.map((task, index) => {
          const status = task.status || 'normal';
          const item = task.item || 'copy';
          const id = task.id || '';
          const target = item.startsWith('light-') ? 'create' : waiting.includes(status) || ['cancelled', 'unaccepted', 'failed'].includes(status) ? 'app-task' : 'app-result';
          const label = status === 'failed' ? '失败' : status === 'cancelled' ? '已取消' : status === 'unaccepted' ? '未受理' : waiting.includes(status) ? '处理中' : '已完成';
          return <LinkRow key={id || index} title={labels[item] || item} detail={`${label}${task.input ? ' · '+task.input.slice(0,40) : ''}${task.createdAt ? ' · '+new Date(task.createdAt).toLocaleDateString('zh-CN') : ''}`} tag={label} onClick={() => go(`${target}?item=${encodeURIComponent(item)}&task=${encodeURIComponent(id)}`)} />;
        })}</div>}
      </Gate>
    </>
  );
}

function Favorites({ state, go }: Props) {
  const [filter, setFilter] = useState('全部'),
    [kept, setKept] = useState(true);
  return (
    <>
      <Head title="我的收藏" />
      <Gate state={state} go={go}>
        {state === 'account-switched' ? (
          <Empty
            title="已切换账号"
            detail="请用当前账号查看收藏。"
            action="返回我的"
            onAction={() => go('mine')}
          />
        ) : state === 'empty' ? (
          <Empty
            title="还没有收藏"
            detail="从作品、教程或 AI 应用详情收藏后可在此找回。"
            action="去社区"
            onAction={() => go('community')}
          />
        ) : (
          <>
            <div className="cp-tabs cp-personal-tabs">
              {['全部', '作品', '帖子', '教程', 'AI 应用', '资源'].map((x) => (
                <button
                  key={x}
                  type="button"
                  className={filter === x ? 'active' : ''}
                  onClick={() => setFilter(x)}
                >
                  {x}
                </button>
              ))}
            </div>
            {state === 'removed' ? (
              kept ? (
                <div className="cp-card">
                  <strong>内容已不可访问</strong>
                  <p className="cp-muted">这条收藏已失效。</p>
                  <Button secondary onClick={() => setKept(false)}>
                    移除收藏
                  </Button>
                </div>
              ) : (
                <Empty title="已移除收藏" detail="这条失效内容已从列表移除。" />
              )
            ) : (
              <div className="cp-list">
                {getFavorites()
                  .filter((x) => filter === '全部' || x.type === filter)
                  .map((x) => (
                    <LinkRow
                      key={x.target}
                      title={x.title}
                      detail={x.type}
                      onClick={() => go(x.target)}
                    />
                  ))}
                {!getFavorites().some(
                  (x) => filter === '全部' || x.type === filter,
                ) && <Empty title="还没有收藏" />}
              </div>
            )}
          </>
        )}
      </Gate>
    </>
  );
}

function Notifications({ state, go }: Props) {
  return (
    <>
      <Head title="通知" />
      <Gate state={state} go={go}>
        {state === 'empty' ? (
          <Empty
            title="暂无通知"
            detail="评论回复、审核和活动结果会显示在这里。"
          />
        ) : state === 'removed' ? (
          <LinkRow
            title="原内容已失效"
            detail="处理结果仍可查看。"
            onClick={() => go('my-content')}
          />
        ) : (
          <div className="cp-list">
            <LinkRow
              title="作品修改审核结果"
              detail="9月25日 · 本次修改已通过"
              onClick={() => go('my-content')}
              tag="未读"
            />
            <LinkRow
              title="活动投稿资格更新"
              detail="9月24日 · 查看本人投稿进度"
              onClick={() => go('submissions')}
            />
          </div>
        )}
      </Gate>
    </>
  );
}

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
                go('publish');
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

function Submissions({ state, go }: Props) {
  let records: Array<{id?:string; title: string; body?:string; kind: string; activityCode: string|null; activityName: string|null; contentStatus: string; eligibility: string; reward: string;reviewReason?:string}> = readActivitySubmissions();
  if (!records.length) {
    try { const previous = JSON.parse(sessionStorage.getItem('cp-activity-submission') || 'null'); if (previous) records = [previous]; } catch {}
  }
  if (!records.length && ['review','ineligible','awarded'].includes(state)) records = [{id:'sample-submission',title:'一瓶夏日晴光',kind:'work',activityCode:'ai_image_challenge',activityName:'AI 生图挑战',contentStatus:state==='awarded'?'approved':'review',eligibility:state==='ineligible'?'failed':'passed',reward:state==='awarded'?'issued':'pending'}];
  return (
    <>
      <Head title="我的投稿" />
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
            {records.map((record, index) => <article className="cp-submission" key={record.id||index}>
              <h2>{record.title || (record.kind==='post'?record.body?.trim().slice(0,24)||'未命名帖子':'未命名作品')}</h2>
              <p>{record.activityName || '活动'}</p>
              <dl>
                <div><dt>内容审核</dt><dd>{record.contentStatus==='public'?'已公开':'待公开审核'}</dd></div>
                <div><dt>投稿资格</dt><dd>{record.eligibility==='passed'?'已通过':record.eligibility==='failed'?'未通过':'待核实'}</dd></div>
                <div><dt>活动评审</dt><dd>{record.contentStatus==='approved'?'已通过':record.contentStatus==='rejected'?'未通过':record.contentStatus==='correction'?'待补正':'待评审'}</dd></div>
                <div><dt>奖励</dt><dd>{record.reward==='issued'?'已发放':record.reward==='ready'?'待发放':'待确认'}</dd></div>
              </dl>
              <button type="button" onClick={()=>go('activity?item='+(record.activityCode||'ai_image_challenge'))}>查看活动 →</button>
            </article>)}
            {records.some(record=>record.reviewReason) && <Notice>{records.filter(record=>record.reviewReason).map(record=>`${record.activityName || '活动'}：${record.reviewReason}`).join('；')}</Notice>}
          </>
        )}
      </Gate>
    </>
  );
}

function Points({ state, go }: Props) {
  const earned = sessionStorage.getItem('cp-checkin') === 'done';
  const exchanges = shopRecords();
  const redeemed = sessionStorage.getItem('cp-redeemed') === '1';
  const tasks = taskHistory();
  const pending = tasks.filter(task=>!['completed','partial','cancelled','unaccepted','failed'].includes(task.status)).reduce((sum,task)=>sum+(task.points||0),0);
  return (
    <Gate state={state} go={go}>
      <Head title="积分中心" />
      <div className="cp-card cp-personal-balance">
        <span>可用积分</span>
        <strong>{pointBalance()}</strong>
        <small>占用中费用 {pending} 积分</small>
      </div>
      {pending>0 && <Notice>{tasks.filter(task=>!['completed','partial','cancelled','unaccepted','failed'].includes(task.status)).length} 笔生成费用占用中，可在任务页查看处理结果。</Notice>}
      <div className="cp-actions">
        <Button onClick={() => go('checkin')}>每日签到</Button>
        <Button secondary onClick={() => go('invite')}>
          邀请有礼
        </Button>
        <Button secondary onClick={() => go('shop')}>
          AI 商城
        </Button>
      </div>
      <h2>积分明细</h2>
      {state === 'empty' || (!earned && !exchanges.length && !redeemed && !tasks.length) ? (
        <Empty title="暂无积分记录" />
      ) : (
        <div className="cp-list">
          {earned && (
            <LinkRow
              title="每日签到"
              detail="今日 · 已到账"
              tag="+20"
              onClick={() => go('checkin?state=done')}
            />
          )}
          {exchanges.filter(r=>r.status==='success').map(r=><LinkRow key={r.id} title={r.name+'兑换'} detail="已完成" tag={'−'+r.price} onClick={()=>go('shop-records')}/>)}
          {redeemed && (
            <LinkRow
              title="AI 体验权益兑换"
              detail="今日 · 已完成"
              tag="−50"
              onClick={() => go('shop?state=records')}
            />
          )}
          {tasks.map((task,index)=>{
            const released=['cancelled','unaccepted','failed'].includes(task.status);
            const consumed=['completed','partial'].includes(task.status);
            const amount=task.status==='partial'?(task.settledPoints??task.points??0):(task.points??0);
            const item=task.item||'copy';
            const id=task.id||'';
            return <LinkRow key={id||index} title={( {copy:'文案改写',background:'产品换背景',video:'产品短片制作',restore:'照片修复'} as Record<string,string>)[item]||'AI 应用生成'} detail={`${released?'费用已释放':consumed?'费用已结算':'费用占用中'} · ${task.createdAt?new Date(task.createdAt).toLocaleDateString('zh-CN'):'生成任务'}`} tag={(released?'+':'−')+String(released?task.points||0:amount)} onClick={()=>go(`${consumed?'app-result':'app-task'}?item=${encodeURIComponent(item)}&task=${encodeURIComponent(id)}`)}/>;
          })}
        </div>
      )}
    </Gate>
  );
}
function Checkin({ state, go }: Props) {
  const [done, setDone] = useState(
    state === 'done' || sessionStorage.getItem('cp-checkin') === 'done',
  );
  return (
    <Gate state={state} go={go}>
      <div className="cp-card">
        <p>本周签到</p>
        <div className="cp-week">
          {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => (
            <div key={day}>
              <small>周{day}</small>
              <strong>
                {i === 5 && done ? '✓' : '—'}
              </strong>
            </div>
          ))}
        </div>
        {state === 'unavailable' && (
          <Notice tone="warn">签到暂不可用，请稍后再试。</Notice>
        )}
        <Button
          disabled={done || state === 'unavailable'}
          onClick={() => {
            sessionStorage.setItem('cp-checkin', 'done');
            setDone(true);
          }}
        >
          {done ? '今日已签到' : '签到'}
        </Button>
        {done && <Notice>签到成功，可在积分明细查看。</Notice>}
        <Button secondary onClick={() => go('points')}>
          查看积分
        </Button>
      </div>
    </Gate>
  );
}
function Invite({ state, go }: Props) {
  const [rules, setRules] = useState(false);
  const [notice, setNotice] = useState('');
  return (
    <Gate state={state} go={go}>
      <div className="cp-card">
        <p>
          邀请码 <strong>—</strong>
        </p>
        <Button
          disabled
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                window.location.origin +
                  '/community-options/c-prototype?page=login&invite=DEMO-ONLY',
              );
              setNotice('邀请链接已复制');
            } catch {
              setNotice('复制失败，请重试');
            }
          }}
        >
          复制邀请链接
        </Button>
        {notice && <Notice>{notice}</Notice>}
        <Button secondary onClick={() => setRules(!rules)}>
          邀请规则
        </Button>
        {rules && (
          <p>
            邀请条件和奖励金额以当前活动规则为准。完成邀请后可查看进度，到账后可在积分明细核对。
          </p>
        )}
      </div>
      <h2>邀请进度</h2>
      <Empty title={state === 'pending' ? '奖励状态待确认' : '暂无邀请记录'} />
    </Gate>
  );
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
    case 'create':
      return <Create {...props} />;
    case 'publish':
      return <Publish {...props} />;
    case 'post-edit':
      return <PostEdit {...props} />;
    case 'publish-status':
      return <PublishStatus {...props} />;
    case 'mine':
      return <Mine {...props} />;
    case 'my-relations':
      return <MyRelations {...props} />;
    case 'profile-edit':
      return <ProfileEdit {...props} />;
    case 'my-content':
      return <MyContent {...props} />;
    case 'drafts':
      return <Drafts {...props} />;
    case 'records':
      return <Records {...props} />;
    case 'favorites':
      return <Favorites {...props} />;
     case 'login':
       return <LoginOverlay state={state} go={go} />;
    case 'notifications':
      return <Notifications {...props} />;
    case 'activities':
      return <Activities {...props} />;
    case 'activity':
      return <Activity {...props} />;
    case 'submissions':
      return <Submissions {...props} />;
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

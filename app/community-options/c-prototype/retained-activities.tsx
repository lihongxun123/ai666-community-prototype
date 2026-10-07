'use client';
/* oxlint-disable next/no-img-element -- These are copied local prototype assets. */
import { useEffect, useState } from 'react';
import { CreationEntry } from './creation-entry';
import { prototypeStore } from './storage';
import { readEventStatuses } from '../b-prototype/operations-data';
import { readPublishedEventConfigs, type EventConfig, type EventTask } from '../b-prototype/retained-event-config';
import { defaultEventConfigs } from '../b-prototype/retained-event-defaults';
import './retained-activities.css';
import { ActivityDetail, type DetailTask } from './activity-detail';

type Props = { page: string; state: string; go: (page: string) => void };
type Task = { title: string; description: string; reward: string; progress: string; action?: string; route?: string; eventType?: string; bizType?: string; unlockDay?: number };
type Activity = {
  code: string;
  name: string;
  image?: string;
  reward: string;
  period: string;
  summary: string;
  description: string[]; descriptionMarkdown?: string;
  tasks: Task[];
  kind?: 'invite' | 'locked';
  publishKind?: 'post' | 'work';
  status: string;
  locked: boolean;
};

const asset = (name: string) => `/retained/activity/${name}`;

// Public-page snapshot and copied C-end artwork are presentation references only.
const referenceActivities: Omit<Activity, 'status' | 'locked'>[] = [
  {
    code: 'meizhourenwu', name: '每周任务', image: asset('activity-live-weekly.png'), reward: '最高可得 350 积分',
    period: '9月24日—9月30日', summary: '用简单任务，天天都有积分。',
    description: ['本期活动时间：9月24日—9月30日。七天依次解锁任务，每轮每项任务仅可领取 1 次奖励。', '七天任务全部完成，最高可获得 350 积分。'],
    tasks: [
      { title: '第 1 天 · 浏览 5 条社区内容', description: '浏览 5 条社区内容，熟悉本周的灵感与作品。', reward: '+20 积分', progress: '0/5', action: '去浏览' },
      { title: '第 2 天 · 收藏 3 个 AI 作品', description: '收藏 3 个想参考的 AI 作品。', reward: '+30 积分', progress: '0/3', action: '去收藏' },
      // Current research IA uses circle posts for the original site's text/image flash tasks.
      { title: '第 3 天 · 发布 1 条纯文字圈子帖子', description: '记录一个灵感、想法或创作计划。', reward: '+40 积分', progress: '0/1', action: '去发布' },
      { title: '第 4 天 · 发布 1 条图片圈子帖子', description: '用至少 1 张图片表达一个想法。', reward: '+50 积分', progress: '0/1', action: '去发布' },
      { title: '第 5 天 · 发布 1 个图片作品', description: '完成图片作品发布。', reward: '+60 积分', progress: '0/1', action: '去发布' },
      { title: '第 6 天 · 发布 2 个不同图片作品', description: '发布 2 个不同的图片作品。', reward: '+70 积分', progress: '0/2', action: '去发布' },
      { title: '第 7 天 · 发布 3 个不同图片作品', description: '发布 3 个不同图片作品。', reward: '+80 积分', progress: '0/3', action: '去发布' },
    ],
  },
  {
    code: 'ai_image_challenge', name: '生图挑战', image: asset('activity-live-image-challenge.png'),
    reward: '最高可得 5,100 积分', period: '本期活动', summary: '不限题材，自由创作。带上 #生图挑战 发布原创 AI 图片。',
    description: ['发布原创图片作品并带上 #生图挑战。标题不少于 4 个字，正文不少于 30 个汉字；填写创作场景与使用模型，至少上传 1 张图片。', '前 2 条合格作品每条奖励 50 积分；作品被推荐至首页后，每篇额外奖励 500 积分，每人每期最多 10 次。', '重复发布、删除后重发、搬运、抄袭或明显低质内容不参与积分奖励。'],
    tasks: [
      { title: '发布图片作品', description: '发布原创 AI 图片并带上 #生图挑战；本期前 2 条计入发布奖励。', reward: '+50 积分', progress: '0/2', action: '去发布图片' },
      { title: '首页推荐奖励', description: '作品被推荐至首页后额外奖励；每人每期最多 10 次。', reward: '+500 积分', progress: '0/1' },
    ],
  },
  {
    code: 'prompt_co_creation', name: 'Prompt 共创计划', image: asset('activity-live-prompt.png'),
    reward: '活动内最高 3,000 积分', period: '持续进行', summary: '分享经过验证的 Prompt，让更多人复用你的创作方法。',
    description: ['发布带图片、视频或漫剧素材的 Prompt 作品。标题不少于 4 个字；中文正文不少于 30 个汉字，英文或中英混合正文不少于 20 个英文单词；填写场景、模型和案例。', '每天前 2 条合格作品每条奖励 50 积分；纯文字内容不参与发布积分。活动内自动发放积分最高 3,000。', '首页精选每篇另奖 500 积分，由运营审核后手动发放，不计入活动内 3,000 积分上限；同一篇仅奖励 1 次。'],
    tasks: [
      { title: '发布带素材 Prompt', description: '每天前 2 条满足要求的作品，每条奖励 50 积分。', reward: '+50 积分', progress: '0/2', action: '去发布' },
      { title: '首页精选加奖', description: '审核精选后另行发放，同一篇仅奖励 1 次。', reward: '+500 积分', progress: '0/1' },
    ],
  },
  {
    code: 'invite_reward', name: '邀请有礼', image: asset('activity-live-invite.png'),
    reward: '最高可得 10,000 积分', period: '持续进行', summary: '邀请好友加入，一起创作。', description: [], tasks: [], kind: 'invite',
  },
  {
    code: 'newbie_task', name: '新手任务', image: asset('activity-live-newbie.png'),
    reward: '最高可得 150 积分', period: '新用户可参与', summary: '完成新手任务，解锁七日成长计划。',
    description: ['完成注册、浏览、完善资料、首次互动和转发作品五项任务，最高领取 150 积分。', '完成新手任务后，七日成长计划才会解锁。'],
    tasks: [
      { title: '注册成功，领取新人积分', description: '完成注册后自动到账。', reward: '+20 积分', progress: '0/1' },
      { title: '浏览 1 个 AIGC 作品', description: '浏览任意作品详情。', reward: '+30 积分', progress: '0/1', action: '去浏览' },
      { title: '完善个人资料', description: '完善头像、名称、性别和个性签名。', reward: '+30 积分', progress: '0/1', action: '去完善' },
      { title: '完成首次互动', description: '首次点赞、评论或收藏任一内容。', reward: '+30 积分', progress: '0/1', action: '去互动' },
      { title: '转发 1 个 AI 作品', description: '打开作品详情并完成转发。', reward: '+40 积分', progress: '0/1', action: '去转发作品' },
    ],
  },
  {
    code: 'growth_7day', name: '七日成长计划', image: asset('activity-live-growth.png'),
    reward: '最高可得 300 积分', period: '完成新手任务后解锁', summary: '从发现灵感到创作发布，完成连续七天的成长计划。',
    description: ['完成新手任务后开启专属七日成长计划，按日完成从发现灵感到创作发布的任务。'],
    tasks: [], kind: 'locked',
  },
];

const canonicalCode = (code: string) => code === 'referral' ? 'invite_reward' : code;
const taskFromConfig = (task: EventTask, reference?: Task): Task => ({
  title: task.name,
  description: task.description,
  reward: task.reward_points > 0 ? `+${task.reward_points} 积分` : '按活动规则',
  progress: `0/${task.target_count}`,
  action: task.cta_route || (['work.publish','post.publish','content.view','interaction.favorite','interaction.like_or_comment','work.share','aigc.generation_success'].includes(task.event_type) && task.reward_dispatch_mode!=='manual') || reference?.action ? task.cta_text || reference?.action : undefined,
  route: task.cta_route,
  eventType: task.event_type,
  bizType: task.event_filter.biz_type,
  unlockDay: task.unlock_day || task.day_index,
});
const periodFromConfig = (config: EventConfig) => {
  if (config.type === 'long_term' || config.type === 'referral') return '长期活动';
  const format = (value: string) => value.slice(0,16).replace('T',' ');
  if (config.start_time && config.end_time) return format(config.start_time) + ' — ' + format(config.end_time);
  if (config.start_time) return format(config.start_time) + ' 开始';
  if (config.end_time) return '截至 ' + format(config.end_time);
  return '活动时间待公布';
};
export function readCActivities(): Activity[] {
  const hasPublishedStore = Boolean(prototypeStore.getItem('bp-op-event-configs'));
  const legacyStatuses = readEventStatuses();
  const defaultConfigs = new Map(defaultEventConfigs().map((item) => [item.code, item]));
  const configs = readPublishedEventConfigs().filter((config) => config.status !== '草稿');
  return configs
    .map((config) => {
      const code = canonicalCode(config.code);
      const reference = referenceActivities.find((item) => item.code === code);
      const legacyStatus = legacyStatuses.find((item) => canonicalCode(item.code) === code)?.status;
      const publishedChanged = !defaultConfigs.has(code) || JSON.stringify(config) !== JSON.stringify(defaultConfigs.get(code));
      const configuredStatus = code === 'growth_7day' || hasPublishedStore && publishedChanged ? config.status : legacyStatus || config.status;
      const now = Date.now();
      const status = configuredStatus === '进行中' && config.type === 'campaign' && config.end_time && Date.parse(config.end_time) <= now ? '已结束'
        : configuredStatus === '进行中' && config.type === 'campaign' && config.start_time && Date.parse(config.start_time) > now ? '未开始' : configuredStatus;
      const locked = code === 'growth_7day' || config.unlock_rule.requires.length > 0;
      const description = config.description.trim().split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const useReferenceCopy = Boolean(reference && config.description === defaultConfigs.get(code)?.description);
      const tasks = [...config.tasks].sort((a, b) => a.sort_order - b.sort_order).map((task) => taskFromConfig(task, reference?.tasks.find((item) => item.title === task.name)));
      return {
        code,
        name: config.name || reference?.name || code,
        image: config.cover_url || reference?.image || asset('activity-center-banner-v2.webp'),
        reward: config.max_points > 0 ? `最高可得 ${config.max_points.toLocaleString('zh-CN')} 积分` : reference?.reward || '奖励以活动规则为准',
        period: periodFromConfig(config),
        summary: useReferenceCopy ? reference?.summary || description[0] : description[0] || reference?.summary || '查看活动规则与参与方式。',
        description: useReferenceCopy ? reference?.description || description : description.length ? description : reference?.description || [],
        descriptionMarkdown: config.description,
        tasks,
        kind: config.type === 'referral' ? 'invite' as const : locked ? 'locked' as const : undefined,
        publishKind: config.extra_config.publish_config.biz_type === 'post' ? 'post' as const : 'work' as const,
        status,
        locked,
      };
    })
    .sort((a, b) => (configs.find((item) => canonicalCode(item.code) === b.code)?.sort_order || 0) - (configs.find((item) => canonicalCode(item.code) === a.code)?.sort_order || 0));
}

const stateText: Record<string, string> = {
  ended: '活动已结束，可以查看规则和历史投稿，暂不能新参与。',
  ineligible: '当前账号暂不符合参与条件。请查看活动规则。',
  submitted: '内容已提交。投稿资格、审核和奖励仍需分别确认。',
  review: '投稿材料审核中，不能视为已公开或获奖。',
  'login-expired': '登录已失效，请重新登录后继续。',
};

export function RetainedActivities({ page, state, go }: Props) {
  const query = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
  const [activities, setActivities] = useState(readCActivities);
  const requestedCode = canonicalCode(query?.get('item') || prototypeStore.getItem('cp-activity-code') || 'guoqing_qitianle_20261001');
  // Initial prototype fixtures share one list; published B-end configuration takes precedence.
  const listActivities = !prototypeStore.getItem('bp-op-event-configs') ? activities.map((item,index)=>item.code==='guoqing_qitianle_20261001'?item:({ ...item,
    status: index === 1 ? '未开始' : index === 3 ? '已结束' : item.status,
    period: index === 0 ? '2026-10-01 09:00 — 2026-10-15 23:59' : index === 1 ? '2026-10-20 09:00 — 2026-10-31 23:59' : index === 3 ? '2026-09-01 09:00 — 2026-09-30 23:59' : item.period,
  })) : activities;
  const selected = listActivities.find((item) => item.code === requestedCode);
  const [joinedCode, setJoinedCode] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState('全部');
  const joined = joinedCode === requestedCode || prototypeStore.getItem('cp-joined-'+requestedCode) === '1';
  const [clockTime, setClockTime] = useState(0);
  useEffect(() => {
    const refresh = () => { setActivities(readCActivities()); setClockTime(Date.now()); };
    const timer = window.setTimeout(refresh, 0);
    const interval = window.setInterval(refresh, 1000);
    window.addEventListener('focus', refresh);
    window.addEventListener('bp-operations-change', refresh);
    window.addEventListener('bp-slots-change', refresh);
    return () => { window.clearTimeout(timer); window.clearInterval(interval); window.removeEventListener('focus', refresh); window.removeEventListener('bp-operations-change', refresh); window.removeEventListener('bp-slots-change', refresh); };
  }, []);
  const statusBlocked = (item: Activity) => item.status !== '进行中' || item.locked;
  const taskBlocked = (item: Activity, task: Task, at = clockTime) => {
    if (statusBlocked(item)) return true;
    if (!task.unlockDay) return false;
    if(item.code==='guoqing_qitianle_20261001') return task.unlockDay!==Math.floor((at-Date.parse('2026-10-01T00:00:00+08:00'))/86400000)+1;
    const joinedAt = Number(prototypeStore.getItem('cp-joined-at-' + item.code));
    return !joinedAt || Math.floor((at - joinedAt) / 86400000) + 1 < task.unlockDay;
  };
  const activeCount = listActivities.filter((item) => item.status === '进行中').length;
  const selectedBlocked = selected ? statusBlocked(selected) : true;
  const device = query?.get('device') === 'pc' || (typeof document !== 'undefined' && Boolean(document.querySelector('.cp-retained-desktop'))) ? 'pc' : 'mobile';

  const requireLogin = () => {
    if (prototypeStore.getItem('cp-auth') === '1') return true;
    prototypeStore.setItem('cp-return', `activity?item=${requestedCode}`);
    go('login?state=return');
    return false;
  };
  const join = () => {
    if (!selected || selectedBlocked || statusBlocked(readCActivities().find(x=>x.code===selected.code) || {...selected,status:'已结束'})) return;
    if (!requireLogin()) return;
    prototypeStore.setItem('cp-joined-'+selected.code, '1');
    if (!prototypeStore.getItem('cp-joined-at-' + selected.code)) prototypeStore.setItem('cp-joined-at-' + selected.code, String(Date.now()));
    setJoinedCode(selected.code);
  };
  const [publishChoice, setPublishChoice] = useState<{item: Activity; task?: string} | null>(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('reviewOverlay')==='activity-choice'&&selected?{item:selected}:null);
  const prepareSubmission = (item: Activity, postKind: 'post' | 'work', task?: string) => {
    ['cp-source', 'cp-result', 'cp-circle', 'cp-activity-task'].forEach(key => prototypeStore.removeItem(key));
    prototypeStore.setItem('cp-activity', '1');
    prototypeStore.setItem('cp-activity-code', item.code);
    prototypeStore.setItem('cp-activity-name', item.name);
    prototypeStore.setItem('cp-post-kind', postKind);
    if (task) prototypeStore.setItem('cp-activity-task', task);
  };
  const goPublish = (item: Activity, postKind: 'post' | 'work' = 'work', task?: string) => {
    if (statusBlocked(item) || statusBlocked(readCActivities().find(x=>x.code===item.code) || {...item,status:'已结束'}) || !requireLogin()) return;
    if (postKind === 'post') {
      prepareSubmission(item, postKind, task);
      go('post-publish?entry=activity-' + Date.now());
    } else setPublishChoice({item, task});
  };
  const followTask = (item: Activity, task: Task) => {
    const current = readCActivities().find(x=>x.code===item.code);
    const currentTask = current?.tasks.find(x=>x.title===task.title);
    if (!current || !currentTask || taskBlocked(current, currentTask, Date.now()) || taskBlocked(item, task, Date.now())) return;
    task = currentTask;
    if (!requireLogin()) return;
    const routeQuery = task.route?.split('?')[1] || '';
    const route = new URLSearchParams(routeQuery).get('page') || task.route?.split('?')[0].split('/').filter(Boolean).at(-1) || '';
    if(task.eventType?.startsWith('circle.')){go('circles');return;}
    const publish = ['publish', 'post-edit'].includes(route) || task.eventType?.endsWith('.publish') || task.action?.includes('发布');
    if (publish) {
      const postKind = task.bizType === 'post' || task.eventType?.startsWith('post.') || task.title.includes('圈子帖子') ? 'post' : 'work';
      goPublish(item, postKind, task.title);
      return;
    }
    if (route === 'create' || task.eventType === 'aigc.generation_success') {
      prototypeStore.setItem('cp-activity', '1');
      prototypeStore.setItem('cp-activity-code', item.code);
      prototypeStore.setItem('cp-activity-name', item.name);
      prototypeStore.setItem('cp-activity-task', task.title);
      go('create?activity=' + encodeURIComponent(item.code));
      return;
    }
    const known: Record<string, string> = { profile: 'profile-edit', 'profile-edit': 'profile-edit', invite: 'invite', community: 'community', post: 'post', work: 'work', topics: 'topics', circles: 'circles', home: 'home', apps: 'apps', points: 'points', checkin: 'checkin', search: 'search', tutorials: 'tutorials', mine: 'mine' };
    go(known[route] || (task.action === '去浏览' || task.action === '去收藏' ? 'community' : task.action === '去分享' ? 'work' : task.action === '去完善' ? 'profile-edit' : task.action === '去互动' || task.action === '去转发作品' ? 'work' : 'home'));
  };

  const openActivity = (item: Activity) => go(item.kind==='invite'?'invite':'activity?item='+item.code+(item.status==='已结束'?'&state=ended':''));
  const featuredActivity = listActivities.find(item=>item.code==='guoqing_qitianle_20261001' && item.status!=='已停用') || listActivities.find(item=>item.status==='进行中' && !item.locked);
  const moreActivities = listActivities.filter(item=>item.status!=='已停用' && item.code!==featuredActivity?.code && (activityFilter==='全部' || item.status===(activityFilter==='即将开始'?'未开始':activityFilter)));
  if (page === 'activities' && device === 'pc') return <section className="cp-retained-activities cp-ra-pc-center" data-device="pc">
    <header className="cp-ra-pc-heading"><h1>活动中心</h1><p>参与创作，收获灵感与积分。</p></header>
    {state==='failure'?<output className="cp-ra-empty">活动暂时无法加载。<button onClick={()=>go('activities')}>重试</button></output>:state==='empty'?<div className="cp-ra-empty">暂无进行中的活动。<button onClick={()=>go('submissions')}>我的投稿</button></div>:<>
      {featuredActivity && <article className="cp-ra-pc-featured"><button className="cp-ra-pc-featured-art" type="button" aria-label={'查看'+featuredActivity.name} onClick={()=>openActivity(featuredActivity)}><img src={featuredActivity.image} alt={featuredActivity.name} /></button><div className="cp-ra-pc-featured-copy"><span className="cp-ra-status">{featuredActivity.status}</span><h2>{featuredActivity.name}</h2><p className="cp-ra-pc-period">活动时间：{featuredActivity.period}</p>{!/^\s*#/.test(featuredActivity.summary)&&<p>{featuredActivity.summary}</p>}<strong>{featuredActivity.reward}</strong><button type="button" onClick={()=>openActivity(featuredActivity)}>{featuredActivity.status==='进行中'?'参与活动':'查看活动'} <img src="/home-prototype/icons/arrow-right-line.svg" alt="" /></button></div></article>}
      <section className="cp-ra-pc-more" aria-label="更多活动"><header><h2>更多活动</h2><div className="cp-ra-pc-filters" aria-label="活动状态筛选">{['全部','进行中','即将开始','已结束'].map(filter=><button key={filter} type="button" aria-pressed={activityFilter===filter} onClick={()=>setActivityFilter(filter)}>{filter}</button>)}</div></header>
      {moreActivities.length?<div className="cp-ra-grid">{moreActivities.map(item=><button className="cp-ra-card" type="button" key={item.code} aria-label={'查看'+item.name} onClick={()=>openActivity(item)}><div className="cp-ra-cover"><img src={item.image} alt="" /></div><div className="cp-ra-card-body"><div className="cp-ra-pc-card-title"><h2>{item.name}</h2><span className="cp-ra-status">{item.status}</span></div><p className="cp-ra-pc-summary">{item.summary}</p><div className="cp-ra-card-meta"><span className="cp-ra-card-time">{item.period}</span></div>{item.locked && item.status!=='已结束' && <p className="cp-ra-card-condition">{item.code==='growth_7day'?'完成新手任务后解锁':'满足活动前置条件后参与'}</p>}<div className="cp-ra-card-footer"><strong>{item.reward}</strong></div></div></button>)}</div>:<p className="cp-ra-list-empty">暂无{activityFilter==='全部'?'更多':activityFilter}活动</p>}
      </section></>}
  </section>;

  if (page === 'activities') return (
    <section className="cp-retained-activities" data-device={device}>
      <header className="cp-ra-list-head">
        <img src={asset('activity-center-banner-v2.webp')} alt="" />
        <div><span>✦ 活动中心</span><p>发现正在发生的创作挑战与社区计划</p></div>
        <strong>{String(activeCount).padStart(2,'0')} <small>场正在进行</small></strong>
      </header>
      {state === 'failure' ? <output className="cp-ra-empty">活动暂时无法加载。<button onClick={() => go('activities')}>重试</button></output>
        : state === 'empty' ? <div className="cp-ra-empty">暂无进行中的活动。<button onClick={() => go('submissions')}>我的投稿</button></div>
          : <>{[{title:'当前活动',items:listActivities.filter(item=>item.status!=='已结束' && item.status!=='已停用')},{title:'往期回顾',items:listActivities.filter(item=>item.status==='已结束')}].map(group=><section className="cp-ra-list-section" key={group.title} aria-label={group.title}>
            <h2>{group.title}</h2>
            {group.items.length ? <div className="cp-ra-grid">{group.items.map(item=><button className="cp-ra-card" type="button" key={item.code} aria-label={'查看'+item.name} onClick={()=>go(item.kind==='invite'?'invite':'activity?item='+item.code+(item.status==='已结束'?'&state=ended':''))}>
              <div className="cp-ra-cover"><img src={item.image} alt="" /></div>
              <div className="cp-ra-card-body">
                <h2>{item.name}</h2>
                <div className="cp-ra-card-meta"><span className={"cp-ra-status is-"+({进行中:"active",未开始:"scheduled",已结束:"ended"}[item.status] || "other")}>{item.status}</span><span className="cp-ra-card-time">{item.period}</span></div>
                {item.locked && item.status!=='已结束' && <p className="cp-ra-card-condition">{item.code==='growth_7day'?'完成新手任务后解锁':'满足活动前置条件后参与'}</p>}
                <div className="cp-ra-card-footer"><strong>{item.status==='已结束'?'查看往期内容':item.reward}</strong><span>{item.status==='已结束'?'回顾活动':'查看详情'} →</span></div>
              </div>
            </button>)}</div> : <p className="cp-ra-list-empty">{group.title==='往期回顾'?'暂无往期活动':'暂无当前活动'}</p>}
          </section>)}</>}

    </section>
  );

  if (page !== 'activity') return null;
  if (state === 'removed' || !selected) return <section className="cp-retained-activities" data-device={device}><div className="cp-ra-empty">活动不存在或已下架。<button onClick={() => go('activities')}>返回活动中心</button></div></section>;
  if (state === 'failure') return <section className="cp-retained-activities" data-device={device}><output className="cp-ra-empty">活动详情暂时无法加载。<button onClick={() => go(`activity?item=${selected.code}`)}>重试</button></output></section>;
  const blocked = ['ended', 'ineligible', 'review', 'submitted', 'login-expired'].includes(state) || selectedBlocked;
  const activityStatusLabel = selectedBlocked ? (selected.locked && selected.status === '进行中' ? '尚未解锁' : selected.status === '已结束' || selected.status === '已停用' ? '已结束' : selected.status === '未开始' ? '未开始' : '尚未解锁') : state === 'ended' ? '已结束' : '进行中';
  const national = selected.code==='guoqing_qitianle_20261001';
  const nationalDay = Math.floor((clockTime-Date.parse('2026-10-01T00:00:00+08:00'))/86400000)+1;
  const showsWorks = selected.kind!=='invite' && selected.tasks.some(task=>task.bizType!=='post' && !task.eventType?.startsWith('post.') && !task.title.includes('帖子') && (task.eventType==='work.publish'||task.action?.includes('发布')));
  const detailTasks:(DetailTask & {unlockDay?:number})[]=(national?[...selected.tasks].sort((a,b)=>(a.unlockDay||0)-(b.unlockDay||0)):selected.tasks).map(task=>{
    const dateBlocked=national&&task.unlockDay?task.unlockDay!==nationalDay:taskBlocked(selected,task);
    const disabled=blocked||Boolean(dateBlocked);
    const label=blocked?activityStatusLabel:!task.action?'待判定':national&&task.unlockDay&&task.unlockDay<nationalDay?'已过期':dateBlocked?(task.unlockDay?`第 ${task.unlockDay} 天开放`:'未开放'):'待完成';
    return {...task,title:national&&task.unlockDay?`第 ${task.unlockDay} 天：${task.title}`:task.title,status:label,disabled,reward:task.reward+(national&&!task.unlockDay?' / 条':''),run:()=>followTask(selected,task)};
  });
  // Historical sample completions never override today's availability.
  if(device==='pc' && national && !blocked && !prototypeStore.getItem('bp-op-event-configs')){
    detailTasks.forEach((task,index)=>{
      if(!task.unlockDay) detailTasks[index]={...task,progress:'1/2',status:'进行中'};
      else if(task.unlockDay<nationalDay && task.unlockDay<=2) detailTasks[index]={...task,progress:task.progress.split('/')[1]+'/'+task.progress.split('/')[1],status:'已完成',disabled:true};
    });
  }
  return <>
    <ActivityDetail key={selected.code} code={selected.code} name={selected.name} image={selected.image} period={selected.period} reward={selected.reward} status={activityStatusLabel} description={selected.descriptionMarkdown ?? selected.description.join('\n\n')} joined={joined} blocked={blocked} join={join} go={go} tasks={detailTasks} showWorks={showsWorks} notice={selected.locked?'完成前置任务后解锁本活动。':stateText[state]}/>
    <CreationEntry go={go} controlledOpen={Boolean(publishChoice)} onClose={()=>setPublishChoice(null)} onSelect={target=>{
      if(!publishChoice)return;
      const current = readCActivities().find(item=>item.code===publishChoice.item.code);
      const task = current?.tasks.find(item=>item.title===publishChoice.task);
      if(!current||statusBlocked(current)||(publishChoice.task&&!task)||(task&&taskBlocked(current,task,Date.now())))return;
      prepareSubmission(publishChoice.item,'work',publishChoice.task);
      go(target==='create'?'create?activity='+encodeURIComponent(publishChoice.item.code):'post-edit?entry=activity-'+Date.now());
    }}/>
  </>;
}

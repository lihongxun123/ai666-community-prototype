'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import {communityTaskTypes} from './community-task-types';
import type { ColumnsType } from 'antd/es/table';
import type { EventConfig, EventTask } from './retained-event-config';
import {
  readOperations,
  writeOperations,
  type OpRow,
} from './operations-model';
import { UserIdentity } from './user-identity';
import { ContentBlockPreview, MediaPreview } from './content-media';

type Props = {
  config: EventConfig;
  onChange: (config: EventConfig, action: string) => void;
  onEdit: () => void;
  onBack: () => void;
  readOnly?: boolean;
  onDelete?: () => void;
  canDelete?: boolean;
};
const modes = { realtime: '实时', deferred: '结算', manual: '手动' };
const types: Record<string, string> = {
  long_term: '长期活动',
  campaign: '档期活动',
  referral: '邀请活动',
  archive: '归档活动',
};
const str = (v: unknown): string => {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
    return String(v);
  return v == null ? '' : JSON.stringify(v);
};
const pagination = {
  defaultPageSize: 20,
  showSizeChanger: true,
  pageSizeOptions: [20, 50, 100],
  showQuickJumper: false,
  showTotal: (n: number) => `共 ${n} 条`,
};
const locked = (task: EventTask) =>
  ['invite.register', 'invite.interact', 'invite.publish'].includes(
    task.event_type,
  );
const date = (v: unknown) => {
  if (!v) return '—';
  const d = new Date(typeof v === 'number' ? v : str(v));
  return Number.isNaN(d.valueOf())
    ? str(v)
    : d.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
};
const eventOptions = [
  ['user.first_visit', '首次访问'],
  ['user.profile_complete', '完善资料'],
  ['user.first_interaction', '首次互动'],
  ['content.view', '浏览内容'],
  ['interaction.like_or_comment', '点赞 / 评论'],
  ['interaction.favorite', '收藏作品'],
  ['work.publish', '发布作品'],
  ['work.share', '分享作品'],
  ['post.publish', '发布帖子'],
  ['post.share', '分享帖子'],
  ['prompt.publish', '发布 Prompt'],
  ['prompt.copy', '复制 Prompt'],
  ['activity.join', '参与活动'],
  ['mall.redeem', '商城兑换'],
  ['aigc.generation_success', 'AIGC 生成成功'],
  ['invite.register', '邀请-好友注册'],
  ['invite.interact', '邀请-好友互动'],
  ['invite.publish', '邀请-好友发布'],
].map(([value, label]) => ({ value, label })).concat(communityTaskTypes);
const integer = (label: string, min: number) => [
  { required: true, message: `请填写${label}` },
  {
    type: 'integer' as const,
    min,
    message: `${label}须为不小于 ${min} 的整数`,
  },
];

function TaskRuleFields({
  field,
  value,
  onChange,
}: {
  field: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  let rule: Record<string, unknown> = {};
  try {
    rule = JSON.parse(value || '{}');
  } catch {
    /* Advanced input validation retains the entered text. */
  }
  const set = (key: string, next: unknown) => {
    const updated = { ...rule };
    if (next === undefined || next === '' || next === null) delete updated[key];
    else updated[key] = next;
    onChange?.(JSON.stringify(updated, null, 2));
  };
  const number = (key: string, label: string, min = 0) => (
    <label style={{ display: 'block', marginBottom: 12 }}>
      {label}
      <br />
      <InputNumber
        value={
          typeof rule[key] === 'number' ? (rule[key] as number) : undefined
        }
        min={min}
        precision={0}
        onChange={(v) => set(key, v)}
      />
    </label>
  );
  return (
    <div>
      {field === 'event_filter' ? (
        <>
          <label
            htmlFor="task-rule-biz"
            style={{ display: 'block', marginBottom: 12 }}
          >
            业务类型
            <Select
              id="task-rule-biz"
              allowClear
              value={str(rule.biz_type) || undefined}
              style={{ width: '100%' }}
              options={[
                { value: 'work', label: '作品' },
                { value: 'post', label: '闪念' },
                { value: 'prompt', label: 'Prompt' },
              ]}
              onChange={(v) => set('biz_type', v)}
            />
          </label>
          <label
            htmlFor="task-rule-content"
            style={{ display: 'block', marginBottom: 12 }}
          >
            内容类型
            <Select
              id="task-rule-content"
              mode="multiple"
              value={
                Array.isArray(rule.content_types)
                  ? (rule.content_types as number[])
                  : []
              }
              style={{ width: '100%' }}
              options={[
                { value: 1, label: '漫剧 / 闪念富文本' },
                { value: 2, label: '图片 / 闪念媒体与富文本' },
                { value: 3, label: '视频' },
                { value: 4, label: '文本' },
              ]}
              onChange={(v) => set('content_types', v)}
            />
          </label>
          {number('min_image_count', '最少图片数')}
        </>
      ) : field === 'quota_rule' ? (
        <>
          <label
            htmlFor="task-rule-scope"
            style={{ display: 'block', marginBottom: 12 }}
          >
            统计范围
            <Select
              id="task-rule-scope"
              allowClear
              value={str(rule.scope) || undefined}
              style={{ width: '100%' }}
              options={[
                { value: 'per_period', label: '按本期活动' },
                { value: 'per_day', label: '按天' },
                { value: 'per_month', label: '按月' },
              ]}
              onChange={(v) => set('scope', v)}
            />
          </label>
          {number('limit', '最多发奖次数', 1)}
          {number('limit_points', '积分上限')}
        </>
      ) : (
        <>
          {number('title_min_len', '标题最少字数')}
          {number('content_min_cn_chars', '正文最少汉字数')}
          {number('min_image_count', '最少图片数')}
          <label htmlFor="task-rule-required">
            必填字段
            <Select
              id="task-rule-required"
              mode="multiple"
              value={
                Array.isArray(rule.required_fields)
                  ? (rule.required_fields as string[])
                  : []
              }
              style={{ width: '100%' }}
              options={['title', 'content', 'scene', 'model'].map(
                (value, i) => ({
                  value,
                  label: ['标题', '正文', '场景', '模型'][i],
                }),
              )}
              onChange={(v) => set('required_fields', v)}
            />
          </label>
        </>
      )}
      <Collapse
        style={{ marginTop: 12 }}
        items={[
          {
            key: 'json',
            label: '高级配置',
            children: (
              <Input.TextArea
                aria-label={`${field} JSON`}
                rows={5}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

export function ActivityDetail({
  config,
  onChange,
  onEdit,
  onBack,
  readOnly = false,
  onDelete,
  canDelete = false,
}: Props) {
  const { message, modal } = App.useApp();
  const [tab, setTab] = useState('overview');
  const [rows, setRows] = useState(() => readOperations());
  const [now] = useState(() => Date.now());
  const navigating = useRef(false);
  const [loadError, setLoadError] = useState('');
  const [selected, setSelected] = useState<React.Key[]>([]);
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState('');
  const [status, setStatus] = useState<string>();
  const [editor, setEditor] = useState<EventTask | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [form] = Form.useForm();
  const taskEvent=Form.useWatch('event_type',form);
  const communityTask=communityTaskTypes.find(t=>t.value===taskEvent);
  const [record, setRecord] = useState<OpRow | null>(null);
  const [dialog, setDialog] = useState<'grant' | 'settle' | null>(null);
  const [rewardForm] = Form.useForm();
  function reload() {
    try {
      setRows(readOperations());
      setLoadError('');
    } catch {
      setLoadError('记录加载失败，请重试。');
    }
  }
  useEffect(() => {
    const update = () => {
      try {
        setRows(readOperations());
      } catch {
        setLoadError('记录加载失败，请重试。');
      }
    };
    window.addEventListener('bp-operations-change', update);
    return () => window.removeEventListener('bp-operations-change', update);
  }, []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('bp-editor-dirty', { detail: dirty }));
    const guard = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', guard);
    return () => {
      window.removeEventListener('beforeunload', guard);
      window.dispatchEvent(
        new CustomEvent('bp-editor-dirty', { detail: false }),
      );
    };
  }, [dirty]);
  useEffect(() => {
    const guard = (event: Event) => {
      if (!dirty || navigating.current) return;
      event.preventDefault();
      const proceed = (event as CustomEvent<{ proceed: () => void }>).detail
        ?.proceed;
      modal.confirm({
        title: '放弃未保存的任务修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          setEditor(null);
          proceed?.();
        },
      });
    };
    window.addEventListener('prototype-before-navigate', guard);
    return () => window.removeEventListener('prototype-before-navigate', guard);
  }, [dirty, modal]);
  function closeEditor() {
    if (dirty)
      modal.confirm({
        title: '放弃未保存的任务修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setEditor(null);
          setDirty(false);
        },
      });
    else setEditor(null);
  }
  function back() {
    if (dirty)
      modal.confirm({
        title: '放弃未保存的任务修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setEditor(null);
          setDirty(false);
          navigating.current = true;
          onBack();
        },
      });
    else onBack();
  }
  function startTask(task?: EventTask) {
    const value = task
      ? structuredClone(task)
      : ({
          task_code: 'task_' + Date.now().toString(36),
          name: '',
          description: '',
          event_type: 'work.publish',
          target_count: 1,
          reward_points: 0,
          expire_days: 30,
          reward_dispatch_mode: 'realtime',
          sort_order: config.tasks.length + 1,
          cta_text: '去参与',
          cta_route: '',
          event_filter: {},
          quota_rule: {},
          validation_rule: {},
        } as EventTask);
    setEditor(value);
    setIsNew(!task);
    setDirty(false);
    form.resetFields();
    form.setFieldsValue({
      ...value,
      event_filter: JSON.stringify(value.event_filter, null, 2),
      quota_rule: JSON.stringify(value.quota_rule, null, 2),
      validation_rule: JSON.stringify(value.validation_rule, null, 2),
    });
  }
  async function saveTask() {
    try {
      const value = await form.validateFields();
      if (!editor || readOnly) return;
      const next = { ...editor, ...value } as EventTask;
      for (const key of [
        'event_filter',
        'quota_rule',
        'validation_rule',
      ] as const) {
        const parsed = JSON.parse(value[key] || '{}');
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
          throw new Error('任务规则须为 JSON 对象');
        next[key] = parsed;
      }
      if(communityTaskTypes.some(t=>t.value===next.event_type)){next.event_filter={};next.validation_rule={};}
      const filter = next.event_filter,
        quota = next.quota_rule,
        rule = next.validation_rule;
      for (const n of [
        filter.min_image_count,
        rule.title_min_len,
        rule.content_min_cn_chars,
      ])
        if (n !== undefined && (!Number.isInteger(n) || n < 0))
          throw new Error('图片数量、标题字数和正文汉字数须为非负整数');
      if (
        filter.content_types &&
        (!Array.isArray(filter.content_types) ||
          filter.content_types.some(
            (n) => !Number.isInteger(n) || n < 1 || n > 4,
          ))
      )
        throw new Error('内容类型须为 1—4 的数字数组');
      if (
        quota.limit !== undefined &&
        (!Number.isInteger(quota.limit) || quota.limit < 1)
      )
        throw new Error('最多发奖次数须为正整数');
      if (
        quota.scope &&
        !['per_period', 'per_day', 'per_month'].includes(quota.scope)
      )
        throw new Error('配额统计范围无效');
      if (
        rule.required_fields &&
        (!Array.isArray(rule.required_fields) ||
          rule.required_fields.some((n) => typeof n !== 'string'))
      )
        throw new Error('必填字段须为字符串数组');
      if (
        config.tasks.some(
          (t) =>
            t.task_code === next.task_code &&
            (isNew || t.task_code !== editor.task_code),
        )
      )
        throw new Error('任务编码已存在');
      if (next.day_index && !next.unlock_day) next.unlock_day = next.day_index;
      onChange(
        {
          ...config,
          tasks: isNew
            ? [...config.tasks, next]
            : config.tasks.map((t) =>
                t.task_code === editor.task_code ? next : t,
              ),
        },
        isNew ? '新建任务' : '编辑任务',
      );
      setEditor(null);
      setDirty(false);
      message.success('任务已保存');
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    }
  }
  function deleteTask(task: EventTask) {
    if (readOnly || locked(task)) return;
    modal.confirm({
      title: `删除任务「${task.name}」？`,
      content: '已产生的参与与奖励记录保留。',
      okText: '删除',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: () => {
        onChange(
          {
            ...config,
            tasks: config.tasks.filter((t) => t.task_code !== task.task_code),
          },
          '删除任务',
        );
        message.success('任务已删除');
      },
    });
  }
  const submissions = rows.rows.submissions.filter(
    (r) => r.activity === config.code,
  );
  const invites =
    config.type === 'referral'
      ? rows.rows.invite.filter(
          (r) =>
            r.type === '邀请关系' &&
            (r.activity === config.code ||
              (!r.activity && config.code === 'invite_reward')),
        )
      : [];
  const inviters = [...new Set(invites.map((r) => str(r.inviter)))].map(
    (inviter) => {
      const matches = invites.filter((r) => r.inviter === inviter);
      return {
        id: inviter,
        name: inviter,
        type: '邀请统计',
        status: '',
        order: 0,
        inviter,
        invite_count: matches.length,
        activated_count: matches.filter((r) => r.status === '有效').length,
        total_points: matches.reduce((n, r) => n + Number(r.points || 0), 0),
        at: matches
          .map((r) => str(r.at))
          .sort()
          .at(-1),
      } as OpRow;
    },
  );
  const rewards = rows.rows.points.filter(
    (r) => r.source === config.code && Number(r.points) > 0,
  );
  const pending:OpRow[] = submissions
    .filter((r) => r.reward === '待结算')
    .map((r) => ({ ...r, status: '待结算' }));
  const users = [
    ...new Set([
      ...submissions.map((r) => str(r.user)),
      ...invites.map((r) => str(r.inviter)),
    ]),
  ]
    .filter(Boolean)
    .map((user) => ({
      id: user,
      user,
      period: str(submissions.find((r) => r.user === user)?.period),
      points: rewards
        .filter((r) => r.user === user && r.status === '已到账')
        .reduce((n, r) => n + Number(r.points), 0),
    }));
  const filtered = (items: OpRow[]) =>
    items.filter(
      (r) =>
        (!query ||
          [r.name, r.user, r.inviter, r.invitee, r.id]
            .map(str)
            .join(' ')
            .includes(query)) &&
        (!period || str(r.period).includes(period)) &&
        (!status || r.status === status),
    );
  const shownStatus =
    config.status_text ||
    (config.status === '进行中' &&
    config.start_time &&
    new Date(config.start_time).valueOf() > now
      ? '未开始'
      : config.status === '进行中' &&
          config.end_time &&
          new Date(config.end_time).valueOf() < now
        ? '已结束'
        : config.status);
  const publishRule = config.extra_config.publish_config;
  const quota = config.extra_config.quota_config as
    | (NonNullable<EventConfig['extra_config']['quota_config']> & {
        daily?: {
          total_points?: number;
          register?: number;
          interact?: number;
          publish?: number;
        };
        monthly?: {
          total_points?: number;
          register?: number;
          interact?: number;
          publish?: number;
        };
      })
    | undefined;
  const quotaSummary =
    quota?.daily || quota?.monthly
      ? (
          [
            ['每日', quota.daily],
            ['每月', quota.monthly],
          ] as const
        )
          .filter(([, v]) => v)
          .map(
            ([label, v]) =>
              `${label} ${v?.total_points ?? '—'} 积分上限，注册 / 互动 / 发布阶段分别 ${v?.register ?? '—'} / ${v?.interact ?? '—'} / ${v?.publish ?? '—'} 人次`,
          )
          .join('；')
      : quota?.scope
        ? `按${({ per_day: '天', per_month: '月', per_period: '本期' } as const)[quota.scope]}最多发奖 ${quota.limit} 次`
        : '未配置活动总配额';
  const ruleSummary =
    config.type === 'referral'
      ? `邀请奖励按任务条件发放；${quotaSummary}`
      : `发布${({ work: '作品', post: '闪念', prompt: 'Prompt' } as const)[publishRule.biz_type]}；${publishRule.require_join_token ? '先参与再投稿；' : ''}最少 ${publishRule.min_image_count} 张图片、${publishRule.min_video_count} 个视频；标题至少 ${publishRule.title_min_len} 字`;
  const unlockSummary = config.unlock_rule.requires.length
    ? `完成前置活动 ${config.unlock_rule.requires.join('、')} 后解锁`
    : '无前置活动要求';
  function changeSubmission(r: OpRow, key: string, value: unknown) {
    if (readOnly) return;
    writeOperations({
      ...rows,
      rows: {
        ...rows.rows,
        submissions: rows.rows.submissions.map((x) =>
          x.id === r.id ? { ...x, [key]: value } : x,
        ),
      },
    });
    message.success('已更新');
  }
  function revoke(r: OpRow) {
    if (readOnly || r.status !== '已到账') return;
    modal.confirm({
      title: '撤销这笔奖励？',
      content: '撤销后该笔奖励保留审计记录。',
      okText: '确认撤销',
      cancelText: '取消',
      onOk: () => {
        writeOperations({
          ...rows,
          rows: {
            ...rows.rows,
            points: rows.rows.points.map((x) =>
              x.id === r.id
                ? { ...x, status: '已撤销', handledAt: date(Date.now()) }
                : x,
            ),
          },
        });
        message.success('奖励已撤销');
      },
    });
  }
  async function saveReward() {
    try {
      const v = await rewardForm.validateFields();
      if (readOnly) return;
      if (dialog === 'settle') {
        const targets = pending.filter(
          (r) => !v.period || r.period === v.period,
        );
        if (!targets.length) {
          message.info('当前期次没有待结算记录');
          setDialog(null);
          return;
        }
        const deferred = config.tasks.filter(
          (t) => t.reward_dispatch_mode === 'deferred',
        );
        const entries = targets.map((r) => ({
          r,
          task:
            deferred.find((t) => t.task_code === r.taskCode) ||
            (deferred.length === 1 ? deferred[0] : undefined),
        }));
        if (
          entries.some(
            ({ r, task }) =>
              r.eligibility !== '通过' ||
              r.contentStatus !== '公开' ||
              !task ||
              task.reward_points < 1 ||
              task.expire_days < 1,
          )
        )
          throw new Error('待结算记录缺少有效任务或未通过投稿资格，请先核对');
        const fresh = entries.filter(
          ({ r, task }) =>
            !rows.rows.points.some(
              (p) =>
                p.source === config.code &&
                p.submission === r.id &&
                p.taskCode === task?.task_code &&
                p.status === '已到账',
            ),
        );
        const grants = fresh.map(
          ({ r, task }) =>
            ({
              id: 'reward-' + crypto.randomUUID(),
              name: r.name,
              type: '活动奖励',
              status: '已到账',
              order: 0,
              user: r.user,
              points: task!.reward_points,
              source: config.code,
              submission: r.id,
              taskCode: task!.task_code,
              period: r.period,
              expireDays: task!.expire_days,
              dispatchMode: 'deferred',
              at: date(Date.now()),
              expires: date(Date.now() + task!.expire_days * 86400000),
            }) as OpRow,
        );
        writeOperations({
          ...rows,
          rows: {
            ...rows.rows,
            points: [...grants, ...rows.rows.points],
            submissions: rows.rows.submissions.map((r) =>
              targets.some((t) => t.id === r.id)
                ? { ...r, reward: '已到账' }
                : r,
            ),
          },
        });
        message.success(`已结算 ${grants.length} 条奖励`);
        setDialog(null);
        return;
      }
      const targets = submissions.filter((r) => selected.includes(r.id));
      if (!targets.length) throw new Error('请先选择投稿作品');
      if (
        targets.some(
          (r) => r.contentStatus !== '公开' || r.eligibility !== '通过',
        )
      )
        throw new Error('仅可向公开且资格通过的投稿发奖');
      if (
        targets.some((r) =>
          rows.rows.points.some(
            (p) =>
              p.source === config.code &&
              p.submission === r.id &&
              p.rewardType === v.rewardType &&
              p.status === '已到账',
          ),
        )
      )
        throw new Error('所选投稿已获得同类奖励，请核对发奖审计');
      const grants = targets.map(
        (r) =>
          ({
            id: 'reward-' + crypto.randomUUID(),
            name: r.name,
            type: '活动奖励',
            status: '已到账',
            order: 0,
            user: r.user,
            points: v.points,
            source: config.code,
            submission: r.id,
            rewardType: v.rewardType,
            expireDays: v.expireDays,
            remark: v.remark,
            dispatchMode: 'manual',
            at: date(Date.now()),
            expires: date(Date.now() + v.expireDays * 86400000),
          }) as OpRow,
      );
      writeOperations({
        ...rows,
        rows: {
          ...rows.rows,
          points: [...grants, ...rows.rows.points],
          submissions: rows.rows.submissions.map((r) =>
            selected.includes(r.id) ? { ...r, reward: '已到账' } : r,
          ),
        },
      });
      message.success('奖励已记录');
      setDialog(null);
      setSelected([]);
    } catch (e) {
      if (e instanceof Error) message.error(e.message);
    }
  }
  const taskColumns: ColumnsType<EventTask> = [
    {
      title: '任务',
      width: 240,
      render: (_, t) => (
        <>
          <strong>{t.name}</strong>
          <div className="om-sub">{t.task_code}</div>
          <div className="om-sub">{t.description}</div>
        </>
      ),
    },
    {
      title: '完成条件',
      width: 190,
      render: (_, t) => (
        <>
          {t.event_type || '未配置事件'}
          <div className="om-sub">完成 {t.target_count} 次</div>
        </>
      ),
    },
    {
      title: '奖励',
      width: 160,
      render: (_, t) => (
        <>
          {t.reward_points} 积分
          <div className="om-sub">
            {t.reward_points > 0
              ? `${t.expire_days} 天有效`
              : '无积分奖励'} ·{' '}
            {modes[t.reward_dispatch_mode]}发放
          </div>
        </>
      ),
    },
    { title: '排序', dataIndex: 'sort_order', width: 80 },
    {
      title: '任务入口',
      width: 160,
      render: (_, t) => (
        <>
          {t.cta_text || '—'}
          <div className="om-sub">{t.cta_route || '—'}</div>
        </>
      ),
    },
    ...(!readOnly
      ? [
          {
            title: '操作',
            width: 120,
            fixed: 'right' as const,
            render: (_: unknown, t: EventTask) => (
              <Space size={0}>
                <Button type="link" onClick={() => startTask(t)}>
                  编辑
                </Button>
                <Tooltip title={locked(t) ? '内置邀请任务不可删除' : ''}>
                  <Button
                    type="link"
                    danger
                    disabled={locked(t)}
                    onClick={() => deleteTask(t)}
                  >
                    删除
                  </Button>
                </Tooltip>
              </Space>
            ),
          },
        ]
      : []),
  ];
  const submissionColumns: ColumnsType<OpRow> = [
    {
      title: '投稿作品',
      width: 200,
      render: (_, r) => (
        <Button type="link" onClick={() => setRecord(r)}>
          {r.name}
        </Button>
      ),
    },
    {
      title: '投稿用户',
      width: 180,
      render: (_, r) => <UserIdentity id={str(r.user)} />,
    },
    { title: '自动资格', dataIndex: 'eligibility' },
    {
      title: '精选',
      render: (_, r) => <Tag>{r.featured ? '已精选' : '未精选'}</Tag>,
    },
    {
      title: '首页推荐',
      render: (_, r) => <Tag>{r.homepage ? '已推荐' : '未推荐'}</Tag>,
    },
    { title: '投稿时间', render: (_, r) => date(r.submittedAt) },
    {
      title: '操作',
      width: 220,
      render: (_, r) => (
        <Space size={0}>
          <Button type="link" onClick={() => setRecord(r)}>
            详情
          </Button>
          <Button
            type="link"
            disabled={readOnly}
            onClick={() => changeSubmission(r, 'featured', !r.featured)}
          >
            {r.featured ? '取消精选' : '精选'}
          </Button>
          <Button
            type="link"
            disabled={readOnly}
            onClick={() => changeSubmission(r, 'homepage', !r.homepage)}
          >
            {r.homepage ? '取消推荐' : '首页推荐'}
          </Button>
        </Space>
      ),
    },
  ];
  const rewardColumns: ColumnsType<OpRow> = [
    {
      title: '奖励对象',
      width: 200,
      render: (_, r) => (
        <>
          <UserIdentity id={str(r.user)} />
          <div className="om-sub">{r.name}</div>
        </>
      ),
    },
    {
      title: '奖励',
      render: (_, r) => (
        <>
          {str(r.points)} 积分
          <div className="om-sub">
            {r.expireDays
              ? `${str(r.expireDays)} 天有效`
              : r.expires
                ? `到期 ${str(r.expires)}`
                : '—'}
          </div>
        </>
      ),
    },
    {
      title: '发奖模式',
      render: (_, r) =>
        r.dispatchMode === 'manual'
          ? '手动'
          : r.dispatchMode === 'deferred'
            ? '结算'
            : '实时',
    },
    { title: '状态', dataIndex: 'status' },
    {
      title: '处理信息',
      render: (_, r) => str(r.remark || r.handledAt) || '—',
    },
    { title: '创建时间', dataIndex: 'at' },
    {
      title: '操作',
      render: (_, r) => (
        <Button
          type="link"
          danger
          disabled={readOnly || r.status !== '已到账'}
          onClick={() => revoke(r)}
        >
          撤销
        </Button>
      ),
    },
  ];
  const search = (
    <Space wrap style={{ marginBottom: 16 }}>
      <Input
        aria-label="用户编号或昵称"
        placeholder="用户编号或昵称"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: 220 }}
      />
      {tab !== 'invites' && (
        <Input
          placeholder="期次标识"
          aria-label="期次标识"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{ width: 160 }}
        />
      )}
      {tab === 'reward_pending' && (
        <Select
          placeholder="全部状态"
          allowClear
          value={status}
          onChange={setStatus}
          style={{ width: 140 }}
          options={['待结算', '结算成功', '结算失败'].map((value) => ({
            value,
            label: value,
          }))}
        />
      )}
      <Button onClick={reload}>搜索</Button>
      <Button
        onClick={() => {
          setQuery('');
          setPeriod('');
          setStatus(undefined);
        }}
      >
        重置
      </Button>
    </Space>
  );
  const overview = (
    <>
      <Descriptions
        bordered
        column={2}
        items={[
          { key: 'code', label: '活动编码', children: config.code },
          { key: 'name', label: '活动名称', children: config.name },
          {
            key: 'cover',
            label: '封面',
            children: config.cover_url ? (
              <MediaPreview value={config.cover_url} alt={config.name} />
            ) : (
              '—'
            ),
          },
          {
            key: 'type',
            label: '活动类型',
            children: types[config.type] || config.type,
          },
          {
            key: 'time',
            label: '活动时间',
            children:
              config.start_time || config.end_time
                ? `${date(config.start_time)} — ${date(config.end_time)}`
                : '长期有效',
          },
          {
            key: 'points',
            label: '最高可得积分（展示）',
            children: config.max_points,
          },
          { key: 'order', label: '排序', children: config.sort_order },
          {
            key: 'featured',
            label: '主推活动',
            children: config.is_featured ? '是' : '否',
          },
          { key: 'status', label: '状态', children: <Tag>{shownStatus}</Tag> },
        ]}
      />
      <div style={{ marginTop: 20 }}>
        <h3>活动描述</h3>
        <ContentBlockPreview
          block={{
            id: 'description',
            type: 'Markdown',
            text: config.description,
          }}
        />
      </div>
      <p>活动规则：{ruleSummary}</p>
      <p>
        解锁规则：{unlockSummary}
        {config.unlock_rule.duration_days
          ? '；参与窗口 ' + config.unlock_rule.duration_days + ' 天'
          : ''}
      </p>
      <Collapse
        items={[
          {
            key: 'rules',
            label: '活动规则',
            children: (
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {JSON.stringify(config.extra_config, null, 2)}
              </pre>
            ),
          },
          {
            key: 'unlock',
            label: '解锁规则',
            children: (
              <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {JSON.stringify(config.unlock_rule, null, 2)}
              </pre>
            ),
          },
        ]}
      />
    </>
  );
  return (
    <section className="om-page">
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={back}>返回活动列表</Button>
        <strong>{config.name}</strong>
        <Tag>{types[config.type] || config.type}</Tag>
        <Button type="link" disabled={readOnly} onClick={onEdit}>
          编辑活动
        </Button>
        {onDelete && (
          <Button
            type="link"
            danger
            disabled={readOnly || !canDelete}
            onClick={onDelete}
          >
            删除
          </Button>
        )}
      </Space>
      <Card>
        {loadError && (
          <Alert
            type="error"
            title={loadError}
            action={<Button onClick={reload}>重试</Button>}
          />
        )}
        <Tabs
          activeKey={tab}
          onChange={(key) => {
            setTab(key);
            setQuery('');
            setPeriod('');
            setStatus(undefined);
            setSelected([]);
          }}
          items={[
            { key: 'overview', label: '概览', children: overview },
            {
              key: 'tasks',
              label: '活动任务',
              children: (
                <>
                  {!readOnly && (
                    <Button
                      type="primary"
                      style={{ marginBottom: 16 }}
                      onClick={() => startTask()}
                    >
                      新建任务
                    </Button>
                  )}
                  <Table
                    rowKey="task_code"
                    columns={taskColumns}
                    dataSource={[...config.tasks].sort(
                      (a, b) => a.sort_order - b.sort_order,
                    )}
                    pagination={pagination}
                    scroll={{ x: 1050 }}
                  />
                </>
              ),
            },
            {
              key: 'participants',
              label: '参与用户',
              children: (
                <>
                  {search}
                  <Table
                    rowKey="id"
                    columns={[
                      {
                        title: '用户',
                        render: (_, r) => <UserIdentity id={r.user} />,
                      },
                      { title: '期次', dataIndex: 'period' },
                      { title: '参与窗口', render: () => '—' },
                      { title: '连续进度', render: () => '—' },
                      { title: '今日状态', render: () => '—' },
                      { title: '累计积分', dataIndex: 'points' },
                      { title: '里程碑', render: () => '—' },
                    ]}
                    dataSource={users.filter(
                      (r) =>
                        (!query || r.user.includes(query)) &&
                        (!period || r.period.includes(period)),
                    )}
                    locale={{ emptyText: <Empty description="暂无参与用户" /> }}
                    pagination={pagination}
                  />
                </>
              ),
            },
            config.type === 'referral'
              ? {
                  key: 'invites',
                  label: '邀请列表',
                  children: (
                    <>
                      {search}
                      <Table
                        rowKey="id"
                        columns={[
                          {
                            title: '邀请用户',
                            render: (_, r) => (
                              <UserIdentity id={str(r.inviter)} />
                            ),
                          },
                          { title: '邀请人数', dataIndex: 'invite_count' },
                          { title: '激活人数', dataIndex: 'activated_count' },
                          { title: '累计积分', dataIndex: 'total_points' },
                          { title: '最近邀请时间', dataIndex: 'at' },
                          {
                            title: '操作',
                            render: (_, r) => (
                              <Button type="link" onClick={() => setRecord(r)}>
                                邀请详情
                              </Button>
                            ),
                          },
                        ]}
                        dataSource={filtered(inviters)}
                        pagination={pagination}
                        scroll={{ x: 1000 }}
                      />
                    </>
                  ),
                }
              : {
                  key: 'submissions',
                  label: '投稿作品',
                  children: (
                    <>
                      {!readOnly && (
                        <Button
                          type="primary"
                          disabled={!selected.length}
                          style={{ marginBottom: 16 }}
                          onClick={() => {
                            rewardForm.resetFields();
                            setDialog('grant');
                          }}
                        >
                          手动发奖
                        </Button>
                      )}
                      <Table
                        rowKey="id"
                        columns={submissionColumns}
                        dataSource={submissions}
                        rowSelection={{
                          selectedRowKeys: selected,
                          onChange: setSelected,
                        }}
                        pagination={pagination}
                        scroll={{ x: 1100 }}
                      />
                    </>
                  ),
                },
            {
              key: 'reward_logs',
              label: '发奖审计',
              children: (
                <Table
                  rowKey="id"
                  columns={rewardColumns}
                  dataSource={rewards}
                  pagination={pagination}
                  scroll={{ x: 1000 }}
                />
              ),
            },
            {
              key: 'reward_pending',
              label: '待结算',
              children: (
                <>
                  {search}
                  <Button
                    type="primary"
                    disabled={readOnly}
                    style={{ marginLeft: 12 }}
                    onClick={() => {
                      rewardForm.resetFields();
                      rewardForm.setFieldValue('period', period);
                      setDialog('settle');
                    }}
                  >
                    触发结算
                  </Button>
                  <Table
                    rowKey="id"
                    columns={[
                      {
                        title: '奖励对象',
                        render: (_, r) => <UserIdentity id={str(r.user)} />,
                      },
                      { title: '作品', dataIndex: 'name' },
                      { title: '期次', dataIndex: 'period' },
                      { title: '奖励', dataIndex: 'reward' },
                      { title: '状态', dataIndex: 'status' },
                      {
                        title: '创建时间',
                        render: (_, r) => date(r.submittedAt),
                      },
                    ]}
                    dataSource={filtered(pending)}
                    pagination={pagination}
                    scroll={{ x: 900 }}
                  />
                </>
              ),
            },
          ]}
        />
      </Card>
      <Drawer
        title={isNew ? '新建活动任务' : '编辑活动任务'}
        open={!!editor}
        size="80%"
        mask={{ closable: false }}
        onClose={closeEditor}
        footer={
          <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={closeEditor}>取消</Button>
            <Button type="primary" disabled={readOnly} onClick={saveTask}>
              确定
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => setDirty(true)}
        >
          <Form.Item label="活动编码">
            <Input value={config.code} disabled />
          </Form.Item>
          <Form.Item
            label="任务名称"
            name="name"
            rules={[
              { required: true, whitespace: true, message: '请填写任务名称' },
              { max: 128 },
            ]}
          >
            <Input maxLength={128} />
          </Form.Item>
          <Form.Item label="任务编码" name="task_code">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="事件类型"
            name="event_type"
            rules={[{ required: true, message: '请选择事件类型' }]}
          >
            <Select
              showSearch={{optionFilterProp:'label'}}
              onChange={value=>{const task=communityTaskTypes.find(t=>t.value===value);if(task)form.setFieldsValue({event_filter:'{}',validation_rule:'{}',cta_route:'/'+task.route,cta_text:'去参与'});}}
              options={[
                ...eventOptions,
                ...(editor?.event_type &&
                !eventOptions.some((o) => o.value === editor.event_type)
                  ? [{ value: editor.event_type, label: editor.event_type }]
                  : []),
              ]}
            />
          </Form.Item>
          {communityTask&&<p className="om-sub">{communityTask.value==='app.use'?'点击使用入口计数，不以MakeNow创作完成为条件。':'统计全部有效对象，不限定单个圈子、应用或专题。'}</p>}
          <Form.Item label="任务描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="目标次数"
            name="target_count"
            rules={integer('目标次数', 1)}
          >
            <InputNumber min={1} precision={0} />
          </Form.Item>
          <Form.Item
            label="奖励积分"
            name="reward_points"
            rules={integer('奖励积分', 0)}
          >
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Form.Item
            label="有效天数"
            name="expire_days"
            rules={integer('有效天数', 1)}
          >
            <InputNumber min={1} precision={0} />
          </Form.Item>
          <Form.Item
            label="发奖模式"
            name="reward_dispatch_mode"
            rules={[{ required: true }]}
          >
            <Select
              options={Object.entries(modes).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Form.Item>
          <Form.Item label="排序" name="sort_order" rules={integer('排序', 0)}>
            <InputNumber min={0} precision={0} />
          </Form.Item>
          <Collapse
            items={[
              {
                key: 'display',
                label: '展示与入口',
                forceRender: true,
                children: (
                  <>
                    {config.type !== 'referral' && (
                      <>
                        <Form.Item label="第几天任务" name="day_index">
                          <InputNumber
                            min={0}
                            precision={0}
                            onChange={(v) =>
                              form.setFieldValue('unlock_day', v)
                            }
                          />
                        </Form.Item>
                        <Form.Item label="解锁天数" name="unlock_day">
                          <InputNumber min={0} precision={0} />
                        </Form.Item>
                      </>
                    )}
                    <Form.Item label="入口文案" name="cta_text">
                      <Input />
                    </Form.Item>
                    <Form.Item
                      label="业务类型"
                      name="jump_type"
                      initialValue="internal"
                    >
                      <Select
                        options={[
                          { value: 'internal', label: '站内路径' },
                          { value: 'external', label: '站外链接' },
                          { value: 'platform', label: '平台互通' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prev, next) =>
                        prev.jump_type !== next.jump_type
                      }
                    >
                      {() =>
                        form.getFieldValue('jump_type') === 'platform' ? (
                          <Form.Item
                            label="目标平台"
                            name="target_platform"
                            rules={[
                              { required: true, message: '请选择目标平台' },
                            ]}
                          >
                            <Select
                              options={[{ value: 'MakeNow', label: 'MakeNow' }]}
                            />
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                    <Form.Item
                      label="跳转地址 / 备用链接"
                      name="cta_route"
                      rules={[
                        {
                          validator: async (_, v) => {
                            if (v && !/^\/(?!\/)|^https:\/\//.test(v))
                              throw new Error('请输入站内路径或 HTTPS 链接');
                          },
                        },
                      ]}
                    >
                      <Input placeholder="/publish 或 HTTPS 链接" />
                    </Form.Item>
                  </>
                ),
              },
              {
                key: 'config',
                label: '任务判定与配额',
                forceRender: true,
                children: (
                  <>
                    {(
                      ['event_filter', 'quota_rule', 'validation_rule'] as const
                    ).filter(key=>!communityTask||key==='quota_rule').map((key) => (
                      <Form.Item
                        key={key}
                        label={{event_filter:'事件过滤',quota_rule:'发奖配额',validation_rule:'投稿校验'}[key]}
                        name={key}
                        rules={[
                          {
                            validator: async (_, v) => {
                              try {
                                const p = JSON.parse(v || '{}');
                                if (
                                  !p ||
                                  typeof p !== 'object' ||
                                  Array.isArray(p)
                                )
                                  throw new Error();
                              } catch {
                                throw new Error('请输入有效的 JSON 对象');
                              }
                            },
                          },
                        ]}
                      >
                        <TaskRuleFields field={key} />
                      </Form.Item>
                    ))}
                  </>
                ),
              },
            ]}
          />
        </Form>
      </Drawer>
      <Modal
        open={!!record}
        title={record?.type === '邀请关系' ? '邀请详情' : '投稿作品'}
        footer={<Button onClick={() => setRecord(null)}>关闭</Button>}
        onCancel={() => setRecord(null)}
        width={760}
      >
        {record && (
          <>
            <Descriptions
              column={1}
              items={[
                { key: 'name', label: '名称', children: record.name },
                {
                  key: 'user',
                  label: record.type === '邀请关系' ? '邀请人' : '投稿用户',
                  children: (
                    <UserIdentity id={str(record.inviter || record.user)} />
                  ),
                },
                ...(record.invitee
                  ? [
                      {
                        key: 'invitee',
                        label: '被邀请人',
                        children: <UserIdentity id={str(record.invitee)} />,
                      },
                    ]
                  : []),
                { key: 'status', label: '状态', children: record.status },
                {
                  key: 'reward',
                  label: '奖励',
                  children: str(record.reward) || '—',
                },
                {
                  key: 'reason',
                  label: '说明',
                  children: str(record.reason) || '—',
                },
              ]}
            />
            {record.type === '邀请统计' && (
              <Table
                rowKey="id"
                pagination={pagination}
                columns={[
                  {
                    title: '被邀请人',
                    render: (_, r) => <UserIdentity id={str(r.invitee)} />,
                  },
                  { title: '阶段', dataIndex: 'stage' },
                  { title: '积分', dataIndex: 'points' },
                  { title: '邀请时间', dataIndex: 'at' },
                ]}
                dataSource={invites.filter((r) => r.inviter === record.inviter)}
              />
            )}
            <ContentBlockPreview
              block={{
                id: 'material',
                type: 'Markdown',
                text: str(record.material),
              }}
            />
          </>
        )}
      </Modal>
      <Modal
        open={!!dialog}
        title={dialog === 'grant' ? '手动发奖' : '触发奖励结算'}
        onCancel={() => setDialog(null)}
        onOk={saveReward}
        okText={dialog === 'grant' ? '确认发奖' : '确认结算'}
        cancelText="取消"
        mask={{ closable: false }}
      >
        <Form form={rewardForm} layout="vertical">
          <Form.Item label="活动编码">
            <Input value={config.code} disabled />
          </Form.Item>
          {dialog === 'grant' ? (
            <>
              <p>已选投稿 {selected.length} 条</p>
              <Form.Item
                label="奖励类型"
                name="rewardType"
                initialValue="featured"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: 'featured', label: '精选奖励' },
                    { value: 'homepage', label: '首页推荐奖励' },
                  ]}
                />
              </Form.Item>
              <Form.Item
                label="积分"
                name="points"
                initialValue={100}
                rules={integer('积分', 1)}
              >
                <InputNumber min={1} precision={0} />
              </Form.Item>
              <Form.Item
                label="有效天数"
                name="expireDays"
                initialValue={30}
                rules={integer('有效天数', 1)}
              >
                <InputNumber min={1} precision={0} />
              </Form.Item>
              <Form.Item label="备注" name="remark">
                <Input.TextArea rows={3} />
              </Form.Item>
            </>
          ) : (
            <Form.Item
              label="期次标识"
              name="period"
              rules={[
                {
                  required: config.type === 'campaign',
                  message: '档期活动请输入期次标识',
                },
                { pattern: /^\d{6}$/, message: '期次格式为 6 位 yyyyMM' },
              ]}
            >
              <Input placeholder="例如 202610" maxLength={6} />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </section>
  );
}

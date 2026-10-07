'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Popover,
  Radio,
  Result,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { UserIdentity } from './user-identity';
import { MediaUpload } from './media-upload';
import { readUserSupport } from './user-support-model';
import { readOperations } from './operations-model';
import './user-management.css';

type Ledger = {
  beforeBalance?: number;
  afterBalance?: number;
  id: string;
  change: number;
  kind: string;
  expires: string;
  reason: string;
  date: string;
};
type User = {
  id: string;
  name: string;
  status: string;
  kind: string;
  date: string;
  summary: string;
  source: string;
  sourceCode: string;
  points: number;
  level: number;
  growth: number;
  whitelist: boolean;
  lastLogin: string;
  avatar: string;
  purposes: string[];
  officialStatus: string;
  ledger: Ledger[];
  inviter: string;
  [key: string]: unknown;
};
type Store = {
  users: User[];
  logs: Record<string, unknown>[];
  [key: string]: unknown;
};
type Filters = {
  id: string;
  name: string;
  kind?: string;
  source?: string;
  level?: number;
  status?: string;
  whitelist?: boolean;
  from: string;
  to: string;
};
type Action =
  | '编辑'
  | '调整积分'
  | '加入白名单'
  | '移出白名单'
  | '封禁'
  | '解封';
const key = 'research-b-platform-v1';
const textValue = (value: unknown) =>
  typeof value === 'string'
    ? value
    : typeof value === 'number' || typeof value === 'boolean'
      ? `${value}`
      : '';
const freshFilters = (): Filters => ({ id: '', name: '', from: '', to: '' });
const stamp = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
const purposes = [
  { label: '公告发布', value: 'announcement' },
  { label: '教程发布', value: 'tutorial' },
];
const statuses = ['正常', '删除', '冻结', '限制登录'];
function normalizeUser(r: Record<string, unknown>, i: number): User {
  const sourceCode =
    textValue(r.sourceCode) ||
    (r.source === '站内注册'
      ? 'website'
      : r.source === '创作者合作'
        ? 'creator'
        : textValue(r.source) || '未记录渠道');
  const sourceName =
    readUserSupport().sources.find((s) => s.channelCode === sourceCode)?.name ||
    textValue(r.source) ||
    '未记录渠道';
  return {
    ...r,
    id: textValue(r.id),
    name: textValue(r.name || '演示用户'),
    status: statuses.includes(textValue(r.status))
      ? textValue(r.status)
      : '正常',
    kind: r.kind === '官方账号' ? '官方账号' : '普通用户',
    date: textValue(r.date || '2026-10-05 10:20:00'),
    summary: textValue(r.summary || ''),
    source: sourceName,
    sourceCode,
    points: Number(r.points || 0),
    level: Number(r.level ?? (i % 3) + 1),
    growth: Number(r.growth ?? i * 130),
    whitelist: r.whitelist === true || r.whitelist === '是',
    lastLogin: textValue(r.lastLogin || '2026-10-05 18:30:00'),
    avatar: textValue(r.avatar || ''),
    purposes: Array.isArray(r.purposes)
      ? r.purposes.map(String)
      : r.kind === '官方账号'
        ? ['announcement', 'tutorial']
        : [],
    officialStatus: r.officialStatus === '停用' ? '停用' : '启用',
    ledger: Array.isArray(r.ledger)
      ? (r.ledger as Ledger[])
      : [
          {
            id: `LP-${textValue(r.id)}-OPEN`,
            change: Number(r.points || 0),
            kind: '初始演示余额',
            expires: '2026-12-05 10:20:00',
            reason: '演示数据初始批次',
            date: '2026-10-05 10:20:00',
          },
        ],
    inviter: textValue(r.inviter ?? (i > 0 && i % 3 === 0 ? 'U-DEMO-100' : '')),
  };
}
function seed(): Store {
  return {
    users: Array.from({ length: 28 }, (_, i) =>
      normalizeUser(
        {
          id: `U-DEMO-${100 + i}`,
          name: ['林间', '鹿与光', '云上旅人', '编辑部'][i % 4],
          status:
            i === 3 ? '冻结' : i === 6 ? '限制登录' : i === 8 ? '删除' : '正常',
          kind: i % 7 === 0 ? '官方账号' : '普通用户',
          date: '2026-10-05 10:20:00',
          source: ['站内注册', '创作者合作', '未记录渠道'][i % 3],
          points: 100 + i * 7,
          summary: '记录创作过程，分享日常灵感。',
        },
        i,
      ),
    ),
    logs: [],
  };
}
function readStore(): Store {
  const base = seed();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...base,
        ...parsed,
        users: Array.isArray(parsed.users)
          ? parsed.users.map(normalizeUser)
          : base.users,
        logs: Array.isArray(parsed.logs) ? parsed.logs : [],
      };
    }
  } catch {
    /* Use fictional records when storage is unavailable. */
  }
  return base;
}
export function readManagedUsers() {
  return readStore().users;
}
export function UserManagement({
  state,
}: {
  state: string;
  go: (s: string) => void;
}) {
  const { message, modal } = App.useApp();
  const [data, setData] = useState<Store>(seed),
    [localState, setLocalState] = useState(state === 'save-failed' ? 'save-error' : state === 'load-failed' ? 'error' : state === 'permission-denied' ? 'no-permission' : state),
    [filters, setFilters] = useState<Filters>(freshFilters),
    [applied, setApplied] = useState<Filters>(freshFilters),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [detailId, setDetailId] = useState<string | null>(null),
    [tab, setTab] = useState('overview'),
    [editing, setEditing] = useState<{
      user: User | null;
      action: Action | '创建官方账号';
    } | null>(null),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false);
  const [form] = Form.useForm();
  const lock = useRef(false),
    mounted = useRef(true),
    stateRef = useRef(state);
  const official = Form.useWatch('official', form),
    direction = Form.useWatch('direction', form),
    avatar = Form.useWatch('avatar', form);
  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => setData(readStore()));
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    queueMicrotask(() => setLocalState(state === 'save-failed' ? 'save-error' : state === 'load-failed' ? 'error' : state === 'permission-denied' ? 'no-permission' : state));
  }, [state]);
  useEffect(() => {
    stateRef.current = localState;
  }, [localState]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: Event) => {
      e.preventDefault();
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          setEditing(null);
          (e as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    const unload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('prototype-before-navigate', guard);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype-before-navigate', guard);
      window.removeEventListener('beforeunload', unload);
    };
  }, [dirty, modal]);
  const detail = data.users.find((u) => u.id === detailId);
  const detailLedger = detail
    ? [
        ...detail.ledger,
        ...readOperations()
          .rows.points.filter(
            (r) =>
              r.user === detail.id && !detail.ledger.some((l) => l.id === r.id),
          )
          .map((r) => ({
            id: r.id,
            change: Number(r.points || r.change || 0),
            kind: textValue(r.optionType || r.type),
            expires: textValue(r.expires || r.expiresAt) || '—',
            reason: textValue(r.reason || r.name),
            date: textValue(r.at || r.createdAt),
          })),
      ].sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const retainedInvites = readOperations().rows.invite.filter(
    (r) => r.type === '邀请关系',
  );
  const detailInviter = detail
    ? detail.inviter ||
      textValue(retainedInvites.find((r) => r.invitee === detail.id)?.inviter)
    : '';
  const detailInvitees = detail
    ? [
        ...data.users.filter((u) => u.inviter === detail.id),
        ...retainedInvites
          .filter(
            (r) =>
              r.inviter === detail.id &&
              !data.users.some(
                (u) => u.id === r.invitee && u.inviter === detail.id,
              ),
          )
          .map(
            (r) =>
              data.users.find((u) => u.id === r.invitee) ||
              normalizeUser(
                {
                  id: r.invitee,
                  name: r.inviteeName || '演示用户',
                  date: r.at,
                  points: 0,
                },
                0,
              ),
          ),
      ]
    : [];
  const allowed = () => {
    if (localState === 'no-permission') {
      message.error('暂无操作权限');
      return false;
    }
    return !lock.current;
  };
  function actions(u: User): Action[] {
    if (u.status === '删除') return [];
    return [
      '编辑',
      ...(u.kind === '普通用户' && u.status === '正常'
        ? ['调整积分' as Action]
        : []),
      u.whitelist ? '移出白名单' : '加入白名单',
      u.status === '正常' ? '封禁' : '解封',
    ];
  }
  function open(user: User | null, action: Action | '创建官方账号') {
    if (!allowed() || (user && !actions(user).includes(action as Action)))
      return;
    setEditing({ user, action });
    setDirty(false);
    form.resetFields();
    form.setFieldsValue({
      name: user?.name || '',
      avatar: user?.avatar || '',
      summary: user?.summary || '',
      official: user ? user.kind === '官方账号' : true,
      purposes: user?.purposes || [],
      officialStatus: user?.officialStatus || '启用',
      direction: 'add',
      points: 100,
      expireDays: 60,
      reason: '',
    });
  }
  function close() {
    if (lock.current) return;
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          setEditing(null);
        },
      });
    else setEditing(null);
  }
  async function commit(values: Record<string, unknown>) {
    if (!editing || !allowed()) return;
    const context = editing;
    lock.current = true;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 250));
    if (!mounted.current) {
      lock.current = false;
      return;
    }
    if (stateRef.current === 'no-permission') {
      lock.current = false;
      setBusy(false);
      message.error('暂无操作权限');
      return;
    }
    if (stateRef.current === 'save-error') {
      setLocalState('normal');
      lock.current = false;
      setBusy(false);
      message.error('提交失败，输入已保留，请重试');
      return;
    }
    const latest = readStore();
    const current = context.user
      ? latest.users.find((u) => u.id === context.user!.id)
      : null;
    if (
      context.user &&
      (!current || !actions(current).includes(context.action as Action))
    ) {
      lock.current = false;
      setBusy(false);
      message.error('用户状态已变化，请关闭后重新操作');
      return;
    }
    const before = current ? JSON.stringify(current) : '新建账号';
    let next: User;
    if (!current) {
      next = normalizeUser(
        {
          id: `U-DEMO-OFFICIAL-${crypto.randomUUID().slice(0, 8)}`,
          name: textValue(values.name).trim(),
          avatar: values.avatar,
          summary: textValue(values.summary || '').trim(),
          kind: '官方账号',
          status: '正常',
          source: '后台创建',
          date: stamp(),
          lastLogin: '—',
          points: 0,
          purposes: values.purposes,
          officialStatus: values.officialStatus,
          ledger: [],
        },
        0,
      );
    } else if (context.action === '编辑') {
      next = {
        ...current,
        kind: values.official ? '官方账号' : '普通用户',
        purposes: values.official ? (values.purposes as string[]) : [],
        officialStatus: textValue(
          values.officialStatus || current.officialStatus,
        ),
        ...(current.kind === '官方账号'
          ? {
              name: textValue(values.name).trim(),
              avatar: textValue(values.avatar || ''),
              summary: textValue(values.summary || '').trim(),
            }
          : {}),
      };
    } else if (context.action === '调整积分') {
      const amount =
        Number(values.points) * (values.direction === 'deduct' ? -1 : 1);
      if (amount + current.points < 0) {
        lock.current = false;
        setBusy(false);
        message.error('扣减积分不能超过当前余额');
        return;
      }
      const entry: Ledger = {
        beforeBalance: current.points,
        afterBalance: current.points + amount,
        id: 'LP-DEMO-' + crypto.randomUUID().slice(0, 8),
        change: amount,
        kind: amount > 0 ? '人工发放' : '人工扣减',
        expires:
          amount > 0
            ? dayjs()
                .add(Number(values.expireDays), 'day')
                .format('YYYY-MM-DD HH:mm:ss')
            : '—',
        reason: textValue(values.reason).trim(),
        date: stamp(),
      };
      next = {
        ...current,
        points: current.points + amount,
        ledger: [entry, ...current.ledger],
      };
    } else
      next = {
        ...current,
        ...(context.action.includes('白名单')
          ? { whitelist: context.action === '加入白名单' }
          : { status: context.action === '封禁' ? '冻结' : '正常' }),
      };
    const nextStore = {
      ...latest,
      users: current
        ? latest.users.map((u) => (u.id === next.id ? next : u))
        : [next, ...latest.users],
      logs: [
        {
          id: crypto.randomUUID(),
          name: context.action,
          status: '成功',
          kind: '用户管理',
          date: stamp(),
          summary: '',
          actor: '演示管理员',
          target: next.id,
          reason: textValue(values.reason || '维护官方发布账号'),
          before,
          after: JSON.stringify(next),
        },
        ...latest.logs,
      ],
    };
    try {
      localStorage.setItem(key, JSON.stringify(nextStore));
      setData(nextStore);
      setEditing(null);
      setDirty(false);
      message.success(
        context.action === '调整积分'
          ? `积分调整完成，余额 ${next.points}`
          : '操作完成',
      );
    } catch {
      message.error('保存失败，浏览器存储不可用；输入已保留，请重试');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function save() {
    try {
      const values = await form.validateFields();
      if (
        editing?.action === '编辑' &&
        editing.user?.kind === '普通用户' &&
        values.official
      ) {
        modal.confirm({
          title: '将该用户设为官方账号？',
          content: '保留原有用户资料，允许以该账号发布所选官方内容。',
          okText: '确认设置',
          cancelText: '继续编辑',
          onOk: () => commit(values),
        });
      } else await commit(values);
    } catch {
      /* Field messages retain the input. */
    }
  }
  const view = (u: User) => {
    if (!allowed()) return;
    setDetailId(u.id);
    setTab('overview');
  };
  const renderActions = (u: User) => (
    <Space size={0} wrap>
      {actions(u).map((a) => (
        <Button
          type="link"
          size="small"
          key={a}
          danger={a === '封禁'}
          disabled={busy || localState === 'no-permission'}
          onClick={() => open(u, a)}
        >
          {a}
        </Button>
      ))}
    </Space>
  );
  const columns: ColumnsType<User> = [
    {
      title: '用户',
      width: 220,
      render: (_, u) => (
        <UserIdentity
          id={u.id}
          name={u.name}
          avatar={u.avatar}
          onClick={() => view(u)}
        />
      ),
    },
    { title: '账号类型', dataIndex: 'kind', width: 110 },
    { title: '注册来源', dataIndex: 'source', width: 130 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (s) => (
        <Tag color={s === '正常' ? 'green' : s === '删除' ? 'default' : 'red'}>
          {s}
        </Tag>
      ),
    },
    {
      title: '白名单',
      dataIndex: 'whitelist',
      width: 85,
      render: (v) => (
        <Tag color={v ? 'green' : 'default'}>{v ? '是' : '否'}</Tag>
      ),
    },
    { title: '积分', dataIndex: 'points', width: 85 },
    { title: '注册时间', dataIndex: 'date', width: 170 },
    { title: '最后登录', dataIndex: 'lastLogin', width: 170 },
    {
      title: '操作',
      fixed: 'right',
      width: 285,
      render: (_, u) => (
        <Space size={0} wrap>
          <Button type="link" size="small" onClick={() => view(u)}>
            查看
          </Button>
          {renderActions(u)}
        </Space>
      ),
    },
  ];
  const rows =
    localState === 'empty'
      ? []
      : data.users.filter(
          (u) =>
            (!applied.id ||
              u.id.toLowerCase() === applied.id.trim().toLowerCase()) &&
            (!applied.name || u.name.includes(applied.name.trim())) &&
            (!applied.kind || u.kind === applied.kind) &&
            (!applied.source || u.sourceCode === applied.source) &&
            (applied.level === undefined || u.level === applied.level) &&
            (!applied.status || u.status === applied.status) &&
            (applied.whitelist === undefined ||
              u.whitelist === applied.whitelist) &&
            (!applied.from || u.date.slice(0, 10) >= applied.from) &&
            (!applied.to || u.date.slice(0, 10) <= applied.to),
        );
  const update = (patch: Partial<Filters>) =>
    setFilters((p) => ({ ...p, ...patch }));
  if (localState === 'no-permission')
    return (
      <Result
        status="403"
        title="暂无查看权限"
        subTitle="请联系管理员核对职责范围。"
      />
    );
  if (localState === 'error')
    return (
      <Result
        status="error"
        title="用户列表加载失败"
        extra={
          <Button
            onClick={() => {
              setData(readStore());
              setLocalState('normal');
            }}
          >
            重新加载
          </Button>
        }
      />
    );
  const isEditor =
    editing?.action === '编辑' || editing?.action === '创建官方账号';
  const isPoints = editing?.action === '调整积分';
  const profilesEditable = !editing?.user || editing.user.kind === '官方账号';
  return (
    <section className="um-root">
      <div className="um-toolbar">
        <Button type="primary" onClick={() => open(null, '创建官方账号')}>
          创建官方账号
        </Button>
      </div>
      <Form
        className="um-filters"
        layout="inline"
        onFinish={() => {
          setApplied({ ...filters });
          setPage(1);
        }}
      >
        <Form.Item label="用户 ID">
          <Input
            aria-label="用户 ID"
            value={filters.id}
            allowClear
            placeholder="完整用户 ID"
            onChange={(e) => update({ id: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="用户昵称">
          <Input
            aria-label="用户昵称"
            value={filters.name}
            allowClear
            placeholder="昵称关键词"
            onChange={(e) => update({ name: e.target.value })}
          />
        </Form.Item>
        <Form.Item label="账号类型">
          <Select
            aria-label="账号类型"
            value={filters.kind}
            allowClear
            placeholder="全部"
            options={['官方账号', '普通用户'].map((value) => ({
              value,
              label: value,
            }))}
            onChange={(kind) => update({ kind })}
          />
        </Form.Item>
        <Form.Item label="注册来源">
          <Select
            aria-label="注册来源"
            value={filters.source}
            allowClear
            showSearch
            placeholder="全部"
            options={[
              ...readUserSupport().sources.map((s) => ({
                value: s.channelCode,
                label: s.name + '（' + s.channelCode + '）',
              })),
              ...[
                ...new Set(
                  data.users
                    .filter(
                      (u) =>
                        !readUserSupport().sources.some(
                          (s) => s.channelCode === u.sourceCode,
                        ),
                    )
                    .map((u) => u.sourceCode),
                ),
              ].map((value) => ({ value, label: value })),
            ]}
            onChange={(source) => update({ source })}
          />
        </Form.Item>
        <Form.Item label="等级">
          <InputNumber
            aria-label="等级"
            min={0}
            precision={0}
            value={filters.level}
            placeholder="全部"
            onChange={(level) => update({ level: level ?? undefined })}
          />
        </Form.Item>
        <Form.Item label="状态">
          <Select
            aria-label="状态"
            value={filters.status}
            allowClear
            placeholder="全部"
            options={statuses.map((value) => ({ value, label: value }))}
            onChange={(status) => update({ status })}
          />
        </Form.Item>
        <Form.Item label="白名单">
          <Select
            aria-label="白名单"
            value={filters.whitelist}
            allowClear
            placeholder="全部"
            options={[
              { value: true, label: '是' },
              { value: false, label: '否' },
            ]}
            onChange={(whitelist) => update({ whitelist })}
          />
        </Form.Item>
        <Form.Item label="注册时间">
          <DatePicker.RangePicker
            value={
              filters.from && filters.to
                ? [dayjs(filters.from), dayjs(filters.to)]
                : null
            }
            onChange={(v) =>
              update({
                from: v?.[0]?.format('YYYY-MM-DD') || '',
                to: v?.[1]?.format('YYYY-MM-DD') || '',
              })
            }
          />
        </Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            搜索
          </Button>
          <Button
            onClick={() => {
              setFilters(freshFilters());
              setApplied(freshFilters());
              setPage(1);
            }}
          >
            重置
          </Button>
        </Space>
      </Form>
      <Table
        rowKey="id"
        size="small"
        loading={localState === 'loading'}
        dataSource={rows}
        columns={columns}
        scroll={{ x: 1455 }}
        pagination={{
          current: Math.min(
            page,
            Math.max(1, Math.ceil(rows.length / pageSize)),
          ),
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          showTotal: (n) => `共 ${n} 条`,
          onChange: (p, s) => {
            setPage(s !== pageSize ? 1 : p);
            setPageSize(s);
          },
        }}
      />
      <Drawer
        title="用户详情"
        open={!!detail}
        size={960}
        onClose={() => setDetailId(null)}
      >
        {detail && (
          <>
            <div className="um-detail-heading">
              <UserIdentity
                id={detail.id}
                name={detail.name}
                avatar={detail.avatar}
              />
              {renderActions(detail)}
            </div>
            <Tabs
              activeKey={tab}
              onChange={setTab}
              items={[
                {
                  key: 'overview',
                  label: '概览',
                  children: (
                    <Descriptions
                      bordered
                      size="small"
                      column={3}
                      items={[
                        { key: 'id', label: '用户 ID', children: detail.id },
                        {
                          key: 'kind',
                          label: '账号类型',
                          children: detail.kind,
                        },
                        {
                          key: 'status',
                          label: (
                            <Popover
                              trigger="click"
                              title="账号状态说明"
                              content={
                                <div>
                                  正常：可登录；删除：仅查看；冻结：已封禁；限制登录：当前不可登录。
                                </div>
                              }
                            >
                              <button className="um-help" type="button">
                                账号状态 ⓘ
                              </button>
                            </Popover>
                          ),
                          children: detail.status,
                        },
                        { key: 'level', label: '等级', children: detail.level },
                        {
                          key: 'growth',
                          label: '成长值',
                          children: detail.growth,
                        },
                        {
                          key: 'points',
                          label: '积分',
                          children: detail.points,
                        },
                        {
                          key: 'white',
                          label: '白名单',
                          children: detail.whitelist ? '是' : '否',
                        },
                        {
                          key: 'date',
                          label: '注册时间',
                          children: detail.date,
                        },
                        {
                          key: 'login',
                          label: '最后登录',
                          children: detail.lastLogin,
                        },
                        {
                          key: 'source',
                          label: '注册来源',
                          children: detail.source,
                        },
                        {
                          key: 'official',
                          label: '官方发布状态',
                          children:
                            detail.kind === '官方账号'
                              ? detail.officialStatus
                              : '—',
                        },
                        {
                          key: 'purpose',
                          label: '允许用途',
                          children:
                            purposes
                              .filter((p) => detail.purposes.includes(p.value))
                              .map((p) => p.label)
                              .join('、') || '—',
                        },
                        {
                          key: 'summary',
                          label: '简介',
                          span: 3,
                          children: detail.summary || '—',
                        },
                      ]}
                    />
                  ),
                },
                {
                  key: 'points',
                  label: '积分明细',
                  children: (
                    <>
                      <p className="um-muted"></p>
                      <Table
                        rowKey="id"
                        size="small"
                        dataSource={detailLedger}
                        columns={[
                          { title: '记录 ID', dataIndex: 'id', width: 180 },
                          {
                            title: '积分变化',
                            dataIndex: 'change',
                            render: (n) => (
                              <span
                                style={{
                                  color: n >= 0 ? '#389e0d' : '#cf1322',
                                }}
                              >
                                {n >= 0 ? '+' : ''}
                                {n}
                              </span>
                            ),
                          },
                          { title: '业务类型', dataIndex: 'kind' },
                          {
                            title: '到期时间',
                            dataIndex: 'expires',
                            width: 165,
                          },
                          { title: '原因', dataIndex: 'reason' },
                          { title: '时间', dataIndex: 'date', width: 165 },
                        ]}
                        scroll={{ x: 950 }}
                        pagination={{
                          defaultPageSize: 10,
                          showSizeChanger: true,
                        }}
                      />
                    </>
                  ),
                },
                {
                  key: 'invite',
                  label: '邀请关系',
                  children: (
                    <>
                      <Descriptions
                        bordered
                        column={1}
                        size="small"
                        items={[
                          {
                            key: 'inviter',
                            label: '邀请人',
                            children: detailInviter ? (
                              <UserIdentity
                                id={detailInviter}
                                name={
                                  data.users.find((u) => u.id === detailInviter)
                                    ?.name
                                }
                              />
                            ) : (
                              '无邀请人'
                            ),
                          },
                        ]}
                      />
                      <Table
                        className="um-invites"
                        rowKey="id"
                        size="small"
                        dataSource={detailInvitees}
                        columns={[
                          {
                            title: '被邀请用户',
                            render: (_, u) => (
                              <UserIdentity
                                id={u.id}
                                name={u.name}
                                avatar={u.avatar}
                                onClick={() => view(u)}
                              />
                            ),
                          },
                          { title: '注册时间', dataIndex: 'date' },
                        ]}
                        pagination={false}
                        locale={{
                          emptyText: <Empty description="暂无被邀请用户" />,
                        }}
                      />
                    </>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>
      <Modal
        open={!!editing}
        title={
          editing?.action === '编辑' && editing.user?.kind === '普通用户'
            ? '设置官方账号'
            : editing?.action === '编辑'
              ? '编辑官方账号'
              : editing?.action
        }
        onCancel={close}
        onOk={() => void save()}
        okText={editing?.action === '封禁' ? '确认封禁' : '保存'}
        okButtonProps={{ danger: editing?.action === '封禁' }}
        confirmLoading={busy}
        mask={{ closable: false }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          disabled={busy}
          onValuesChange={() => setDirty(true)}
          preserve={false}
        >
          {editing?.user && (
            <Form.Item label="用户">
              <UserIdentity
                id={editing.user.id}
                name={editing.user.name}
                avatar={editing.user.avatar}
              />
            </Form.Item>
          )}
          {isEditor ? (
            <>
              {editing?.action === '编辑' && (
                <Form.Item name="official" label="官方账号">
                  <Radio.Group
                    options={[
                      { label: '是', value: true },
                      { label: '否', value: false },
                    ]}
                  />
                </Form.Item>
              )}
              {profilesEditable && (
                <>
                  <Form.Item
                    name="name"
                    label="公开昵称"
                    rules={[
                      {
                        required: true,
                        whitespace: true,
                        message: '请输入公开昵称',
                      },
                    ]}
                  >
                    <Input maxLength={60} showCount />
                  </Form.Item>
                  <Form.Item name="avatar" label="头像">
                    <Input placeholder="头像链接" />
                  </Form.Item>
                  <MediaUpload
                    firstAsCover={false}
                    label="头像"
                    items={avatar ? [{ url: avatar, type: 'image' }] : []}
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    maxCount={1}
                    disabled={busy}
                    onRemove={() => {
                      form.setFieldValue('avatar', '');
                      setDirty(true);
                    }}
                    onFiles={async (files) => {
                      const file = files[0];
                      if (
                        !file ||
                        ![
                          'image/png',
                          'image/jpeg',
                          'image/webp',
                          'image/gif',
                        ].includes(file.type) ||
                        file.size > 2 * 1024 * 1024
                      ) {
                        message.error(
                          '请选择 2MB 以内的 PNG、JPG、WebP 或 GIF',
                        );
                        return;
                      }
                      const url = await new Promise<string>(
                        (resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () =>
                            resolve(textValue(reader.result));
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        },
                      );
                      form.setFieldValue('avatar', url);
                      setDirty(true);
                    }}
                  />
                  <Form.Item name="summary" label="公开简介">
                    <Input.TextArea rows={3} maxLength={180} showCount />
                  </Form.Item>
                </>
              )}
              {(official || editing?.action === '创建官方账号') && (
                <>
                  <Form.Item
                    label="允许用途"
                    name="purposes"
                    rules={[
                      {
                        type: 'array',
                        required: true,
                        min: 1,
                        message: '至少选择一种用途',
                      },
                    ]}
                  >
                    <Checkbox.Group options={purposes} />
                  </Form.Item>
                  <Form.Item
                    label="官方发布状态"
                    name="officialStatus"
                    rules={[{ required: true }]}
                  >
                    <Radio.Group options={['启用', '停用']} />
                  </Form.Item>
                </>
              )}
            </>
          ) : (
            <>
              {isPoints ? (
                <>
                  <p className="um-muted">增加积分须填写有效期。</p>
                  <Form.Item label="调整方式" name="direction">
                    <Radio.Group
                      options={[
                        { label: '增加', value: 'add' },
                        { label: '扣减', value: 'deduct' },
                      ]}
                    />
                  </Form.Item>
                  <Form.Item
                    label="积分"
                    name="points"
                    rules={[
                      {
                        required: true,
                        type: 'integer',
                        min: 1,
                        message: '请输入正整数积分',
                      },
                    ]}
                  >
                    <InputNumber min={1} precision={0} />
                  </Form.Item>
                  {direction !== 'deduct' && (
                    <Form.Item
                      label="有效天数"
                      name="expireDays"
                      rules={[
                        {
                          required: true,
                          type: 'integer',
                          min: 1,
                          message: '请输入正整数有效天数',
                        },
                      ]}
                    >
                      <InputNumber min={1} precision={0} />
                    </Form.Item>
                  )}
                </>
              ) : (
                <p>
                  {editing?.action === '封禁'
                    ? '封禁后账号进入冻结状态，无法登录。'
                    : editing?.action === '解封'
                      ? '解封后恢复正常账号状态。'
                      : editing?.action === '加入白名单'
                        ? '加入白名单后保留账号现有状态。'
                        : '移出白名单后保留账号现有状态。'}
                </p>
              )}
              <Form.Item
                label={isPoints ? '调整原因' : '操作原因'}
                name="reason"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入操作原因',
                  },
                ]}
              >
                <Input.TextArea rows={3} maxLength={255} showCount />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </section>
  );
}

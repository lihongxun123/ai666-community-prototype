'use client';
import { useEffect, useState } from 'react';
import {
  Alert,
  App,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Result,
  Select,
  Space,
  Spin,
  Switch,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { prototypeStore } from '../c-prototype/storage';
import {
  readOperations,
  writeOperations,
  type OpRow,
} from './operations-model';
import { readEventConfigs } from './retained-event-config';
import { UserIdentity } from './user-identity';
import {
  readUserSupport,
  seedUserSupport,
  userSupportKey,
  type Source,
  type Level,
  type Expiry,
  type Support,
} from './user-support-model';
import { readManagedUsers } from './user-management';
import './user-support-management.css';

const key = userSupportKey;
const seed = seedUserSupport;
const stamp = () => dayjs().format('YYYY-MM-DD HH:mm:ss');
const newId = () => crypto.randomUUID();
const sourceBound = (source: Source) =>
  readManagedUsers().some(
    (u) => u.sourceCode === source.channelCode || u.source === source.name,
  );
export const userSupportPages = [
  { id: 'user-register-sources', title: '注册来源' },
  { id: 'user-member-levels', title: '会员等级' },
].map((p) => ({
  ...p,
  module: '用户管理',
  states: [
    'normal',
    'empty',
    'error',
    'loading',
    'no-permission',
    'save-error',
  ],
}));
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const text = (v: unknown) =>
  typeof v === 'string'
    ? v
    : typeof v === 'number' || typeof v === 'boolean'
      ? String(v)
      : v == null
        ? ''
        : JSON.stringify(v);
const pointValue = (r: OpRow) => num(r.points ?? r.change);
const recordTime = (r: OpRow) => text(r.at ?? r.createdAt);
const businessType = (r: OpRow) => text(r.optionType || r.type);
const pointsOptions = [
  '签到',
  '连续签到奖励',
  '邀请',
  '活动',
  '手动调整',
  '扣减',
  '商城兑换',
  '模型生成',
  '模型退款',
  '过期',
  '充值',
  '充值佣金',
];
type Filter = {
  record: string;
  bizNo: string;
  user: string;
  source: string;
  sourceType?: string;
  direction?: string;
  type?: string;
  from: string;
  to: string;
};
const blankFilter = (): Filter => ({
  record: '',
  bizNo: '',
  user: '',
  source: '',
  from: '',
  to: '',
});
function invitationStage(r: OpRow, label: string) {
  const stages = Array.isArray(r.milestones)
    ? (r.milestones as { label?: string; stage?: string; status?: string }[])
    : [];
  const entry = stages.find(
    (x) =>
      x.label === label ||
      x.stage ===
        (
          { 注册: 'register', 互动: 'interact', 发布: 'publish' } as Record<
            string,
            string
          >
        )[label],
  );
  if (entry?.status && ['未完成', '完成待发', '已发放'].includes(entry.status))
    return entry.status;
  const stage = text(r.stage);
  if (stage.includes(label) && !stage.includes('待核验'))
    return r.reward === '已到账' ? '已发放' : '完成待发';
  return '未完成';
}
type Inviter = {
  id: string;
  count: number;
  activated: number;
  points: number;
  pending: number;
  at: string;
  records: OpRow[];
};

export function UserSupportManagement({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (page: string) => void;
}) {
  const { message, modal } = App.useApp();
  const [support, setSupport] = useState(seed),
    [operations, setOperations] = useState(readOperations),
    [localState, setLocalState] = useState(state),
    [editing, setEditing] = useState<Source | Level | null>(null),
    [expiryOpen, setExpiryOpen] = useState(false),
    [expiryDraft, setExpiryDraft] = useState<Expiry[]>([]),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [dragged, setDragged] = useState(''),
    [inviteDetail, setInviteDetail] = useState<Inviter | null>(null),
    [more, setMore] = useState(false),
    [filter, setFilter] = useState(blankFilter),
    [applied, setApplied] = useState(blankFilter),
    [pagination, setPagination] = useState({ current: 1, pageSize: 20 });
  const [form] = Form.useForm();
  const denied = ['no-permission', 'permission-denied','read-only','readonly'].includes(state),
    sourcePage = page === 'user-register-sources',
    levelPage = page === 'user-member-levels',
    pointPage = page === 'op-points';
  useEffect(() => {
    queueMicrotask(() => {
      setSupport(readUserSupport());
      setOperations(readOperations());
    });
    const refresh = () => {
      setOperations(readOperations());
      setSupport(readUserSupport());
    };
    window.addEventListener('bp-operations-change', refresh);
    return () => window.removeEventListener('bp-operations-change', refresh);
  }, []);
  useEffect(() => {
    queueMicrotask(() => {
      setLocalState(state);
      setFilter(blankFilter());
      setApplied(blankFilter());
      setPagination({ current: 1, pageSize: 20 });
      setInviteDetail(null);
    });
  }, [page, state]);
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
          setExpiryOpen(false);
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
  function commit(
    next: Support,
    object: string,
    action: string,
    before: unknown,
    after: unknown,
  ) {
    if (denied) return false;
    if (['save-error', 'save-failed'].includes(localState)) {
      message.error('保存失败，请重试');
      setLocalState('normal');
      return false;
    }
    try {
      const previous = prototypeStore.getItem(key);
      const data = readOperations();
      const logged = {
        ...data,
        revision: data.revision + 1,
        logs: [
          {
            id: 'user-log-' + newId(),
            at: stamp(),
            actor: '演示运营员',
            module: sourcePage
              ? '注册来源'
              : levelPage
                ? '会员等级'
                : '积分有效期',
            object,
            action,
            detail: JSON.stringify({ before, after }),
          },
          ...data.logs,
        ],
      };
      prototypeStore.setItem(key, JSON.stringify(next));
      try {
        writeOperations(logged);
      } catch (error) {
        if (previous === null) prototypeStore.removeItem(key);
        else prototypeStore.setItem(key, previous);
        throw error;
      }
      setSupport(next);
      setOperations(logged);
      message.success(action + '成功');
      return true;
    } catch {
      message.error('保存失败，输入已保留，请重试');
      return false;
    }
  }
  function closeEditor() {
    if (busy) return;
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setEditing(null);
          setExpiryOpen(false);
          setDirty(false);
        },
      });
    else {
      setEditing(null);
      setExpiryOpen(false);
    }
  }
  function edit(row: Source | Level) {
    form.resetFields();
    form.setFieldsValue(row);
    setEditing(row);
    setDirty(false);
  }
  async function save() {
    if (!editing || busy) return;
    try {
      const values = await form.validateFields();
      setBusy(true);
      if (sourcePage) {
        const current = editing as Source;
        const channelCode = text(values.channelCode).trim(),
          name = text(values.name).trim();
        if (
          current.id &&
          sourceBound(current) &&
          channelCode !== current.channelCode
        ) {
          message.error('该渠道已关联用户，渠道编码不可修改');
          return;
        }
        if (
          support.sources.some(
            (r) => r.id !== current.id && r.channelCode === channelCode,
          )
        ) {
          message.error('渠道编码已存在');
          return;
        }
        const next: Source = {
          ...current,
          ...values,
          channelCode,
          name,
          id: current.id || 'RS-DEMO-' + newId(),
          updatedAt: stamp(),
          createdAt: current.createdAt || stamp(),
        };
        const sources = current.id
          ? support.sources.map((r) => (r.id === current.id ? next : r))
          : [...support.sources, next];
        if (
          commit(
            { ...support, sources },
            next.id,
            current.id ? '编辑注册来源' : '新增注册来源',
            current.id ? current : null,
            next,
          )
        ) {
          setEditing(null);
          setDirty(false);
        }
      } else {
        const current = editing as Level;
        const next: Level = { ...current, ...values, name: current.name };
        if (
          commit(
            {
              ...support,
              levels: support.levels.map((r) => (r.id === next.id ? next : r)),
            },
            next.id,
            '编辑会员等级',
            current,
            next,
          )
        ) {
          setEditing(null);
          setDirty(false);
        }
      }
    } catch (error) {
      if (error instanceof Error) message.error(error.message);
    } finally {
      setBusy(false);
    }
  }
  function reorder(target: string) {
    if (!dragged || dragged === target || denied) return;
    const enabled = support.levels.filter((r) => r.enabled),
      from = enabled.findIndex((r) => r.id === dragged),
      to = enabled.findIndex((r) => r.id === target);
    if (from < 0 || to < 0) return;
    const reordered = [...enabled],
      moved = reordered.splice(from, 1)[0];
    reordered.splice(to, 0, moved);
    commit(
      {
        ...support,
        levels: [...reordered, ...support.levels.filter((r) => !r.enabled)],
      },
      'member-level-order',
      '调整会员等级排序',
      enabled.map((r) => r.id),
      reordered.map((r) => r.id),
    );
    setDragged('');
  }
  const displayed =
    localState === 'empty'
      ? []
      : [...support.sources].sort((a, b) => a.order - b.order);
  const sourceColumns: ColumnsType<Source> = [
    { title: '来源编码', dataIndex: 'id', width: 150 },
    {
      title: '渠道名称',
      render: (_, r) => (
        <>
          <strong>{r.name}</strong>
          <small className="us-sub">{r.channelCode}</small>
        </>
      ),
      width: 220,
    },
    { title: '排序', dataIndex: 'order', width: 90 },
    { title: '创建时间', dataIndex: 'createdAt', width: 175 },
    { title: '更新时间', dataIndex: 'updatedAt', width: 175 },
    {
      title: '操作',
      width: 120,
      render: (_, r) => (
        <Space size={2}>
          <Button type="link" disabled={denied} onClick={() => edit(r)}>
            编辑
          </Button>
          <Button
            type="link"
            danger
            disabled={denied || sourceBound(r)}
            title={sourceBound(r) ? '该渠道已关联用户，不能删除' : undefined}
            onClick={() =>
              modal.confirm({
                title: '删除注册来源？',
                content: '删除 ' + r.name + '。历史用户的注册来源保留。',
                okText: '删除',
                okButtonProps: { danger: true },
                cancelText: '取消',
                onOk: () => {
                  if (sourceBound(r)) {
                    message.error('该渠道已关联用户，不能删除');
                    return Promise.reject();
                  }
                  if (
                    !commit(
                      {
                        ...support,
                        sources: support.sources.filter((x) => x.id !== r.id),
                      },
                      r.id,
                      '删除注册来源',
                      r,
                      null,
                    )
                  )
                    return Promise.reject();
                  setPagination((p) => ({
                    ...p,
                    current: Math.max(
                      1,
                      Math.min(
                        p.current,
                        Math.ceil((support.sources.length - 1) / p.pageSize),
                      ),
                    ),
                  }));
                },
              })
            }
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];
  const managedUsers = readManagedUsers();
  const managedPoints: OpRow[] = managedUsers.flatMap((u) =>
    u.ledger
      .filter((l) => l.kind !== '初始演示余额')
      .map((l) => ({
        id: l.id,
        name: l.reason,
        status: '已到账',
        type: l.kind,
        order: 0,
        user: u.id,
        userName: u.name,
        points: l.change,
        optionType: l.change > 0 ? '手动调整' : '扣减',
        source: u.id,
        bizNo: l.id,
        sourceType: '用户',
        at: l.date,
        expires: l.expires,
        reason: l.reason,
        balance:
          'beforeBalance' in l && 'afterBalance' in l
            ? String(l.beforeBalance) + ' → ' + String(l.afterBalance)
            : String(
                u.points -
                  u.ledger
                    .slice(
                      0,
                      u.ledger.findIndex((entry) => entry.id === l.id) + 1,
                    )
                    .reduce((total, entry) => total + entry.change, 0),
              ) +
              ' → ' +
              String(
                u.points -
                  u.ledger
                    .slice(
                      0,
                      u.ledger.findIndex((entry) => entry.id === l.id),
                    )
                    .reduce((total, entry) => total + entry.change, 0),
              ),
      })),
  );
  const allPoints = [
    ...operations.rows.points,
    ...managedPoints.filter(
      (r) => !operations.rows.points.some((o) => o.id === r.id),
    ),
  ].sort((a, b) => recordTime(b).localeCompare(recordTime(a)));
  const pointRows =
    localState === 'empty'
      ? []
      : allPoints.filter(
          (r) =>
            (!applied.record || r.id === applied.record.trim()) &&
            (!applied.bizNo || text(r.bizNo || r.source) === applied.bizNo.trim()) &&
            (!applied.user ||
              text(r.user)
                .toLowerCase()
                .includes(applied.user.trim().toLowerCase())) &&
            (!applied.source ||
              text(r.source).includes(applied.source.trim())) &&
            (!applied.sourceType ||
              text(r.sourceType || r.type) === applied.sourceType) &&
            (!applied.direction ||
              (pointValue(r) >= 0 ? '增加' : '扣减') === applied.direction) &&
            (!applied.type || businessType(r) === applied.type) &&
            (!applied.from || recordTime(r).slice(0, 10) >= applied.from) &&
            (!applied.to || recordTime(r).slice(0, 10) <= applied.to),
        );
  const pointColumns: ColumnsType<OpRow> = [
    { title: '流水 ID', dataIndex: 'id', width: 150 },
    {
      title: '用户',
      width: 170,
      render: (_, r) => (
        <UserIdentity
          id={text(r.user)}
          name={managedUsers.find((u) => u.id === text(r.user))?.name}
        />
      ),
    },
    {
      title: '方向',
      width: 80,
      render: (_, r) => (pointValue(r) >= 0 ? '增加' : '扣减'),
    },
    { title: '状态', dataIndex: 'status', width: 110 },
    { title: '业务类型', width: 120, render: (_, r) => businessType(r) },
    {
      title: '业务单号',
      width: 165,
      render: (_, r) => text(r.bizNo || r.source) || '—',
    },
    {
      title: '来源',
      width: 160,
      render: (_, r) => (
        <>
          {r.name}
          <small className="us-sub">{text(r.source)}</small>
        </>
      ),
    },
    {
      title: '积分变化',
      width: 100,
      render: (_, r) => (
        <span className={pointValue(r) >= 0 ? 'us-positive' : 'us-negative'}>
          {pointValue(r) > 0 ? '+' : ''}
          {pointValue(r)}
        </span>
      ),
    },
    { title: '余额变化', width: 120, render: (_, r) => text(r.balance) || '—' },
    {
      title: '到期时间',
      width: 165,
      render: (_, r) => text(r.expires || r.expiresAt) || '—',
    },
    {
      title: '变更原因',
      width: 180,
      ellipsis: true,
      render: (_, r) => text(r.reason || r.name) || '—',
    },
    { title: '变更时间', width: 170, render: (_, r) => recordTime(r) || '—' },
  ];
  const invitation = readEventConfigs().find((r) => r.code === 'invite_reward');
  const retainedRelations = operations.rows.invite.filter(
    (r) => r.type === '邀请关系',
  );
  const managedRelations: OpRow[] = managedUsers
    .filter((u) => u.inviter)
    .map((u) => ({
      id: 'iv-user-' + u.id,
      name: '邀请关系',
      status: '已注册',
      type: '邀请关系',
      order: 0,
      inviter: u.inviter,
      invitee: u.id,
      stage: '注册完成',
      reward: '待判定',
      points: 0,
      at: u.date,
    }));
  const relationships = [
    ...retainedRelations,
    ...managedRelations.filter(
      (r) =>
        !retainedRelations.some(
          (x) => x.inviter === r.inviter && x.invitee === r.invitee,
        ),
    ),
  ];
  const inviters: Inviter[] = [];
  for (const r of relationships) {
    const id = text(r.inviter),
      existing = inviters.find((x) => x.id === id);
    if (existing) existing.records.push(r);
    else
      inviters.push({
        id,
        count: 0,
        activated: 0,
        points: 0,
        pending: 0,
        at: '',
        records: [r],
      });
  }
  for (const r of inviters) {
    r.count = r.records.length;
    r.activated = r.records.filter((x) => x.status === '有效').length;
    r.points = r.records
      .filter((x) => x.reward === '已到账')
      .reduce((n, x) => n + num(x.points), 0);
    r.pending = r.records
      .filter((x) => x.reward !== '已到账')
      .reduce((n, x) => n + num(x.points), 0);
    r.at = r.records.map(recordTime).sort().at(-1) || '';
  }
  const inviteRows =
    localState === 'empty'
      ? []
      : inviters.filter(
          (r) =>
            !applied.user ||
            r.id.toLowerCase().includes(applied.user.toLowerCase()),
        );
  const currentInvite = inviteDetail
    ? inviters.find((r) => r.id === inviteDetail.id)
    : null;
  const paginationProps = {
    ...pagination,
    showSizeChanger: true,
    pageSizeOptions: [20, 50, 100],
    showQuickJumper: false,
    showTotal: (n: number) => `共 ${n} 条`,
    onChange: (current: number, pageSize: number) =>
      setPagination({ current, pageSize }),
  };
  function search() {
    setApplied({ ...filter });
    setPagination((p) => ({ ...p, current: 1 }));
  }
  const filters = (
    <div className="us-filter">
      <Space wrap>
        <Input
          placeholder={pointPage ? '流水 ID' : '邀请人用户 ID'}
          aria-label={pointPage ? '流水 ID' : '邀请人用户 ID'}
          value={pointPage ? filter.record : filter.user}
          onChange={(e) =>
            setFilter({
              ...filter,
              ...(pointPage
                ? { record: e.target.value }
                : { user: e.target.value }),
            })
          }
          onPressEnter={search}
        />
        {pointPage && (
          <>
            <Input
              aria-label="用户 ID"
              placeholder="用户 ID"
              value={filter.user}
              onChange={(e) => setFilter({ ...filter, user: e.target.value })}
              onPressEnter={search}
            />
            <Select
              aria-label="积分方向"
              placeholder="全部方向"
              allowClear
              value={filter.direction}
              onChange={(direction) => setFilter({ ...filter, direction })}
              options={['增加', '扣减'].map((value) => ({
                value,
                label: value,
              }))}
            />
            <Select
              aria-label="业务类型"
              placeholder="全部业务类型"
              allowClear
              value={filter.type}
              onChange={(type) => setFilter({ ...filter, type })}
              options={[
                ...new Set([...pointsOptions, ...allPoints.map(businessType)]),
              ].map((value) => ({ value, label: value }))}
            />
          </>
        )}
        <Button type="primary" onClick={search}>
          搜索
        </Button>
        <Button
          onClick={() => {
            setFilter(blankFilter());
            setApplied(blankFilter());
            setPagination((p) => ({ ...p, current: 1 }));
          }}
        >
          重置
        </Button>
        {pointPage && (
          <Button type="link" onClick={() => setMore(!more)}>
            {more ? '收起筛选' : '更多筛选'}
          </Button>
        )}
      </Space>
      {pointPage && more && (
        <Space wrap className="us-more">
          <Input aria-label="业务单号" placeholder="业务单号" value={filter.bizNo} onChange={(e) => setFilter({ ...filter, bizNo: e.target.value })} onPressEnter={search} />
          <Select
            aria-label="来源类型"
            placeholder="全部来源类型"
            allowClear
            value={filter.sourceType}
            onChange={(sourceType) => setFilter({ ...filter, sourceType })}
            options={[
              ...new Set(allPoints.map((r) => text(r.sourceType || r.type))),
            ].map((value) => ({ value, label: value }))}
          />
          <Input
            aria-label="来源对象 ID"
            placeholder="来源对象 ID"
            value={filter.source}
            onChange={(e) => setFilter({ ...filter, source: e.target.value })}
          />
          <DatePicker.RangePicker
            value={
              filter.from && filter.to
                ? [dayjs(filter.from), dayjs(filter.to)]
                : null
            }
            onChange={(_, dates) =>
              setFilter({ ...filter, from: dates[0], to: dates[1] })
            }
          />
        </Space>
      )}
    </div>
  );
  if(['no-permission','permission-denied'].includes(localState))return <Result status="403" title="暂无查看权限"/>;
  return (
    <section className="us-root">
      {denied && <Alert type="warning" showIcon title="当前权限仅可查看" />}
      {['error', 'load-failed'].includes(localState) ? (
        <Alert
          type="error"
          showIcon
          title="加载失败，请重试"
          action={
            <Button
              onClick={() => {
                setSupport(readUserSupport());
                setOperations(readOperations());
                setLocalState('normal');
              }}
            >
              重新加载
            </Button>
          }
        />
      ) : (
        <>
          {sourcePage && (
            <>
              <div className="us-toolbar">
                <Button
                  type="primary"
                  disabled={denied}
                  onClick={() =>
                    edit({
                      id: '',
                      channelCode: '',
                      name: '',
                      order: 10,
                      createdAt: '',
                      updatedAt: '',
                    })
                  }
                >
                  新增注册来源
                </Button>
              </div>
              <Table
                size="small"
                rowKey="id"
                loading={localState === 'loading'}
                columns={sourceColumns}
                dataSource={displayed}
                scroll={{ x: 940 }}
                pagination={paginationProps}
                locale={{ emptyText: <Empty description="暂无注册来源" /> }}
              />
            </>
          )}
          {levelPage &&
            (localState === 'loading' ? (
              <Spin description="加载中">
                <div style={{ height: 180 }} />
              </Spin>
            ) : localState === 'empty' ? (
              <Empty description="暂无会员等级" />
            ) : (
              <div className="us-levels" aria-busy={localState === 'loading'}>
                {support.levels.map((r, i) => (
                  <Card
                    key={r.id}
                    size="small"
                    className={'us-level us-level-' + r.id.slice(-1)}
                    draggable={r.enabled && !denied}
                    onDragStart={() => setDragged(r.id)}
                    onDragOver={(e) => {
                      if (r.enabled) e.preventDefault();
                    }}
                    onDrop={() => reorder(r.id)}
                    title={
                      <span>
                        {r.name.toUpperCase()}
                        <Tag color={r.enabled ? 'green' : 'default'}>
                          {r.enabled ? '启用' : '停用'}
                        </Tag>
                      </span>
                    }
                    extra={
                      <Button
                        type="link"
                        disabled={denied}
                        onClick={() => edit(r)}
                      >
                        编辑
                      </Button>
                    }
                  >
                    <Descriptions
                      column={1}
                      size="small"
                      items={[
                        {
                          key: 'growth',
                          label: '升级成长值',
                          children: r.growth,
                        },
                        {
                          key: 'points',
                          label: '签到奖励积分',
                          children: r.points,
                        },
                        {
                          key: 'expiry',
                          label: '签到奖励有效期',
                          children: r.expireDays + ' 天',
                        },
                      ]}
                    />
                    <Space>
                      <Switch
                        aria-label={r.name + '是否启用'}
                        checked={r.enabled}
                        disabled={denied}
                        onChange={(enabled) =>
                          modal.confirm({
                            title: enabled
                              ? '启用此会员等级？'
                              : '停用此会员等级？',
                            content: enabled
                              ? '启用后参与会员等级排序。'
                              : '停用后无法使用，不参与会员等级排序。',
                            okText: '确认',
                            cancelText: '取消',
                            onOk: () => {
                              if (
                                !commit(
                                  {
                                    ...support,
                                    levels: support.levels.map((x) =>
                                      x.id === r.id ? { ...x, enabled } : x,
                                    ),
                                  },
                                  r.id,
                                  enabled ? '启用会员等级' : '停用会员等级',
                                  r,
                                  { ...r, enabled },
                                )
                              )
                                return Promise.reject();
                            },
                          })
                        }
                      />
                      <Button
                        type="link"
                        disabled={
                          denied ||
                          !r.enabled ||
                          !support.levels.slice(0, i).some((x) => x.enabled)
                        }
                        onClick={() => {
                          setDragged(r.id);
                          const enabled = support.levels.filter(
                              (x) => x.enabled,
                            ),
                            index = enabled.findIndex((x) => x.id === r.id);
                          const next = [...enabled];
                          [next[index - 1], next[index]] = [
                            next[index],
                            next[index - 1],
                          ];
                          commit(
                            {
                              ...support,
                              levels: [
                                ...next,
                                ...support.levels.filter((x) => !x.enabled),
                              ],
                            },
                            'member-level-order',
                            '调整会员等级排序',
                            enabled.map((x) => x.id),
                            next.map((x) => x.id),
                          );
                          setDragged('');
                        }}
                      >
                        上移
                      </Button>
                    </Space>
                  </Card>
                ))}
              </div>
            ))}
          {pointPage && (
            <>
              <div className="us-toolbar">
                <Button
                  type="primary"
                  disabled={denied}
                  onClick={() => {
                    setExpiryDraft(structuredClone(support.expiry));
                    setExpiryOpen(true);
                    setDirty(false);
                  }}
                >
                  有效期配置
                </Button>
              </div>
              {filters}
              <Table
                size="small"
                rowKey="id"
                loading={localState === 'loading'}
                columns={pointColumns}
                dataSource={pointRows}
                scroll={{ x: 1680 }}
                pagination={paginationProps}
                locale={{ emptyText: <Empty description="暂无积分记录" /> }}
              />
            </>
          )}
          {!sourcePage && !levelPage && !pointPage && (
            <>
              <div className="us-toolbar">
                <Button
                  onClick={() => {
                    setOperations(readOperations());
                    message.success('已刷新');
                  }}
                >
                  刷新
                </Button>
                <Button
                  type="link"
                  onClick={() => go('op-events?code=invite_reward')}
                >
                  邀请活动配置
                </Button>
              </div>
              <Descriptions
                className="us-activity"
                column={4}
                size="small"
                items={[
                  {
                    key: 'name',
                    label: '当前活动',
                    children: invitation?.name || '邀请有礼',
                  },
                  {
                    key: 'status',
                    label: '活动状态',
                    children: invitation?.status || '—',
                  },
                  {
                    key: 'date',
                    label: '活动时间',
                    children: invitation
                      ? [invitation.start_time, invitation.end_time]
                          .filter(Boolean)
                          .join(' 至 ') || '长期有效'
                      : '—',
                  },
                  {
                    key: 'points',
                    label: '最高奖励',
                    children: invitation
                      ? invitation.max_points + ' 积分'
                      : '—',
                  },
                ]}
              />
              {filters}
              <Table
                size="small"
                rowKey="id"
                loading={localState === 'loading'}
                dataSource={inviteRows}
                scroll={{ x: 920 }}
                pagination={paginationProps}
                columns={[
                  {
                    title: '邀请人',
                    width: 200,
                    render: (_, r: Inviter) => (
                      <UserIdentity
                        id={r.id}
                        name={managedUsers.find((u) => u.id === r.id)?.name}
                      />
                    ),
                  },
                  { title: '累计邀请', dataIndex: 'count' },
                  { title: '已激活', dataIndex: 'activated' },
                  {
                    title: '累计奖励',
                    render: (_, r: Inviter) => r.points + ' 积分',
                  },
                  { title: '最近邀请时间', dataIndex: 'at', width: 180 },
                  {
                    title: '操作',
                    width: 100,
                    render: (_, r: Inviter) => (
                      <Button type="link" onClick={() => setInviteDetail(r)}>
                        查看记录
                      </Button>
                    ),
                  },
                ]}
              />
            </>
          )}
        </>
      )}
      <Modal
        title={
          sourcePage
            ? editing?.id
              ? '编辑注册来源'
              : '新增注册来源'
            : '编辑会员等级'
        }
        open={!!editing}
        onCancel={closeEditor}
        onOk={save}
        confirmLoading={busy}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: denied }}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={() => setDirty(true)}
        >
          {sourcePage ? (
            <>
              {editing?.id && (
                <Form.Item label="来源编码" name="id">
                  <Input disabled />
                </Form.Item>
              )}
              <Form.Item
                name="channelCode"
                label="渠道编码"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入渠道编码',
                  },
                  { max: 64 },
                ]}
              >
                <Input
                  maxLength={64}
                  disabled={!!editing?.id && sourceBound(editing as Source)}
                />
              </Form.Item>
              <Form.Item
                name="name"
                label="渠道名称"
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: '请输入渠道名称',
                  },
                  { max: 64 },
                ]}
              >
                <Input maxLength={64} />
              </Form.Item>
              <Form.Item
                name="order"
                label="排序"
                rules={[{ required: true, message: '请输入排序值' }]}
              >
                <InputNumber precision={0} />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item name="name" label="等级名称">
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="growth"
                label="成长值"
                rules={[{ required: true }, { type: 'number', min: 0 }]}
              >
                <InputNumber min={0} />
              </Form.Item>
              <Form.Item
                name="points"
                label="签到奖励积分"
                rules={[{ required: true }, { type: 'integer', min: 0 }]}
              >
                <InputNumber min={0} precision={0} />
              </Form.Item>
              <Form.Item
                name="expireDays"
                label="签到奖励有效天数"
                rules={[{ required: true }, { type: 'integer', min: 1 }]}
              >
                <InputNumber min={1} precision={0} />
              </Form.Item>
              <Form.Item
                name="enabled"
                label="是否启用"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
      <Modal
        title="积分有效期配置"
        open={expiryOpen}
        onCancel={closeEditor}
        width={700}
        okText="保存配置"
        cancelText="取消"
        okButtonProps={{ disabled: denied }}
        onOk={() => {
          if (
            expiryDraft.some((r) => !Number.isInteger(r.days) || r.days < 1)
          ) {
            message.error('有效天数必须为正整数');
            return;
          }
          if (
            commit(
              { ...support, expiry: expiryDraft },
              'limit-points-expire-config',
              '保存积分有效期配置',
              support.expiry,
              expiryDraft,
            )
          ) {
            setExpiryOpen(false);
            setDirty(false);
          }
        }}
      >
        <Table
          rowKey="id"
          size="small"
          pagination={false}
          dataSource={expiryDraft}
          columns={[
            { title: '业务来源', dataIndex: 'name' },
            { title: '来源类型', dataIndex: 'id' },
            {
              title: '当前有效期',
              render: (_, r: Expiry) => (
                <InputNumber
                  aria-label={r.name + '有效天数'}
                  min={1}
                  precision={0}
                  suffix="天"
                  value={r.days}
                  onChange={(value) => {
                    setExpiryDraft((rows) =>
                      rows.map((x) =>
                        x.id === r.id ? { ...x, days: value ?? 0 } : x,
                      ),
                    );
                    setDirty(true);
                  }}
                />
              ),
            },
            {
              title: '默认值',
              render: (_, r: Expiry) => r.defaultDays + ' 天',
            },
          ]}
        />
      </Modal>
      <Drawer
        title="邀请详情"
        open={!!currentInvite}
        onClose={() => setInviteDetail(null)}
        size={860}
      >
        {currentInvite && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              items={[
                {
                  key: 'user',
                  label: '邀请人',
                  children: (
                    <UserIdentity
                      id={currentInvite.id}
                      name={
                        managedUsers.find((u) => u.id === currentInvite.id)
                          ?.name
                      }
                    />
                  ),
                },
                {
                  key: 'count',
                  label: '累计邀请',
                  children: currentInvite.count,
                },
                {
                  key: 'active',
                  label: '已激活',
                  children: currentInvite.activated,
                },
                {
                  key: 'total',
                  label: '累计获得',
                  children: currentInvite.points + ' 积分',
                },
                {
                  key: 'pending',
                  label: '待发奖励',
                  children: currentInvite.pending + ' 积分',
                },
                {
                  key: 'daily',
                  label: '今日配额',
                  children:
                    invitation?.tasks.find(
                      (t) => t.quota_rule.scope === 'per_day',
                    )?.quota_rule.limit ?? '—',
                },
                {
                  key: 'monthly',
                  label: '本月配额',
                  children:
                    invitation?.tasks.find(
                      (t) => t.quota_rule.scope === 'per_month',
                    )?.quota_rule.limit ?? '—',
                },
                {
                  key: 'inviter',
                  label: '我的邀请人',
                  children: relationships.some(
                    (r) => text(r.invitee) === currentInvite.id,
                  ) ? (
                    <UserIdentity
                      id={text(
                        relationships.find(
                          (r) => text(r.invitee) === currentInvite.id,
                        )?.inviter,
                      )}
                    />
                  ) : (
                    '—'
                  ),
                },
              ]}
            />
            <div className="us-rewards">
              <Space wrap>
                {invitation?.tasks.map((t) => (
                  <Tag key={t.task_code}>
                    {t.name}：
                    {t.reward_points > 0 ? t.reward_points + ' 积分' : '未配置'}
                  </Tag>
                ))}
              </Space>
            </div>
            <Table
              rowKey="id"
              size="small"
              dataSource={currentInvite.records}
              scroll={{ x: 720 }}
              pagination={{
                defaultPageSize: 20,
                showSizeChanger: true,
                pageSizeOptions: [20, 50, 100],
                showQuickJumper: false,
              }}
              columns={[
                {
                  title: '被邀请人',
                  width: 190,
                  render: (_, r: OpRow) => (
                    <UserIdentity
                      id={text(r.invitee)}
                      name={
                        managedUsers.find((u) => u.id === text(r.invitee))?.name
                      }
                    />
                  ),
                },
                {
                  title: '邀请时间',
                  width: 165,
                  render: (_, r: OpRow) => recordTime(r),
                },
                {
                  title: '阶段状态',
                  width: 250,
                  render: (_, r: OpRow) => (
                    <Space wrap>
                      {['注册', '互动', '发布'].map((label) => (
                        <Tag key={label}>
                          {label} · {invitationStage(r, label)}
                        </Tag>
                      ))}
                    </Space>
                  ),
                },
                {
                  title: '实际奖励',
                  render: (_, r: OpRow) =>
                    r.reward === '已到账' ? num(r.points) + ' 积分' : '0 积分',
                },
              ]}
            />
          </>
        )}
      </Drawer>
    </section>
  );
}

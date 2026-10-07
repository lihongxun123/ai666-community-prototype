'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Alert,
  Button,
  Card,
  Checkbox,
  Collapse,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Result,
  Segmented,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import { ActivityDetail } from './activity-detail';
import {
  blankEventConfig,
  deleteEventConfig,
  readEventConfigs,
  type EventConfig,
  type EventType,
} from './retained-event-config';
import {
  appendLog,
  eventRow,
  publishEvent,
  readOperations,
  writeOperations,
} from './operations-model';
import { MediaUpload } from './media-upload';
import { MarkdownEditor } from './markdown-editor';
import './activity-management.css';

type QuotaStage = {
  total_points?: number;
  register?: number;
  interact?: number;
  publish?: number;
};
type AdminConfig = EventConfig & {
  unlock_rule: EventConfig['unlock_rule'] & {
    period_key?: string;
    unlocks?: string[];
    requirement_conditions?: Record<
      string,
      { all_tasks_claimed?: boolean; all_tasks_completed?: boolean }
    >;
  };
  extra_config: EventConfig['extra_config'] & {
    settle_cycle?: string;
    settle_time?: string;
    quota_config?: NonNullable<EventConfig['extra_config']['quota_config']> & {
      daily?: QuotaStage;
      monthly?: QuotaStage;
    };
    publish_config: EventConfig['extra_config']['publish_config'] & {
      min_title_length?: number;
    };
  };
};
const typeOptions = [
  { value: 'long_term', label: '长期活动' },
  { value: 'referral', label: '邀请裂变' },
  { value: 'campaign', label: '档期活动' },
];
const labels: Record<EventType, string> = {
  long_term: '长期活动',
  referral: '邀请裂变',
  campaign: '档期活动',
  archive: '往期归档',
};
const protectedCodes = [
  'newbie_task',
  'growth_7day',
  'invite_reward',
  'ai_image_challenge',
  'prompt_co_creation',
];
const emptyFilters = { code: '', keyword: '', type: '', status: '' };
let listState = {
  filters: emptyFilters,
  applied: emptyFilters,
  pagination: { current: 1, pageSize: 20 },
};
const displayStatus = (c: EventConfig) =>
  c.status_text ||
  (c.status === '进行中' && c.start_time && dayjs(c.start_time).isAfter(dayjs())
    ? '未开始'
    : c.status === '进行中' && c.end_time && !dayjs(c.end_time).isAfter(dayjs())
      ? '已结束'
      : c.status);

export function ActivityManagement({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (target: string) => void;
}) {
  const { message, modal } = App.useApp();
  const [rows, setRows] = useState<EventConfig[]>(readEventConfigs),
    [filters, setFilters] = useState(listState.filters),
    [applied, setApplied] = useState(listState.applied),
    [pagination, setPagination] = useState(listState.pagination),
    [recovered, setRecovered] = useState(false);
  const q = new URLSearchParams(
      typeof location === 'undefined' ? '' : location.search,
    ),
    code = q.get('code') || q.get('id')?.replace(/^ev-/, '') || '';
  const selected = rows.find((c) => c.code === code);
  const [draft, setDraft] = useState<AdminConfig | null>(() =>
      page === 'op-event-edit'
        ? (structuredClone(selected || blankEventConfig()) as AdminConfig)
        : null,
    ),
    [original, setOriginal] = useState(() =>
      page === 'op-event-edit'
        ? JSON.stringify(selected || blankEventConfig())
        : '',
    ),
    [editing, setEditing] = useState(!!selected),
    [saving, setSaving] = useState(false),
    [uploadMode, setUploadMode] = useState(false);
  const [form] = Form.useForm();
  const bypassNav = useRef(false);
  const latest = useRef(draft);
  useEffect(() => {
    latest.current = draft;
  }, [draft]);
  const dirty = !!draft && JSON.stringify(draft) !== original;
  const failed =
    (state === 'save-failed' || state === 'conflict') && !recovered;
  useEffect(() => {
    listState = { filters, applied, pagination };
  }, [filters, applied, pagination]);
  const refresh = () => setRows(readEventConfigs());
  useEffect(() => {
    window.addEventListener('bp-operations-change', refresh);
    return () => window.removeEventListener('bp-operations-change', refresh);
  }, []);
  const close = () => {
    if (saving) {
      message.warning('活动正在保存，请稍候');
      return;
    }
    const done = () => {
      bypassNav.current = true;
      setDraft(null);
      if (page === 'op-event-edit') go('op-events');
    };
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        content: '当前活动修改尚未保存。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: done,
      });
    else done();
  };
  useEffect(() => {
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    const nav = (e: Event) => {
      if (bypassNav.current || (!dirty && !saving)) return;
      e.preventDefault();
      if (saving) {
        message.warning('活动正在保存，请稍候');
        return;
      }
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          bypassNav.current = true;
          setDraft(null);
          (e as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    window.addEventListener('beforeunload', unload);
    window.addEventListener('prototype-before-navigate', nav);
    return () => {
      window.removeEventListener('beforeunload', unload);
      window.removeEventListener('prototype-before-navigate', nav);
    };
  }, [dirty, saving, message, modal]);
  const open = (c?: EventConfig) => {
    const next = structuredClone(c || blankEventConfig()) as AdminConfig;
    setDraft(next);
    setOriginal(JSON.stringify(next));
    setEditing(!!c);
    setUploadMode(false);
    bypassNav.current = false;
    form.resetFields();
  };
  const set = <K extends keyof AdminConfig>(key: K, value: AdminConfig[K]) =>
    setDraft((c) => (c ? { ...c, [key]: value } : c));
  const unlock = (value: Partial<AdminConfig['unlock_rule']>) =>
    setDraft((c) =>
      c ? { ...c, unlock_rule: { ...c.unlock_rule, ...value } } : c,
    );
  const extra = (value: Partial<AdminConfig['extra_config']>) =>
    setDraft((c) =>
      c ? { ...c, extra_config: { ...c.extra_config, ...value } } : c,
    );
  const publishing = (
    value: Partial<AdminConfig['extra_config']['publish_config']>,
  ) =>
    setDraft((c) =>
      c
        ? {
            ...c,
            extra_config: {
              ...c.extra_config,
              publish_config: { ...c.extra_config.publish_config, ...value },
            },
          }
        : c,
    );
  const saveConfig = (c: EventConfig, action: string) => {
    publishEvent(c);
    const db = readOperations();
    writeOperations(
      appendLog(
        {
          ...db,
          rows: {
            ...db.rows,
            events: db.rows.events.some((r) => r.id === c.code)
              ? db.rows.events.map((r) => (r.id === c.code ? eventRow(c) : r))
              : [eventRow(c), ...db.rows.events],
          },
        },
        'events',
        c.code,
        action,
        '更新活动配置',
      ),
    );
    refresh();
  };
  const save = async () => {
    if (!draft || saving) return;
    try {
      await form.validateFields();
      if (!draft.name.trim()) throw new Error('请输入活动名称');
      if (!/^[a-z][a-z0-9_]{2,63}$/.test(draft.code))
        throw new Error(
          '活动编码须为 3—64 位小写英文、数字和下划线，并以字母开头',
        );
      if (!draft.cover_url.trim()) throw new Error('请上传或输入封面图 URL');
      if (!editing && rows.some((r) => r.code === draft.code))
        throw new Error('活动编码已存在，请更换编码');
      if (
        ['campaign', 'archive'].includes(draft.type) &&
        (!draft.start_time ||
          !draft.end_time ||
          dayjs(draft.end_time).valueOf() <= dayjs(draft.start_time).valueOf())
      )
        throw new Error('请选择有效活动时间，结束时间必须晚于开始时间');
      if (draft.extra_config.streak_config) {
        if (
          draft.type !== 'long_term' ||
          draft.unlock_rule.duration_days !== 14
        )
          throw new Error('连续创作挑战须为长期活动，参与窗口为 14 天');
        if (
          draft.status === '进行中' &&
          ['aigc.generation_success', 'work.publish'].some(
            (event) =>
              !draft.tasks.some(
                (t) =>
                  t.event_type === event &&
                  t.target_count === 1 &&
                  t.quota_rule.scope === 'per_day' &&
                  t.quota_rule.limit === 1,
              ),
          )
        )
          throw new Error('启用前请在活动任务中配置每日生成和每日发布两条任务');
      }
      if (
        !Number.isInteger(draft.max_points) ||
        draft.max_points < 0 ||
        !Number.isInteger(draft.sort_order) ||
        draft.sort_order < 0
      )
        throw new Error('展示积分和排序须为非负整数');
      if (
        draft.unlock_rule.duration_days !== undefined &&
        (!Number.isInteger(draft.unlock_rule.duration_days) ||
          draft.unlock_rule.duration_days < 0)
      )
        throw new Error('解锁后有效天数须为非负整数');
      for (const v of [
        draft.extra_config.publish_config.min_image_count,
        draft.extra_config.publish_config.min_video_count,
        draft.extra_config.publish_config.title_min_len,
        ...Object.values(draft.extra_config.quota_config?.daily || {}),
        ...Object.values(draft.extra_config.quota_config?.monthly || {}),
        ...(draft.extra_config.streak_config?.milestones.map((m) => m.points) ||
          []),
      ])
        if (v !== undefined && (!Number.isInteger(v) || v < 0))
          throw new Error('规则中的积分、数量和长度须为非负整数');
      if (failed)
        throw new Error(
          state === 'conflict'
            ? '配置存在更新冲突，请核对后重试'
            : '保存失败，填写内容已保留，请重试',
        );
      setSaving(true);
      const next = {
        ...draft,
        name: draft.name.trim(),
        cover_url: draft.cover_url.trim(),
      };
      delete next.status_text;
      saveConfig(next, editing ? '编辑活动' : '新建活动');
      setOriginal(JSON.stringify(next));
      bypassNav.current = true;
      setDraft(null);
      setRecovered(true);
      message.success(editing ? '编辑活动成功' : '新建活动成功');
      if (page === 'op-event-edit') go('op-events');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '保存失败，请重试');
      if (failed) setRecovered(true);
    } finally {
      setSaving(false);
    }
  };
  const remove = (c: EventConfig) => {
    if (protectedCodes.includes(c.code)) {
      message.warning('内置活动不可删除');
      return;
    }
    if (c.status === '进行中') {
      message.warning('进行中的活动不可删除');
      return;
    }
    modal.confirm({
      title: `删除活动「${c.name}」？`,
      content: '删除后无法继续参与该活动，请确认。',
      okText: '删除',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        if (state === 'save-failed' && !recovered) {
          message.error('删除失败，请重试');
          setRecovered(true);
          return Promise.reject(new Error('delete failed'));
        }
        try {
          deleteEventConfig(c.code);
          const db = readOperations();
          writeOperations(
            appendLog(
              {
                ...db,
                rows: {
                  ...db.rows,
                  events: db.rows.events.filter((r) => r.id !== c.code),
                },
              },
              'events',
              c.code,
              '删除活动',
              '删除活动配置',
            ),
          );
          refresh();
          message.success('删除成功');
          if (code === c.code) go('op-events');
        } catch {
          message.error('删除失败，请重试');
          return Promise.reject(new Error('delete failed'));
        }
      },
    });
  };
  const preset = () => {
    if (!draft) return;
    setDraft({
      ...draft,
      name: draft.name || '7日连续创作挑战',
      code: draft.code || 'creation_streak_7day',
      type: 'long_term',
      unlock_rule: { ...draft.unlock_rule, duration_days: 14 },
      extra_config: {
        ...draft.extra_config,
        publish_config: {
          ...draft.extra_config.publish_config,
          biz_type: 'work',
          content_types: [2, 3, 4],
          media_types: ['image', 'video'],
          require_join_token: true,
        },
        streak_config: {
          timezone: 'Asia/Shanghai',
          milestones: [
            { days: 3, points: 30 },
            { days: 5, points: 50 },
            { days: 7, points: 100 },
          ],
        },
      },
    });
    message.success('已补齐推荐配置，请确认活动编码和积分');
  };
  const visible = (
    state === 'empty' && !recovered
      ? []
      : [...rows].sort((a, b) => b.sort_order - a.sort_order)
  ).filter(
    (c) =>
      (!applied.code || c.code === applied.code.trim()) &&
      (!applied.keyword ||
        c.name.toLowerCase().includes(applied.keyword.trim().toLowerCase())) &&
      (!applied.type || c.type === applied.type) &&
      (!applied.status || displayStatus(c) === applied.status),
  );
  const selectedOptions = rows
    .filter((c) => c.code !== draft?.code)
    .map((c) => ({ value: c.code, label: c.name }));
  const tagOptions = (type: string, values: string[]) => {
    const opts = readOperations()
      .rows.taxonomy.filter((r) => r.type === type && r.status === '启用')
      .map((r) => ({
        value: typeof r.code === 'string' ? r.code : r.id,
        label: r.name,
      }));
    return [
      ...opts,
      ...values
        .filter((v) => !opts.some((o) => o.value === v))
        .map((v) => ({ value: v, label: v })),
    ];
  };
  const config = draft?.extra_config.publish_config;
  const numberField = (
    label: string,
    value: number | undefined,
    onChange: (v: number | undefined) => void,
    min = 0,
  ) => (
    <Form.Item label={label}>
      <InputNumber
        min={min}
        precision={0}
        value={value}
        onChange={(v) => onChange(v ?? undefined)}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
  if (code && !selected)
    return (
      <Result
        status="404"
        title="活动不存在"
        extra={<Button onClick={() => go('op-events')}>返回活动列表</Button>}
      />
    );
  if (state === 'permission-denied')
    return <Result status="403" title="没有活动管理权限" />;
  if (state === 'load-failed' && !recovered)
    return (
      <Alert
        type="error"
        title="活动加载失败"
        action={
          <Button
            onClick={() => {
              refresh();
              setRecovered(true);
            }}
          >
            重试
          </Button>
        }
      />
    );
  return (
    <div className="activity-management">
      {selected && page !== 'op-event-edit' ? (
        <ActivityDetail
          config={selected}
          onChange={(c, a) => {
            try {
              if (failed) throw new Error('保存失败，请重试');
              saveConfig(c, a);
              message.success('保存成功');
            } catch (e) {
              message.error(e instanceof Error ? e.message : '保存失败');
              if (failed) setRecovered(true);
              throw e;
            }
          }}
          onDelete={() => remove(selected)}
          canDelete={
            !protectedCodes.includes(selected.code) &&
            selected.status !== '进行中'
          }
          onEdit={() => open(selected)}
          onBack={() => go('op-events')}
        />
      ) : (
        <Card>
          <div className="activity-list-head">
            <span />
            <Button type="primary" onClick={() => open()}>
              新增活动
            </Button>
          </div>
          <Form layout="vertical" className="activity-filters">
            <Form.Item label="活动 ID">
              <Input
                placeholder="请输入完整活动 ID"
                allowClear
                value={filters.code}
                onChange={(e) =>
                  setFilters({ ...filters, code: e.target.value })
                }
                onPressEnter={() => {
                  setApplied(filters);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              />
            </Form.Item>
            <Form.Item label="活动名称">
              <Input
                placeholder="请输入活动名称"
                allowClear
                value={filters.keyword}
                onChange={(e) =>
                  setFilters({ ...filters, keyword: e.target.value })
                }
                onPressEnter={() => {
                  setApplied(filters);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              />
            </Form.Item>
            <Form.Item label="活动类型">
              <Select
                placeholder="全部"
                allowClear
                value={filters.type || undefined}
                options={[
                  ...typeOptions,
                  { value: 'archive', label: '往期归档' },
                ]}
                onChange={(v) => setFilters({ ...filters, type: v || '' })}
              />
            </Form.Item>
            <Form.Item label="活动状态">
              <Select
                placeholder="全部"
                allowClear
                value={filters.status || undefined}
                options={['草稿', '未开始', '进行中', '已结束'].map((value) => ({
                  value,
                  label: value,
                }))}
                onChange={(v) => setFilters({ ...filters, status: v || '' })}
              />
            </Form.Item>
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setApplied(filters);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              >
                搜索
              </Button>
              <Button
                onClick={() => {
                  setFilters(emptyFilters);
                  setApplied(emptyFilters);
                  setPagination((p) => ({ ...p, current: 1 }));
                }}
              >
                重置
              </Button>
            </Space>
          </Form>
          <Table<EventConfig>
            rowKey="code"
            dataSource={visible}
            scroll={{ x: 940 }}
            locale={{ emptyText: <Empty description="暂无活动" /> }}
            pagination={{
              ...pagination,
              pageSizeOptions: [20, 50, 100],
              showSizeChanger: true,
              showQuickJumper: false,
              showTotal: (n) => `共 ${n} 条`,
              onChange: (current, pageSize) =>
                setPagination({ current, pageSize }),
            }}
            columns={[
              {
                title: '封面',
                dataIndex: 'cover_url',
                width: 72,
                render: (url) =>
                  url ? (
                    <Image
                      src={url}
                      width={48}
                      height={48}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  ) : (
                    '-'
                  ),
              },
              {
                title: '活动',
                width: 240,
                render: (_, c) => (
                  <div>
                    <div>
                      {c.name} {c.is_featured && <Tag color="gold">主推</Tag>}
                    </div>
                    <span className="activity-muted">{c.code}</span>
                  </div>
                ),
              },
              { title: '类型', width: 110, render: (_, c) => labels[c.type] },
              {
                title: '活动时间',
                width: 260,
                render: (_, c) => (
                  <div>
                    {c.time_label ||
                      (!c.start_time && !c.end_time ? '长期有效' : '')}
                    <div className="activity-muted">
                      {[c.start_time, c.end_time]
                        .filter(Boolean)
                        .map((t) => dayjs(t).format('YYYY-MM-DD HH:mm'))
                        .join(' ~ ')}
                    </div>
                  </div>
                ),
              },
              {
                title: '状态',
                width: 100,
                render: (_, c) => (
                  <Tag
                    color={
                      displayStatus(c) === '进行中' ? 'success' : 'default'
                    }
                  >
                    {displayStatus(c)}
                  </Tag>
                ),
              },
              {
                title: '操作',
                width: 185,
                fixed: 'right',
                render: (_, c) => (
                  <Space size={0}>
                    <Button
                      type="link"
                      onClick={() =>
                        go('op-events?code=' + encodeURIComponent(c.code))
                      }
                    >
                      详情
                    </Button>
                    <Button type="link" onClick={() => open(c)}>
                      编辑
                    </Button>
                    <Tooltip
                      title={
                        protectedCodes.includes(c.code)
                          ? '内置活动不可删除，可通过编辑调整配置'
                          : undefined
                      }
                    >
                      <Button
                        type="link"
                        danger
                        disabled={
                          protectedCodes.includes(c.code) ||
                          c.status === '进行中'
                        }
                        onClick={() => remove(c)}
                      >
                        删除
                      </Button>
                    </Tooltip>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}
      <Drawer
        open={!!draft}
        size="80%"
        title={editing ? '编辑活动' : '新建活动'}
        mask={{ closable: false }}
        onClose={close}
        closable={!saving}
        keyboard={!saving}
        footer={
          <Space style={{ float: 'right' }}>
            <Button disabled={saving} onClick={close}>
              取消
            </Button>
            <Button type="primary" loading={saving} onClick={() => void save()}>
              确定
            </Button>
          </Space>
        }
        destroyOnHidden
      >
        {draft && config && (
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            className="activity-form"
          >
            <Form.Item label="活动名称" required>
              <Input
                value={draft.name}
                onChange={(e) => set('name', e.target.value)}
                onBlur={() => {
                  if (!draft.code && /^[a-z]/i.test(draft.name))
                    set(
                      'code',
                      draft.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '_')
                        .slice(0, 64),
                    );
                }}
              />
            </Form.Item>
            <Form.Item
              label="活动编码"
              required
              extra="创建后不可修改；使用小写英文、数字和下划线。新一期连续挑战使用新的活动编码"
            >
              <Input
                disabled={editing}
                maxLength={64}
                value={draft.code}
                onChange={(e) => set('code', e.target.value.toLowerCase())}
              />
            </Form.Item>
            <Form.Item label="封面图" required>
              <Input
                value={draft.cover_url}
                disabled={uploadMode}
                placeholder={
                  uploadMode ? '上传成功后自动回填 URL' : '请输入封面图 URL'
                }
                onChange={(e) => set('cover_url', e.target.value)}
              />
              <Space style={{ margin: '12px 0' }}>
                图片来源
                <Switch
                  checked={uploadMode}
                  checkedChildren="上传文件"
                  unCheckedChildren="手动输入"
                  onChange={setUploadMode}
                />
              </Space>
              {uploadMode ? (
                <MediaUpload
                  label="活动封面"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  items={
                    draft.cover_url
                      ? [{ url: draft.cover_url, type: 'image' }]
                      : []
                  }
                  onRemove={() => set('cover_url', '')}
                  onFiles={async (files) => {
                    const file = files[0],
                      owner = latest.current?.code;
                    if (
                      !file ||
                      ![
                        'image/jpeg',
                        'image/png',
                        'image/webp',
                        'image/gif',
                        'image/avif',
                      ].includes(file.type) ||
                      file.size > 20 * 1024 * 1024
                    ) {
                      message.error('请选择 20 MB 内的图片');
                      return;
                    }
                    try {
                      const url = await new Promise<string>(
                        (resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () =>
                            typeof reader.result === 'string'
                              ? resolve(reader.result)
                              : reject(new Error('图片读取失败'));
                          reader.onerror = () =>
                            reject(new Error('图片读取失败'));
                          reader.readAsDataURL(file);
                        },
                      );
                      if (latest.current && latest.current.code === owner)
                        set('cover_url', url);
                    } catch {
                      message.error('图片读取失败，请重试');
                    }
                  }}
                />
              ) : (
                draft.cover_url && (
                  <div>
                    <Image
                      src={draft.cover_url}
                      width={80}
                      height={80}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                )
              )}
            </Form.Item>
            <Form.Item label="活动类型" required>
              <Segmented
                block
                disabled={draft.type === 'archive'}
                options={
                  draft.type === 'archive'
                    ? [{ value: 'archive', label: '往期归档' }]
                    : typeOptions
                }
                value={draft.type}
                onChange={(v) => set('type', v as EventType)}
              />
              <div className="activity-muted">
                {draft.type === 'referral'
                  ? '配置邀请日/月配额与阶段奖励。'
                  : '配置解锁条件与发布要求。'}
              </div>
            </Form.Item>
            {['campaign', 'archive'].includes(draft.type) && (
              <Form.Item label="活动时间" required>
                <DatePicker.RangePicker
                  showTime
                  format="YYYY-MM-DD HH:mm:ss"
                  value={
                    draft.start_time && draft.end_time
                      ? [dayjs(draft.start_time), dayjs(draft.end_time)]
                      : null
                  }
                  onChange={(v) =>
                    setDraft({
                      ...draft,
                      start_time: v?.[0]?.format('YYYY-MM-DDTHH:mm:ss') || '',
                      end_time: v?.[1]?.format('YYYY-MM-DDTHH:mm:ss') || '',
                    })
                  }
                />
              </Form.Item>
            )}
            {numberField('最高可得积分（展示）', draft.max_points, (v) =>
              set('max_points', v ?? 0),
            )}
            <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
              <span className="activity-muted">
                仅用于活动页展示，实际奖励以任务和发奖规则为准
              </span>
            </Form.Item>
            {numberField('排序', draft.sort_order, (v) =>
              set('sort_order', v ?? 0),
            )}
            {editing && (
              <Form.Item label="活动状态">
                <Select
                  value={draft.status}
                  options={['草稿', '进行中', '已结束'].map((value) => ({
                    value,
                    label: value,
                  }))}
                  onChange={(v) => set('status', v)}
                />
              </Form.Item>
            )}
            <Form.Item
              label="主推活动"
              extra="开启后进入主推活动集合，展示顺序仍由排序值决定"
            >
              <Switch
                checkedChildren="主推"
                unCheckedChildren="普通"
                checked={draft.is_featured}
                onChange={(v) => set('is_featured', v)}
              />
            </Form.Item>
            {!editing && (
              <Form.Item label="快速配置">
                <Button onClick={preset}>套用 7 日连续创作挑战</Button>
              </Form.Item>
            )}
            {draft.extra_config.streak_config && (
              <Alert
                type="warning"
                showIcon
                title="连续创作挑战"
                description="启用前需在活动任务中配置每日生成和每日发布两条任务。"
                style={{ marginBottom: 16 }}
              />
            )}
            <Collapse
              defaultActiveKey={['config']}
              items={[
                {
                  key: 'description',
                  label: '活动说明（可选）',
                  children: (
                    <MarkdownEditor
                      value={draft.description}
                      onChange={(v) => set('description', v)}
                    />
                  ),
                },
                {
                  key: 'config',
                  label: '活动规则与配置',
                  children: (
                    <>
                      <div className="activity-rule-title">解锁条件</div>
                      <Form.Item label="前置条件列表">
                        <Select
                          mode="multiple"
                          allowClear
                          value={draft.unlock_rule.requires}
                          options={selectedOptions}
                          onChange={(v) => unlock({ requires: v })}
                        />
                      </Form.Item>
                      {draft.unlock_rule.requires.map((c) => (
                        <Form.Item
                          label={rows.find((r) => r.code === c)?.name || c}
                          key={c}
                        >
                          <Space>
                            <Checkbox
                              checked={
                                draft.unlock_rule.requirement_conditions?.[c]
                                  ?.all_tasks_completed ??
                                draft.unlock_rule.requires_condition ===
                                  'all_completed'
                              }
                              onChange={(e) =>
                                unlock({
                                  requires_condition: e.target.checked
                                    ? 'all_completed'
                                    : draft.unlock_rule.requires_condition,
                                  requirement_conditions: {
                                    ...draft.unlock_rule.requirement_conditions,
                                    [c]: {
                                      ...draft.unlock_rule
                                        .requirement_conditions?.[c],
                                      all_tasks_completed: e.target.checked,
                                    },
                                  },
                                })
                              }
                            >
                              需全部已完成
                            </Checkbox>
                            <Checkbox
                              checked={
                                draft.unlock_rule.requirement_conditions?.[c]
                                  ?.all_tasks_claimed ??
                                draft.unlock_rule.requires_condition ===
                                  'all_claimed'
                              }
                              onChange={(e) =>
                                unlock({
                                  requires_condition: e.target.checked
                                    ? 'all_claimed'
                                    : draft.unlock_rule.requires_condition,
                                  requirement_conditions: {
                                    ...draft.unlock_rule.requirement_conditions,
                                    [c]: {
                                      ...draft.unlock_rule
                                        .requirement_conditions?.[c],
                                      all_tasks_claimed: e.target.checked,
                                    },
                                  },
                                })
                              }
                            >
                              前置任务奖励全部发放
                            </Checkbox>
                          </Space>
                        </Form.Item>
                      ))}
                      {numberField(
                        '解锁后有效天数',
                        draft.unlock_rule.duration_days,
                        (v) => unlock({ duration_days: v }),
                      )}
                      <Form.Item label="完成后可解锁的活动">
                        <Select
                          mode="multiple"
                          value={
                            draft.unlock_rule.unlocks ||
                            (draft.unlock_rule.next_activity_code
                              ? [draft.unlock_rule.next_activity_code]
                              : [])
                          }
                          options={selectedOptions}
                          onChange={(v) =>
                            unlock({ unlocks: v, next_activity_code: v[0] })
                          }
                        />
                      </Form.Item>
                      <Form.Item label="依赖活动期次">
                        <Input
                          value={
                            draft.unlock_rule.period_key ||
                            draft.unlock_rule.period_code
                          }
                          placeholder="如 lifetime 或 202610"
                          onChange={(e) =>
                            unlock({
                              period_key: e.target.value,
                              period_code: e.target.value,
                            })
                          }
                        />
                      </Form.Item>
                      <div className="activity-rule-title">扩展配置</div>
                      {draft.type === 'referral' ? (
                        (['daily', 'monthly'] as const).map((period) => (
                          <div key={period}>
                            <div className="activity-rule-subtitle">
                              {period === 'daily' ? '每日配额' : '每月配额'}
                            </div>
                            {(
                              [
                                ['total_points', '积分上限'],
                                ['register', '注册阶段人次上限'],
                                ['interact', '互动阶段人次上限'],
                                ['publish', '发布阶段人次上限'],
                              ] as const
                            ).map(([key, label]) => (
                              <div key={key}>
                                {numberField(
                                  label,
                                  draft.extra_config.quota_config?.[period]?.[
                                    key
                                  ],
                                  (v) =>
                                    extra({
                                      quota_config: {
                                        scope:
                                          draft.extra_config.quota_config
                                            ?.scope || 'per_period',
                                        limit:
                                          draft.extra_config.quota_config
                                            ?.limit || 1,
                                        ...draft.extra_config.quota_config,
                                        [period]: {
                                          ...draft.extra_config.quota_config?.[
                                            period
                                          ],
                                          [key]: v,
                                        },
                                      },
                                    }),
                                )}
                              </div>
                            ))}
                          </div>
                        ))
                      ) : (
                        <>
                          <Form.Item label="投稿业务类型">
                            <Select
                              value={config.biz_type}
                              options={[
                                { value: 'work', label: '作品' },
                                { value: 'prompt', label: 'Prompt' },
                                ...(config.biz_type === 'post'
                                  ? [{ value: 'post', label: '闪念' }]
                                  : []),
                              ]}
                              onChange={(v) => publishing({ biz_type: v })}
                            />
                          </Form.Item>
                          <Form.Item label="允许的内容类型">
                            <Select
                              mode="multiple"
                              value={config.content_types}
                              options={[
                                { value: 1, label: '漫剧' },
                                { value: 2, label: '图片' },
                                { value: 3, label: '视频' },
                                { value: 4, label: '文本' },
                              ]}
                              onChange={(v) => publishing({ content_types: v })}
                            />
                          </Form.Item>
                          <Form.Item label="允许的媒体类型">
                            <Select
                              mode="multiple"
                              value={config.media_types}
                              options={[
                                { value: 'image', label: '图片' },
                                { value: 'video', label: '视频' },
                              ]}
                              onChange={(v) => publishing({ media_types: v })}
                            />
                          </Form.Item>
                          {(
                            [
                              [
                                'topic_codes',
                                '必须包含的话题',
                                '内容话题',
                                'required_topic',
                              ],
                              [
                                'category_codes',
                                '必须包含的分类',
                                '作品分类',
                                'required_category',
                              ],
                              [
                                'model_codes',
                                '必须包含的模型',
                                '模板模型',
                                'required_model',
                              ],
                              [
                                'scene_codes',
                                '必须包含的场景',
                                '使用场景',
                                'required_scene',
                              ],
                            ] as const
                          ).map(([key, label, type, required]) => (
                            <Form.Item label={label} key={key}>
                              <Select
                                mode="multiple"
                                allowClear
                                value={config[key]}
                                options={tagOptions(type, config[key])}
                                onChange={(v) =>
                                  publishing({
                                    [key]: v,
                                    [required]: v.length > 0,
                                  })
                                }
                              />
                            </Form.Item>
                          ))}
                          {numberField(
                            '最少图片数',
                            config.min_image_count,
                            (v) => publishing({ min_image_count: v ?? 0 }),
                          )}
                          {numberField(
                            '最少视频数',
                            config.min_video_count,
                            (v) => publishing({ min_video_count: v ?? 0 }),
                          )}
                          {numberField(
                            '最短标题长度',
                            config.min_title_length ?? config.title_min_len,
                            (v) =>
                              publishing({
                                min_title_length: v ?? 0,
                                title_min_len: v ?? 0,
                              }),
                          )}
                          <Form.Item label="必须先参与再发布">
                            <Switch
                              checked={config.require_join_token}
                              onChange={(v) =>
                                publishing({ require_join_token: v })
                              }
                            />
                          </Form.Item>
                          {draft.type === 'long_term' ? (
                            <>
                              <Form.Item label="连续创作奖励">
                                <Switch
                                  checked={!!draft.extra_config.streak_config}
                                  onChange={(v) =>
                                    extra({
                                      streak_config: v
                                        ? {
                                            timezone: 'Asia/Shanghai',
                                            milestones: [
                                              { days: 3, points: 0 },
                                              { days: 5, points: 0 },
                                              { days: 7, points: 0 },
                                            ],
                                          }
                                        : undefined,
                                    })
                                  }
                                />
                              </Form.Item>
                              {draft.extra_config.streak_config && (
                                <>
                                  <Form.Item label="时区">
                                    <Input value="Asia/Shanghai" disabled />
                                  </Form.Item>
                                  {[3, 5, 7].map((days) => (
                                    <div key={days}>
                                      {numberField(
                                        `连续 ${days} 天奖励积分`,
                                        draft.extra_config.streak_config?.milestones.find(
                                          (m) => m.days === days,
                                        )?.points,
                                        (v) =>
                                          extra({
                                            streak_config: {
                                              timezone: 'Asia/Shanghai',
                                              milestones: [3, 5, 7].map(
                                                (day) => ({
                                                  days: day,
                                                  points:
                                                    day === days
                                                      ? (v ?? 0)
                                                      : (draft.extra_config.streak_config?.milestones.find(
                                                          (m) => m.days === day,
                                                        )?.points ?? 0),
                                                }),
                                              ),
                                            },
                                          }),
                                      )}
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <Form.Item label="结算周期">
                                <Select
                                  allowClear
                                  value={draft.extra_config.settle_cycle}
                                  options={[
                                    { value: 'daily', label: '按自然日结算' },
                                    {
                                      value: 'period',
                                      label: '活动期次结束结算',
                                    },
                                  ]}
                                  onChange={(v) => extra({ settle_cycle: v })}
                                />
                              </Form.Item>
                              <Form.Item label="日结算时刻">
                                <Select
                                  allowClear
                                  value={draft.extra_config.settle_time}
                                  options={[
                                    '00:00',
                                    '00:30',
                                    '01:00',
                                    '02:00',
                                  ].map((value) => ({ value, label: value }))}
                                  onChange={(v) => extra({ settle_time: v })}
                                />
                              </Form.Item>
                            </>
                          )}
                        </>
                      )}
                    </>
                  ),
                },
              ]}
            />
          </Form>
        )}
      </Drawer>
    </div>
  );
}

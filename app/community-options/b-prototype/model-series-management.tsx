'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  appendSystemLog,
  readSystemStore,
  systemStorageKey,
} from './system-model';
import './model-series-management.css';

export type ModelSeries = {
  code: string;
  name: string;
  description: string;
  status: string;
  update_time: string;
};
export const modelSeriesPages = [
  {
    id: 'aigc-series',
    title: '模型系列',
    module: 'AIGC管理',
    states: [
      'normal',
      'empty',
      'error',
      'loading',
      'no-permission',
      'read-only',
      'save-error',
    ],
  },
];
export const modelSeriesStorageKey = 'research-b-model-series-v1';
const initialSeries: ModelSeries[] = [
  {
    code: 'gemini',
    name: 'Gemini',
    description: 'Gemini 模型系列',
    status: '1',
    update_time: '2026-10-06 09:00:00',
  },
  {
    code: 'openai',
    name: 'OpenAI',
    description: 'OpenAI 模型系列',
    status: '1',
    update_time: '2026-10-06 09:00:00',
  },
  {
    code: 'zijie',
    name: '字节',
    description: '字节模型系列',
    status: '1',
    update_time: '2026-10-06 09:00:00',
  },
  {
    code: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek 模型系列',
    status: '0',
    update_time: '2026-10-06 09:00:00',
  },
];
const legacySeriesCodes: Record<string, string> = {
  'image-creation': 'gemini',
  图片创作: 'gemini',
  'video-creation': 'zijie',
  视频创作: 'zijie',
  'text-creation': 'deepseek',
  文本创作: 'deepseek',
};
export function normalizeModelSeriesCode(value: string) {
  return legacySeriesCodes[value] || value;
}
export function readModelSeries(strict = false): ModelSeries[] {
  if (typeof window === 'undefined')
    return initialSeries.map((r) => ({ ...r }));
  try {
    const raw = localStorage.getItem(modelSeriesStorageKey);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (
        Array.isArray(parsed) &&
        parsed.every(
          (r) => r && typeof r.code === 'string' && typeof r.name === 'string',
        )
      ) {
        const legacy = parsed.some((r) => legacySeriesCodes[r.code]);
        const migrated = parsed.map((original: ModelSeries) => {
          const r = {
            ...original,
            status: ['0', '1'].includes(original.status) ? original.status : '',
          };
          const replacement = initialSeries.find(
            (s) => s.code === legacySeriesCodes[r.code],
          );
          return replacement
            ? {
                ...r,
                code: replacement.code,
                name: replacement.name,
                description: replacement.description,
              }
            : r;
        });
        if (legacy && !migrated.some((r) => r.code === 'openai'))
          migrated.push({ ...initialSeries[1] });
        return migrated;
      }
      throw new Error('模型系列数据格式异常，请重新加载');
    }
  } catch (error) {
    if (strict) throw error;
    /* Fall back to the local example data. */
  }
  return initialSeries.map((r) => ({ ...r }));
}
export function modelSeriesOptions(current?: string) {
  current = current ? normalizeModelSeriesCode(current) : current;
  const rows = readModelSeries();
  const options = rows
    .filter((r) => r.status === '1' || r.code === current || r.name === current)
    .map((r) => ({
      value: r.code,
      label: r.name + (r.status === '0' ? '（停用）' : ''),
      disabled: r.status !== '1',
    }));
  if (current && !rows.some((r) => r.code === current || r.name === current))
    options.push({
      value: current,
      label: current + '（已不存在）',
      disabled: true,
    });
  return options;
}
export function modelSeriesName(value: string) {
  const code = normalizeModelSeriesCode(value);
  return (
    readModelSeries().find((r) => r.code === code || r.name === value)?.name ||
    value
  );
}

export function ModelSeriesManagement({ state }: { state: string }) {
  const { message, modal } = App.useApp();
  const [form] = Form.useForm<ModelSeries>();
  const [rows, setRows] = useState<ModelSeries[]>(initialSeries),
    [ready, setReady] = useState(false),
    [localState, setLocalState] = useState(
      state === 'load-failed'
        ? 'error'
        : state === 'permission-denied'
          ? 'no-permission'
          : state === 'save-failed'
            ? 'save-error'
            : state,
    ),
    [keyword, setKeyword] = useState(''),
    [status, setStatus] = useState<string>(),
    [applied, setApplied] = useState({
      keyword: '',
      status: undefined as string | undefined,
    }),
    [page, setPage] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [editing, setEditing] = useState<ModelSeries | null>(null),
    [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false);
  const alive = useRef(true);
  const canEdit = ['normal', 'empty', 'save-error'].includes(localState);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        setRows(readModelSeries(true));
      } catch {
        setLocalState('error');
      }
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const guard = (e: Event) => {
      e.preventDefault();
      modal.confirm({
        title: '放弃未保存的修改？',
        content: '当前系列信息尚未保存。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          setOpen(false);
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
  function persist(
    next: ModelSeries[],
    action: string,
    code: string,
    before: unknown,
    after: unknown,
  ) {
    if (!alive.current || !canEdit) throw new Error('当前页面不可操作');
    const previous = localStorage.getItem(modelSeriesStorageKey);
    const logged = appendSystemLog(
      readSystemStore(),
      action,
      'AIGC管理',
      code,
      before,
      after,
      action,
    );
    localStorage.setItem(modelSeriesStorageKey, JSON.stringify(next));
    try {
      localStorage.setItem(systemStorageKey, JSON.stringify(logged));
    } catch (error) {
      if (previous === null) localStorage.removeItem(modelSeriesStorageKey);
      else localStorage.setItem(modelSeriesStorageKey, previous);
      throw error;
    }
    setRows(next);
    window.dispatchEvent(new Event('model-series-updated'));
  }
  function openForm(record?: ModelSeries) {
    if (!canEdit || busy) return;
    setEditing(record || null);
    form.resetFields();
    form.setFieldsValue(
      record || { code: '', name: '', description: '', status: '1' },
    );
    setDirty(false);
    setOpen(true);
  }
  function close() {
    if (busy) return;
    if (dirty) {
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setOpen(false);
          setDirty(false);
        },
      });
    } else setOpen(false);
  }
  async function save() {
    if (
      !canEdit ||
      busy ||
      localState === 'no-permission' ||
      localState === 'loading'
    )
      return;
    let values: ModelSeries;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (!alive.current || !canEdit) return;
    const code = editing?.code || values.code.trim();
    const next = {
      code,
      name: values.name.trim(),
      description: (values.description || '').trim(),
      status: values.status,
      update_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };
    if (!editing && rows.some((r) => r.code === code)) {
      form.setFields([{ name: 'code', errors: ['系列编码已存在'] }]);
      return;
    }
    setBusy(true);
    try {
      if (localState === 'save-error') {
        setLocalState('normal');
        throw new Error('保存失败，请稍后重试，输入已保留。');
      }
      if (!['0', '1'].includes(next.status)) throw new Error('请选择有效状态');
      const latest = readModelSeries(true);
      const before = latest.find((r) => r.code === code);
      if (!editing && before) throw new Error('系列编码已存在');
      if (editing && !before) throw new Error('系列已不存在，请重新选择');
      persist(
        editing
          ? latest.map((r) => (r.code === editing.code ? { ...r, ...next } : r))
          : [next, ...latest],
        editing ? '编辑模型系列' : '新建模型系列',
        code,
        before || {},
        next,
      );
      setOpen(false);
      setDirty(false);
      message.success(editing ? '更新成功' : '创建成功');
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : '保存失败，请稍后重试，输入已保留。',
      );
    } finally {
      setBusy(false);
    }
  }
  function remove(record: ModelSeries) {
    if (!canEdit || busy || !['0', '1'].includes(record.status)) return;
    modal.confirm({
      title: '确认删除该系列？',
      content: `系列编码：${record.code}`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        if (localState === 'save-error') {
          setLocalState('normal');
          message.error('删除失败，请稍后重试。');
          throw new Error('删除失败');
        }
        try {
          if (!alive.current || !canEdit) return;
          const latest = readModelSeries(true);
          const before = latest.find((r) => r.code === record.code);
          if (!before) throw new Error('系列已不存在');
          const next = latest.filter((r) => r.code !== record.code);
          persist(next, '删除模型系列', record.code, before, {});
          setPage((p) =>
            Math.min(p, Math.max(1, Math.ceil(next.length / pageSize))),
          );
          message.success('删除成功');
        } catch {
          message.error('删除失败，请稍后重试。');
          throw new Error('删除失败');
        }
      },
    });
  }
  const columns: ColumnsType<ModelSeries> = [
    { title: '系列编码', dataIndex: 'code', width: 150 },
    { title: '名称', dataIndex: 'name', width: 160 },
    {
      title: '描述',
      dataIndex: 'description',
      width: 280,
      ellipsis: true,
      render: (value: string) => value || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (value: string) => (
        <Tag
          color={value === '1' ? 'green' : value === '0' ? 'default' : 'orange'}
        >
          {value === '1' ? '启用' : value === '0' ? '停用' : '—'}
        </Tag>
      ),
    },
    { title: '更新时间', dataIndex: 'update_time', width: 175 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 140,
      render: (_, record) =>
        canEdit ? (
          <Space size={4}>
            <Button type="link" onClick={() => openForm(record)}>
              编辑
            </Button>
            <Button
              type="link"
              danger
              disabled={busy || !['0', '1'].includes(record.status)}
              onClick={() => remove(record)}
            >
              删除
            </Button>
          </Space>
        ) : (
          '-'
        ),
    },
  ];
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
        title="获取模型系列失败"
        extra={
          <Button
            onClick={() => {
              try {
                setRows(readModelSeries(true));
                setLocalState('normal');
              } catch {
                message.error('加载失败，请重试');
              }
            }}
          >
            重新加载
          </Button>
        }
      />
    );
  const filtered =
    localState === 'empty'
      ? []
      : rows.filter(
          (r) =>
            (!applied.keyword ||
              `${r.code} ${r.name}`
                .toLowerCase()
                .includes(applied.keyword.toLowerCase())) &&
            (!applied.status || r.status === applied.status),
        );
  return (
    <section className="ms-root">
      <div className="ms-toolbar">
        <div className="ms-filters">
          <div>
            <label htmlFor="series-keyword">关键词</label>
            <Input
              id="series-keyword"
              placeholder="编码 / 名称"
              value={keyword}
              allowClear
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={() => {
                setApplied({ keyword: keyword.trim(), status });
                setPage(1);
              }}
            />
          </div>
          <div>
            <label htmlFor="series-status">状态</label>
            <Select
              id="series-status"
              placeholder="全部"
              allowClear
              value={status}
              onChange={setStatus}
              options={[
                { value: '1', label: '启用' },
                { value: '0', label: '停用' },
              ]}
            />
          </div>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setApplied({ keyword: keyword.trim(), status });
                setPage(1);
              }}
            >
              搜索
            </Button>
            <Button
              onClick={() => {
                setKeyword('');
                setStatus(undefined);
                setApplied({ keyword: '', status: undefined });
                setPage(1);
              }}
            >
              重置
            </Button>
          </Space>
        </div>
        {canEdit && (
          <Button
            type="primary"
            disabled={!ready || localState === 'loading' || busy}
            onClick={() => openForm()}
          >
            新建系列
          </Button>
        )}
      </div>
      <Table<ModelSeries>
        rowKey="code"
        columns={columns}
        dataSource={filtered}
        loading={!ready || localState === 'loading'}
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          showQuickJumper: false,
          showTotal: (n) => `共 ${n} 条`,
          onChange: (p, size) => {
            setPage(size !== pageSize ? 1 : p);
            setPageSize(size);
          },
        }}
      />
      <Modal
        open={open}
        title={editing ? '编辑系列' : '新建系列'}
        width={560}
        destroyOnHidden
        mask={{ closable: false }}
        onCancel={close}
        onOk={save}
        okText="确定"
        cancelText="取消"
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
      >
        <Form
          form={form}
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
          disabled={busy}
          onValuesChange={() => setDirty(true)}
        >
          <Form.Item
            name="code"
            label="系列编码"
            rules={[
              { required: true, whitespace: true, message: '请输入系列编码' },
            ]}
          >
            <Input placeholder="如 gemini" disabled={!!editing || busy} />
          </Form.Item>
          <Form.Item
            name="name"
            label="名称"
            rules={[
              { required: true, whitespace: true, message: '请输入名称' },
            ]}
          >
            <Input placeholder="如 Gemini" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="可选" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Radio.Group
              options={[
                { value: '1', label: '启用' },
                { value: '0', label: '停用' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}

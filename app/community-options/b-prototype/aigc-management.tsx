'use client';
import { useEffect, useRef, useState } from 'react';
import {
  App,
  Button,
  Collapse,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  aigcJson,
  aigcStatusText,
  assertNoAigcSecrets,
  defaultInvoke,
  generationStatusOptions,
  generationStatusText,
  imageBodyExample,
  imageFormExample,
  loggedAigc,
  newAigcModel,
  outputOptions,
  outputText,
  prettyAigc,
  readAigcStore,
  type AigcModel,
  type AigcStore,
  type Generation,
  type InvokeConfig,
} from './aigc-model';
import {
  modelSeriesName,
  modelSeriesOptions,
  readModelSeries,
} from './model-series-management';
import {
  stringList,
  stringValue,
  systemStamp,
  systemStorageKey,
} from './system-model';
import { UserIdentity } from './user-identity';
import { readManagedUsers } from './user-management';
import './aigc-management.css';

const states = [
  'normal',
  'empty',
  'loading',
  'load-failed',
  'permission-denied',
  'read-only',
  'save-failed',
];
export const aigcPages = [
  { id: 'aigc-models', title: '模型配置' },
  { id: 'aigc-model-detail', title: '模型协议配置' },
  { id: 'aigc-runtime-detail', title: '模型详情' },
  { id: 'aigc-generations', title: '生成记录' },
].map((p) => ({ ...p, module: 'AIGC管理', states }));
const aliases: Record<string, string> = {
  error: 'load-failed',
  'no-permission': 'permission-denied',
  'save-error': 'save-failed',
};
type Filters = {
  keyword: string;
  series: string;
  output?: string;
  status?: string;
  generation: string;
  user: string;
  model: string;
  work: string;
  request: string;
};
const freshFilters = (): Filters => ({
  keyword: '',
  series: '',
  generation: '',
  user: '',
  model: '',
  work: '',
  request: '',
});
const statuses = [
  { value: '1', label: '启用' },
  { value: '0', label: '停用' },
];
const exact = (a: string, b: string) =>
  a.trim().toLowerCase() === b.trim().toLowerCase();
const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(
  (value) => ({ value }),
);
const resultOptions = [
  { value: 'url', label: 'URL' },
  { value: 'base64', label: 'Base64' },
  { value: 'text', label: '文本' },
  { value: 'id', label: '异步任务 ID' },
];

export function AigcManagement({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (s: string) => void;
}) {
  const { message, modal } = App.useApp();
  const [data, setData] = useState<AigcStore | null>(null),
    [localState, setLocalState] = useState(aliases[state] || state),
    [readError, setReadError] = useState(''),
    [filters, setFilters] = useState<Filters>(freshFilters),
    [applied, setApplied] = useState<Filters>(freshFilters),
    [more, setMore] = useState(false),
    [current, setCurrent] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [editor, setEditor] = useState<{
      row: AigcModel;
      creating: boolean;
    } | null>(null),
    [deleting, setDeleting] = useState<AigcModel | null>(null),
    [detail, setDetail] = useState<Generation | null>(null),
    [failure, setFailure] = useState<Generation | null>(null),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [tab, setTab] = useState('invoke'),
    [invokeLoaded, setInvokeLoaded] = useState(false);
  const [modelForm] = Form.useForm(),
    [configForm] = Form.useForm(),
    [failForm] = Form.useForm();
  const resultType = Form.useWatch('resultType', configForm);
  const lock = useRef(false),
    mounted = useRef(true),
    context = useRef(''),
    loadedConfigContext = useRef('');
  const params =
    typeof location === 'undefined'
      ? null
      : new URLSearchParams(location.search);
  const code = params?.get('code') || params?.get('id') || '';
  const selected = data?.models.find((m) => m.code === code);
  const configPage = ['aigc-model-detail', 'aigc-runtime-detail'].includes(
    page,
  );
  const canEdit = localState !== 'read-only';
  const userIdentity = (id: string) => {
    const user = readManagedUsers().find((u) => u.id === id);
    return <UserIdentity id={id} name={user?.name} avatar={user?.avatar} />;
  };
  useEffect(() => {
    context.current = `${page}:${code}:${state}`;
  }, [page, code, state]);
  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => {
      try {
        setData(readAigcStore());
      } catch (e) {
        setReadError(e instanceof Error ? e.message : '加载失败');
      }
    });
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!selected || !configPage) return;
    const loadContext = `${code}:${canEdit}`;
    if (loadedConfigContext.current === loadContext) return;
    loadedConfigContext.current = loadContext;
    queueMicrotask(() => {
      const initialTab = canEdit ? 'invoke' : 'frontend';
      setTab(initialTab);
      setInvokeLoaded(false);
      configForm.resetFields();
      configForm.setFieldsValue({
        model_form: prettyAigc(selected.frontend_config.model_form),
        requestBody: prettyAigc(selected.frontend_config.requestBody),
      });
      setDirty(false);
    });
    // Load one model context once; save routines refresh the same form explicitly.
  }, [code, configPage, configForm, canEdit, selected]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const guard = (event: Event) => {
      event.preventDefault();
      if (lock.current) {
        message.warning('正在保存，请稍候');
        return;
      }
      modal.confirm({
        title: '放弃未保存的修改？',
        content: '当前输入尚未保存。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          setEditor(null);
          setFailure(null);
          configForm.resetFields();
          modelForm.resetFields();
          failForm.resetFields();
          (event as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    const unload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('prototype-before-navigate', guard);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype-before-navigate', guard);
      window.removeEventListener('beforeunload', unload);
    };
  }, [dirty, busy, modal, message, modelForm, configForm, failForm]);
  function reload() {
    try {
      setData(readAigcStore());
      setReadError('');
      setLocalState('normal');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败，请重试');
    }
  }
  function askDiscard(next: () => void) {
    if (lock.current) return;
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: () => {
          setDirty(false);
          next();
        },
      });
    else next();
  }
  async function write(
    change: (latest: AigcStore) => AigcStore,
  ): Promise<boolean> {
    if (
      lock.current ||
      !data ||
      !canEdit ||
      readError ||
      ['permission-denied', 'load-failed', 'loading'].includes(localState)
    )
      return false;
    const sourceContext = context.current;
    lock.current = true;
    setBusy(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    try {
      if (!mounted.current || sourceContext !== context.current) return false;
      if (localState === 'save-failed') {
        setLocalState('normal');
        throw new Error('保存失败，输入已保留，请重试');
      }
      const next = change(readAigcStore());
      localStorage.setItem(systemStorageKey, JSON.stringify(next));
      setData(next);
      message.success('保存成功');
      return true;
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : '保存失败，输入已保留，请重试',
      );
      return false;
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function openModel(row?: AigcModel) {
    const next = row || newAigcModel('', '', '');
    modelForm.resetFields();
    modelForm.setFieldsValue(next);
    setEditor({ row: next, creating: !row });
    setDirty(false);
  }
  async function saveModel() {
    if (!editor) return;
    let v: Record<string, unknown>;
    try {
      v = await modelForm.validateFields();
    } catch {
      return;
    }
    const creating = editor.creating;
    const sourceCode = editor.row.code;
    const ok = await write((latest) => {
      const currentRow = latest.models.find((m) => m.code === sourceCode);
      if (!creating && !currentRow) throw new Error('模型已不存在，请重新选择');
      const targetCode = creating ? stringValue(v.code).trim() : sourceCode;
      if (creating && latest.models.some((m) => m.code === targetCode))
        throw new Error('模型编码已存在');
      if (
        creating &&
        !readModelSeries().some(
          (s) => s.code === v.series_code && s.status === '1',
        )
      )
        throw new Error('请选择启用的模型系列');
      const outputs = stringList(v.output_types);
      if (
        !outputs.length ||
        outputs.some((o) => !outputOptions.some((t) => t.value === o))
      )
        throw new Error('请选择有效输出类型');
      if (!Number.isFinite(v.cost_points) || Number(v.cost_points) < 0)
        throw new Error('消耗积分须为非负数');
      if (!['0', '1'].includes(stringValue(v.status)))
        throw new Error('请选择有效状态');
      const next = {
        ...(currentRow ||
          newAigcModel(
            targetCode,
            stringValue(v.name).trim(),
            stringValue(v.series_code),
          )),
        name: stringValue(v.name).trim(),
        vendor_model: stringValue(v.vendor_model).trim(),
        output_types: outputs,
        cost_points: Number(v.cost_points),
        status: creating ? '0' : stringValue(v.status),
        update_time: systemStamp(),
      };
      assertNoAigcSecrets(next.vendor_model);
      return loggedAigc(
        {
          ...latest,
          models: creating
            ? [next, ...latest.models]
            : latest.models.map((m) => (m.code === sourceCode ? next : m)),
        },
        creating ? '新建模型' : '编辑模型',
        targetCode,
        currentRow || {},
        next,
      );
    });
    if (ok) {
      setEditor(null);
      setDirty(false);
      modelForm.resetFields();
    }
  }
  async function deleteModel() {
    if (!deleting) return;
    const target = deleting.code;
    const ok = await write((latest) => {
      const currentRow = latest.models.find((m) => m.code === target);
      if (!currentRow) throw new Error('模型已不存在，请刷新列表');
      return loggedAigc(
        { ...latest, models: latest.models.filter((m) => m.code !== target) },
        '删除模型',
        target,
        currentRow,
        {},
      );
    });
    if (ok) setDeleting(null);
  }
  function loadConfig(nextTab = tab) {
    if (!selected) return;
    try {
      const model = readAigcStore().models.find((m) => m.code === code);
      if (!model) throw new Error('模型已不存在');
      configForm.resetFields();
      if (nextTab === 'frontend')
        configForm.setFieldsValue({
          model_form: prettyAigc(model.frontend_config.model_form),
          requestBody: prettyAigc(model.frontend_config.requestBody),
        });
      else {
        const invoke = model.invoke_config || defaultInvoke();
        configForm.setFieldsValue({
          ...invoke,
          auth_headers: '{"Authorization":"[TOKEN]"}',
          responseBody: prettyAigc(invoke.responseBody),
          queryResultResponseBody: prettyAigc(invoke.queryResultResponseBody),
          resultMapping: prettyAigc(invoke.resultMapping),
        });
        setInvokeLoaded(true);
      }
      setDirty(false);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败，请重试');
    }
  }
  function changeTab(next: string) {
    askDiscard(() => {
      setTab(next);
      if (next === 'frontend' || invokeLoaded) loadConfig(next);
    });
  }
  async function saveConfig() {
    let v: Record<string, unknown>;
    try {
      v = await configForm.validateFields();
    } catch {
      return;
    }
    let patch: Partial<AigcModel>;
    try {
      if (tab === 'frontend')
        patch = {
          frontend_config: {
            model_form: aigcJson(v.model_form, 'model_form', {
              object: true,
            }) as Record<string, unknown>,
            requestBody: aigcJson(v.requestBody, 'requestBody', {
              object: true,
            }) as Record<string, unknown>,
          },
        };
      else {
        const rawAuth = stringValue(v.auth_headers).trim();
        if (rawAuth) {
          const auth = JSON.parse(rawAuth);
          if (!auth || typeof auth !== 'object' || Array.isArray(auth))
            throw new Error('Auth Headers 须为 JSON 对象');
          assertNoAigcSecrets(auth);
        }
        assertNoAigcSecrets(v.path);
        assertNoAigcSecrets(v.queryResultPath);
        const asyncResult = v.resultType === 'id';
        if (
          !methodOptions.some((o) => o.value === v.method) ||
          !outputOptions.some((o) => o.value === v.type) ||
          !resultOptions.some((o) => o.value === v.resultType)
        )
          throw new Error('请选择有效调用配置选项');
        const invoke: InvokeConfig = {
          path: stringValue(v.path).trim(),
          method: stringValue(v.method),
          model_name: stringValue(v.model_name).trim(),
          type: stringValue(v.type),
          result: stringValue(v.result).trim(),
          resultType: stringValue(v.resultType),
          responseBody:
            aigcJson(v.responseBody, 'responseBody', { nullable: true }) ?? {},
          queryResultPath: asyncResult
            ? stringValue(v.queryResultPath).trim()
            : '',
          queryResultType: asyncResult
            ? stringValue(v.queryResultType || 'get')
            : '',
          queryResultResponseBody: asyncResult
            ? aigcJson(v.queryResultResponseBody, 'queryResultResponseBody', {
                nullable: true,
              })
            : null,
          resultMapping: asyncResult
            ? aigcJson(v.resultMapping, 'resultMapping', { nullable: true })
            : null,
        };
        if (asyncResult && !['get', 'post'].includes(invoke.queryResultType))
          throw new Error('请选择有效异步查询方法');
        patch = { invoke_config: invoke };
      }
    } catch (e) {
      message.warning(e instanceof Error ? e.message : 'JSON 校验失败');
      return;
    }
    const ok = await write((latest) => {
      const currentRow = latest.models.find((m) => m.code === code);
      if (!currentRow) throw new Error('模型已不存在，请返回列表');
      const next = { ...currentRow, ...patch, update_time: systemStamp() };
      return loggedAigc(
        {
          ...latest,
          models: latest.models.map((m) => (m.code === code ? next : m)),
        },
        tab === 'frontend' ? '保存用户表单与拼包' : '保存调用与鉴权',
        code,
        tab === 'frontend'
          ? currentRow.frontend_config
          : currentRow.invoke_config,
        patch,
      );
    });
    if (ok) {
      setDirty(false);
      loadConfig();
    }
  }
  function openFailure(row: Generation) {
    if (!canEdit || row.status !== '0') return;
    setDetail(null);
    setFailure(row);
    failForm.resetFields();
    setDirty(false);
  }
  async function failGeneration() {
    if (!failure) return;
    let v: { fail_reason: string };
    try {
      v = await failForm.validateFields();
    } catch {
      return;
    }
    const target = failure.generation_no;
    if (target.length > 32) {
      message.error('生成单号不能超过32个字符');
      return;
    }
    const ok = await write((latest) => {
      const currentRow = latest.generations.find(
        (r) => r.generation_no === target,
      );
      if (!currentRow || currentRow.status !== '0')
        throw new Error('仅处理中生成单可以执行失败兜底，请刷新后重试');
      assertNoAigcSecrets(v.fail_reason);
      const next = {
        ...currentRow,
        status: '2',
        fail_reason: v.fail_reason.trim(),
        reason: v.fail_reason.trim(),
        settlement: '已返还',
        update_time: systemStamp(),
      };
      return loggedAigc(
        {
          ...latest,
          generations: latest.generations.map((r) =>
            r.generation_no === target ? next : r,
          ),
        },
        '标记生成失败并退还积分',
        target,
        { status: currentRow.status, cost_points: currentRow.cost_points },
        {
          status: next.status,
          fail_reason: next.fail_reason,
          settlement: next.settlement,
        },
        v.fail_reason.trim(),
      );
    });
    if (ok) {
      setFailure(null);
      setDirty(false);
      failForm.resetFields();
      if (detail?.generation_no === target)
        setDetail(
          readAigcStore().generations.find((r) => r.generation_no === target) ||
            null,
        );
    }
  }
  const updateFilter = (patch: Partial<Filters>) =>
    setFilters((previous) => ({ ...previous, ...patch }));
  const query = () => {
    try {
      setData(readAigcStore());
      setApplied({ ...filters });
      setCurrent(1);
    } catch (e) {
      message.error(e instanceof Error ? e.message : '查询失败');
    }
  };
  const models =
    localState === 'empty'
      ? []
      : (data?.models || []).filter(
          (m) =>
            (!applied.keyword ||
              `${m.code} ${m.name}`
                .toLowerCase()
                .includes(applied.keyword.trim().toLowerCase())) &&
            (!applied.series || exact(m.series_code, applied.series)) &&
            (!applied.output || m.output_types.includes(applied.output)) &&
            (!applied.status || m.status === applied.status),
        );
  const generations =
    localState === 'empty'
      ? []
      : (data?.generations || []).filter(
          (r) =>
            (!applied.generation ||
              exact(r.generation_no, applied.generation)) &&
            (!applied.user || exact(r.user_no, applied.user)) &&
            (!applied.model || exact(r.model_code, applied.model)) &&
            (!applied.series || exact(r.series_code, applied.series)) &&
            (!applied.work || exact(r.work_no, applied.work)) &&
            (!applied.request || exact(r.request_id, applied.request)) &&
            (!applied.output || r.output_type === applied.output) &&
            (applied.status === undefined || r.status === applied.status),
        );
  if (!states.includes(localState))
    return (
      <Result
        status="warning"
        title="当前状态不可用"
        extra={<Button onClick={() => go('aigc-models')}>返回模型列表</Button>}
      />
    );
  if (localState === 'permission-denied')
    return (
      <Result
        status="403"
        title="暂无查看权限"
        subTitle="请联系管理员核对职责范围。"
      />
    );
  if (localState === 'load-failed' || readError)
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={readError}
        extra={<Button onClick={reload}>重新加载</Button>}
      />
    );
  const modelColumns: ColumnsType<AigcModel> = [
    {
      title: '模型编码',
      dataIndex: 'code',
      width: 170,
      render: (value: string) => (
        <Button
          type="link"
          onClick={() =>
            go(`aigc-runtime-detail?code=${encodeURIComponent(value)}`)
          }
        >
          {value}
        </Button>
      ),
    },
    { title: '模型名称', dataIndex: 'name', width: 160 },
    {
      title: '系列',
      width: 160,
      render: (_, row) => (
        <>
          {modelSeriesName(row.series_code)}
          <div className="am-muted">{row.series_code}</div>
        </>
      ),
    },
    {
      title: '厂商模型',
      dataIndex: 'vendor_model',
      width: 190,
      render: (v) => v || '—',
    },
    {
      title: '输出类型',
      width: 150,
      render: (_, row) =>
        row.output_types.map((t) => (
          <Tag key={t} color="blue">
            {outputText(t)}
          </Tag>
        )),
    },
    { title: '消耗积分', dataIndex: 'cost_points', width: 100 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v) => (
        <Tag color={v === '1' ? 'green' : v === '0' ? 'default' : 'orange'}>
          {aigcStatusText(v)}
        </Tag>
      ),
    },
    { title: '更新时间', dataIndex: 'update_time', width: 170 },
    {
      title: '操作',
      fixed: 'right',
      width: 190,
      render: (_, row) => (
        <Space size={0}>
          <Button
            type="link"
            onClick={() =>
              go(`aigc-model-detail?code=${encodeURIComponent(row.code)}`)
            }
          >
            配置
          </Button>
          {canEdit && (
            <>
              <Button
                type="link"
                disabled={busy}
                onClick={() => openModel(row)}
              >
                编辑
              </Button>
              <Button
                type="link"
                danger
                disabled={busy || !['0', '1'].includes(row.status)}
                onClick={() => setDeleting(row)}
              >
                删除
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];
  const generationColumns: ColumnsType<Generation> = [
    { title: '生成单号', dataIndex: 'generation_no', width: 190 },
    {
      title: '模型',
      width: 180,
      render: (_, row) => (
        <>
          {row.model_code}
          <div className="am-muted">{row.series_code}</div>
        </>
      ),
    },
    {
      title: '用户 ID',
      width: 210,
      render: (_, row) => userIdentity(row.user_no),
    },
    {
      title: '输出类型',
      dataIndex: 'output_type',
      width: 100,
      render: outputText,
    },
    {
      title: '生成状态',
      dataIndex: 'status',
      width: 110,
      render: (v) => (
        <Tag
          color={
            v === '1'
              ? 'green'
              : v === '0'
                ? 'blue'
                : v === '2'
                  ? 'red'
                  : v === '3'
                    ? 'gold'
                    : 'orange'
          }
        >
          {generationStatusText(v)}
        </Tag>
      ),
    },
    { title: '消耗积分', dataIndex: 'cost_points', width: 100 },
    { title: '提示词', dataIndex: 'prompt', width: 270, ellipsis: true },
    {
      title: '作品 ID',
      dataIndex: 'work_no',
      width: 150,
      render: (v) => v || '—',
    },
    { title: '创建时间', dataIndex: 'create_time', width: 170 },
    {
      title: '操作',
      fixed: 'right',
      width: 170,
      render: (_, row) => (
        <Space size={0}>
          <Button type="link" onClick={() => setDetail(row)}>
            详情
          </Button>
          {canEdit && row.status === '0' && (
            <Button
              type="link"
              danger
              disabled={busy}
              onClick={() => openFailure(row)}
            >
              标记失败并退还积分
            </Button>
          )}
        </Space>
      ),
    },
  ];
  const pagination = (count: number) => ({
    current: Math.min(current, Math.max(1, Math.ceil(count / pageSize))),
    pageSize,
    showSizeChanger: true,
    pageSizeOptions: [20, 50, 100],
    showQuickJumper: false,
    showTotal: (n: number) => `共 ${n} 条`,
    onChange: (p: number, size: number) => {
      setCurrent(size === pageSize ? p : 1);
      setPageSize(size);
    },
  });
  return (
    <section className="am-root">
      {!configPage ? (
        <>
          <div className="am-toolbar">
            <Space wrap size={8}>
              {page === 'aigc-models' ? (
                <>
                  <Input
                    aria-label="模型名称或编码"
                    placeholder="模型名称 / 编码"
                    value={filters.keyword}
                    onChange={(e) => updateFilter({ keyword: e.target.value })}
                    onPressEnter={query}
                    allowClear
                  />
                  <Input
                    aria-label="系列编码"
                    placeholder="系列编码"
                    value={filters.series}
                    onChange={(e) => updateFilter({ series: e.target.value })}
                    onPressEnter={query}
                    allowClear
                  />
                  <Select
                    aria-label="输出类型"
                    placeholder="输出类型"
                    allowClear
                    value={filters.output}
                    onChange={(v) => updateFilter({ output: v })}
                    options={outputOptions}
                  />
                  <Select
                    aria-label="状态"
                    placeholder="全部状态"
                    allowClear
                    value={filters.status}
                    onChange={(v) => updateFilter({ status: v })}
                    options={statuses}
                  />
                </>
              ) : (
                <>
                  <Input
                    aria-label="生成单号"
                    placeholder="完整生成单号"
                    value={filters.generation}
                    onChange={(e) =>
                      updateFilter({ generation: e.target.value })
                    }
                    onPressEnter={query}
                    allowClear
                  />
                  <Input
                    aria-label="用户 ID"
                    placeholder="用户 ID"
                    value={filters.user}
                    onChange={(e) => updateFilter({ user: e.target.value })}
                    onPressEnter={query}
                    allowClear
                  />
                  <Select
                    aria-label="生成状态"
                    placeholder="生成状态"
                    allowClear
                    value={filters.status}
                    onChange={(v) => updateFilter({ status: v })}
                    options={generationStatusOptions}
                  />
                  <Button type="link" onClick={() => setMore(!more)}>
                    {more ? '收起筛选' : '更多筛选'}
                  </Button>
                </>
              )}
              <Button type="primary" onClick={query}>
                查询
              </Button>
              <Button
                onClick={() => {
                  setFilters(freshFilters());
                  setApplied(freshFilters());
                  setCurrent(1);
                  reload();
                }}
              >
                重置
              </Button>
            </Space>
            {page === 'aigc-models' && canEdit && (
              <Button
                type="primary"
                disabled={!data || localState === 'loading' || busy}
                onClick={() => openModel()}
              >
                新建模型
              </Button>
            )}
          </div>
          {page === 'aigc-generations' && more && (
            <Space wrap size={8} className="am-more">
              <Input
                aria-label="模型编码"
                placeholder="模型编码"
                value={filters.model}
                onChange={(e) => updateFilter({ model: e.target.value })}
                allowClear
              />
              <Input
                aria-label="系列编码"
                placeholder="系列编码"
                value={filters.series}
                onChange={(e) => updateFilter({ series: e.target.value })}
                allowClear
              />
              <Select
                aria-label="输出类型"
                placeholder="输出类型"
                value={filters.output}
                onChange={(v) => updateFilter({ output: v })}
                options={outputOptions}
                allowClear
              />
              <Input
                aria-label="作品 ID"
                placeholder="作品 ID"
                value={filters.work}
                onChange={(e) => updateFilter({ work: e.target.value })}
                allowClear
              />
              <Input
                aria-label="请求 ID"
                placeholder="请求 ID"
                value={filters.request}
                onChange={(e) => updateFilter({ request: e.target.value })}
                allowClear
              />
            </Space>
          )}
          {page === 'aigc-models' ? (
            <Table<AigcModel>
              size="small"
              rowKey="code"
              columns={modelColumns}
              dataSource={models}
              loading={!data || localState === 'loading'}
              scroll={{ x: 1450 }}
              pagination={pagination(models.length)}
            />
          ) : (
            <Table<Generation>
              size="small"
              rowKey="generation_no"
              columns={generationColumns}
              dataSource={generations}
              loading={!data || localState === 'loading'}
              scroll={{ x: 1570 }}
              pagination={pagination(generations.length)}
            />
          )}
        </>
      ) : (
        <>
          <div className="am-detail-actions">
            <Button type="link" onClick={() => go('aigc-models')}>
              返回模型列表
            </Button>
            <Space>
              {selected && (
                <Button
                  type="link"
                  onClick={() =>
                    go(
                      `${page === 'aigc-model-detail' ? 'aigc-runtime-detail' : 'aigc-model-detail'}?code=${encodeURIComponent(selected.code)}`,
                    )
                  }
                >
                  {page === 'aigc-model-detail' ? '模型详情' : '协议配置'}
                </Button>
              )}
              {selected && page === 'aigc-runtime-detail' && canEdit && (
                <Button
                  type="primary"
                  disabled={busy}
                  onClick={() => openModel(selected)}
                >
                  编辑模型
                </Button>
              )}
            </Space>
          </div>
          {!data || localState === 'loading' ? (
            <Spin />
          ) : !selected || localState === 'empty' ? (
            <Empty description={!code ? '缺少模型编码' : '未找到该模型'} />
          ) : (
            <>
              {page === 'aigc-runtime-detail' && (
                <Descriptions
                  className="am-description"
                  bordered
                  size="small"
                  column={2}
                  items={[
                    { key: 'code', label: '模型编码', children: selected.code },
                    { key: 'name', label: '模型名称', children: selected.name },
                    {
                      key: 'series',
                      label: '所属系列',
                      children: `${modelSeriesName(selected.series_code)}（${selected.series_code}）`,
                    },
                    {
                      key: 'vendor',
                      label: '厂商模型',
                      children: selected.vendor_model || '—',
                    },
                    {
                      key: 'outputs',
                      label: '输出类型',
                      children: selected.output_types.map((v) => (
                        <Tag key={v}>{outputText(v)}</Tag>
                      )),
                      span: 2,
                    },
                    {
                      key: 'ratios',
                      label: '画面比例',
                      children: selected.aspect_ratios.join('、') || '—',
                      span: 2,
                    },
                    {
                      key: 'resolutions',
                      label: '分辨率',
                      children: selected.resolutions.join('、') || '—',
                      span: 2,
                    },
                    {
                      key: 'cost',
                      label: '单次调用积分',
                      children: selected.cost_points,
                    },
                    {
                      key: 'status',
                      label: (
                        <Tooltip title="启用允许新调用；停用保留配置与历史生成记录。">
                          供应状态
                        </Tooltip>
                      ),
                      children: aigcStatusText(selected.status),
                    },
                    {
                      key: 'create',
                      label: '创建时间',
                      children: selected.create_time,
                    },
                    {
                      key: 'update',
                      label: '更新时间',
                      children: selected.update_time,
                    },
                  ]}
                />
              )}
              <div className="am-config">
                <Tabs
                  activeKey={tab}
                  onChange={changeTab}
                  items={[
                    ...(canEdit
                      ? [{ key: 'invoke', label: '调用与鉴权' }]
                      : []),
                    { key: 'frontend', label: '用户表单与拼包' },
                  ]}
                />
                {tab === 'invoke' && !invokeLoaded ? (
                  <div className="am-load">
                    <Button type="primary" onClick={() => loadConfig('invoke')}>
                      加载调用与鉴权
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="am-config-actions">
                      <Space>
                        {tab === 'frontend' && canEdit && (
                          <Button
                            disabled={busy}
                            onClick={() => {
                              configForm.setFieldsValue({
                                model_form: prettyAigc(imageFormExample),
                                requestBody: prettyAigc(imageBodyExample),
                              });
                              setDirty(true);
                            }}
                          >
                            填充图片示例
                          </Button>
                        )}
                        <Button
                          disabled={busy}
                          onClick={() => askDiscard(() => loadConfig())}
                        >
                          重新加载
                        </Button>
                        {canEdit && (
                          <Button
                            type="primary"
                            loading={busy}
                            onClick={saveConfig}
                          >
                            {tab === 'frontend'
                              ? '保存前端模板'
                              : '保存调用配置'}
                          </Button>
                        )}
                      </Space>
                    </div>
                    <Form
                      form={configForm}
                      layout="vertical"
                      disabled={busy || !canEdit}
                      onValuesChange={() => setDirty(true)}
                    >
                      {tab === 'frontend' ? (
                        <div className="am-json-grid">
                          <Form.Item
                            name="model_form"
                            label="model_form（JSON）"
                            rules={[
                              { required: true, message: '请填写 model_form' },
                            ]}
                          >
                            <Input.TextArea rows={14} />
                          </Form.Item>
                          <Form.Item
                            name="requestBody"
                            label="requestBody（JSON）"
                            rules={[
                              { required: true, message: '请填写 requestBody' },
                            ]}
                          >
                            <Input.TextArea rows={14} />
                          </Form.Item>
                        </div>
                      ) : (
                        <>
                          <Form.Item
                            name="path"
                            label="请求 Path"
                            rules={[
                              {
                                required: true,
                                whitespace: true,
                                message: '请填写请求 Path',
                              },
                            ]}
                          >
                            <Input placeholder="https://api.example.com/v1/models/{model_name}" />
                          </Form.Item>
                          <div className="am-form-grid">
                            <Form.Item
                              name="method"
                              label="Method"
                              rules={[{ required: true }]}
                            >
                              <Select options={methodOptions} />
                            </Form.Item>
                            <Form.Item
                              name="type"
                              label="输出类型 type"
                              rules={[{ required: true }]}
                            >
                              <Select options={outputOptions} />
                            </Form.Item>
                            <Form.Item
                              name="model_name"
                              label="厂商模型名 model_name"
                            >
                              <Input />
                            </Form.Item>
                          </div>
                          <Form.Item
                            name="auth_headers"
                            label="Auth Headers（JSON 对象）"
                          >
                            <Input.TextArea
                              rows={4}
                              placeholder='{"Authorization":"[TOKEN]"}'
                            />
                          </Form.Item>
                          <div className="am-json-grid">
                            <Form.Item
                              name="result"
                              label="结果路径 result"
                              rules={[
                                {
                                  required: true,
                                  whitespace: true,
                                  message: '请填写结果路径',
                                },
                              ]}
                            >
                              <Input placeholder="data[0].url" />
                            </Form.Item>
                            <Form.Item
                              name="resultType"
                              label="结果类型 resultType"
                              rules={[{ required: true }]}
                            >
                              <Select options={resultOptions} />
                            </Form.Item>
                          </div>
                          <Form.Item
                            name="responseBody"
                            label="responseBody（可选 JSON）"
                          >
                            <Input.TextArea rows={8} />
                          </Form.Item>
                          {resultType === 'id' && (
                            <>
                              <Form.Item
                                name="queryResultPath"
                                label="queryResultPath"
                                rules={[
                                  {
                                    required: true,
                                    whitespace: true,
                                    message: '异步模型请填写 queryResultPath',
                                  },
                                ]}
                              >
                                <Input placeholder="https://api.example.com/v1/tasks/{task_id}" />
                              </Form.Item>
                              <Form.Item
                                name="queryResultType"
                                label="queryResultType"
                              >
                                <Select
                                  options={[
                                    { value: 'get', label: 'GET' },
                                    { value: 'post', label: 'POST' },
                                  ]}
                                  allowClear
                                />
                              </Form.Item>
                              <Form.Item
                                name="queryResultResponseBody"
                                label="queryResultResponseBody（可选 JSON）"
                              >
                                <Input.TextArea rows={8} />
                              </Form.Item>
                              <Form.Item
                                name="resultMapping"
                                label="resultMapping（JSON）"
                              >
                                <Input.TextArea
                                  rows={4}
                                  placeholder='{"video_url":"video_url","progress":"progress","error":"error"}'
                                />
                              </Form.Item>
                            </>
                          )}
                        </>
                      )}
                    </Form>
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}
      <Modal
        className="am-modal"
        open={!!editor}
        title={editor?.creating ? '新建模型' : '编辑模型'}
        width={640}
        mask={{ closable: false }}
        destroyOnHidden
        onCancel={() =>
          askDiscard(() => {
            setEditor(null);
            modelForm.resetFields();
          })
        }
        onOk={saveModel}
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={modelForm}
          layout="vertical"
          disabled={busy}
          onValuesChange={() => setDirty(true)}
        >
          <Form.Item
            name="code"
            label="模型编码"
            rules={[
              { required: true, whitespace: true, message: '请输入模型编码' },
            ]}
          >
            <Input disabled={!editor?.creating || busy} />
          </Form.Item>
          <Form.Item
            name="name"
            label="模型名称"
            rules={[
              { required: true, whitespace: true, message: '请输入模型名称' },
            ]}
          >
            <Input />
          </Form.Item>
          {editor?.creating && (
            <Form.Item
              name="series_code"
              label="所属系列"
              rules={[{ required: true, message: '请选择系列' }]}
            >
              <Select
                showSearch={{ optionFilterProp: 'label' }}
                options={modelSeriesOptions()}
              />
            </Form.Item>
          )}
          <Form.Item name="vendor_model" label="厂商模型">
            <Input />
          </Form.Item>
          <Form.Item
            name="output_types"
            label="输出类型"
            rules={[
              {
                required: true,
                type: 'array',
                min: 1,
                message: '请选择输出类型',
              },
            ]}
          >
            <Select mode="multiple" allowClear options={outputOptions} />
          </Form.Item>
          <Form.Item
            name="cost_points"
            label="消耗积分"
            rules={[{ required: true, message: '请输入消耗积分' }]}
          >
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Radio.Group>
              <Radio value="1" disabled={editor?.creating}>
                启用
              </Radio>
              <Radio value="0">停用</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        className="am-modal"
        open={!!deleting}
        title="确认删除该模型？"
        onCancel={() => {
          if (!busy) setDeleting(null);
        }}
        onOk={deleteModel}
        mask={{ closable: false }}
        confirmLoading={busy}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ disabled: busy }}
      >
        <p>模型编码：{deleting?.code}</p>
      </Modal>
      <Drawer
        className="am-drawer"
        open={!!detail}
        title="生成单详情"
        size={760}
        destroyOnHidden
        onClose={() => setDetail(null)}
        extra={
          detail?.status === '0' && canEdit ? (
            <Button danger onClick={() => openFailure(detail)}>
              标记失败并退还积分
            </Button>
          ) : undefined
        }
      >
        {detail && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              items={[
                {
                  key: 'generation',
                  label: '生成单号',
                  children: detail.generation_no,
                  span: 2,
                },
                {
                  key: 'user',
                  label: '用户 ID',
                  children: userIdentity(detail.user_no),
                },
                {
                  key: 'status',
                  label: '生成状态',
                  children: generationStatusText(detail.status),
                },
                ...(
                  [
                    ['series_code', '系列编码'],
                    ['model_code', '模型编码'],
                    ['output_type', '输出类型'],
                    ['cost_points', '消耗积分'],
                    ['aspect_ratio', '输入比例'],
                    ['mapped_ratio', '实际比例'],
                    ['resolution', '分辨率'],
                    ['work_no', '作品 ID'],
                    ['activity_code', '活动编码'],
                    ['request_id', '请求 ID'],
                    ['create_time', '创建时间'],
                    ['update_time', '更新时间'],
                  ] as const
                ).map(([key, label]) => ({
                  key,
                  label,
                  children:
                    key === 'output_type'
                      ? outputText(detail[key])
                      : stringValue(detail[key]) || '—',
                })),
                {
                  key: 'prompt',
                  label: '提示词',
                  children: (
                    <pre className="am-pre">{detail.prompt || '—'}</pre>
                  ),
                  span: 2,
                },
                ...(detail.fail_reason
                  ? [
                      {
                        key: 'fail',
                        label: '失败原因',
                        children: detail.fail_reason,
                        span: 2,
                      },
                    ]
                  : []),
                {
                  key: 'text',
                  label: '文本结果',
                  children: (
                    <pre className="am-pre">{detail.result_text || '—'}</pre>
                  ),
                  span: 2,
                },
              ]}
            />
            {detail.input_images.length > 0 && (
              <MediaImages title="输入图片" values={detail.input_images} />
            )}
            {detail.result_images.length > 0 && (
              <MediaImages title="结果图片" values={detail.result_images} />
            )}
            {detail.result_videos.length > 0 && (
              <>
                <h3>结果视频</h3>
                {detail.result_videos
                  .filter((u) => /^(?:https?:\/\/|\/)/.test(u))
                  .map((url) => (
                    <video
                      className="am-video"
                      key={url}
                      src={url}
                      controls
                      preload="metadata"
                    >
                      <track
                        kind="captions"
                        src="/home-prototype/sea-sample.vtt"
                        srcLang="zh"
                        label="中文"
                      />
                    </video>
                  ))}
              </>
            )}
            <Collapse
              ghost
              items={[
                {
                  key: 'request',
                  label: '原始请求（敏感字段已脱敏）',
                  children: (
                    <pre className="am-pre">
                      {prettyAigc(detail.raw_request)}
                    </pre>
                  ),
                },
                {
                  key: 'response',
                  label: '原始响应（敏感字段已脱敏）',
                  children: (
                    <pre className="am-pre">
                      {prettyAigc(detail.raw_response)}
                    </pre>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>
      <Modal
        className="am-modal"
        open={!!failure}
        title="标记生成失败"
        width={620}
        mask={{ closable: false }}
        destroyOnHidden
        onCancel={() =>
          askDiscard(() => {
            setFailure(null);
            failForm.resetFields();
          })
        }
        onOk={failGeneration}
        confirmLoading={busy}
        okText="确认标记失败并退还积分"
        cancelText="取消"
        okButtonProps={{ danger: true }}
        cancelButtonProps={{ disabled: busy }}
      >
        <p>
          仅对处理中生成单执行失败兜底，退还本次扣减积分，不会重新发起生成。
        </p>
        <Descriptions
          bordered
          size="small"
          column={2}
          items={[
            {
              key: 'id',
              label: '生成单号',
              children: failure?.generation_no,
              span: 2,
            },
            {
              key: 'status',
              label: '当前状态',
              children: generationStatusText(failure?.status),
            },
            { key: 'cost', label: '扣减积分', children: failure?.cost_points },
            { key: 'user', label: '用户', children: userIdentity(failure?.user_no || '') },
            { key: 'model', label: '模型', children: failure?.model_code },
          ]}
        />
        <Form
          form={failForm}
          layout="vertical"
          disabled={busy}
          onValuesChange={() => setDirty(true)}
        >
          <Form.Item
            name="fail_reason"
            label="失败原因"
            rules={[
              { required: true, whitespace: true, message: '请输入失败原因' },
              { max: 512, message: '失败原因不能超过512个字符' },
            ]}
          >
            <Input.TextArea rows={4} maxLength={512} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
function MediaImages({ title, values }: { title: string; values: string[] }) {
  return (
    <>
      <h3>{title}</h3>
      <Image.PreviewGroup>
        <div className="am-images">
          {values
            .filter((u) => /^(?:https?:\/\/|\/)/.test(u))
            .map((url) => (
              <Image key={url} src={url} alt={title} width={112} height={112} />
            ))}
        </div>
      </Image.PreviewGroup>
    </>
  );
}

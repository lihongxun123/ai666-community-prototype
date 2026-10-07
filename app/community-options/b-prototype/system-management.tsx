'use client';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  App,
  Button,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Result,
  Select,
  Space,
  Table,
  Tag,
  Tree,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import dayjs from 'dayjs';
import {
  aggregateSystemLogs,
  appendSystemLog,
  enabled,
  formatSystemValue,
  isSuper,
  initialSystemStore,
  knownStatus,
  permissionCodes,
  permissionSummary,
  readSystemStore,
  roleIds,
  sanitizeSystemValue,
  statusText,
  stringList,
  stringValue,
  syncSystemCatalog,
  systemStamp,
  systemTime,
  systemStorageKey,
  type Permission,
  type SystemRow,
  type SystemStore,
} from './system-model';
import './system-management.css';

const stateAliases: Record<string, string> = {
  'load-failed': 'error',
  'permission-denied': 'no-permission',
  'save-failed': 'save-error',
};
const supportedStates = [
  'normal',
  'empty',
  'loading',
  'error',
  'no-permission',
  'save-error',
];
const moduleTitles: Record<string, string> = {
  'system-roles': '角色管理',
  'system-permissions': '权限管理',
  'system-admins': '后台用户管理',
  'system-logs': '操作日志',
};
type Filters = {
  id: string;
  keyword: string;
  status?: string;
  type?: string;
  category?: string;
  operation?: string;
  actor: string;
  target: string;
  from: string;
  to: string;
};
const freshFilters = (): Filters => ({
  id: '',
  keyword: '',
  actor: '',
  target: '',
  from: '',
  to: '',
});
type Edit = {
  row: SystemRow;
  creating: boolean;
  readonly: boolean;
  page: string;
};
type Pending = {
  kind: 'save' | 'toggle' | 'sync' | 'password';
  title: string;
  row?: SystemRow;
  nextStatus?: string;
};
const exact = (a: unknown, b: string) =>
  stringValue(a).trim().toLowerCase() === b.trim().toLowerCase();
const typeOptions = [
  { value: '1', label: '菜单' },
  { value: '2', label: '按钮' },
  { value: '3', label: '接口' },
];
const statusOptions = [
  { value: '启用', label: '启用' },
  { value: '停用', label: '停用' },
];

function permissionTree(
  rows: Permission[],
  parent = 0,
  visited: number[] = [],
): DataNode[] {
  return rows
    .filter(
      (r) =>
        r.parent_id === parent ||
        (parent === 0 && !rows.some((x) => Number(x.id) === r.parent_id)),
    )
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((r) => !visited.includes(Number(r.id)))
    .map((r) => ({
      key: r.code,
      title: (
        <span>
          {r.name}
          <small className="sm-muted"> {r.front_key}</small>
        </span>
      ),
      children: permissionTree(rows, Number(r.id), [...visited, Number(r.id)]),
    }));
}

export function SystemManagement({
  page,
  state,
  go,
}: {
  page: string;
  state: string;
  go: (s: string) => void;
}) {
  const { message, modal } = App.useApp();
  const [store, setStore] = useState<SystemStore>(initialSystemStore),
    [ready, setReady] = useState(false),
    [localState, setLocalState] = useState(stateAliases[state] || state),
    [filters, setFilters] = useState<Filters>(freshFilters),
    [applied, setApplied] = useState<Filters>(freshFilters),
    [more, setMore] = useState(false),
    [current, setCurrent] = useState(1),
    [pageSize, setPageSize] = useState(20),
    [editing, setEditing] = useState<Edit | null>(null),
    [passwordRow, setPasswordRow] = useState<SystemRow | null>(null),
    [logDetail, setLogDetail] = useState<SystemRow | null>(null),
    [dirty, setDirty] = useState(false),
    [busy, setBusy] = useState(false),
    [pending, setPending] = useState<Pending | null>(null),
    [readError, setReadError] = useState('');
  const [form] = Form.useForm(),
    [passwordForm] = Form.useForm();
  const permissionSelection = Form.useWatch('permission_codes', form) as
    | string[]
    | undefined;
  const mounted = useRef(true),
    submitting = useRef(false),
    writeContext = useRef({ page, state: localState });
  const normalizedState = stateAliases[state] || state;
  useEffect(() => {
    writeContext.current = { page, state: normalizedState };
  }, [page, normalizedState]);
  useEffect(() => {
    mounted.current = true;
    queueMicrotask(() => {
      try {
        setStore(readSystemStore());
      } catch (e) {
        setReadError(e instanceof Error ? e.message : '加载失败');
      }
      setReady(true);
    });
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    queueMicrotask(() => {
      setLocalState(normalizedState);
      setFilters(freshFilters());
      setApplied(freshFilters());
      setCurrent(1);
      setMore(false);
    });
  }, [page, normalizedState]);
  useEffect(() => {
    if (!dirty && !busy) return;
    const beforeNavigate = (event: Event) => {
      event.preventDefault();
      if (submitting.current) {
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
          setEditing(null);
          setPasswordRow(null);
          setPending(null);
          form.resetFields();
          passwordForm.resetFields();
          (event as CustomEvent<{ proceed: () => void }>).detail.proceed();
        },
      });
    };
    const unload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('prototype-before-navigate', beforeNavigate);
    window.addEventListener('beforeunload', unload);
    return () => {
      window.removeEventListener('prototype-before-navigate', beforeNavigate);
      window.removeEventListener('beforeunload', unload);
    };
  }, [dirty, busy, form, passwordForm, modal, message]);
  function reload() {
    try {
      setStore(readSystemStore());
      setReadError('');
      setLocalState('normal');
    } catch (e) {
      message.error(e instanceof Error ? e.message : '加载失败，请重试');
    }
  }
  function closeEditor() {
    if (submitting.current) return;
    const close = () => {
      setEditing(null);
      setPasswordRow(null);
      setPending(null);
      setDirty(false);
      form.resetFields();
      passwordForm.resetFields();
    };
    if (dirty)
      modal.confirm({
        title: '放弃未保存的修改？',
        content: '当前输入尚未保存。',
        okText: '放弃修改',
        cancelText: '继续编辑',
        onOk: close,
      });
    else close();
  }
  function openEdit(row?: SystemRow, readonly = false) {
    const creating = !row;
    const next = row || {
      id: crypto.randomUUID(),
      name: '',
      status: '启用',
      date: systemStamp(),
      kind:
        page === 'system-roles'
          ? '业务角色'
          : page === 'system-admins'
            ? '后台用户'
            : '自定义权限',
      summary: '',
      is_super: '0',
    };
    form.resetFields();
    form.setFieldsValue({
      ...next,
      status: knownStatus(next.status) ? statusText(next.status) : undefined,
      description: next.description || next.summary || '',
      permission_codes: isSuper(next)
        ? store.permissions.filter((p) => enabled(p.status)).map((p) => p.code)
        : permissionCodes(next),
      account: creating
        ? ''
        : next.account ||
          (next.id === 'ADM-DEMO-1' ? 'demo_admin' : 'demo_editor'),
      user_name: next.name,
      role_nos: roleIds(next),
      code: next.code || '',
      parent_id: next.parent_id || 0,
      type: next.type || '2',
      front_key: next.front_key || '',
      sort_order: next.sort_order ?? 100,
      apis: next.apis || [],
    });
    setEditing({ row: next, creating, readonly, page });
    setDirty(false);
    setPending(null);
  }
  function openPassword(row: SystemRow) {
    passwordForm.resetFields();
    setPasswordRow(row);
    setDirty(false);
    setPending(null);
  }
  const permissions = store.permissions;
  const activePermissions = permissions.filter((p) => enabled(p.status));
  const codes = activePermissions.map((p) => p.code);
  const unknownCodes =
    editing && page === 'system-roles'
      ? permissionCodes(editing.row).filter((c) => !codes.includes(c))
      : [];
  function protectedAdmin(row: SystemRow, data = store) {
    return isSuper(row) && data.admins.filter(isSuper).length <= 1;
  }
  function roleName(id: string) {
    return store.roles.find((r) => r.id === id)?.name || id;
  }
  let all: SystemRow[] =
    page === 'system-roles'
      ? store.roles
      : page === 'system-admins'
        ? store.admins
        : page === 'system-permissions'
          ? permissions
          : [];
  if (page === 'system-logs') {
    try {
      all = aggregateSystemLogs(store);
    } catch {
      all = store.logs;
    }
  }
  const rows =
    localState === 'empty'
      ? []
      : all.filter((r) => {
          if (page === 'system-logs')
            return (
              (!applied.id || exact(r.id, applied.id)) &&
              (!applied.category || r.kind === applied.category) &&
              (!applied.operation || r.name === applied.operation) &&
              (!applied.actor ||
                stringValue(r.actor)
                  .toLowerCase()
                  .includes(applied.actor.trim().toLowerCase())) &&
              (!applied.target || exact(r.target, applied.target)) &&
              (!applied.from ||
                systemTime(r.date) >= systemTime(applied.from)) &&
              (!applied.to || systemTime(r.date) <= systemTime(applied.to))
            );
          const keyword = applied.keyword.trim().toLowerCase();
          return (
            (!applied.id || exact(r.id, applied.id)) &&
            (!keyword ||
              `${r.name} ${page === 'system-admins' ? stringValue(r.account) : page === 'system-permissions' ? stringValue(r.code) : ''}`
                .toLowerCase()
                .includes(keyword)) &&
            (!applied.status || statusText(r.status) === applied.status) &&
            (!applied.type || r.type === applied.type)
          );
        });
  async function stageSave() {
    if (busy || editing?.readonly) return;
    try {
      const v = await form.validateFields();
      if (page === 'system-permissions') {
        if (
          permissions.some((p) => p.code === v.code && p.id !== editing?.row.id)
        ) {
          message.error('权限编码已存在');
          return;
        }
        if (
          (v.apis || []).some(
            (a: { path: string }) =>
              a.path?.trim() && !a.path.trim().startsWith('/'),
          )
        ) {
          message.error('接口路径必须以 / 开头');
          return;
        }
        let parent = Number(v.parent_id),
          guard = 0;
        while (parent && guard++ <= permissions.length) {
          if (String(parent) === editing?.row.id) {
            message.error('父级权限不能指向自身或下级权限');
            return;
          }
          parent =
            permissions.find((p) => Number(p.id) === parent)?.parent_id || 0;
        }
        if (guard > permissions.length + 1) {
          message.error('父级权限存在循环，请重新选择');
          return;
        }
      }
      if (page === 'system-admins') {
        if (editing && !enabled(v.status) && protectedAdmin(editing.row)) {
          message.error('最后一个超级管理员不能停用');
          return;
        }
        if (
          store.admins.some(
            (a) =>
              stringValue(a.account).toLowerCase() ===
                v.account.trim().toLowerCase() && a.id !== editing?.row.id,
          )
        ) {
          message.error('账号已存在');
          return;
        }
      }
      await commitWrite({ kind: 'save', title: '保存', row: editing?.row });
    } catch {
      /* Form displays field validation messages. */
    }
  }
  async function commitWrite(write: Pending) {
    if (submitting.current) return;
    if (
      !ready ||
      readError ||
      ['no-permission', 'loading', 'error'].includes(localState) ||
      !supportedStates.includes(localState)
    )
      return;
    let values: Record<string, unknown> = {};
    try {
      if (write.kind === 'save') values = await form.validateFields();
      if (write.kind === 'password') await passwordForm.validateFields();
    } catch {
      return;
    }
    submitting.current = true;
    setBusy(true);
    const context = writeContext.current;
    await new Promise((resolve) => setTimeout(resolve, 280));
    if (!mounted.current) {
      submitting.current = false;
      return;
    }
    try {
      if (
        context !== writeContext.current ||
        writeContext.current.state === 'no-permission'
      )
        throw new Error('当前页面或权限已变化，请重新操作');
      if (localState === 'save-error') {
        setLocalState('normal');
        throw new Error('提交失败，输入已保留，请重试');
      }
      let latest = readSystemStore();
      const bucket =
        page === 'system-roles'
          ? 'roles'
          : page === 'system-admins'
            ? 'admins'
            : 'permissions';
      let target = write.row?.id || 'system-permission-catalog';
      const row = write.row
        ? (latest[bucket] as SystemRow[]).find((r) => r.id === write.row?.id)
        : undefined;
      let before: unknown = row || {},
        after: unknown = {},
        action = write.title.replace(/[？?]/g, '');
      if (write.kind === 'sync') {
        const plan = syncSystemCatalog(latest);
        before = { count: latest.permissions.length };
        after = {
          created: plan.created,
          updated: plan.updated,
          extra: plan.extra,
        };
        latest = { ...latest, permissions: plan.permissions };
        action = '同步系统权限';
      } else if (write.kind === 'password') {
        if (!latest.admins.some((a) => a.id === target && !isSuper(a)))
          throw new Error('当前账号不可重置密码，请重新选择');
        before = '—';
        after = '已重置';
        action = '重置后台用户密码';
      } else if (write.kind === 'toggle') {
        if (
          !row ||
          !knownStatus(row.status) ||
          (page === 'system-roles' && isSuper(row))
        )
          throw new Error('当前对象不可变更，请重新加载');
        const next = { ...row, status: write.nextStatus!, date: systemStamp() };
        after = { status: next.status };
        before = { status: row.status };
        latest = {
          ...latest,
          [bucket]: (latest[bucket] as SystemRow[]).map((r) =>
            r.id === target ? next : r,
          ),
        };
        action = enabled(next.status) ? '启用' : '停用';
      } else {
        if (!editing || editing.page !== page || editing.readonly)
          throw new Error('编辑对象已变化，请重新打开');
        if (!editing.creating && !row)
          throw new Error('对象已不存在，请重新选择');
        let next: SystemRow = {
          ...(row || editing.row),
          status: stringValue(values.status),
          date: systemStamp(),
        };
        if (!knownStatus(next.status)) throw new Error('请选择有效状态');
        if (page === 'system-roles') {
          if (isSuper(next)) throw new Error('超级管理员角色仅可查看');
          const selected = [
            ...new Set([
              ...stringList(values.permission_codes),
              ...unknownCodes,
            ]),
          ];
          next = {
            ...next,
            name: stringValue(values.name).trim(),
            description: stringValue(values.description).trim(),
            summary: stringValue(values.description).trim(),
            permission_codes: selected,
            permissions: selected.map(
              (c) => latest.permissions.find((p) => p.code === c)?.name || c,
            ),
          };
        } else if (page === 'system-admins') {
          if (isSuper(next)) throw new Error('超级管理员账号仅可查看');
          if (!enabled(next.status) && protectedAdmin(next, latest))
            throw new Error('最后一个超级管理员不能停用');
          const ids = stringList(values.role_nos);
          next = {
            ...next,
            name: stringValue(values.user_name).trim(),
            account: stringValue(values.account).trim(),
            role_nos: ids,
            role: ids[0] || '',
            kind: '后台用户',
            is_super: '0',
            create_time: stringValue(
              row?.create_time || row?.created_at || row?.date || next.date,
            ),
            date: stringValue(
              row?.create_time || row?.created_at || row?.date || next.date,
            ),
            update_time: systemStamp(),
          };
          if (
            latest.admins.some(
              (a) =>
                a.id !== target &&
                stringValue(a.account).toLowerCase() ===
                  stringValue(next.account).toLowerCase(),
            )
          )
            throw new Error('账号已存在');
        } else {
          if (editing.creating)
            target = String(
              Math.max(0, ...latest.permissions.map((p) => Number(p.id) || 0)) +
                1,
            );
          const apis = Array.isArray(values.apis)
            ? values.apis
                .map((a) => ({
                  method: stringValue(a.method),
                  path: stringValue(a.path).trim(),
                }))
                .filter((a) => a.path)
            : [];
          if (
            apis.some(
              (a) =>
                !a.path.startsWith('/') ||
                !['', 'GET', 'POST', 'DELETE'].includes(a.method),
            )
          )
            throw new Error('请核对接口方法和路径');
          if (!['1', '2', '3'].includes(stringValue(values.type)))
            throw new Error('请选择有效权限类型');
          let parent = Number(values.parent_id),
            traversed = 0;
          while (parent && traversed++ <= latest.permissions.length) {
            if (String(parent) === target)
              throw new Error('父级权限不能指向自身或下级权限');
            const entry = latest.permissions.find(
              (p) => Number(p.id) === parent,
            );
            if (!entry) throw new Error('所选父级权限已不存在，请重新选择');
            parent = entry.parent_id;
          }
          if (parent) throw new Error('父级权限存在循环，请重新选择');
          next = {
            ...next,
            id: target,
            name: stringValue(values.name).trim(),
            code: stringValue(values.code).trim(),
            parent_id: Number(values.parent_id) || 0,
            type: stringValue(values.type),
            front_key: stringValue(values.front_key).trim(),
            sort_order: Number(values.sort_order) || 0,
            apis,
          };
          if (
            latest.permissions.some(
              (p) => p.code === next.code && p.id !== target,
            )
          )
            throw new Error('权限编码已存在');
        }
        after = next;
        latest = {
          ...latest,
          [bucket]: editing.creating
            ? [next, ...(latest[bucket] as SystemRow[])]
            : (latest[bucket] as SystemRow[]).map((r) =>
                r.id === target ? next : r,
              ),
        };
        action = `${editing.creating ? '新建' : '编辑'}${page === 'system-roles' ? '角色' : page === 'system-admins' ? '后台用户' : '权限'}`;
      }
      latest = appendSystemLog(
        latest,
        action,
        moduleTitles[page],
        target,
        before,
        after,
        action,
      );
      localStorage.setItem(systemStorageKey, JSON.stringify(latest));
      setStore(latest);
      setPending(null);
      setEditing(null);
      setPasswordRow(null);
      setDirty(false);
      form.resetFields();
      passwordForm.resetFields();
      message.success('操作完成');
    } catch (e) {
      message.error(
        e instanceof Error ? e.message : '保存失败，输入已保留，请重试',
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }
  function toggle(row: SystemRow) {
    setPending({
      kind: 'toggle',
      title: `确认${enabled(row.status) ? '停用' : '启用'}${row.name}？`,
      row,
      nextStatus: enabled(row.status) ? '停用' : '启用',
    });
  }
  function rowActions(row: SystemRow) {
    if (page === 'system-logs')
      return (
        <Button type="link" onClick={() => setLogDetail(row)}>
          查看
        </Button>
      );
    if (page === 'system-roles')
      return isSuper(row) ? (
        <Button type="link" onClick={() => openEdit(row, true)}>
          查看
        </Button>
      ) : (
        <Space size={0}>
          <Button type="link" disabled={busy} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button
            type="link"
            danger={enabled(row.status)}
            disabled={busy || !knownStatus(row.status)}
            onClick={() => toggle(row)}
          >
            {enabled(row.status) ? '停用' : '启用'}
          </Button>
        </Space>
      );
    if (page === 'system-admins')
      return isSuper(row) ? (
        <Button type="link" onClick={() => openEdit(row, true)}>
          查看
        </Button>
      ) : (
        <Space size={0}>
          <Button type="link" disabled={busy} onClick={() => openEdit(row)}>
            编辑
          </Button>
          <Button
            type="link"
            disabled={busy || !knownStatus(row.status)}
            onClick={() => openPassword(row)}
          >
            重置密码
          </Button>
        </Space>
      );
    return (
      <Space size={0}>
        <Button type="link" disabled={busy} onClick={() => openEdit(row)}>
          编辑
        </Button>
        <Button
          type="link"
          danger={enabled(row.status)}
          disabled={busy || !knownStatus(row.status)}
          onClick={() => toggle(row)}
        >
          {enabled(row.status) ? '停用' : '启用'}
        </Button>
      </Space>
    );
  }
  const stateColumn = {
    title: page === 'system-admins' ? '账号状态' : '状态',
    dataIndex: 'status',
    width: 100,
    render: (s: string) => (
      <Tag
        color={!knownStatus(s) ? 'orange' : enabled(s) ? 'green' : 'default'}
      >
        {statusText(s)}
      </Tag>
    ),
  };
  const columns: ColumnsType<SystemRow> =
    page === 'system-roles'
      ? [
          { title: '角色 ID', dataIndex: 'id', width: 160 },
          {
            title: '角色名称',
            dataIndex: 'name',
            width: 170,
            render: (name, r) => (
              <>
                <strong>{name}</strong>
                <div className="sm-muted">
                  {isSuper(r)
                    ? '超级管理员'
                    : stringValue(r.description || r.summary)}
                </div>
              </>
            ),
          },
          {
            title: '权限摘要',
            width: 320,
            ellipsis: true,
            render: (_, r) => permissionSummary(r, permissions),
          },
          stateColumn,
          {
            title: '后台用户数',
            width: 110,
            render: (_, r) =>
              store.admins.filter((a) => roleIds(a).includes(r.id)).length,
          },
          { title: '更新时间', dataIndex: 'date', width: 170 },
        ]
      : page === 'system-admins'
        ? [
            { title: '管理员 ID', dataIndex: 'id', width: 170 },
            {
              title: '账号 / 名称',
              width: 210,
              render: (_, r) => (
                <>
                  <strong>
                    {stringValue(r.account) ||
                      (r.id === 'ADM-DEMO-1' ? 'demo_admin' : 'demo_editor')}
                  </strong>
                  <div className="sm-muted">{r.name}</div>
                </>
              ),
            },
            {
              title: '角色',
              width: 190,
              ellipsis: true,
              render: (_, r) =>
                isSuper(r)
                  ? '超级管理员'
                  : roleIds(r).map(roleName).join('、') || '未分配',
            },
            stateColumn,
            {
              title: '最后登录',
              width: 170,
              render: (_, r) =>
                stringValue(r.lastLogin || r.last_login_at) || '—',
            },
            {
              title: '创建时间',
              width: 170,
              render: (_, r) =>
                stringValue(r.create_time || r.created_at || r.date),
            },
          ]
        : page === 'system-permissions'
          ? [
              {
                title: '权限编码',
                dataIndex: 'code',
                width: 230,
                ellipsis: true,
              },
              { title: '权限名称', dataIndex: 'name', width: 150 },
              {
                title: '类型',
                width: 85,
                render: (_, r) =>
                  typeOptions.find((t) => t.value === r.type)?.label ||
                  '类型待核对',
              },
              {
                title: '前端标识',
                dataIndex: 'front_key',
                width: 200,
                ellipsis: true,
              },
              {
                title: '接口绑定',
                width: 100,
                render: (_, r) =>
                  `${Array.isArray(r.apis) ? r.apis.length : 0} 个接口`,
              },
              { title: '排序', dataIndex: 'sort_order', width: 80 },
              stateColumn,
              { title: '更新时间', dataIndex: 'date', width: 170 },
            ]
          : [
              { title: '日志 ID', dataIndex: 'id', width: 170, ellipsis: true },
              { title: '动作', dataIndex: 'name', width: 180 },
              {
                title: '对象 ID',
                dataIndex: 'target',
                width: 190,
                ellipsis: true,
              },
              { title: '来源模块', dataIndex: 'kind', width: 130 },
              { title: '操作人', dataIndex: 'actor', width: 140 },
              {
                title: '变更说明',
                width: 330,
                ellipsis: true,
                render: (_, r) => formatSystemValue(r.reason || r.summary),
              },
              { title: '操作时间', dataIndex: 'date', width: 170 },
            ];
  columns.push({
    title: '操作',
    key: 'action',
    width: page === 'system-logs' ? 80 : 160,
    fixed: 'right',
    render: (_, row) => rowActions(row),
  });
  if (!moduleTitles[page] || !supportedStates.includes(localState))
    return (
      <Result
        status="warning"
        title="当前状态不可用"
        extra={<Button onClick={() => go('system-roles')}>返回角色管理</Button>}
      />
    );
  if (localState === 'no-permission')
    return (
      <Result
        status="403"
        title="暂无查看权限"
        subTitle="请联系管理员核对职责范围。"
      />
    );
  if (localState === 'error' || readError)
    return (
      <Result
        status="error"
        title="加载失败"
        subTitle={readError || '请重新加载后继续。'}
        extra={<Button onClick={reload}>重新加载</Button>}
      />
    );
  const changeFilter = (patch: Partial<Filters>) =>
    setFilters((prev) => ({ ...prev, ...patch }));
  const query = () => {
    try {
      setStore(readSystemStore());
      setReadError('');
      setApplied({
        ...filters,
        id: filters.id.trim(),
        target: filters.target.trim(),
      });
      setCurrent(1);
    } catch {
      message.error('加载失败，请重试');
    }
  };
  const chosen = stringList(permissionSelection);
  const plan = syncSystemCatalog(store);
  return (
    <section className="sm-root">
      <div className="sm-toolbar">
        <Space wrap size={8}>
          {page === 'system-roles' ||
          page === 'system-admins' ||
          page === 'system-logs' ? (
            <Input
              aria-label={
                page === 'system-roles'
                  ? '角色 ID'
                  : page === 'system-admins'
                    ? '管理员 ID'
                    : '日志 ID'
              }
              placeholder={
                page === 'system-roles'
                  ? '完整角色 ID'
                  : page === 'system-admins'
                    ? '完整管理员 ID'
                    : '完整日志 ID'
              }
              value={filters.id}
              onChange={(e) => changeFilter({ id: e.target.value })}
              onPressEnter={query}
              allowClear
            />
          ) : null}
          {page !== 'system-logs' ? (
            <Input
              aria-label="名称或账号"
              placeholder={
                page === 'system-roles'
                  ? '角色名称'
                  : page === 'system-admins'
                    ? '账号 / 名称'
                    : '权限名称 / 编码'
              }
              value={filters.keyword}
              onChange={(e) => changeFilter({ keyword: e.target.value })}
              onPressEnter={query}
              allowClear
            />
          ) : (
            <>
              <Select
                aria-label="来源模块"
                placeholder="全部来源模块"
                value={filters.category}
                onChange={(v) => changeFilter({ category: v })}
                allowClear
                options={[...new Set(all.map((r) => r.kind))].map((value) => ({
                  value,
                }))}
              />
              <Select
                aria-label="动作"
                placeholder="全部动作"
                value={filters.operation}
                onChange={(v) => changeFilter({ operation: v })}
                allowClear
                options={[...new Set(all.map((r) => r.name))].map((value) => ({
                  value,
                }))}
              />
            </>
          )}
          {page === 'system-permissions' && (
            <Select
              aria-label="权限类型"
              placeholder="权限类型"
              allowClear
              value={filters.type}
              onChange={(v) => changeFilter({ type: v })}
              options={typeOptions}
            />
          )}
          {['system-roles', 'system-permissions'].includes(page) && (
            <Select
              aria-label="状态"
              placeholder="全部状态"
              allowClear
              value={filters.status}
              onChange={(v) => changeFilter({ status: v })}
              options={statusOptions}
            />
          )}
          {page === 'system-logs' && (
            <Button type="link" onClick={() => setMore(!more)}>
              {more ? '收起筛选' : '更多筛选'}
            </Button>
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
        <Space size={8}>
          {page === 'system-permissions' && (
            <Button
              onClick={() => {
                setPending({ kind: 'sync', title: '同步系统权限？' });
              }}
              disabled={busy}
            >
              同步系统权限
            </Button>
          )}
          {page !== 'system-logs' && (
            <Button
              type="primary"
              disabled={!ready || localState === 'loading' || busy}
              onClick={() => openEdit()}
            >
              {page === 'system-roles'
                ? '新建角色'
                : page === 'system-admins'
                  ? '新建后台用户'
                  : '新增权限'}
            </Button>
          )}
        </Space>
      </div>
      {more && page === 'system-logs' && (
        <Space wrap size={8} className="sm-more">
          <Input
            aria-label="操作账号"
            placeholder="操作账号"
            value={filters.actor}
            onChange={(e) => changeFilter({ actor: e.target.value })}
            allowClear
          />
          <Input
            aria-label="对象 ID"
            placeholder="完整对象 ID"
            value={filters.target}
            onChange={(e) => changeFilter({ target: e.target.value })}
            allowClear
          />
          <DatePicker.RangePicker
            aria-label="操作时间"
            showTime
            value={
              filters.from && filters.to
                ? [dayjs(filters.from), dayjs(filters.to)]
                : null
            }
            onChange={(_, dates) =>
              changeFilter({ from: dates[0], to: dates[1] })
            }
          />
        </Space>
      )}
      <Table<SystemRow>
        rowKey="id"
        size="small"
        columns={columns}
        dataSource={rows}
        loading={!ready || localState === 'loading'}
        scroll={{ x: page === 'system-roles' ? 1110 : 1350 }}
        pagination={{
          current: Math.min(
            current,
            Math.max(1, Math.ceil(rows.length / pageSize)),
          ),
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: [20, 50, 100],
          showQuickJumper: false,
          showTotal: (n) => `共 ${n} 条`,
          onChange: (p, size) => {
            setCurrent(size !== pageSize ? 1 : p);
            setPageSize(size);
          },
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无记录"
            />
          ),
        }}
      />
      <Modal
        className="sm-modal"
        open={!!editing}
        title={`${editing?.readonly ? '查看' : editing?.creating ? '新建' : '编辑'}${page === 'system-roles' ? '角色' : page === 'system-admins' ? '后台用户' : '权限'}`}
        width={
          page === 'system-roles'
            ? 860
            : page === 'system-permissions'
              ? 760
              : 540
        }
        mask={{ closable: false }}
        destroyOnHidden
        onCancel={closeEditor}
        footer={editing?.readonly ? null : undefined}
        okText="保存"
        cancelText="取消"
        onOk={stageSave}
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
      >
        <Form
          form={form}
          layout="vertical"
          disabled={busy || !!editing?.readonly}
          onValuesChange={() => setDirty(true)}
        >
          {page === 'system-roles' ? (
            <div className="sm-role-layout">
              <div>
                {!editing?.creating && (
                  <Form.Item label="角色 ID">
                    <Input value={editing?.row.id} disabled />
                  </Form.Item>
                )}
                <Form.Item
                  name="name"
                  label="角色名称"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入角色名称',
                    },
                  ]}
                >
                  <Input maxLength={64} />
                </Form.Item>
                <Form.Item name="description" label="角色说明">
                  <Input.TextArea rows={4} maxLength={255} showCount />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Radio.Group options={statusOptions} />
                </Form.Item>
                {!editing?.creating && (
                  <Form.Item label="后台用户数">
                    {
                      store.admins.filter((a) =>
                        roleIds(a).includes(editing?.row.id || ''),
                      ).length
                    }
                  </Form.Item>
                )}
              </div>
              <div className="sm-permission-panel">
                <div className="sm-tree-toolbar">
                  <span>
                    页面与操作权限{' '}
                    <small className="sm-muted">
                      已选 {chosen.filter((c) => codes.includes(c)).length} /{' '}
                      {codes.length} 项
                    </small>
                  </span>
                  {!editing?.readonly && (
                    <Space size={0}>
                      <Button
                        type="link"
                        onClick={() => {
                          form.setFieldValue('permission_codes', codes);
                          setDirty(true);
                        }}
                      >
                        全选
                      </Button>
                      <Button
                        type="link"
                        onClick={() => {
                          form.setFieldValue('permission_codes', []);
                          setDirty(true);
                        }}
                      >
                        清空
                      </Button>
                    </Space>
                  )}
                </div>
                <Form.Item
                  name="permission_codes"
                  valuePropName="checkedKeys"
                  trigger="onCheck"
                  getValueFromEvent={(keys) =>
                    Array.isArray(keys) ? keys : keys.checked
                  }
                  rules={[
                    {
                      validator: (_, value) =>
                        stringList(value).length || unknownCodes.length
                          ? Promise.resolve()
                          : Promise.reject(
                              new Error('请至少选择一个页面及其操作权限'),
                            ),
                    },
                  ]}
                >
                  <Tree
                    className="sm-tree"
                    disabled={busy || !!editing?.readonly}
                    treeData={permissionTree(activePermissions)}
                    checkable
                    defaultExpandAll
                    blockNode
                  />
                </Form.Item>
                {unknownCodes.length > 0 && (
                  <Alert
                    type="warning"
                    title="目录外的历史权限将原样保留"
                    description={
                      <Space wrap>
                        {unknownCodes.map((c) => (
                          <Tag key={c}>{c}</Tag>
                        ))}
                      </Space>
                    }
                  />
                )}
              </div>
            </div>
          ) : page === 'system-admins' ? (
            <>
              {!editing?.creating && (
                <Form.Item label="管理员 ID">
                  <Input value={editing?.row.id} disabled />
                </Form.Item>
              )}
              <Form.Item
                name="account"
                label="账号"
                rules={[
                  { required: true, whitespace: true, message: '请输入账号' },
                  { min: 3, max: 24, message: '账号长度需为 3–24 个字符' },
                ]}
              >
                <Input
                  maxLength={24}
                  disabled={!editing?.creating || busy}
                  autoComplete="off"
                />
              </Form.Item>
              <Form.Item
                name="user_name"
                label="名称"
                rules={[
                  { required: true, whitespace: true, message: '请输入名称' },
                ]}
              >
                <Input maxLength={50} />
              </Form.Item>
              <Form.Item name="role_nos" label="角色（可多选）">
                <Select
                  mode="multiple"
                  allowClear
                  options={store.roles
                    .filter(
                      (r) =>
                        enabled(r.status) ||
                        roleIds(editing!.row).includes(r.id),
                    )
                    .map((r) => ({
                      value: r.id,
                      label: `${r.name}（${r.id}）`,
                      disabled: !enabled(r.status),
                    }))}
                />
              </Form.Item>
              {editing && isSuper(editing.row) && (
                <Alert
                  type="warning"
                  title={
                    protectedAdmin(editing.row)
                      ? '最后一个超级管理员不能停用'
                      : '超级管理员身份由系统保护'
                  }
                />
              )}
              <Form.Item
                name="status"
                label="账号状态"
                rules={[{ required: true, message: '请选择账号状态' }]}
              >
                <Radio.Group>
                  <Radio value="启用">启用</Radio>
                  <Radio
                    value="停用"
                    disabled={!!editing && protectedAdmin(editing.row)}
                  >
                    停用
                  </Radio>
                </Radio.Group>
              </Form.Item>
              {editing?.creating && (
                <Form.Item
                  name="password"
                  label="初始密码"
                  rules={[
                    { required: true, message: '请输入初始密码' },
                    { min: 6, max: 32, message: '密码长度需为 6–32 个字符' },
                  ]}
                >
                  <Input.Password maxLength={32} autoComplete="new-password" />
                </Form.Item>
              )}
            </>
          ) : (
            <>
              <div className="sm-form-grid">
                <Form.Item
                  name="code"
                  label="权限编码"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入权限编码',
                    },
                    {
                      pattern: /^[a-z0-9]+(?:[-_:][a-z0-9]+)*$/,
                      message: '仅支持小写字母、数字及 - _ :',
                    },
                  ]}
                >
                  <Input
                    maxLength={100}
                    disabled={!editing?.creating || busy}
                  />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="权限名称"
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: '请输入权限名称',
                    },
                  ]}
                >
                  <Input maxLength={100} />
                </Form.Item>
                <Form.Item name="parent_id" label="父级权限">
                  <Select
                    showSearch={{ optionFilterProp: 'label' }}
                    options={[
                      { value: 0, label: '无（顶级权限）' },
                      ...permissions
                        .filter((p) => p.id !== editing?.row.id)
                        .map((p) => ({
                          value: Number(p.id),
                          label: `${p.name}（${p.code}）`,
                        })),
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  name="type"
                  label="权限类型"
                  rules={[{ required: true, message: '请选择权限类型' }]}
                >
                  <Select options={typeOptions} />
                </Form.Item>
                <Form.Item name="front_key" label="前端元素标识">
                  <Input maxLength={100} />
                </Form.Item>
                <Form.Item name="sort_order" label="排序">
                  <InputNumber precision={0} />
                </Form.Item>
                <Form.Item
                  name="status"
                  label="状态"
                  rules={[{ required: true, message: '请选择状态' }]}
                >
                  <Select options={statusOptions} />
                </Form.Item>
              </div>
              <Form.List name="apis">
                {(fields, { add, remove }) => (
                  <>
                    <div className="sm-tree-toolbar">
                      <span>接口绑定</span>
                      <Button
                        disabled={busy}
                        onClick={() => {
                          add({ method: '', path: '' });
                          setDirty(true);
                        }}
                      >
                        添加接口
                      </Button>
                    </div>
                    {!fields.length && (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="未绑定接口，仅控制页面或按钮"
                      />
                    )}
                    {fields.map((field) => (
                      <div key={field.key} className="sm-api-row">
                        <Form.Item name={[field.name, 'method']}>
                          <Select
                            options={['', 'GET', 'POST', 'DELETE'].map(
                              (value) => ({
                                value,
                                label: value || '任意方法',
                              }),
                            )}
                          />
                        </Form.Item>
                        <Form.Item name={[field.name, 'path']}>
                          <Input
                            maxLength={255}
                            placeholder="/admin/api/example/*"
                          />
                        </Form.Item>
                        <Button
                          type="text"
                          danger
                          disabled={busy}
                          onClick={() => {
                            remove(field.name);
                            setDirty(true);
                          }}
                        >
                          删除
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </Form.List>
            </>
          )}
        </Form>
      </Modal>
      <Modal
        className="sm-modal"
        open={!!passwordRow}
        title="重置后台用户密码"
        mask={{ closable: false }}
        onCancel={closeEditor}
        destroyOnHidden
        onOk={async () => {
          try {
            await passwordForm.validateFields();
            await commitWrite({
              kind: 'password',
              title: '重置后台用户密码',
              row: passwordRow!,
            });
          } catch {
            /* Field errors. */
          }
        }}
        okText="确认重置"
        cancelText="取消"
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          disabled={busy}
          onValuesChange={() => setDirty(true)}
        >
          <Form.Item label="管理员 ID">
            <Input value={passwordRow?.id} disabled />
          </Form.Item>
          <Form.Item label="账号">
            <Input value={stringValue(passwordRow?.account)} disabled />
          </Form.Item>
          <Form.Item
            name="password"
            label="新密码"
            rules={[
              { required: true, message: '请输入新密码' },
              { min: 6, max: 32, message: '密码长度需为 6–32 个字符' },
            ]}
          >
            <Input.Password maxLength={32} autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="确认新密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入新密码' },
              {
                validator: (_, v) =>
                  !v || v === passwordForm.getFieldValue('password')
                    ? Promise.resolve()
                    : Promise.reject(new Error('两次输入的密码不一致')),
              },
            ]}
          >
            <Input.Password maxLength={32} autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        className="sm-modal"
        open={!!pending}
        title={pending?.title}
        mask={{ closable: false }}
        onCancel={() => {
          if (!busy) setPending(null);
        }}
        onOk={() => pending && commitWrite(pending)}
        okText="确认"
        cancelText="取消"
        confirmLoading={busy}
        cancelButtonProps={{ disabled: busy }}
      >
        <p>
          {pending?.kind === 'sync'
            ? `将新增 ${plan.created} 项、校正 ${plan.updated} 项，保留 ${plan.extra} 项自定义权限。`
            : `${pending?.row?.name || '新对象'} · ${pending?.row?.id || ''}`}
        </p>
      </Modal>
      <Modal
        className="sm-modal"
        open={!!logDetail}
        title="操作日志详情"
        width={820}
        mask={{ closable: false }}
        footer={null}
        onCancel={() => setLogDetail(null)}
      >
        {logDetail && (
          <>
            <Descriptions
              bordered
              column={2}
              size="small"
              items={[
                { key: 'id', label: '日志 ID', children: logDetail.id },
                { key: 'action', label: '动作', children: logDetail.name },
                {
                  key: 'target',
                  label: '对象 ID',
                  children: stringValue(logDetail.target) || '—',
                },
                { key: 'module', label: '来源模块', children: logDetail.kind },
                {
                  key: 'actor',
                  label: '操作人',
                  children: stringValue(logDetail.actor) || '—',
                },
                { key: 'date', label: '操作时间', children: logDetail.date },
              ]}
            />
            <h3>变更说明</h3>
            <pre className="sm-business-detail">
              {formatSystemValue(logDetail.reason || logDetail.summary)}
            </pre>
            <h3>业务明细</h3>
            <Descriptions
              bordered
              column={1}
              size="small"
              items={Object.entries(
                sanitizeSystemValue({
                  before: logDetail.before,
                  after: logDetail.after,
                }) as Record<string, unknown>,
              )
                .filter(([, value]) => value != null && value !== '')
                .map(([key, value]) => ({
                  key,
                  label: key === 'before' ? '操作前' : '操作后',
                  children: (
                    <pre className="sm-business-detail">
                      {formatSystemValue(value)}
                    </pre>
                  ),
                }))}
            />
          </>
        )}
      </Modal>
    </section>
  );
}

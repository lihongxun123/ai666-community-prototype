import catalog from './system-permission-catalog.json';
import { readOperations } from './operations-model';
import { readContentModel } from './content-model';
import { readAdminWorks } from './work-management';

export type SystemRow = {
  id: string;
  name: string;
  status: string;
  date: string;
  kind: string;
  summary: string;
  [key: string]: unknown;
};
export type Permission = SystemRow & {
  code: string;
  parent_id: number;
  type: string;
  front_key: string;
  sort_order: number;
  apis: { method: string; path: string }[];
};
export type SystemStore = {
  roles: SystemRow[];
  admins: SystemRow[];
  logs: SystemRow[];
  permissions: Permission[];
  [key: string]: unknown;
};
export const systemStorageKey = 'research-b-platform-v1';
export const systemStamp = () =>
  new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
export function systemTime(value: unknown): number {
  const text = stringValue(value).trim();
  if (/T.*(?:Z|[+-]\d{2}:?\d{2})$/i.test(text)) return Date.parse(text);
  const parts =
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/.exec(
      text,
    );
  if (!parts) return Number.NEGATIVE_INFINITY;
  return Date.UTC(
    Number(parts[1]),
    Number(parts[2]) - 1,
    Number(parts[3]),
    Number(parts[4] || 0) - 8,
    Number(parts[5] || 0),
    Number(parts[6] || 0),
  );
}
export const stringValue = (v: unknown): string => {
  if (typeof v === 'string') return v;
  if (typeof v === 'number' || typeof v === 'boolean' || typeof v === 'bigint')
    return String(v);
  return v && typeof v === 'object' ? JSON.stringify(v) : '';
};
export const stringList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(stringValue).filter(Boolean) : [];
export const isSuper = (r: SystemRow) =>
  stringValue(r.is_super) === '1' ||
  ['ROLE-ADMIN', 'ADM-DEMO-1'].includes(r.id);
export const knownStatus = (s: unknown) =>
  ['启用', '停用', '1', '0'].includes(stringValue(s));
export const enabled = (s: unknown) => ['启用', '1'].includes(stringValue(s));
export const statusText = (s: unknown) =>
  knownStatus(s) ? (enabled(s) ? '启用' : '停用') : '状态待核对';
export const roleIds = (r: SystemRow) =>
  Array.isArray(r.role_nos)
    ? stringList(r.role_nos)
    : r.role
      ? [stringValue(r.role)]
      : [];
export function systemCatalog(): Permission[] {
  const ids = new Map(catalog.map((r, i) => [r.code, i + 1]));
  return catalog.map((r, i) => ({
    ...r,
    id: String(i + 1),
    date: '2026-10-06 10:00:00',
    kind: '系统权限',
    summary: '',
    parent_id: ids.get(r.parentCode) || 0,
    apis: r.apis.map((a) => ({
      method: 'method' in a ? stringValue(a.method) : '',
      path: a.path,
    })),
  }));
}
export function initialSystemStore(): SystemStore {
  const row = (
    id: string,
    name: string,
    extra: Record<string, unknown>,
  ): SystemRow => ({
    id,
    name,
    status: '启用',
    date: '2026-10-05 10:20:00',
    kind: '业务角色',
    summary: '',
    ...extra,
  });
  return {
    permissions: systemCatalog(),
    roles: [
      row('ROLE-ADMIN', '系统管理员', {
        is_super: '1',
        permission_codes: catalog.map((r) => r.code),
        permissions: ['全部权限'],
      }),
      row('ROLE-EDITOR', '内容运营', {
        permission_codes: catalog
          .filter(
            (r) =>
              r.code.startsWith('content-') || r.code.startsWith('review-'),
          )
          .map((r) => r.code),
        permissions: [
          '作品查看',
          '内容维护',
          '内容审核',
          '内容治理',
          '数据查看',
        ],
      }),
      row('ROLE-OBSERVER', '数据观察员', {
        permission_codes: catalog
          .filter((r) => r.code.startsWith('data-analysis-'))
          .map((r) => r.code),
        permissions: ['作品查看', '数据查看'],
      }),
    ],
    admins: [
      row('ADM-DEMO-1', '演示管理员', {
        account: 'demo_admin',
        role: 'ROLE-ADMIN',
        role_nos: ['ROLE-ADMIN'],
        is_super: '1',
        lastLogin: '2026-10-06 08:30:00',
      }),
      row('ADM-DEMO-2', '内容运营甲', {
        account: 'demo_editor',
        role: 'ROLE-EDITOR',
        role_nos: ['ROLE-EDITOR'],
        is_super: '0',
        lastLogin: '2026-10-05 18:10:00',
      }),
    ],
    logs: [
      row('LOG-DEMO-1', '修改展示顺序', {
        status: '成功',
        kind: '运营管理',
        actor: '内容运营',
        target: '专题-示例',
        reason: '调整首页展示顺序',
        before: '排序20',
        after: '排序10',
      }),
      row('LOG-DEMO-2', '审核作品', {
        status: '成功',
        kind: '内容管理',
        actor: '内容运营',
        target: 'work-sea',
        reason: '符合社区规范',
        before: '待审核',
        after: '已公开',
      }),
    ],
  };
}
export function readSystemStore(): SystemStore {
  const base = initialSystemStore();
  if (typeof localStorage === 'undefined') return base;
  const raw = localStorage.getItem(systemStorageKey);
  if (!raw) return base;
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new Error('本地数据无法读取，请重新加载');
  const merged = { ...base, ...parsed } as SystemStore;
  for (const key of ['roles', 'admins', 'logs', 'permissions'] as const)
    if (!Array.isArray(merged[key]))
      throw new Error('本地数据格式异常，请重新加载');
  merged.admins = merged.admins.map((admin) => ({
    ...admin,
    create_time: stringValue(
      admin.create_time ||
        admin.created_at ||
        base.admins.find((a) => a.id === admin.id)?.date ||
        admin.date,
    ),
  }));
  return merged;
}
// Legacy labels are retained until a role is explicitly saved with catalog codes.
export function permissionCodes(r: SystemRow): string[] {
  if (Array.isArray(r.permission_codes)) return stringList(r.permission_codes);
  const labels = stringList(r.permissions);
  const prefix: Record<string, string[]> = {
    作品查看: ['content-list:view'],
    内容维护: ['content-list:edit'],
    内容审核: [
      'review-workbench:view',
      'review-workbench:approve',
      'review-workbench:reject',
    ],
    内容治理: ['content-list:offline', 'flash-management:offline'],
    运营配置: ['operations-settings:view'],
    积分核对: ['points-records:view'],
    用户治理: ['user-list:view', 'user-list:detail'],
    数据查看: ['data-analysis-overview:view'],
    系统管理: [
      'role-management:view',
      'permission-management:view',
      'admin-users:view',
    ],
  };
  return [...new Set(labels.flatMap((v) => prefix[v] || [v]))];
}
export function permissionSummary(
  r: SystemRow,
  permissions: Permission[],
): string {
  if (isSuper(r)) return '全部权限';
  const selected = permissionCodes(r);
  const staticCodes = new Set(catalog.map((p) => p.code));
  const staticKnown = selected.filter(
    (code) => staticCodes.has(code) && !code.startsWith('group:'),
  );
  const pages = catalog.filter(
    (p) =>
      p.level === 1 &&
      staticKnown.some(
        (code) =>
          code === p.code ||
          catalog.some((a) => a.code === code && a.parentCode === p.code),
      ),
  );
  const custom = selected.filter(
    (code) =>
      !staticCodes.has(code) && permissions.some((p) => p.code === code),
  );
  const historical = selected.filter(
    (code) =>
      !permissions.some((p) => p.code === code) && !code.startsWith('group:'),
  );
  return (
    [
      pages.length
        ? `${pages.length} 个页面 · ${staticKnown.length} 项操作`
        : '',
      custom.length ? `${custom.length} 项自定义权限` : '',
      historical.length ? `${historical.length} 个历史权限码` : '',
    ]
      .filter(Boolean)
      .join('；') || '未配置权限'
  );
}
const privateKey =
  /token|authorization|cookie|session|password|secret|api_?key|card_?key|phone|email|client_?ip|remote_?ip|ip_?address|user_?agent|device_?id|^ip$/i;
export function sanitizeSystemValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizeSystemValue);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, v]) => [
        key,
        privateKey.test(key) ? '[已脱敏]' : sanitizeSystemValue(v),
      ]),
    );
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object')
        return sanitizeSystemValue(parsed);
    } catch {
      /* Plain business text. */
    }
  }
  return value;
}
export function formatSystemValue(value: unknown): string {
  const safe = sanitizeSystemValue(value);
  return safe == null || safe === ''
    ? '—'
    : typeof safe === 'object'
      ? JSON.stringify(safe, null, 2)
      : stringValue(safe);
}
export function aggregateSystemLogs(store: SystemStore): SystemRow[] {
  const ops = readOperations().logs.map((x) => ({
    id: 'op-' + x.id,
    name: x.action,
    status: '成功',
    date: x.at,
    kind: x.module,
    summary: x.detail,
    actor: x.actor,
    target: x.object,
    reason: x.detail,
  }));
  const model = readContentModel();
  const content = [
    ...model.records,
    ...model.comments,
    ...model.reports,
  ].flatMap((r) =>
    r.logs.map((x, i) => ({
      id: 'content-' + r.id + '-' + i,
      name: x.action,
      status: '成功',
      date: x.at,
      kind: '内容管理',
      summary: x.reason,
      actor: x.operator,
      target: r.id,
      reason: x.reason,
    })),
  );
  const works = readAdminWorks().flatMap((r) =>
    r.logs.map((x, i) => ({
      id: 'work-' + r.id + '-' + i,
      name: x.action,
      status: '成功',
      date: x.at,
      kind: '作品管理',
      summary: x.reason,
      actor: '内容运营',
      target: r.id,
      reason: x.reason,
    })),
  );
  return [...store.logs, ...ops, ...content, ...works].sort(
    (a, b) => systemTime(b.date) - systemTime(a.date),
  );
}
export function appendSystemLog(
  store: SystemStore,
  action: string,
  module: string,
  target: string,
  before: unknown,
  after: unknown,
  reason: string,
): SystemStore {
  return {
    ...store,
    logs: [
      {
        id: crypto.randomUUID(),
        name: action,
        status: '成功',
        date: systemStamp(),
        kind: module,
        summary: reason,
        actor: '演示管理员',
        target,
        reason,
        before: formatSystemValue(before),
        after: formatSystemValue(after),
      },
      ...store.logs,
    ],
  };
}
export function syncSystemCatalog(store: SystemStore) {
  const canonical = systemCatalog();
  let nextId = Math.max(0, ...store.permissions.map((p) => Number(p.id) || 0));
  const ids = new Map(store.permissions.map((p) => [p.code, Number(p.id)]));
  for (const p of canonical) if (!ids.has(p.code)) ids.set(p.code, ++nextId);
  const expected = canonical.map((p) => ({
    ...p,
    id: String(ids.get(p.code)),
    parent_id: ids.get(stringValue(p.parentCode)) || 0,
  }));
  const comparable = (p: Permission) =>
    JSON.stringify([
      p.name,
      p.parent_id,
      p.type,
      p.front_key,
      p.icon,
      p.sort_order,
      enabled(p.status),
      p.apis,
    ]);
  const created = expected.filter(
    (p) => !store.permissions.some((x) => x.code === p.code),
  ).length;
  const updated = expected.filter((p) => {
    const old = store.permissions.find((x) => x.code === p.code);
    return old && comparable(old) !== comparable(p);
  }).length;
  const extra = store.permissions.filter(
    (p) => !expected.some((x) => x.code === p.code),
  );
  return {
    created,
    updated,
    extra: extra.length,
    permissions: [
      ...expected.map((p) => {
        const old = store.permissions.find((x) => x.code === p.code);
        return old && comparable(old) === comparable(p)
          ? old
          : { ...old, ...p, date: systemStamp() };
      }),
      ...extra,
    ],
  };
}

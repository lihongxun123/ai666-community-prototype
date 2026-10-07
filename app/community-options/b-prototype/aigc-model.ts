import { normalizeModelSeriesCode } from './model-series-management';
import {
  appendSystemLog,
  readSystemStore,
  stringList,
  stringValue,
  systemStamp,
  type SystemRow,
  type SystemStore,
} from './system-model';

export type InvokeConfig = {
  path: string;
  method: string;
  model_name: string;
  type: string;
  result: string;
  resultType: string;
  responseBody: unknown;
  queryResultPath: string;
  queryResultType: string;
  queryResultResponseBody: unknown;
  resultMapping: unknown;
};
export type AigcModel = SystemRow & {
  code: string;
  series_code: string;
  vendor_model: string;
  output_types: string[];
  cost_points: number;
  aspect_ratios: string[];
  resolutions: string[];
  create_time: string;
  update_time: string;
  frontend_config: {
    model_form: Record<string, unknown>;
    requestBody: Record<string, unknown>;
  };
  invoke_config: InvokeConfig | null;
};
export type Generation = SystemRow & {
  generation_no: string;
  user_no: string;
  model_code: string;
  series_code: string;
  output_type: string;
  cost_points: number;
  prompt: string;
  work_no: string;
  request_id: string;
  activity_code: string;
  create_time: string;
  update_time: string;
  fail_reason: string;
  result_text: string;
  input_images: string[];
  result_images: string[];
  result_videos: string[];
  raw_request: unknown;
  raw_response: unknown;
};
export type AigcStore = SystemStore & {
  models: AigcModel[];
  generations: Generation[];
};
export const outputOptions = [
  { value: 'image', label: '图片' },
  { value: 'text', label: '文本' },
  { value: 'video', label: '视频' },
];
export const generationStatusOptions = [
  { value: '0', label: '处理中' },
  { value: '1', label: '成功' },
  { value: '2', label: '失败' },
  { value: '3', label: '已退款' },
];
const legacyTypes: Record<string, string> = {
  图片: 'image',
  视频: 'video',
  文本: 'text',
};
const secretKey =
  /^(auth_headers|authorization|proxy[-_]?authorization|x[-_]?api[-_]?key|api[-_]?key|apikey|access[-_]?token|refresh[-_]?token|token|secret|client[-_]?secret|password|passwd|cookie|set[-_]?cookie|credentials?)$/i;
const placeholder = (v: unknown) =>
  typeof v === 'string' &&
  /^(?:\*+|\[(?:TOKEN|API_KEY|PASSWORD|已脱敏|REDACTED)\])$/i.test(v.trim());
export function safeAigc(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(safeAigc);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .filter(([k]) => !secretKey.test(k))
        .map(([k, v]) => [k, safeAigc(v)]),
    );
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object') return safeAigc(parsed);
    } catch {
      /* Plain text. */
    }
    return value
      .replace(/\bBearer\s+[^\s"',}]+/gi, 'Bearer [TOKEN]')
      .replace(
        /([?&](?:api[-_]?key|access[-_]?token|token|secret|password)=)[^&#\s]+/gi,
        '$1[REDACTED]',
      );
  }
  return value;
}
export function assertNoAigcSecrets(value: unknown): void {
  if (Array.isArray(value)) {
    value.forEach(assertNoAigcSecrets);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (secretKey.test(k) && v != null && v !== '' && !placeholder(v))
        throw new Error('请移除真实鉴权值，使用脱敏占位符');
      assertNoAigcSecrets(v);
    }
  }
  if (
    typeof value === 'string' &&
    /\bBearer\s+(?!\[TOKEN\]|\*+)[A-Za-z0-9._~+/-]+=*|[?&](?:api[-_]?key|token|secret|password)=(?!\[|\*)[^&#\s]+/i.test(
      value,
    )
  )
    throw new Error('请移除真实鉴权值，使用脱敏占位符');
}
export function aigcJson(
  value: unknown,
  label: string,
  { nullable = false, object = false } = {},
): unknown {
  const text = stringValue(value).trim();
  if (nullable && (!text || text === 'null')) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(text || '{}');
  } catch {
    throw new Error(`${label} 不是合法 JSON`);
  }
  if (
    object &&
    (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
  )
    throw new Error(`${label} 须为 JSON 对象`);
  assertNoAigcSecrets(parsed);
  return safeAigc(parsed);
}
export function prettyAigc(value: unknown): string {
  return JSON.stringify(safeAigc(value), null, 2) || '{}';
}
const modelStatus = (s: unknown) =>
  ['1', '启用'].includes(stringValue(s))
    ? '1'
    : ['0', '停用'].includes(stringValue(s))
      ? '0'
      : '';
export const aigcStatusText = (s: unknown) =>
  modelStatus(s) === '1'
    ? '启用'
    : modelStatus(s) === '0'
      ? '停用'
      : '状态待核对';
export const outputText = (s: string) =>
  outputOptions.find((o) => o.value === s)?.label || '类型待核对';
export const generationStatusText = (s: unknown) =>
  generationStatusOptions.find((o) => o.value === stringValue(s))?.label ||
  '状态待核对';
function parseObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value))
    return value as Record<string, unknown>;
  try {
    const parsed = JSON.parse(stringValue(value));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : {};
  } catch {
    return {};
  }
}
export function normalizeAigcModel(row: SystemRow): AigcModel {
  const safe = safeAigc(row) as SystemRow;
  const frontend = parseObject(safe.frontend_config);
  const ratios = stringList(safe.aspect_ratios || safe.ratios);
  const config = parseObject(safe.invoke_config);
  return {
    ...safe,
    id: safe.id || stringValue(safe.code),
    code: stringValue(safe.code || safe.id),
    series_code: normalizeModelSeriesCode(
      stringValue(safe.series_code || safe.series),
    ),
    vendor_model: stringValue(safe.vendor_model),
    output_types: stringList(safe.output_types).length
      ? stringList(safe.output_types)
      : legacyTypes[safe.kind]
        ? [legacyTypes[safe.kind]]
        : [],
    cost_points: Number(safe.cost_points ?? safe.cost ?? 0),
    status: modelStatus(safe.status),
    aspect_ratios: ratios,
    resolutions: stringList(safe.resolutions),
    create_time: stringValue(safe.create_time || safe.date),
    update_time: stringValue(safe.update_time || safe.date),
    frontend_config: {
      model_form: parseObject(frontend.model_form || safe.form),
      requestBody: parseObject(frontend.requestBody),
    },
    invoke_config: Object.keys(config).length ? (config as InvokeConfig) : null,
  };
}
function normalizeGeneration(row: SystemRow, models: AigcModel[]): Generation {
  const safe = safeAigc(row) as SystemRow;
  const statuses: Record<string, string> = {
    处理中: '0',
    成功: '1',
    失败: '2',
    已退款: '3',
  };
  const status =
    statuses[safe.status] ||
    (['0', '1', '2', '3'].includes(stringValue(safe.status))
      ? stringValue(safe.status)
      : '');
  const modelCode = stringValue(safe.model_code || safe.model);
  return {
    ...safe,
    generation_no: stringValue(safe.generation_no || safe.id),
    user_no: stringValue(safe.user_no || safe.user),
    model_code: modelCode,
    series_code: stringValue(
      safe.series_code || models.find((m) => m.code === modelCode)?.series_code,
    ),
    output_type: stringValue(safe.output_type || legacyTypes[safe.kind]),
    cost_points: Number(safe.cost_points ?? safe.cost ?? 0),
    status,
    prompt: stringValue(safe.prompt),
    work_no: stringValue(safe.work_no),
    request_id: stringValue(safe.request_id),
    activity_code: stringValue(safe.activity_code),
    create_time: stringValue(safe.create_time || safe.date),
    update_time: stringValue(safe.update_time || safe.date),
    fail_reason: stringValue(safe.fail_reason || safe.reason),
    result_text: stringValue(
      safe.result_text ||
        (safe.kind === '文本' && status === '1' ? safe.result : ''),
    ),
    input_images: stringList(safe.input_images),
    result_images: stringList(safe.result_images),
    result_videos: stringList(safe.result_videos),
    raw_request: safe.raw_request ?? { prompt: safe.prompt },
    raw_response: safe.raw_response ?? {},
  };
}
function seedModel(): SystemRow[] {
  return [
    {
      id: 'image-standard',
      name: '图片生成',
      status: '启用',
      kind: '图片',
      date: '2026-10-05 10:20:00',
      summary: '用于通用图像创作。',
      series: 'gemini',
      cost: 10,
      ratios: ['1:1', '16:9', '9:16'],
      resolutions: ['1K', '2K'],
      form: '{"prompt":"string","image":[],"ratio":["1:1","16:9"]}',
    },
    {
      id: 'video-standard',
      name: '视频生成',
      status: '启用',
      kind: '视频',
      date: '2026-10-05 10:20:00',
      summary: '用于短视频创作。',
      series: 'zijie',
      cost: 20,
      ratios: ['16:9', '9:16'],
      resolutions: ['720p', '1080p'],
      form: '{"prompt":"string","duration":[5,10]}',
    },
    {
      id: 'text-standard',
      name: '文本创作',
      status: '停用',
      kind: '文本',
      date: '2026-10-05 10:20:00',
      summary: '用于短文与脚本。',
      series: 'deepseek',
      cost: 5,
      form: '{"prompt":"string"}',
    },
  ];
}
function seedGeneration(): SystemRow[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `GEN-DEMO-${1000 + i}`,
    name: ['海岸日落', '产品静物', '海风来信'][i % 3],
    status: ['成功', '处理中', '失败', '失败'][i % 4],
    kind: ['图片', '视频', '文本'][i % 3],
    date: '2026-10-05 10:20:00',
    summary: '',
    user: `U-DEMO-${100 + (i % 8)}`,
    model: ['image-standard', 'video-standard', 'text-standard'][i % 3],
    cost: i % 3 === 1 ? 20 : 10,
    prompt: '沿海岸缓慢推进镜头，海面泛起暖色微光。',
    result: '海风穿过窗前，把日落写进信里。',
    reason:
      i % 4 === 2
        ? '服务响应超时；结算结果待核对。'
        : i % 4 === 3
          ? '生成失败，原扣减已返还。'
          : '',
    settlement: ['已扣减', '预扣处理中', '待核对', '已返还'][i % 4],
  }));
}
export function readAigcStore(): AigcStore {
  const raw = readSystemStore();
  const models = (
    Array.isArray(raw.models) ? (raw.models as SystemRow[]) : seedModel()
  ).map(normalizeAigcModel);
  return {
    ...raw,
    models,
    generations: (Array.isArray(raw.generations)
      ? (raw.generations as SystemRow[])
      : seedGeneration()
    ).map((r) => normalizeGeneration(r, models)),
  };
}
export function readAigcModels(): AigcModel[] {
  return readAigcStore().models;
}
export function loggedAigc(
  store: AigcStore,
  action: string,
  target: string,
  before: unknown,
  after: unknown,
  reason = '',
): AigcStore {
  return appendSystemLog(
    store,
    action,
    'AIGC管理',
    target,
    safeAigc(before),
    safeAigc(after),
    reason || action,
  ) as AigcStore;
}
export const defaultInvoke = (): InvokeConfig => ({
  path: '',
  method: 'POST',
  model_name: '',
  type: 'image',
  result: '',
  resultType: 'url',
  responseBody: {},
  queryResultPath: '',
  queryResultType: 'get',
  queryResultResponseBody: null,
  resultMapping: null,
});
export const imageFormExample = {
  prompt: 'string',
  image: [],
  image_type: ['url', 'base64'],
  image_count: -1,
  ratio: ['1:1', '16:9', '9:16'],
  resolution: ['1k', '2k'],
};
export const imageBodyExample = {
  model: 'gpt-image-2',
  prompt: 'model_form.prompt',
  n: 1,
  size: 'model_form.ratio',
  image: 'model_form.image',
  watermark: true,
};
export function newAigcModel(
  code: string,
  name: string,
  series: string,
): AigcModel {
  const date = systemStamp();
  return normalizeAigcModel({
    id: code,
    code,
    name,
    status: '0',
    kind: '模型',
    date,
    summary: '',
    series_code: series,
    output_types: [],
    cost_points: 1,
    create_time: date,
    update_time: date,
  });
}

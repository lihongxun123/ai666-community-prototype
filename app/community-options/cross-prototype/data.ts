export type ShareMode = 'outcome' | 'view' | 'reuse';
export type Copy = {
  id: string;
  version: number;
  acquiredReshare: boolean;
  parentAllows: boolean;
  title: string;
};
export type ReturnStatus = 'idle' | 'draft-opened' | 'uncertain' | 'duplicate';
export type CrossData = {
  share: {
    mode: ShareMode;
    publicVersion: number;
    privateVersion: number;
    allowReshare: boolean;
    withdrawn: boolean;
    sourceVisible: boolean;
  };
  copies: Copy[];
  selectedCopy: string;
  derivative: { published: boolean; mode: ShareMode; allowReshare: boolean };
  linked: boolean;
  communityAccount: string;
  makeNowAccount: string;
  result: 'poster' | 'portrait';
  returnStatus: ReturnStatus;
  returnAttempt: string;
  activity: 'none' | 'active' | 'ended';
  maintenance: {
    qualified: boolean;
    tutorial: 'draft' | 'submitted' | 'revision' | 'published';
    resource: 'draft' | 'submitted' | 'revision' | 'published';
    tutorialText: string;
    resourceText: string;
  };
};

export type CrossMeta = {
  id: string;
  title: string;
  module: string;
  states: string[];
};
export const crossPages: CrossMeta[] = [
  {
    id: 'project',
    title: '公开项目',
    module: 'MakeNow 分享',
    states: [
      'normal',
      'outcome-only',
      'view-only',
      'withdrawn',
      'source-removed',
      'forbidden',
      'loading',
    ],
  },
  {
    id: 'share',
    title: '分享设置',
    module: 'MakeNow 分享',
    states: ['normal', 'permission', 'dependency-missing', 'save-error'],
  },
  {
    id: 'version',
    title: '公开版本',
    module: 'MakeNow 分享',
    states: ['normal', 'unpublished', 'update-error', 'withdrawn'],
  },
  {
    id: 'copy',
    title: '复制项目',
    module: 'MakeNow 复用',
    states: [
      'normal',
      'view-only',
      'withdrawn',
      'dependency-missing',
      'permission',
      'copy-error',
    ],
  },
  {
    id: 'library',
    title: '我的项目',
    module: 'MakeNow 复用',
    states: ['normal', 'empty', 'source-withdrawn'],
  },
  {
    id: 'editor',
    title: '个人副本',
    module: 'MakeNow 复用',
    states: ['normal', 'mobile', 'dependency-missing', 'source-withdrawn'],
  },
  {
    id: 'derivative',
    title: '衍生分享',
    module: 'MakeNow 复用',
    states: ['normal', 'blocked', 'upstream-blocked', 'published'],
  },
  {
    id: 'results',
    title: '选择成果',
    module: '成果回流',
    states: ['normal', 'empty', 'identity-changed', 'activity-ended'],
  },
  {
    id: 'link',
    title: '确认账号',
    module: '成果回流',
    states: ['normal', 'mismatch', 'expired', 'error'],
  },
  {
    id: 'return',
    title: '回流确认',
    module: '成果回流',
    states: [
      'normal',
      'duplicate',
      'identity-error',
      'activity-ended',
      'network-error',
    ],
  },
  {
    id: 'return-status',
    title: '回流状态',
    module: '成果回流',
    states: ['normal', 'uncertain', 'duplicate', 'identity-error'],
  },
  {
    id: 'workflow',
    title: 'ComfyUI 资源',
    module: '资源取用',
    states: [
      'normal',
      'view-only',
      'license-denied',
      'file-missing',
      'dependency-missing',
      'withdrawn',
    ],
  },
  {
    id: 'workflow-import',
    title: '导入条件',
    module: '资源取用',
    states: [
      'normal',
      'mobile',
      'unsupported',
      'dependency-missing',
      'license-denied',
    ],
  },
  {
    id: 'maintain',
    title: '内容维护',
    module: '作者维护',
    states: ['normal', 'unqualified', 'mobile', 'permission-revoked'],
  },
  {
    id: 'maintain-tutorial',
    title: '维护教程',
    module: '作者维护',
    states: [
      'normal',
      'revision',
      'submitted',
      'permission-revoked',
      'save-error',
      'submit-error',
    ],
  },
  {
    id: 'maintain-resource',
    title: '维护资源',
    module: '作者维护',
    states: [
      'normal',
      'revision',
      'submitted',
      'permission-revoked',
      'file-missing',
      'save-error',
      'submit-error',
    ],
  },
  {
    id: 'maintain-status',
    title: '维护进度',
    module: '作者维护',
    states: [
      'normal',
      'submitted',
      'revision',
      'approved',
      'published',
      'failed',
    ],
  },
  { id: 'review', title: '原型边界', module: '走查', states: ['normal'] },
];

export const initialData: CrossData = {
  share: {
    mode: 'view',
    publicVersion: 2,
    privateVersion: 3,
    allowReshare: false,
    withdrawn: false,
    sourceVisible: true,
  },
  copies: [],
  selectedCopy: '',
  derivative: { published: false, mode: 'view', allowReshare: false },
  linked: false,
  communityAccount: '林间',
  makeNowAccount: '林间工作室',
  result: 'poster',
  returnStatus: 'idle',
  returnAttempt: '',
  activity: 'none',
  maintenance: {
    qualified: true,
    tutorial: 'draft',
    resource: 'draft',
    tutorialText:
      '保留原图副本，先观察划痕与缺损，再做局部修复，最后与原图对照。',
    resourceText:
      '旧照修复参考工程，包含破损标记与局部修复步骤；取用前核对依赖与素材许可。',
  },
};

const KEY = 'cross-prototype-v1';
export function readData(): CrossData {
  if (typeof window === 'undefined') return initialData;
  try {
    const saved = window.sessionStorage.getItem(KEY);
    return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
  } catch {
    return initialData;
  }
}
export function writeData(next: CrossData) {
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event('cross-data'));
}
export function subscribeData(listener: () => void) {
  window.addEventListener('cross-data', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('cross-data', listener);
    window.removeEventListener('storage', listener);
  };
}
export function dataSnapshot() {
  return typeof window === 'undefined'
    ? ''
    : window.sessionStorage.getItem(KEY) || '';
}

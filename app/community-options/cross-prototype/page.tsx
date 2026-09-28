'use client';
/* eslint-disable next/no-img-element -- Existing local prototype media. */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import {
  changeRecord,
  readB,
  useB,
  writeB,
  type Content,
} from '../b-prototype/store';
import {
  crossPages,
  dataSnapshot,
  initialData,
  readData,
  subscribeData,
  writeData,
  type CrossData,
  type ShareMode,
} from './data';
import './cross.css';
export { crossPages } from './data';

const C = '/community-options/c-prototype';
const currentActivity=()=>{if(typeof window==='undefined')return null;const code=sessionStorage.getItem('cp-activity-code'),name=sessionStorage.getItem('cp-activity-name');return sessionStorage.getItem('cp-activity')==='1'&&code&&name?{code,name,task:sessionStorage.getItem('cp-activity-task')||''}:null;};
const routeSnapshot = () => window.location.search;
const routeSubscribe = (cb: () => void) => {
  window.addEventListener('popstate', cb);
  return () => window.removeEventListener('popstate', cb);
};
const deviceSubscribe=(cb:()=>void)=>{const media=window.matchMedia('(max-width: 767px)');media.addEventListener('change',cb);return()=>media.removeEventListener('change',cb);};
const mobileSnapshot=()=>window.matchMedia('(max-width: 767px)').matches;
const ver = (n: number) => `1.${n}`;
type Go = (page: string, extra?: string) => void;
type ResourceAccess = 'none' | 'outcome' | 'view' | 'reuse';
type AuthorKind = 'tutorial' | 'resource';
type AuthorStage =
  | 'draft'
  | 'submitted'
  | 'revision'
  | 'approved'
  | 'published';
const authorId = (kind: AuthorKind) => `${kind}-author`;
const authorTitles: Record<AuthorKind, string> = {
  tutorial: '旧照修复：作者实践笔记',
  resource: '旧照修复参考工程（作者维护）',
};
function authorStage(record?: Content): AuthorStage {
  if (!record) return 'draft';
  if (record.draft.review === '待审') return 'submitted';
  if (record.draft.review === '退回') return 'revision';
  if (
    record.draft.review === '通过' &&
    record.revision > record.publishedRevision
  )
    return 'approved';
  if (
    record.publicStatus === '公开' &&
    record.publishedRevision >= record.revision
  )
    return 'published';
  return 'draft';
}
function saveAuthorDraft(
  kind: AuthorKind,
  title: string,
  body: string,
  submit: boolean,
  fileChanged: boolean,
) {
  try {
    const db = readB();
    const id = authorId(kind);
    let record = db.records.find((entry) => entry.id === id);
    if (!record) {
      const sample = db.records.find((entry) => entry.id === `${kind}-1`);
      if (!sample?.public) return '原公开内容暂不可用，请稍后重试。';
      record = {
        ...structuredClone(sample),
        id,
        public: null,
        publicStatus: '私有',
        revision: 0,
        publishedRevision: 0,
        draft: {
          ...structuredClone(sample.public),
          title: authorTitles[kind],
          author: '林间',
          source: '用户原创',
          license: '',
          entry: kind==='resource'?'':sample.public.entry,
          verified: false,
          review: '草稿',
        },
        recommended: false,
        authorized: true,
        history: [
          {
            at: new Date().toLocaleString('zh-CN'),
            action: '作者维护对象建立',
            detail: '建立独立私有对象，待审核与正式发布',
          },
        ],
      };
      db.records.push(record);
      writeB(db);
    }
    if (!record.authorized || record.publicStatus === '已删除')
      return '当前没有维护权限。';
    if (record.draft.review === '待审') return '已有待审版本，请等待平台处理。';
    changeRecord(
      id,
      submit ? '作者提交审核' : '作者保存草稿',
      submit ? '等待平台审核' : '公开版本未变化',
      (current) => ({
        ...current,
        revision: current.revision + 1,
        draft: {
          ...current.draft,
          title,
          summary: body.slice(0, 70),
          body: [{ id: 'author-body', type: '段落', text: body }],
          author: '林间',
          review: submit ? '待审' : '草稿',
          note: '',
          verified: fileChanged ? false : current.draft.verified,
          change: fileChanged ? '执行更新' : '说明更新',
        },
      }),
    );
    return '';
  } catch {
    return '保存未完成，请保留输入并重试。';
  }
}

function Button({
  children,
  onClick,
  quiet = false,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  quiet?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`xp-button${quiet ? ' quiet' : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
function Note({
  title,
  children,
  tone = 'plain',
}: {
  title: string;
  children?: React.ReactNode;
  tone?: 'plain' | 'warn' | 'good';
}) {
  return (
    <div className={`xp-note ${tone}`}>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}
function CardLink({
  title,
  detail,
  onClick,
  label,
}: {
  title: string;
  detail: string;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button type="button" className="xp-cardlink" onClick={onClick}>
      <span>
        {label && <em>{label}</em>}
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <b aria-hidden="true">›</b>
    </button>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="xp-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Picture({ name, alt }: { name: string; alt: string }) {
  return (
    <img className="xp-cover" src={`/home-prototype/${name}.png`} alt={alt} />
  );
}
function Status({
  state,
  cases,
  go,
}: {
  state: string;
  cases: Record<string, [string, string, string?]>;
  go: Go;
}) {
  const found = cases[state];
  if (!found) return null;
  return (
    <div className="xp-state">
      <h2>{found[0]}</h2>
      <p>{found[1]}</p>
      <Button onClick={() => go(found[2] || 'project')} quiet>
        返回
      </Button>
    </div>
  );
}

function VideoAppHandoff({ back }: { back: () => void }) {
  const [showChecklist, setShowChecklist] = useState(false);
  return (
    <>
      <div className="xp-hero">
        <Picture name="perfume" alt="产品短片画面示意" />
        <div>
          <span className="xp-pill">MakeNow 应用承接</span>
          <h2>产品短片制作</h2>
          <p>从社区应用说明进入电脑端，整理产品图片、短片用途与画面顺序。</p>
        </div>
      </div>
      <div className="xp-facts">
        <span>设备：电脑端</span>
        <span>示例：产品展示短片</span>
      </div>
      <Section title="制作顺序">
        <div className="xp-steps">
          <span>选择产品素材</span>
          <span>确定画面重点</span>
          <span>整理镜头顺序</span>
          <span>复查成片</span>
        </div>
      </Section>
      {showChecklist && (
        <div className="xp-card">
          <strong>准备清单</strong>
          <p>产品图片、使用场景、短片用途与可用素材许可。</p>
          <p>完成制作后，选择要带回社区的实际成果，再检查账号与发布条件。</p>
        </div>
      )}
      <div className="xp-actions">
        <Button onClick={() => setShowChecklist(!showChecklist)}>
          {showChecklist ? '收起准备清单' : '查看准备清单'}
        </Button>
        <Button quiet onClick={back}>
          返回社区应用
        </Button>
      </div>
    </>
  );
}

function Project({
  data,
  state,
  go,
  back,
  resourceAccess,
}: {
  data: CrossData;
  state: string;
  go: Go;
  back: () => void;
  resourceAccess?: ResourceAccess;
}) {
  const chosenMode =
    state === 'outcome-only'
      ? 'outcome'
      : state === 'view-only'
        ? 'view'
        : data.share.mode;
  const mode =
    resourceAccess === 'outcome'
      ? 'outcome'
      : resourceAccess === 'view' && chosenMode === 'reuse'
        ? 'view'
        : chosenMode;
  const withdrawn = data.share.withdrawn || state === 'withdrawn';
  if (state === 'loading') return <div className="xp-skeleton" />;
  if (
    withdrawn ||
    state === 'forbidden' ||
    state === 'source-removed' ||
    !data.share.sourceVisible ||
    resourceAccess === 'none'
  )
    return (
      <Status
        state={
          withdrawn
            ? 'withdrawn'
            : resourceAccess === 'none'
              ? 'resource-unavailable'
              : state === 'source-removed' || !data.share.sourceVisible
                ? 'source-removed'
                : 'forbidden'
        }
        cases={{
          withdrawn: [
            '项目分享已撤回',
            '公开成果可从原内容查看，项目暂不可访问。',
          ],
          'source-removed': ['来源内容不可访问', '此入口已停止承接该项目。'],
          'resource-unavailable': [
            '关联资源暂不可用',
            '请返回社区查看当前资源状态。',
          ],
          forbidden: ['当前无法查看项目', '请返回来源内容。'],
        }}
        go={(_, __) => back()}
      />
    );
  return (
    <>
      <div className="xp-hero">
        <Picture name="restore" alt="旧照修复参考工程预览" />
        <div>
          <span className="xp-pill">MakeNow 公开项目</span>
          <h2>旧照修复参考工程</h2>
          <p>林间 · 公开版本 {ver(data.share.publicVersion)}</p>
          <p>用于观察旧照片的破损区域与修复顺序。</p>
        </div>
      </div>
      <div className="xp-facts">
        <span>
          公开范围：
          {mode === 'outcome'
            ? '仅成果'
            : mode === 'view'
              ? '允许查看'
              : '允许复用'}
        </span>
        <span>设备：电脑继续制作</span>
        <span>来源：旧照修复练习</span>
      </div>
      {mode === 'outcome' ? (
        <Note title="仅展示成果">项目内容暂不开放查看。</Note>
      ) : (
        <Section title="公开项目预览">
          <div className="xp-steps">
            <span>原图观察</span>
            <span>破损标记</span>
            <span>局部修复</span>
            <span>结果对照</span>
          </div>
          <p>展示的是作者选择的公开版本。私人编辑不会改变此处内容。</p>
        </Section>
      )}
      <div className="xp-actions">
        {mode === 'reuse' ? (
          <Button onClick={() => go('copy')}>复制到我的项目</Button>
        ) : mode === 'view' ? (
          <Button quiet onClick={() => go('copy', '&state=view-only')}>
            查看复制条件
          </Button>
        ) : null}
        <Button quiet onClick={() => go('share')}>
          我的分享设置
        </Button>
        <Button quiet onClick={back}>
          返回来源内容
        </Button>
      </div>
      <Section title="继续了解">
        <CardLink
          title="我的项目"
          detail="查看本人已取得的独立副本"
          onClick={() => go('library')}
        />
        <CardLink
          title="公开版本"
          detail="查看作者的公开版本与更新"
          onClick={() => go('version')}
        />
      </Section>
    </>
  );
}

function Share({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  const [mode, setMode] = useState<ShareMode>(data.share.mode);
  const [reshare, setReshare] = useState(data.share.allowReshare);
  const [rights, setRights] = useState(false);
  const [warning, setWarning] = useState('');
  const [retrying, setRetrying] = useState(false);
  const blocked =
    ['permission', 'dependency-missing', 'save-error'].includes(state) &&
    !retrying;
  return (
    <>
      <p className="xp-lead">选择对外可见的成果和项目范围。</p>
      <div className="xp-card">
        <strong>旧照修复参考工程</strong>
        <p>
          私人工作版本 {ver(data.share.privateVersion)} · 当前公开版本{' '}
          {ver(data.share.publicVersion)}
        </p>
      </div>
      {state === 'permission' && (
        <Note title="没有分享权限" tone="warn">
          当前账号不能更改此项目的公开范围。
        </Note>
      )}
      {state === 'dependency-missing' && (
        <Note title="依赖材料待补齐" tone="warn">
          所需素材许可未确认，暂不能开放项目查看或复制。
        </Note>
      )}
      {state === 'save-error' && (
        <Note title="保存失败" tone="warn">
          已选择的设置留在当前页，可以重试。
        </Note>
      )}
      {state === 'save-error' && !retrying && (
        <Button quiet onClick={() => setRetrying(true)}>
          重试保存
        </Button>
      )}
      <Section title="分享范围">
        <div className="xp-choice">
          {(
            [
              ['outcome', '仅分享成果', '作品可看，项目不开放'],
              ['view', '允许查看制作项目', '查看指定的公开版本'],
              ['reuse', '允许复用制作项目', '访客可主动取得独立副本'],
            ] as const
          ).map(([value, title, detail]) => (
            <label key={value}>
              <input
                type="radio"
                name="share"
                aria-label={title}
                checked={mode === value}
                onChange={() => {
                  setMode(value);
                  if (value !== 'reuse') setReshare(false);
                }}
              />
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </label>
          ))}
        </div>
      </Section>
      {mode === 'reuse' && (
        <Section title="衍生工程">
          <label className="xp-check">
            <input
              type="checkbox"
              checked={reshare}
              onChange={(e) => setReshare(e.target.checked)}
            />
            <span>允许取得副本的人再次分享自己的工程</span>
          </label>
          <p className="xp-muted">未开启时仍可修改个人副本并发布合法成果。</p>
        </Section>
      )}
      <label className="xp-check xp-card">
        <input
          type="checkbox"
          checked={rights}
          onChange={(e) => setRights(e.target.checked)}
        />
        <span>我确认公开版本和其中素材具备相应展示、复用许可</span>
      </label>
      {mode === 'reuse' && (
        <Note title="已有副本保持独立">
          今后收紧分享范围，不会删除其他人此前取得的个人副本。
        </Note>
      )}
      {warning && <output className="xp-feedback">{warning}</output>}
      <div className="xp-actions">
        <Button
          onClick={() => {
            if (!rights) {
              setWarning('请先确认公开素材与许可。');
              return;
            }
            if (blocked) {
              setWarning('目前无法保存，请检查当前权限与依赖。');
              return;
            }
            update((d) => ({
              ...d,
              share: {
                ...d.share,
                mode,
                allowReshare: mode === 'reuse' && reshare,
                withdrawn: false,
              },
            }));
            go('project');
          }}
        >
          保存分享设置
        </Button>
        <Button quiet onClick={() => go('version')}>
          管理公开版本
        </Button>
      </div>
    </>
  );
}

function Version({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState('');
  const [retrying,setRetrying]=useState(false);
  return (
    <>
      <div className="xp-grid">
        <div className="xp-card">
          <span className="xp-muted">对外公开</span>
          <h2>版本 {ver(data.share.publicVersion)}</h2>
          <p>新访问者看到这一版。</p>
        </div>
        <div className="xp-card">
          <span className="xp-muted">私人工作区</span>
          <h2>版本 {ver(data.share.privateVersion)}</h2>
          <p>尚未主动更新公开版本。</p>
        </div>
      </div>
      {state === 'unpublished' && (
        <Note title="私人版本未公开">
          已保存的私人修改不会自动替换公开内容。
        </Note>
      )}
      {state === 'update-error' && (
        <Note title="公开更新失败" tone="warn">
          访客仍看到上一次公开版本。
        </Note>
      )}
      {state === 'withdrawn' && (
        <Note title="分享已撤回" tone="warn">
          新访问停止；已有个人副本仍在各自项目中。
        </Note>
      )}
      <Section title="本次更新">
        <p>
          公开版本 {ver(data.share.publicVersion)} →{' '}
          {ver(data.share.privateVersion)}
          。更新后新访问使用新版，已有副本与作品来源版本不变。
        </p>
      </Section>
      <div className="xp-actions">
        {state==='update-error'&&!retrying&&<Button quiet onClick={()=>setRetrying(true)}>重试更新</Button>}
        <Button
          disabled={data.share.publicVersion === data.share.privateVersion||(state==='update-error'&&!retrying)}
          onClick={() => {
            update((d) => ({
              ...d,
              share: {
                ...d.share,
                publicVersion: d.share.privateVersion,
                withdrawn: false,
              },
            }));
            setMessage('公开版本已更新。');
          }}
        >
          更新公开版本
        </Button>
        <Button quiet onClick={() => setConfirm(true)}>
          撤回项目分享
        </Button>
      </div>
      {confirm && (
        <div className="xp-card">
          <strong>撤回项目分享？</strong>
          <p>此后不能通过公开入口查看或复制。已取得的个人副本保持独立。</p>
          <div className="xp-actions">
            <Button
              onClick={() => {
                update((d) => ({
                  ...d,
                  share: { ...d.share, withdrawn: true },
                }));
                setConfirm(false);
                go('project');
              }}
            >
              确认撤回
            </Button>
            <Button quiet onClick={() => setConfirm(false)}>
              取消
            </Button>
          </div>
        </div>
      )}
      {message && <output className="xp-feedback">{message}</output>}
    </>
  );
}

function CopyProject({
  data,
  state,
  go,
  update,
  resourceAccess,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
  resourceAccess?: ResourceAccess;
}) {
  const denied =
    (state !== 'normal' && state !== 'copy-error') ||
    data.share.withdrawn ||
    !data.share.sourceVisible ||
    data.share.mode !== 'reuse' ||
    (resourceAccess !== undefined && resourceAccess !== 'reuse');
  const reason =
    state === 'dependency-missing'
      ? '所需依赖缺失，暂不能复制。'
      : state === 'copy-error'
        ? '复制未完成，请重试。'
        : state === 'permission'
          ? '当前账号不能取得这个项目。'
          : resourceAccess === 'none'
            ? '关联资源暂不可访问。'
            : resourceAccess === 'outcome'
              ? '当前资源只展示成果。'
              : resourceAccess === 'view'
                ? '当前资源仅允许查看。'
                : data.share.withdrawn || state === 'withdrawn'
                  ? '项目分享已撤回。'
                  : '作者当前只开放查看，不能取得副本。';
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const copying=useRef(false);
  return (
    <>
      <div className="xp-hero">
        <Picture name="restore" alt="旧照修复项目预览" />
        <div>
          <h2>旧照修复参考工程</h2>
          <p>林间 · 公开版本 {ver(data.share.publicVersion)}</p>
        </div>
      </div>
      {denied ? (
        <Note title="暂不能复制" tone="warn">
          {reason}
        </Note>
      ) : (
        <>
          {state === 'copy-error' && (
            <Note title="复制未完成" tone="warn">
              请重新确认条件后重试。
            </Note>
          )}
          <p>复制后会在我的项目中形成独立副本，不修改作者原项目。</p>
          <label className="xp-check xp-card">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span>我已阅读项目说明与素材使用条件</span>
          </label>
          <div className="xp-facts">
            <span>
              再次分享工程：
              {data.share.allowReshare ? '取得副本时获许可' : '未获许可'}
            </span>
            <span>可发布合法成果</span>
          </div>
        </>
      )}
      {state === 'copy-error' && (
        <Button quiet onClick={() => go('copy')}>
          重新复制
        </Button>
      )}
      <div className="xp-actions">
        <Button
          disabled={denied || !accepted || busy}
          onClick={() => {
            if (copying.current) return;
            copying.current=true;
            setBusy(true);
            const copyId = `copy-${Date.now()}`;
            update((d) => ({
              ...d,
              selectedCopy: copyId,
              copies: [
                ...d.copies,
                {
                  id: copyId,
                  version: d.share.publicVersion,
                  acquiredReshare: d.share.allowReshare,
                  parentAllows: true,
                  title: '我的旧照修复练习',
                },
              ],
            }));
            go('library');
          }}
        >
          复制到我的项目
        </Button>
        <Button quiet onClick={() => go('project')}>
          返回项目
        </Button>
      </div>
    </>
  );
}

function Library({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  if (!data.copies.length || state === 'empty')
    return (
      <>
        <Note title="还没有个人副本">可以从允许复用的公开项目开始。</Note>
        <Button onClick={() => go('project')}>查看公开项目</Button>
      </>
    );
  return (
    <>
      <p className="xp-lead">个人副本由你独立编辑，来源版本保持记录。</p>
      {data.copies.map((copy) => (
        <CardLink
          key={copy.id}
          title={copy.title}
          detail={`来源：旧照修复参考工程 · 取得时版本 ${ver(copy.version)}`}
          label={
            state === 'source-withdrawn' || data.share.withdrawn
              ? '来源暂不可访问'
              : '个人项目'
          }
          onClick={() => {
            update((d) => ({ ...d, selectedCopy: copy.id }));
            go('editor');
          }}
        />
      ))}
      <div className="xp-actions">
        <Button quiet onClick={() => go('project')}>
          查看原项目
        </Button>
      </div>
    </>
  );
}

function Editor({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  const copy = data.copies.find((x) => x.id === data.selectedCopy);
  const [title, setTitle] = useState(copy?.title || '我的旧照修复练习');
  const [message, setMessage] = useState('');
  if (!copy)
    return (
      <>
        <Note title="尚未选择个人项目">先从我的项目选择一份副本。</Note>
        <Button onClick={() => go('library')}>我的项目</Button>
      </>
    );
  if (state === 'mobile')
    return (
      <>
        <Note title="请在电脑端继续">
          手机可查看来源与版本；项目编辑需在电脑上完成。
        </Note>
        <Button quiet onClick={() => go('library')}>
          返回我的项目
        </Button>
      </>
    );
  return (
    <>
      <div className="xp-hero">
        <Picture name="restore" alt="个人项目成果预览" />
        <div>
          <span className="xp-pill">我的个人副本</span>
          <h2>{copy.title}</h2>
          <p>来源版本 {ver(copy.version)} · 原作者林间</p>
        </div>
      </div>
      {(state === 'source-withdrawn' || data.share.withdrawn) && (
        <Note title="原项目当前不可访问">你的个人副本仍可继续查看与编辑。</Note>
      )}
      {state === 'dependency-missing' && (
        <Note title="部分依赖不可用" tone="warn">
          先核对所需素材与工具，再继续制作。
        </Note>
      )}
      <Section title="个人项目">
        <div className="xp-steps">
          <span>准备原图</span>
          <span>划痕定位</span>
          <span>局部调整</span>
          <span>结果对照</span>
        </div>
        <label className="xp-field">
          项目名称
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <div className="xp-actions">
          <Button
            onClick={() => {
              update((d) => ({
                ...d,
                copies: d.copies.map((x) =>
                  x.id === copy.id
                    ? { ...x, title: title.trim() || x.title }
                    : x,
                ),
              }));
              setMessage('项目名称已保存。');
            }}
          >
            保存项目名称
          </Button>
          <Button quiet onClick={() => go('results')}>
            选择已有成果
          </Button>
          <Button quiet onClick={() => go('derivative')}>
            分享我的工程
          </Button>
        </div>
      </Section>
      {message && <output className="xp-feedback">{message}</output>}
    </>
  );
}

function Derivative({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  const copy = data.copies.find((x) => x.id === data.selectedCopy);
  const [mode, setMode] = useState<ShareMode>(data.derivative.mode);
  const [allowNext, setAllowNext] = useState(data.derivative.allowReshare);
  const [notice, setNotice] = useState('');
  if (!copy)
    return (
      <>
        <Note title="先选择个人副本">从我的项目进入当前副本。</Note>
        <Button onClick={() => go('library')}>我的项目</Button>
      </>
    );
  const canShare =
    copy.acquiredReshare &&
    copy.parentAllows &&
    !['blocked', 'upstream-blocked'].includes(state);
  return (
    <>
      <div className="xp-card">
        <strong>{copy.title}</strong>
        <p>来源：林间 · 旧照修复参考工程 · 版本 {ver(copy.version)}</p>
      </div>
      {!canShare ? (
        <Note title="暂不能公开衍生工程" tone="warn">
          取得此副本时没有完整的再次分享许可。你仍可在许可范围内制作并发布合法成果。
        </Note>
      ) : (
        <>
          <p>公开的是你选择的个人版本，来源作者与版本会一同显示。</p>
          <div className="xp-choice">
            {(
              [
                ['outcome', '仅成果'],
                ['view', '允许查看'],
                ['reuse', '允许复用'],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="derivative"
                  checked={mode === value}
                  onChange={() => {
                    setMode(value);
                    if (value !== 'reuse') setAllowNext(false);
                  }}
                />
                <strong>{label}</strong>
              </label>
            ))}
          </div>
          {mode === 'reuse' && (
            <label className="xp-check">
              <input
                type="checkbox"
                checked={allowNext}
                onChange={(e) => setAllowNext(e.target.checked)}
              />
              允许下一级再次分享工程
            </label>
          )}
        </>
      )}
      {state === 'published' || data.derivative.published ? (
        <Note title="个人工程已公开" tone="good">
          公开内容保留了原项目与取得时版本的来源。
        </Note>
      ) : null}
      {notice && <output className="xp-feedback">{notice}</output>}
      <div className="xp-actions">
        <Button
          disabled={!canShare}
          onClick={() => {
            if (!copy.acquiredReshare || !copy.parentAllows) {
              setNotice('上游许可不足。');
              return;
            }
            update((d) => ({
              ...d,
              derivative: {
                published: true,
                mode,
                allowReshare: mode === 'reuse' && allowNext,
              },
            }));
            setNotice('个人工程的公开设置已保存。');
          }}
        >
          公开我的工程
        </Button>
        <Button quiet onClick={() => go('editor')}>
          回个人项目
        </Button>
        <Button quiet onClick={() => go('results')}>
          选择成果发布
        </Button>
      </div>
    </>
  );
}

function Results({
  data,
  state,
  go,
  update,
  activityInherited,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
  activityInherited: boolean;
}) {
  const active = data.activity === 'active' || activityInherited;
  if (state === 'empty')
    return (
      <>
        <Note title="暂时没有可选择的成果">可返回个人项目继续整理。</Note>
        <Button onClick={() => go('editor')}>返回个人项目</Button>
      </>
    );
  if (state === 'identity-changed')
    return (
      <>
        <Note title="账号已变化" tone="warn">
          原账号的私人结果暂不在当前账号下展示。
        </Note>
        <Button onClick={() => go('link', '&state=mismatch')}>核对账号</Button>
      </>
    );
  return (
    <>
      <p className="xp-lead">选择要带到社区的成果。未选择的结果仍留在此处。</p>
      <div className="xp-grid">
        {(
          [
            ['poster', '修复后的照片', 'restore'],
            ['portrait', '旧照局部对照', 'portrait'],
          ] as const
        ).map(([id, title, cover]) => (
          <button
            type="button"
            className={`xp-result${data.result === id ? ' selected' : ''}`}
            key={id}
            onClick={() =>
              update((d) => ({
                ...d,
                result: id,
                returnStatus: d.result===id?d.returnStatus:'idle',
                returnAttempt: d.result===id?d.returnAttempt:'',
              }))
            }
          >
            <Picture name={cover} alt={title} />
            <strong>{title}</strong>
            <small>{data.result === id ? '已选择' : '选择此成果'}</small>
          </button>
        ))}
      </div>
      {active && (
        <Note title={currentActivity()?.name||'活动关联待核对'}>
          活动关联会随成果返回社区；提交前仍需检查活动状态。
        </Note>
      )}
      {(state === 'activity-ended' || data.activity === 'ended') && (
        <Note title="活动已结束" tone="warn">
          成果保持私有；返回社区后可主动取消活动关联，再考虑普通发布。
        </Note>
      )}
      <div className="xp-actions">
        <Button onClick={() => go(data.linked ? 'return' : 'link')}>
          带入社区作品草稿
        </Button>
        {data.returnAttempt && <Button quiet onClick={()=>update(d=>({...d,returnStatus:'idle',returnAttempt:''}))}>为所选成果发起新的发布</Button>}
        <Button quiet onClick={() => go('editor')}>
          继续查看个人项目
        </Button>
      </div>
    </>
  );
}

function LinkAccount({
  data,
  state,
  go,
  update,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
}) {
  const [checked, setChecked] = useState(false);
  const [notice, setNotice] = useState('');
  return (
    <>
      <p className="xp-lead">首次带回私人结果，需要确认当前使用的两个账号。</p>
      <div className="xp-grid">
        <div className="xp-card">
          <span className="xp-pill">社区</span>
          <h2>{data.communityAccount}</h2>
        </div>
        <div className="xp-card">
          <span className="xp-pill">MakeNow</span>
          <h2>{state === 'mismatch' ? '另一位创作者' : data.makeNowAccount}</h2>
        </div>
      </div>
      {state === 'mismatch' && (
        <Note title="账号不匹配" tone="warn">
          请切回制作该成果的账号，当前结果不会进入社区。
        </Note>
      )}
      {state === 'expired' && (
        <Note title="关联已失效" tone="warn">
          请重新确认当前账号，再选择成果。
        </Note>
      )}
      {state === 'error' && (
        <Note title="关联未完成" tone="warn">
          原成果仍在 MakeNow，可稍后重试。
        </Note>
      )}
      {state === 'normal' && (
        <label className="xp-check xp-card">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>确认两个账号由本人使用，并同意将所选结果带回社区</span>
        </label>
      )}
      {notice && <output className="xp-feedback">{notice}</output>}
      <div className="xp-actions">
        <Button
          disabled={state !== 'normal' || !checked}
          onClick={() => {
            if (!checked) {
              setNotice('请先确认账号。');
              return;
            }
            update((d) => ({ ...d, linked: true }));
            go('return');
          }}
        >
          确认关联并继续
        </Button>
        <Button quiet onClick={() => go('results')}>
          暂不关联
        </Button>
        {state !== 'normal' && (
          <Button quiet onClick={() => go('link')}>
            重新确认账号
          </Button>
        )}
      </div>
    </>
  );
}

function ReturnConfirm({
  data,
  state,
  go,
  update,
  activityInherited,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
  activityInherited: boolean;
}) {
  const [checked, setChecked] = useState(false);
  const active = data.activity === 'active' || activityInherited;
  const title = data.result === 'poster' ? '修复后的照片' : '旧照局部对照';
  if (!data.linked || state === 'identity-error')
    return (
      <>
        <Note title="需要重新核对身份" tone="warn">
          当前账号与成果归属未确认，结果仍留在 MakeNow。
        </Note>
        <Button onClick={() => go('link')}>核对账号</Button>
      </>
    );
  return (
    <>
      <div className="xp-hero">
        <Picture
          name={data.result === 'poster' ? 'restore' : 'portrait'}
          alt={title}
        />
        <div>
          <h2>{title}</h2>
          <p>
            来源项目：旧照修复参考工程 · 取得时公开版本{' '}
            {ver(
              data.copies.find((x) => x.id === data.selectedCopy)?.version ??
                data.share.publicVersion,
            )}
          </p>
          <p>作者：林间</p>
        </div>
      </div>
      {active && (
        <Note title={'活动关联：'+(currentActivity()?.name||'待核对')}>
          返回社区作品编辑后，再确认投稿条件。
        </Note>
      )}
      {(state === 'activity-ended' || data.activity === 'ended') && (
        <Note title="活动已结束" tone="warn">
          不能直接投稿；结果仍可作为私人材料找回。
        </Note>
      )}
      {(state === 'duplicate' || data.returnStatus === 'draft-opened') && (
        <Note title="已找到同次回流动作">
          请继续原草稿，或查看此前的提交状态。
        </Note>
      )}
      {state === 'network-error' && (
        <Note title="回流暂未完成" tone="warn">
          请重试这次选择，MakeNow 中的原成果仍在。
        </Note>
      )}
      <label className="xp-check xp-card">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>已核对选择的成果与来源</span>
      </label>
      <div className="xp-actions">
        <Button
          disabled={!checked}
          onClick={() => {
            if (!checked) return;
            if (state === 'network-error') {
              update((d) => ({
                ...d,
                returnStatus: 'uncertain',
                returnAttempt: d.returnAttempt || `return-${Date.now()}`,
              }));
              go('return-status', '&state=uncertain');
              return;
            }
            update((d) => ({
              ...d,
              returnStatus:
                d.returnStatus === 'draft-opened'
                  ? 'duplicate'
                  : 'draft-opened',
              returnAttempt: d.returnAttempt || `return-${Date.now()}`,
            }));
            go('return-status');
          }}
        >
          确认带入社区
        </Button>
        <Button quiet onClick={() => go('results')}>
          重新选择成果
        </Button>
      </div>
    </>
  );
}

function ReturnStatus({
  data,
  state,
  go,
  update,
  toCommunity,
  activityInherited,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
  toCommunity: (target: string) => void;
  activityInherited: boolean;
}) {
  const uncertain = state === 'uncertain' || data.returnStatus === 'uncertain';
  if (state === 'identity-error')
    return (
      <>
        <Note title="身份核验未通过" tone="warn">
          结果没有进入社区，请核对两端当前账号。
        </Note>
        <Button onClick={() => go('link')}>核对账号</Button>
      </>
    );
  if (uncertain)
    return (
      <>
        <Note title="结果待确认" tone="warn">
          正在核对这次回流。请继续查询原动作，避免重复提交。
        </Note>
        <Button
          onClick={() => {
            update((d) => ({ ...d, returnStatus: 'draft-opened' }));
            go('return-status');
          }}
        >
          查询原动作
        </Button>
        <Button quiet onClick={() => go('results')}>
          查看 MakeNow 成果
        </Button>
      </>
    );
  return (
    <>
      <Note
        title={
          state === 'duplicate' || data.returnStatus === 'duplicate'
            ? '已找到原动作'
            : '已准备社区作品草稿'
        }
        tone="good"
      >
        {state === 'duplicate' || data.returnStatus === 'duplicate'
          ? '继续查看这次操作的已有状态。'
          : '还需要你检查并主动提交；当前结果尚未公开。'}
      </Note>
      <div className="xp-card">
        <strong>
          {data.result === 'poster' ? '修复后的照片' : '旧照局部对照'}
        </strong>
        <p>
          来源：旧照修复参考工程 · 林间 · 版本{' '}
          {ver(
            data.copies.find((x) => x.id === data.selectedCopy)?.version ??
              data.share.publicVersion,
          )}
        </p>
        {(activityInherited || data.activity === 'active') && (
          <p>活动关联：{currentActivity()?.name||'待核对'}</p>
        )}
      </div>
      <div className="xp-actions">
        <Button onClick={() => toCommunity('post-edit')}>
          继续处理社区作品
        </Button>
        <Button quiet onClick={() => go('results')}>
          返回成果列表
        </Button>
      </div>
    </>
  );
}

function Workflow({ state, go }: { state: string; go: Go }) {
  const blocked = ['license-denied', 'file-missing', 'withdrawn'].includes(
    state,
  );
  if (state === 'withdrawn')
    return (
      <>
        <Note title="资源暂不可访问" tone="warn">
          文件和旧下载入口已停止提供。
        </Note>
        <Button onClick={() => go('project')}>返回项目</Button>
      </>
    );
  return (
    <>
      <div className="xp-hero">
        <Picture name="restore" alt="旧照修复工作流效果示例" />
        <div>
          <span className="xp-pill">独立资源 · ComfyUI</span>
          <h2>旧照修复工作流</h2>
          <p>提供者：林间 · 维护版本 1.2</p>
          <p>用于学习破损标记与分步处理的工程结构。</p>
        </div>
      </div>
      <div className="xp-facts">
        <span>设备：电脑端</span>
        <span>取得方式：按许可下载</span>
        <span>运行：需自备兼容环境</span>
      </div>
      <Section title="文件与依赖">
        <p>
          文件形式：工作流 JSON。使用前核对 ComfyUI
          版本、所需节点、模型及输入素材的取得与许可。
        </p>
        <ul>
          <li>节点：图像加载、局部处理与结果预览</li>
          <li>模型：需由使用者在自己的环境中合法取得</li>
          <li>素材：示例预览不随工程文件再分发</li>
        </ul>
      </Section>
      <Section title="许可范围">
        <p>
          允许个人学习和修改。公开再分发工程、模型或原示例素材须另行取得许可。
        </p>
      </Section>
      {state === 'view-only' && (
        <Note title="当前仅可查看">资源说明可阅读，文件暂不提供下载。</Note>
      )}
      {state === 'license-denied' && (
        <Note title="未取得下载许可" tone="warn">
          请先查看资源许可，当前不可获取文件。
        </Note>
      )}
      {state === 'file-missing' && (
        <Note title="文件暂不可用" tone="warn">
          资源说明仍可阅读，文件入口已暂停。
        </Note>
      )}
      {state === 'dependency-missing' && (
        <Note title="依赖需补齐" tone="warn">
          缺失必要依赖时不要开始导入或运行。
        </Note>
      )}
      <div className="xp-actions">
        <Button
          disabled={blocked || state === 'view-only'}
          onClick={() =>
            go(
              'workflow-import',
              state === 'dependency-missing' ? '&state=dependency-missing' : '',
            )
          }
        >
          查看取用与导入条件
        </Button>
        <Button quiet onClick={() => go('project')}>
          查看关联项目
        </Button>
      </div>
    </>
  );
}

function WorkflowImport({ state, go }: { state: string; go: Go }) {
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState('');
  const blocked = [
    'unsupported',
    'dependency-missing',
    'license-denied',
  ].includes(state)||state==='mobile';
  const download = () => {
    const content = JSON.stringify(
      {
        resource: '旧照修复工作流',
        version: '1.2',
        format: 'ComfyUI workflow JSON',
        contents: '文件与依赖清单',
        nodes: ['图像加载', '局部处理', '结果预览'],
        note: '导入前需另行核对真实工程文件、许可及兼容环境',
      },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([content], { type: 'application/json' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = '旧照修复工作流-取用清单.json';
    a.click();
    URL.revokeObjectURL(url);
    setMessage('取用清单已开始下载。');
  };
  return (
    <>
      <Note title="电脑端导入">
        先取得资源文件，再在自己的 ComfyUI 环境中核对版本、节点、模型和许可。
      </Note>
      <div className="xp-steps">
        <span>确认许可</span>
        <span>取得文件</span>
        <span>核对依赖</span>
        <span>在电脑端导入</span>
      </div>
      {state === 'mobile' && (
        <Note title="手机可阅读条件">导入和调试请在电脑端继续。</Note>
      )}
      {state === 'unsupported' && (
        <Note title="兼容性尚未确认" tone="warn">
          当前环境无法确认能否正确导入。
        </Note>
      )}
      {state === 'dependency-missing' && (
        <Note title="缺少依赖" tone="warn">
          先补齐所需节点和模型，再尝试导入。
        </Note>
      )}
      {state === 'license-denied' && (
        <Note title="无取用许可" tone="warn">
          此资源目前不提供文件下载。
        </Note>
      )}
      <label className="xp-check xp-card">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>已阅读资源说明和许可范围</span>
      </label>
      <div className="xp-actions">
        <Button disabled={!checked || blocked} onClick={download}>
          下载取用清单
        </Button>
        <Button quiet onClick={() => go('workflow')}>
          返回资源详情
        </Button>
      </div>
      {message && <output className="xp-feedback">{message}</output>}
    </>
  );
}

function Maintain({
  state,
  go,
  authorRecords,
  qualified,
}: {
  state: string;
  go: Go;
  authorRecords: Record<AuthorKind, Content | undefined>;
  qualified: boolean;
}) {
  const tutorialStage = authorStage(authorRecords.tutorial);
  const resourceStage = authorStage(authorRecords.resource);
  const stageLabel: Record<AuthorStage, string> = {
    draft: '草稿',
    submitted: '已提交',
    revision: '待返修',
    approved: '审核通过，待发布',
    published: '公开版有效',
  };
  if (!qualified || state === 'unqualified')
    return (
      <>
        <Note title="内容维护入口暂未开放">你仍可从社区发布作品与帖子。</Note>
        <Button
          onClick={() => {
            window.location.href = `${C}?page=mine`;
          }}
        >
          返回我的
        </Button>
      </>
    );
  if (state === 'permission-revoked')
    return (
      <>
        <Note title="维护资格已变更" tone="warn">
          暂不能继续提交更新，已公开内容仍按当前状态展示。
        </Note>
        <Button onClick={() => go('maintain-status')}>查看已有进度</Button>
      </>
    );
  return (
    <>
      <p className="xp-lead">
        查看本人及获授权维护的教程、资源。正式公开由平台完成。
      </p>
      {state === 'mobile' && (
        <Note title="在电脑端完成编辑">
          手机可查看状态和返修原因；长内容与工程文件请在电脑端维护。
        </Note>
      )}
      {authorRecords.tutorial?.authorized !== false && (
        <Section title="教程">
          <CardLink
            title={authorRecords.tutorial?.draft.title || authorTitles.tutorial}
            detail={`当前维护状态：${stageLabel[tutorialStage]}`}
            label="林间"
            onClick={() =>
              go(
                state === 'mobile' ? 'maintain-status' : 'maintain-tutorial',
                '&item=tutorial',
              )
            }
          />
        </Section>
      )}
      {authorRecords.resource?.authorized !== false && (
        <Section title="资源">
          <CardLink
            title={authorRecords.resource?.draft.title || authorTitles.resource}
            detail={`当前维护状态：${stageLabel[resourceStage]}`}
            label="林间"
            onClick={() =>
              go(
                state === 'mobile' ? 'maintain-status' : 'maintain-resource',
                '&item=resource',
              )
            }
          />
        </Section>
      )}
      <Section title="AI 应用">
        <Note title="应用更新由平台承接">
          可提供材料与更新建议，运行入口和费用由平台维护。
        </Note>
      </Section>
    </>
  );
}

function MaintainEditor({
  data,
  state,
  go,
  update,
  kind,
  record,
}: {
  data: CrossData;
  state: string;
  go: Go;
  update: (fn: (d: CrossData) => CrossData) => void;
  kind: 'tutorial' | 'resource';
  record?: Content;
}) {
  const isResource = kind === 'resource';
  const [title, setTitle] = useState(record?.draft.title || authorTitles[kind]);
  const [body, setBody] = useState(
    record?.draft.body.map((block) => block.text).join('\n') ||
      (isResource
        ? data.maintenance.resourceText
        : data.maintenance.tutorialText),
  );
  const [file, setFile] = useState('');
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [changeType, setChangeType] = useState<'description' | 'file'>(
    'description',
  );
  if (
    !data.maintenance.qualified ||
    record?.authorized === false ||
    state === 'permission-revoked'
  )
    return (
      <>
        <Note title="当前无维护权限" tone="warn">
          输入尚未提交。请返回查看状态或联系平台维护人。
        </Note>
        <Button onClick={() => go('maintain-status', `&item=${kind}`)}>
          查看进度
        </Button>
      </>
    );
  if(state==='mobile')return <><Note title="在电脑端完成编辑">手机可查看维护进度；长内容与工程文件请在电脑端维护。</Note><Button onClick={()=>go('maintain-status',`&item=${kind}`)}>查看进度</Button></>;
  const progress = state === 'normal' ? authorStage(record) : state;
  const save = () => {
    if (state === 'save-error' && !retrying) {
      setMessage('保存失败，输入仍留在当前页。');
      return;
    }
    const error = saveAuthorDraft(
      kind,
      title.trim(),
      body.trim(),
      false,
      isResource && changeType === 'file',
    );
    if (error) {
      setMessage(error);
      return;
    }
    update((d) => ({
      ...d,
      maintenance: {
        ...d.maintenance,
        [kind]: 'draft',
        [isResource ? 'resourceText' : 'tutorialText']: body,
      },
    }));
    setMessage('草稿已保存。');
  };
  const submit = () => {
    if (!title.trim() || !body.trim()) {
      setMessage('请填写标题与正文说明。');
      return;
    }
    if (isResource && changeType === 'file' && !file && state !== 'revision') {
      setMessage('请先选择要更新的资源文件。');
      return;
    }
    if (['submit-error', 'file-missing'].includes(state) && !retrying) {
      setMessage('提交未完成，已填写内容保留。');
      return;
    }
    const error = saveAuthorDraft(
      kind,
      title.trim(),
      body.trim(),
      true,
      isResource && changeType === 'file',
    );
    if (error) {
      setMessage(error);
      return;
    }
    update((d) => ({
      ...d,
      maintenance: {
        ...d.maintenance,
        [kind]: 'submitted',
        [isResource ? 'resourceText' : 'tutorialText']: body,
      },
    }));
    go('maintain-status', `&item=${kind}`);
  };
  return (
    <>
      <p className="xp-lead">
        {isResource
          ? '维护资源说明与取用条件。工程公开版本在制作侧单独管理。'
          : '维护教程正文；待发布修改提交后，公开版仍保持原内容。'}
      </p>
      {progress === 'revision' && (
        <Note title="需要返修" tone="warn">
          请补充{isResource ? '依赖与许可说明' : '步骤中的准备条件'}后再次提交。
        </Note>
      )}
      {progress === 'submitted' && (
        <Note title="已提交，等待平台处理">
          当前公开版不会因本次提交自动替换。
        </Note>
      )}
      {progress === 'approved' && (
        <Note title="审核通过，等待正式发布">读者仍看到当前公开版本。</Note>
      )}
      {state === 'file-missing' && (
        <Note title="资源文件缺失" tone="warn">
          文件未取得前不能提交换版。
        </Note>
      )}
      {['save-error', 'submit-error', 'file-missing'].includes(state) &&
        !retrying && (
          <Button quiet onClick={() => setRetrying(true)}>
            重新尝试
          </Button>
        )}
      <div className="xp-form">
        <label className="xp-field">
          标题
          <input
            value={title}
            maxLength={60}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="xp-field">
          {isResource ? '用途与取用说明' : '教程正文'}
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
          />
        </label>
        {isResource ? (
          <>
            <div className="xp-choice">
              <label>
                <input
                  type="radio"
                  name="change"
                  checked={changeType === 'description'}
                  onChange={() => setChangeType('description')}
                />
                只更新说明
              </label>
              <label>
                <input
                  type="radio"
                  name="change"
                  checked={changeType === 'file'}
                  onChange={() => setChangeType('file')}
                />
                更新工程文件
              </label>
            </div>
            {changeType === 'file' && (
              <label className="xp-field">
                选择工作流文件
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setFile(e.target.files?.[0]?.name || '')}
                />
                {file && <small>已选择：{file}</small>}
              </label>
            )}
            <label className="xp-field">
              依赖与许可
              <input defaultValue="需自行核对节点、模型和素材许可" />
            </label>
          </>
        ) : (
          <label className="xp-field">
            准备条件
            <input defaultValue="原图副本、电脑端处理工具" />
          </label>
        )}
        <div className="xp-actions">
          <Button quiet onClick={save}>
            保存草稿
          </Button>
          <Button quiet onClick={() => setPreview(!preview)}>
            预览
          </Button>
          <Button
            onClick={submit}
            disabled={progress === 'submitted' || progress === 'approved'}
          >
            提交平台处理
          </Button>
          <Button quiet onClick={() => go('maintain')}>
            返回维护列表
          </Button>
        </div>
        {message && <output className="xp-feedback">{message}</output>}
      </div>
      {preview && (
        <div className="xp-card">
          <strong>{title || '未命名'}</strong>
          <p>{body || '暂无内容'}</p>
        </div>
      )}
    </>
  );
}

function MaintainStatus({
  state,
  go,
  item,
  record,
}: {
  state: string;
  go: Go;
  item: string;
  record?: Content;
}) {
  const kind = item === 'resource' ? 'resource' : 'tutorial';
  const progress = state === 'normal' ? authorStage(record) : state;
  const label: Record<string, string> = {
    draft: '私人草稿',
    submitted: '已提交，等待平台处理',
    revision: '待返修',
    approved: '审核通过，等待正式发布',
    published: '公开版有效',
    failed: '提交失败',
  };
  return (
    <>
      <div className="xp-card">
        <span className="xp-pill">{kind === 'resource' ? '资源' : '教程'}</span>
        <h2>{record?.draft.title || authorTitles[kind]}</h2>
        <p>{label[progress] || label.draft}</p>
      </div>
      {progress === 'revision' && (
        <Note title="返修说明" tone="warn">
          {record?.draft.note ||
            `请补全${kind === 'resource' ? '依赖与许可' : '教学准备条件'}，重新预览后提交。`}
        </Note>
      )}
      {progress === 'submitted' && (
        <Note title={record?.public?'公开版本仍有效':'当前尚未公开'}>
          平台完成正式发布后，读者才会看到本次版本。
        </Note>
      )}
      {progress === 'approved' && (
        <Note title={record?.public?'公开版本仍有效':'当前尚未公开'}>审核通过后，仍需平台正式发布。</Note>
      )}
      {progress === 'failed' && (
        <Note title="提交未完成" tone="warn">
          草稿仍可继续修改并重试。
        </Note>
      )}
      <div className="xp-actions">
        <Button
          onClick={() =>
            go(
              kind === 'resource' ? 'maintain-resource' : 'maintain-tutorial',
              `&state=${progress === 'revision' ? 'revision' : 'normal'}`,
            )
          }
        >
          查看内容
        </Button>
        <Button quiet onClick={() => go('maintain')}>
          返回内容维护
        </Button>
      </div>
    </>
  );
}

function Review() {
  return (
    <>
      <Note title="本地产品原型">
        这里展示已确认的产品路径和异常承接，不连接 MakeNow、社区业务服务或真实
        ComfyUI 环境。
      </Note>
      <ul className="xp-review">
        <li>
          项目分享、许可、公开版本和副本由浏览器会话保存；刷新同一会话可继续走查。
        </li>
        <li>
          页面中的账号、作者、版本、成果与资源文件均为虚构样例。分享、复制、关联与提交只改变本地演示状态。
        </li>
        <li>
          “取用清单”是样例信息，不是可运行工作流；导入兼容、节点模型和真实授权仍需逐项核验。
        </li>
        <li>
          社区回流只向同站原型编辑页传入选中的图片及来源，不发生真实发布、生成、扣费或跨站身份核验。
        </li>
        <li>
          正式接口、权限即时收紧、旧链接安全校验、已获许可链、多账号隔离及跨站返回还需要研发实现和授权测试。
        </li>
      </ul>
    </>
  );
}

export default function CrossPrototype() {
  const search = useSyncExternalStore(routeSubscribe, routeSnapshot, () => '');
  const hydrated=useSyncExternalStore(()=>()=>{},()=>true,()=>false);
  const mobileViewport=useSyncExternalStore(deviceSubscribe,mobileSnapshot,()=>false);
  const params = new URLSearchParams(search);
  const mobile=mobileViewport||params.get('device')==='mobile';
  const page = params.get('page') || 'project';
  const state = params.get('state') || 'normal';
  const item = params.get('item') || '';
  const source = params.get('source') || '';
  const videoApp = source === 'app' && item === 'video';
  const bStore = useB();
  const resource = bStore.records.find((record) => record.id === 'resource-1');
  const authorRecords: Record<AuthorKind, Content | undefined> = {
    tutorial: bStore.records.find(
      (record) => record.id === authorId('tutorial'),
    ),
    resource: bStore.records.find(
      (record) => record.id === authorId('resource'),
    ),
  };
  const resourceAccess: ResourceAccess | undefined =
    source !== 'resource'
      ? undefined
      : !resource ||
          resource.publicStatus !== '公开' ||
          resource.runtime === '暂停' ||
          !resource.public
        ? 'none'
        : resource.public.permission.includes('复制') ||
            resource.public.permission.includes('复用')
          ? 'reuse'
          : resource.public.permission.includes('查看')
            ? 'view'
            : 'outcome';
  const stored = useSyncExternalStore(subscribeData, dataSnapshot, () => '');
  const activityInherited =
    useSyncExternalStore(
      subscribeData,
      () => currentActivity()?.code || '',
      () => '',
    ) !== '';
  const data = stored ? (JSON.parse(stored) as CrossData) : initialData;
  const canMaintain =
    data.maintenance.qualified &&
    ((!authorRecords.tutorial && !authorRecords.resource) ||
      Boolean(
        authorRecords.tutorial?.authorized ||
        authorRecords.resource?.authorized,
      ));
  const meta = crossPages.find((x) => x.id === page);
  useEffect(() => {
    const incoming = new URLSearchParams(window.location.search);
    const source = incoming.get('source');
    if (source === 'resource')
      window.sessionStorage.setItem('cross-origin', `${C}?page=resource`);
    else if (source === 'app')
      window.sessionStorage.setItem(
        'cross-origin',
        `${C}?page=app&item=${incoming.get('item') || 'video'}`,
      );
    else if (source === 'mine')
      window.sessionStorage.setItem('cross-origin', `${C}?page=mine`);
    else if (document.referrer.includes(C))
      window.sessionStorage.setItem('cross-origin', document.referrer);
  }, []);
  const go: Go = (target, extra = '') => {
    const context = source
      ? `&source=${encodeURIComponent(source)}${source === 'app' && item ? `&item=${encodeURIComponent(item)}` : ''}`
      : '';
    const url = `?page=${target}${context}${extra}`;
    window.history.pushState({ cross: true }, '', url);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo(0, 0);
  };
  const update = (fn: (d: CrossData) => CrossData) => writeData(fn(readData()));
  const back = () => {
    window.location.href =
      window.sessionStorage.getItem('cross-origin') || `${C}?page=resource`;
  };
  const toCommunity = (target: string) => {
    const selected =
      data.result === 'poster'
        ? { title: '修复后的照片', image: '/home-prototype/restore.png' }
        : { title: '旧照局部对照', image: '/home-prototype/portrait.png' };
    const sourceVersion =
      data.copies.find((x) => x.id === data.selectedCopy)?.version ??
      data.share.publicVersion;
    const existing = window.sessionStorage.getItem('cp-submission');
    if (data.returnStatus === 'duplicate' && existing) {
      try {
        if (JSON.parse(existing).title === selected.title) {
          window.location.assign(`${C}?page=publish-status`);
          return;
        }
      } catch {
        /* continue with original draft */
      }
    }
    window.sessionStorage.setItem('cp-source', 'MakeNow');
    window.sessionStorage.setItem(
      'cp-result',
      JSON.stringify({
        kind: 'image',
        ...selected,
        project: '旧照修复参考工程',
        version: ver(sourceVersion),
        origin: data.selectedCopy || 'public-project',
        attempt: data.returnAttempt,
      }),
    );
    window.sessionStorage.setItem('cp-post-kind', 'work');
    const activity=currentActivity();
    if(activity){window.sessionStorage.setItem('cp-activity','1');window.sessionStorage.setItem('cp-activity-code',activity.code);window.sessionStorage.setItem('cp-activity-name',activity.name);window.sessionStorage.setItem('cp-activity-task',activity.task);}
    else {for(const key of ['cp-activity','cp-activity-code','cp-activity-name','cp-activity-task'])window.sessionStorage.removeItem(key);}
    window.location.assign(
      `${C}?page=${target}${data.activity === 'ended' ? '&state=activity-ended' : ''}`,
    );
  };
  if(!hydrated)return <main className="xp-root" aria-busy="true"/>;
  const base = { data, state, go, update };
  let body: React.ReactNode;
  switch (page) {
    case 'project':
      body = videoApp ? (
        <VideoAppHandoff back={back} />
      ) : (
        <Project
          data={data}
          state={state}
          go={go}
          back={back}
          resourceAccess={resourceAccess}
        />
      );
      break;
    case 'share':
      body = <Share {...base} />;
      break;
    case 'version':
      body = <Version {...base} />;
      break;
    case 'copy':
      body = <CopyProject {...base} resourceAccess={resourceAccess} />;
      break;
    case 'library':
      body = <Library {...base} />;
      break;
    case 'editor':
      body = <Editor {...base} state={mobile?'mobile':state} />;
      break;
    case 'derivative':
      body = <Derivative {...base} />;
      break;
    case 'results':
      body = <Results {...base} activityInherited={activityInherited} />;
      break;
    case 'link':
      body = <LinkAccount {...base} />;
      break;
    case 'return':
      body = <ReturnConfirm {...base} activityInherited={activityInherited} />;
      break;
    case 'return-status':
      body = (
        <ReturnStatus
          {...base}
          toCommunity={toCommunity}
          activityInherited={activityInherited}
        />
      );
      break;
    case 'workflow':
      body = <Workflow state={state} go={go} />;
      break;
    case 'workflow-import':
      body = <WorkflowImport state={mobile?'mobile':state} go={go} />;
      break;
    case 'maintain':
      body = (
        <Maintain
          state={mobile?'mobile':state}
          go={go}
          authorRecords={authorRecords}
          qualified={canMaintain}
        />
      );
      break;
    case 'maintain-tutorial':
      body = (
        <MaintainEditor
          {...base}
          state={mobile?'mobile':state}
          kind="tutorial"
          record={authorRecords.tutorial}
        />
      );
      break;
    case 'maintain-resource':
      body = (
        <MaintainEditor
          {...base}
          state={mobile?'mobile':state}
          kind="resource"
          record={authorRecords.resource}
        />
      );
      break;
    case 'maintain-status':
      body = (
        <MaintainStatus
          state={state}
          go={go}
          item={item}
          record={authorRecords[item === 'resource' ? 'resource' : 'tutorial']}
        />
      );
      break;
    case 'review':
      body = <Review />;
      break;
    default:
      body = (
        <>
          <Note title="页面不存在">请从公开项目继续。</Note>
          <Button onClick={() => go('project')}>公开项目</Button>
        </>
      );
  }
  if (videoApp) body = <VideoAppHandoff back={back} />;
  return (
    <main className="xp-root">
      <div className="xp-shell" data-page={page} data-state={state}>
        <header className="xp-header">
          <button
            type="button"
            className="xp-brand"
            onClick={() => go('project')}
          >
            <span>拾光</span>
            <small>× MakeNow</small>
          </button>
          <button type="button" className="xp-back" onClick={back}>
            返回社区
          </button>
        </header>
        {!videoApp && (
          <nav className="xp-nav" aria-label="跨产品导航">
            <button
              className={page === 'project' ? 'active' : ''}
              onClick={() => go('project')}
            >
              公开项目
            </button>
            <button
              className={
                ['library', 'editor', 'derivative'].includes(page)
                  ? 'active'
                  : ''
              }
              onClick={() => go('library')}
            >
              我的项目
            </button>
            <button
              className={
                ['results', 'link', 'return', 'return-status'].includes(page)
                  ? 'active'
                  : ''
              }
              onClick={() => go('results')}
            >
              成果回流
            </button>
            <button
              className={
                ['workflow', 'workflow-import'].includes(page) ? 'active' : ''
              }
              onClick={() => go('workflow')}
            >
              工作流资源
            </button>
            {canMaintain && state !== 'unqualified' && (
              <button
                className={page.startsWith('maintain') ? 'active' : ''}
                onClick={() => go('maintain')}
              >
                内容维护
              </button>
            )}
          </nav>
        )}
        <div className="xp-main">
          <div className="xp-pagehead">
            <span className="xp-kicker">
              {videoApp ? 'MakeNow 应用' : meta?.module || '跨产品承接'}
            </span>
            <h1>{videoApp ? '应用承接' : meta?.title || '跨产品原型'}</h1>
          </div>
          {body}
        </div>
      </div>
    </main>
  );
}


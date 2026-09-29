"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import "./operations.css";
import {RetainedStoreConfig} from "./retained-store-config";
import {RetainedEventConfig,readEventConfigs,readPublishedEventConfigs,publishEventConfig} from "./retained-event-config";
import { changeRecord, useB, kindLabels, type Content } from "./store";
import {defaultSlots,isSlotTargetValid,slotTargets} from '../c-prototype/slots';
import {readActivitySubmissions,saveActivitySubmissions,eventDefaults} from './operations-data';
import {taskHistory,shopRecords,prototypeStore as sessionStorage} from '../c-prototype/storage';
const sharedSubscribe=(cb:()=>void)=>{window.addEventListener('bp-operations-change',cb);window.addEventListener('cp-task-change',cb);window.addEventListener('storage',cb);return()=>{window.removeEventListener('bp-operations-change',cb);window.removeEventListener('cp-task-change',cb);window.removeEventListener('storage',cb);};};
const sharedSnapshot=(key:string)=>sessionStorage.getItem(key)||'[]';

type Props = { page: string; state: string; go: (target: string) => void };
type Page = { id: string; title: string; module: string; states: string[] };
type Row = { id: string; title: string; type: string; status: string; owner?: string; detail?: string; target?: string; device?: string; award?: string; eligibility?: string };

export const operationPages: Page[] = [
  { id: "op-topics", title: "专题编排", module: "内容运营", states: ["normal", "empty", "target-removed", "permission-denied", "load-failed"] },
  { id: "op-topic-edit", title: "编辑专题", module: "内容运营", states: ["normal", "edit", "invalid", "target-removed", "save-failed", "permission-denied", "conflict"] },
  { id: "op-circles", title: "圈子管理", module: "社区运营", states: ["normal", "empty", "closed", "permission-denied"] },
  { id: "op-circle-edit", title: "编辑圈子", module: "社区运营", states: ["normal", "closed", "invalid", "permission-denied", "conflict"] },
  { id: "op-taxonomy", title: "分类与标签", module: "内容运营", states: ["normal", "empty", "impact", "permission-denied"] },
  { id: "op-features", title: "推荐编排", module: "内容运营", states: ["normal", "empty", "target-removed", "permission-denied", "publish-failed"] },
  { id: "op-slots", title: "展示位配置", module: "内容运营", states: ["normal", "empty", "invalid-target", "mobile", "permission-denied"] },
  { id: "op-events", title: "活动管理", module: "活动运营", states: ["normal", "empty", "ended", "permission-denied"] },
  { id: "op-event-edit", title: "编辑活动", module: "活动运营", states: ["normal", "invalid", "ended", "permission-denied", "conflict"] },
  { id: "op-submissions", title: "投稿与评审", module: "活动运营", states: ["normal", "empty", "ineligible", "content-removed", "award-pending", "permission-denied"] },
  { id: "op-points", title: "积分与任务记录", module: "账户服务", states: ["normal", "empty", "hold", "release", "failed", "permission-denied"] },
  { id: "op-shop", title: "商品与兑换", module: "账户服务", states: ["normal", "empty", "unavailable", "permission-denied"] },
  { id: "op-permissions", title: "职责与权限", module: "系统管理", states: ["normal", "empty", "permission-denied", "change-failed"] },
];

const sample: Record<string, Row[]> = {
  topics: [
    { id: "tp-perfume", title: "电商营销", type: "专题", status: "已发布", owner: "内容运营", detail: "从产品图片到展示短片" },
    { id: "tp-character", title: "角色创作", type: "专题", status: "已发布", owner: "内容运营", detail: "角色设计与表达" },
    { id: "tp-restore", title: "图像修复", type: "专题", status: "已发布", owner: "内容运营", detail: "修复方法与案例" },
    { id: "tp-writing", title: "写作表达", type: "专题", status: "已发布", owner: "内容运营", detail: "文字组织与内容表达" },
  ],
  circles: [
    { id: "ci-image", title: "影像练习圈", type: "圈子", status: "开放", owner: "内容运营", detail: "照片修复 · 构图讨论" },
    { id: "ci-visual", title: "视觉创作圈", type: "圈子", status: "开放", owner: "内容运营", detail: "产品视觉 · 光线与配色" },
  ],
  taxonomy: [
    { id: "ca-01", title: "插画", type: "分类 · 作品", status: "启用", detail: "关联内容 18 条" },
    { id: "ca-02", title: "摄影", type: "分类 · 作品", status: "启用", detail: "关联内容 9 条" },
    { id: "ta-01", title: "新手友好", type: "标签 · 教程/帖子", status: "启用", detail: "关联内容 6 条" },
  ],
  slots: defaultSlots,
  events: eventDefaults.map(item=>({id:'ev-'+item.code,title:item.title,type:'既有活动',status:item.status,owner:'活动运营',detail:'规则沿用 C 端现有活动'})),
  submissions: [],
  shop: [
    { id: "sh-01", title: "待配置商品", type: "积分兑换", status: "待配置", detail: "兑换条件与库存待核实" },
    { id: "sh-02", title: "兑换记录", type: "兑换记录", status: "已记录", detail: "兑换记录待核对" },
  ],
  permissions: [
    { id: "pm-01", title: "内容编辑与运营", type: "职责", status: "已配置", detail: "编辑官方内容、专题和圈子" },
    { id: "pm-02", title: "审核治理", type: "职责", status: "已配置", detail: "内容审核与治理" },
    { id: "pm-03", title: "能力维护", type: "职责", status: "已配置", detail: "运行入口维护" },
    { id: "pm-04", title: "管理员", type: "职责", status: "已配置", detail: "账号权限与维护责任" },
  ],
};
function contentRows(records: Content[], kind: "work" | "post"): Row[] { return records.filter(r => r.kind === kind).map(r => ({ id: r.id, title: r.public?.title || r.draft.title || "未命名", type: kind === "work" ? "作品" : "帖子", status: r.publicStatus, owner: r.public?.author || r.draft.author, detail: r.publicStatus === "公开" ? "可用于编排" : "目标当前不可访问" })); }

function useSaved<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => { let active = true; try { const raw = sessionStorage.getItem(`bp-op-${key}`); if (raw) { const saved = JSON.parse(raw) as T; queueMicrotask(() => { if (active) setValue(saved); }); } } catch { /* storage unavailable */ } return () => { active = false; }; }, [key]);
  const save = (next: T) => { setValue(next); try { sessionStorage.setItem(`bp-op-${key}`, JSON.stringify(next)); if(key==="slots-live"||key==="events"||key==="topics"||key.startsWith("topic-public-"))window.dispatchEvent(new Event("bp-slots-change")); } catch { /* storage unavailable */ } };
  return [value, save] as const;
}
function useDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  useEffect(() => { let active = true; try { const raw = sessionStorage.getItem(`bp-op-${key}`); if (raw) { const saved = JSON.parse(raw) as T; queueMicrotask(() => { if (active) setValue(saved); }); } } catch { /* storage unavailable */ } return () => { active = false; }; }, [key]);
  const persist = () => { try { sessionStorage.setItem(`bp-op-${key}`, JSON.stringify(value)); } catch { /* storage unavailable */ } };
  return [value, setValue, persist] as const;
}
type FeatureFeeds = { works: string[]; posts: string[] };
function featureKey() { if (typeof window === "undefined") return "bp-published-features"; const q = new URLSearchParams(location.search); return q.has("embed") ? `bp-published-features-review:${q.get("page")}:${q.get("state")}` : "bp-published-features"; }
function usePublishedFeatures() {
  const [value, setValue] = useState<FeatureFeeds>({ works: ["work-sea", "work-perfume", "work-1"], posts: ["post-1"] });
  useEffect(() => { let active = true; const read = () => { try { const raw = localStorage.getItem(featureKey()); if (raw && active) { const parsed = JSON.parse(raw) as FeatureFeeds; queueMicrotask(() => { if (active) setValue(parsed); }); } else if (!raw) localStorage.setItem(featureKey(), JSON.stringify({ works: ["work-sea", "work-perfume", "work-1"], posts: ["post-1"] })); } catch { /* storage unavailable */ } }; read(); window.addEventListener("bp-operations-change", read); return () => { active = false; window.removeEventListener("bp-operations-change", read); }; }, []);
  const publish = (next: FeatureFeeds) => { setValue(next); try { localStorage.setItem(featureKey(), JSON.stringify(next)); window.dispatchEvent(new Event("bp-operations-change")); } catch { /* storage unavailable */ } };
  return [value, publish] as const;
}

function Alert({ children, tone = "info" }: { children: React.ReactNode; tone?: string }) { return <output className={`bop-alert bop-${tone}`}>{children}</output>; }
function Button({ children, onClick, muted = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; muted?: boolean; disabled?: boolean }) { return <button className={`bop-btn ${muted ? "bop-btn-muted" : ""}`} type="button" onClick={onClick} disabled={disabled}>{children}</button>; }
function Field({ label, value, onChange, placeholder, multiline = false }: { label: string; value: string; onChange: (x: string) => void; placeholder?: string; multiline?: boolean }) { return <label className="bop-field"><span>{label}</span>{multiline ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} /> : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />}</label>; }
function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (x: string) => void }) { return <label className="bop-field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(x => <option key={x}>{x}</option>)}</select></label>; }
function Table({ rows, columns, action }: { rows: Row[]; columns?: ("type" | "status" | "owner" | "detail" | "target" | "device")[]; action?: (r: Row) => React.ReactNode }) { const cols = columns ?? ["type", "status", "owner"]; return <div className="bop-table-scroll"><table className="bop-table"><thead><tr><th>名称 / 对象</th>{cols.map(c => <th key={c}>{({ type: "类型", status: "状态", owner: "负责人 / 作者", detail: "说明", target: "目标", device: "端侧" })[c]}</th>)}{action && <th>操作</th>}</tr></thead><tbody>{rows.map(r => <tr key={r.id}><td><strong>{r.title}</strong><small>{r.id}</small></td>{cols.map(c => <td key={c}>{c === "status" ? <span className={`bop-tag ${["下架", "私有", "已结束", "已关闭", "已停用", "草稿", "待配置", "待核查"].includes(r.status) ? "bop-tag-warn" : ""}`}>{r.status}</span> : r[c] || "—"}</td>)}{action && <td className="bop-cell-actions">{action(r)}</td>}</tr>)}</tbody></table></div>; }
function Frame({ title, note, action, children }: { title: string; note?: string; action?: React.ReactNode; children: React.ReactNode }) { return <div className="bop-page"><div className="bop-heading"><div><h2>{title}</h2>{note && <p>{note}</p>}</div><div className="bop-actions">{action}</div></div>{children}</div>; }
function StateGate({ state, children }: { state: string; children: React.ReactNode }) { if (state === "permission-denied") return <Alert tone="error">当前账号没有此操作权限。请联系管理员核对职责。</Alert>; if (state === "load-failed") return <Alert tone="error">列表暂时无法加载。<button type="button" onClick={() => location.reload()}>重新加载</button></Alert>; return <>{children}</>; }
function move<T>(array: T[], index: number, delta: number) { const next = [...array], to = index + delta; if (to < 0 || to >= next.length) return next; [next[index], next[to]] = [next[to], next[index]]; return next; }
function publishCircleRules(id:string,draft:{name:string;intro:string;announcement:string;pinned:string;cover:string}){sessionStorage.setItem('bp-op-circle-public-'+id,JSON.stringify(draft));window.dispatchEvent(new Event('bp-circles-change'));}

function Topics({ state, go }: Props) { const [rows, save] = useSaved("topics", sample.topics); const visible = state === "empty" ? [] : rows; return <Frame title="专题编排" action={<Button onClick={() => go("op-topic-edit?id=tp-"+Date.now().toString(36))}>新建专题</Button>}><StateGate state={state}>{state === "target-removed" && <Alert tone="warn">专题引用的作品已下架，公开专题不再展示该引用。请检查编排后重新发布。</Alert>}<div className="bop-toolbar"><input aria-label="搜索专题" placeholder="搜索专题名称" onChange={e => { const q = e.target.value; document.querySelectorAll(".bop-table tbody tr").forEach(tr => { (tr as HTMLElement).hidden = !tr.textContent?.includes(q); }); }} /><span>共 {visible.length} 个专题</span></div>{visible.length ? <Table rows={visible} columns={["status", "owner", "detail"]} action={r => <><button onClick={() => go(`op-topic-edit?id=${r.id}&state=edit`)}>编辑</button><button onClick={() => r.status === "已发布" ? save(rows.map(x => x.id === r.id ? { ...x, status: "已下线" } : x)) : go(`op-topic-edit?id=${r.id}&state=edit`)}>{r.status === "已发布" ? "下线" : "返回编辑"}</button></>} /> : <div className="bop-empty">暂无专题。可新建专题并选择公开内容。</div>}</StateGate></Frame>; }

function TopicEdit({ state, go }: Props) { const [topics, saveTopics] = useSaved("topics", sample.topics); const topicId = typeof window === "undefined" ? "new" : new URLSearchParams(location.search).get("id") || "new"; const current = topics.find(x => x.id === topicId); const [draft, saveDraft, persistDraft] = useDraft(`topic-draft-${topicId}`, { title: current?.title || "", intro: current?.detail || "", audience: current?.detail || "", cover: current ? "专题封面说明" : "", refs: ["work-1", "post-1"] }); const [published, savePublished] = useSaved(`topic-public-${topicId}`, { title: current?.title || "", refs: current ? ["work-1", "post-1"] : [] as string[] }); const [notice, setNotice] = useState(""); const removed = state === "target-removed"; const db = useB(); const all:Row[] = db.records.map(r=>({id:r.id,title:r.public?.title||r.draft.title||"未命名",type:kindLabels[r.kind],status:r.publicStatus,owner:r.public?.author||r.draft.author})); const valid = (id: string) => all.some(x => x.id === id && x.status === "公开") && !(removed && id === "work-1"); const publish = () => { if (!draft.title.trim() || !draft.intro.trim() || !draft.cover.trim()) { setNotice("请填写标题、简介和封面说明。"); return; } const usable = draft.refs.filter(valid); if (!usable.length) { setNotice("没有可公开引用的内容，专题暂不能发布。"); return; } if (state === "conflict") { setNotice("专题已被其他维护者更新，请核对最新版本后再提交。"); return; } savePublished({ title: draft.title, refs: usable }); const match = topics.find(x => x.id === topicId); saveTopics(match ? topics.map(x => x.id === match.id ? { ...x, status: "已发布", detail: draft.audience } : x) : [...topics, { id: topicId, title: draft.title, type: "专题", status: "已发布", owner: "内容运营", detail: draft.audience }]); setNotice("专题更新已发布。失效引用已排除。"); }; return <Frame title={state === "edit" ? "编辑专题" : "新建专题"} action={<Button muted onClick={() => go("op-topics")}>返回列表</Button>}><StateGate state={state}>{state === "save-failed" && <Alert tone="error">保存失败，当前输入仍在。请重试。</Alert>}<div className="bop-layout"><section className="bop-panel"><h3>基本信息</h3><div className="bop-form"><Field label="专题标题" value={draft.title} onChange={x => saveDraft({ ...draft, title: x })} /><Field label="封面说明" value={draft.cover} onChange={x => saveDraft({ ...draft, cover: x })} placeholder="可读文字" /><Field label="简介" value={draft.intro} onChange={x => saveDraft({ ...draft, intro: x })} multiline /><Field label="主题 / 面向人群" value={draft.audience} onChange={x => saveDraft({ ...draft, audience: x })} /></div><h3>收录内容</h3><div className="bop-list">{draft.refs.map((id, index) => { const item = all.find(x => x.id === id); return <div className="bop-list-row" key={id}><span>{index + 1}. {item?.title ?? id} <em>{valid(id) ? item?.type : "不可公开引用"}</em></span><div><button onClick={() => saveDraft({ ...draft, refs: move(draft.refs, index, -1) })}>上移</button><button onClick={() => saveDraft({ ...draft, refs: move(draft.refs, index, 1) })}>下移</button><button onClick={() => saveDraft({ ...draft, refs: draft.refs.filter(x => x !== id) })}>移出</button></div></div>; })}</div><Select label="添加公开内容" value="选择内容" options={["选择内容", ...all.filter(x => valid(x.id) && !draft.refs.includes(x.id)).map(x => `${x.id} · ${x.title}`)]} onChange={x => { if (x !== "选择内容") saveDraft({ ...draft, refs: [...draft.refs, x.split(" · ")[0]] }); }} /><div className="bop-actions bop-footer"><Button muted onClick={() => { persistDraft(); setNotice("草稿已保存，公开专题未改变。"); }}>保存草稿</Button><Button muted onClick={() => setNotice(`预览：${draft.title || "未命名专题"}，可展示 ${draft.refs.filter(valid).length} 项。`)}>预览</Button><Button onClick={publish}>发布更新</Button></div>{notice && <Alert tone={notice.includes("发布") ? "success" : "info"}>{notice}</Alert>}</section><aside className="bop-panel bop-preview"><h3>当前公开版</h3><strong>{published.title}</strong><p>公开收录 {published.refs.filter(valid).length} 项</p>{removed && <p>失效目标已即时排除。</p>}</aside></div></StateGate></Frame>; }

function Circles({ state, go }: Props) { const [rows, save] = useSaved("circles", sample.circles); return <Frame title="圈子管理" action={<Button onClick={() => go("op-circle-edit?id=ci-"+Date.now().toString(36))}>新建圈子</Button>}><StateGate state={state}>{state === "closed" && <Alert tone="warn">圈子已关闭新发帖与推荐；原有合规帖子仍可在社区访问。</Alert>}{state === "empty" ? <div className="bop-empty">暂无圈子。</div> : <Table rows={rows} columns={["status", "owner", "detail"]} action={r => <><button onClick={() => go(`op-circle-edit?id=${r.id}`)}>维护</button><button onClick={() => save(rows.map(x => x.id === r.id ? { ...x, status: x.status === "开放" ? "已关闭" : "开放" } : x))}>{r.status === "开放" ? "关闭" : "恢复"}</button></>} />}</StateGate></Frame>; }
function CircleEdit({ state, go }: Props) { const circleId=typeof window==="undefined"?"":new URLSearchParams(location.search).get("id")||""; const initial=sample.circles.find(x=>x.id===circleId); const [draft, save, persistDraft] = useDraft("circle-draft-"+circleId, { name: initial?.title||"", cover: initial?.title||"", intro: initial?.detail||"", owner: initial?.owner||"内容运营", announcement: "欢迎分享最近的练习", pinned: "", closed: initial?.status==="已关闭" }); const [notice, setNotice] = useState(""); const [circles, saveCircles] = useSaved("circles", sample.circles); return <Frame title="编辑圈子" action={<Button muted onClick={() => go("op-circles")}>返回列表</Button>}><StateGate state={state}><div className="bop-panel"><div className="bop-form bop-two">{([ ["名称", "name"], ["封面说明", "cover"], ["介绍", "intro"], ["负责人", "owner"], ["公告", "announcement"], ["置顶帖子", "pinned"] ] as const).map(([label, key]) => <Field key={key} label={label} value={draft[key]} onChange={x => save({ ...draft, [key]: x })} />)}</div><label className="bop-check"><input type="checkbox" checked={draft.closed || state === "closed"} onChange={e => save({ ...draft, closed: e.target.checked })} />关闭圈子的新发帖与推荐</label><div className="bop-actions bop-footer"><Button muted onClick={() => { persistDraft(); setNotice("草稿已保存，公开圈子未改变。"); }}>保存草稿</Button><Button muted onClick={() => setNotice(`预览：${draft.name} · ${draft.intro}`)}>预览</Button><Button onClick={() => { if (!draft.name.trim() || !draft.owner.trim()) { setNotice("请填写名称和负责人。"); return; } if (state === "conflict") { setNotice("配置已更新，请先核对最新版本。"); return; } const match = circles.find(x => x.id === circleId); saveCircles(match ? circles.map(x => x.id === match.id ? { ...x, status: draft.closed ? "已关闭" : "开放", owner: draft.owner, detail: draft.intro } : x) : [...circles, { id: circleId, title: draft.name, type: "圈子", status: draft.closed ? "已关闭" : "开放", owner: draft.owner, detail: draft.intro }]); publishCircleRules(circleId,draft); setNotice(draft.closed ? "圈子已关闭。原帖保留，不再接受圈内新帖。" : "圈子配置已发布。"); }}>发布更新</Button></div>{notice && <Alert>{notice}</Alert>}</div></StateGate></Frame>; }

function Taxonomy({ state }: Props) { const [rows, save] = useSaved("taxonomy", sample.taxonomy); const [form, setForm] = useState({ name: "", type: "标签 · 帖子" }); const [notice, setNotice] = useState(""); return <Frame title="分类与标签"><StateGate state={state}>{state === "impact" && <Alert tone="warn">停用「插画」将影响 18 条已关联内容的后续选取；历史内容继续保留。</Alert>}<div className="bop-panel"><div className="bop-inline"><Field label="名称" value={form.name} onChange={x => setForm({ ...form, name: x })} placeholder="输入分类或标签" /><Select label="适用类型" value={form.type} options={["分类 · 作品", "标签 · 作品", "标签 · 帖子", "标签 · 教程", "标签 · 资源"]} onChange={x => setForm({ ...form, type: x })} /><Button onClick={() => { if (!form.name.trim()) { setNotice("请输入名称。"); return; } save([...rows, { id: `tx-${Date.now()}`, title: form.name, type: form.type, status: "启用", detail: "关联内容 0 条" }]); setForm({ ...form, name: "" }); setNotice("已添加，可在列表中调整顺序。") }}>添加</Button></div>{notice && <Alert>{notice}</Alert>}</div>{state === "empty" ? <div className="bop-empty">暂无分类或标签。</div> : <Table rows={rows} columns={["type", "status", "detail"]} action={r => { const index = rows.findIndex(x => x.id === r.id); return <><button onClick={() => save(move(rows, index, -1))}>上移</button><button onClick={() => save(move(rows, index, 1))}>下移</button><button onClick={() => { save(rows.map(x => x.id === r.id ? { ...x, status: x.status === "启用" ? "停用" : "启用" } : x)); setNotice(`${r.title}关联的历史内容保持原状。`); }}>{r.status === "启用" ? "停用" : "启用"}</button></>; }} />}</StateGate></Frame>; }

function Features({ state }: Props) { const [tab, setTab] = useState<"works" | "posts">("works"); const [draft, saveDraft, persistDraft] = useDraft("features-draft", { works: ["work-sea", "work-perfume", "work-1"], posts: ["post-1"] }); const [publicSet, savePublic] = usePublishedFeatures(); const [notice, setNotice] = useState(""); const db = useB(); const candidates = contentRows(db.records, tab === "works" ? "work" : "post"); const valid = (id: string) => candidates.some(x => x.id === id && x.status === "公开") && !(state === "target-removed" && id === (tab === "works" ? "work-1" : "post-1")); const publicValid = (id: string) => valid(id) && db.records.find(r => r.id === id)?.recommended !== false; const ids = draft[tab]; const update = (next: string[]) => saveDraft({ ...draft, [tab]: next }); return <Frame title="推荐编排" note="首页爆款作品与社区推荐帖子分别配置。"><StateGate state={state}><div className="bop-tabs"><button className={tab === "works" ? "active" : ""} onClick={() => setTab("works")}>首页爆款作品</button><button className={tab === "posts" ? "active" : ""} onClick={() => setTab("posts")}>社区推荐帖子</button></div>{state === "target-removed" && <Alert tone="warn">目标已失效，公开推荐立即排除；恢复内容后仍需重新选择推荐。</Alert>}<div className="bop-layout"><section className="bop-panel"><h3>编辑中的顺序</h3>{ids.length ? <div className="bop-list">{ids.map((id, index) => { const row = candidates.find(x => x.id === id); return <div className="bop-list-row" key={id}><span>{index + 1}. {row?.title} <em>{valid(id) ? "公开" : "不可推荐"}</em></span><div><button onClick={() => update(move(ids, index, -1))}>上移</button><button onClick={() => update(move(ids, index, 1))}>下移</button><button onClick={() => update(ids.filter(x => x !== id))}>移出</button></div></div>; })}</div> : <div className="bop-empty">当前未选择内容。</div>}<Select label="添加公开内容" value="选择内容" options={["选择内容", ...candidates.filter(x => valid(x.id) && !ids.includes(x.id)).map(x => `${x.id} · ${x.title}`)]} onChange={x => { if (x !== "选择内容") update([...ids, x.split(" · ")[0]]); }} /><div className="bop-actions bop-footer"><Button muted onClick={() => { persistDraft(); setNotice("草稿已保存，公开推荐未改变。"); }}>保存草稿</Button><Button muted onClick={() => setNotice(`预览：${ids.filter(valid).map(id => candidates.find(x => x.id === id)?.title).join("、") || "无可展示内容"}`)}>预览</Button><Button onClick={() => { if (state === "publish-failed") { setNotice("发布失败，草稿已保留。"); return; } const selected = ids.filter(valid); const previous = publicSet[tab]; for (const id of selected) changeRecord(id, "进入推荐", tab === "works" ? "首页爆款作品" : "社区推荐帖子", r => ({ ...r, recommended: true })); for (const id of previous.filter(x => !selected.includes(x))) changeRecord(id, "移出推荐", tab === "works" ? "首页爆款作品" : "社区推荐帖子", r => ({ ...r, recommended: false })); const other = tab === "works" ? "posts" : "works"; savePublic({ ...publicSet, [other]: publicSet[other].filter(id => db.records.some(r => r.id === id && r.publicStatus === "公开" && r.recommended)), [tab]: selected }); setNotice("当前推荐已发布。"); }}>发布推荐</Button></div>{notice && <Alert>{notice}</Alert>}</section><aside className="bop-panel bop-preview"><h3>公开中的推荐</h3>{publicSet[tab].filter(publicValid).map((id, i) => <p key={id}>{i + 1}. {candidates.find(x => x.id === id)?.title}</p>)}{!publicSet[tab].some(publicValid) && <p>暂无可展示内容</p>}</aside></div></StateGate></Frame>; }

function Slots({ state }: Props) { const [draft, saveDraft, persistDraft] = useDraft("slots-draft", sample.slots); const [live, saveLive] = useSaved("slots-live", sample.slots.filter(x => x.status === "已发布")); const [events] = useSaved("events", sample.events); const [topics] = useSaved("topics", sample.topics); const [editing, setEditing] = useState<string | null>(null); const [notice, setNotice] = useState(""); const valid = (r: Row) => { const target = r.target || ""; return isSlotTargetValid({target,device:r.device||"全端"},events,topics) && !(state === "invalid-target" && r.id === "sl-banner"); }; const update = (id: string, patch: Partial<Row>) => saveDraft(draft.map(r => r.id === id ? { ...r, ...patch } : r)); const published = live.filter(valid).filter(x => state !== "mobile" || x.device !== "仅 PC"); return <Frame title="展示位配置"><StateGate state={state}>{state === "invalid-target" && <Alert tone="warn">活动目标已失效，对应 Banner 已从公开展示位即时移除。</Alert>}<div className="bop-tabs"><span>Banner、金刚区与首页推荐位</span><Button onClick={() => { const id = `sl-${Date.now()}`; saveDraft([...draft, { id, title: "", type: "首页 Banner", status: "草稿", target: "", device: "全端" }]); setEditing(id); }}>添加展示位</Button></div><Table rows={state === "empty" ? [] : draft} columns={["type", "target", "device", "status"]} action={r => { const i = draft.findIndex(x => x.id === r.id); return <><button onClick={() => setEditing(r.id)}>编辑</button><button onClick={() => saveDraft(move(draft, i, -1))}>上移</button><button onClick={() => saveDraft(move(draft, i, 1))}>下移</button><button onClick={() => update(r.id, { status: r.status === "已停用" ? "草稿" : "已停用" })}>{r.status === "已停用" ? "启用" : "停用"}</button></>; }} />{editing && (() => { const row = draft.find(x => x.id === editing); if (!row) return null; return <div className="bop-panel bop-editor"><h3>编辑展示位</h3><div className="bop-form bop-two"><Field label="素材说明 / 可读文字" value={row.title} onChange={x => update(row.id, { title: x })} /><Select label="位置" value={row.type} options={["首页 Banner", "金刚区", "首页推荐"]} onChange={x => update(row.id, { type: x })} /><Select label="跳转目标" value={row.target || "选择目标"} options={["选择目标", ...slotTargets, ...events.map(x => `活动 · ${x.title}`), ...topics.map(x => `专题 · ${x.title}`)]} onChange={x => update(row.id, { target: x === "选择目标" ? "" : x })} /><Select label="端侧" value={row.device || "全端"} options={["全端", "仅 PC", "移动端"]} onChange={x => update(row.id, { device: x })} /></div><div className="bop-actions"><Button muted onClick={() => setEditing(null)}>完成编辑</Button><Button muted onClick={() => setNotice(`预览：${row.title || "未命名"} → ${row.target || "未配置目标"}（${row.device}）`)}>预览</Button></div></div>; })()}<div className="bop-actions bop-footer"><Button muted onClick={() => { persistDraft(); setNotice("展示位草稿已保存，公开位置未改变。"); }}>保存草稿</Button><Button onClick={() => { const invalid = draft.find(x => x.status !== "已停用" && (!x.title.trim() || !x.target?.trim() || !valid(x))); if (invalid) { setNotice(`「${invalid.title || "未命名"}」缺少有效目标、可读文字或端侧不适用。`); return; } saveLive(draft.filter(x => x.status !== "已停用").map(x => ({ ...x, status: "已发布" }))); setNotice("展示位配置已发布。"); }}>发布配置</Button></div>{notice && <Alert>{notice}</Alert>}<div className="bop-panel bop-preview"><h3>{state === "mobile" ? "移动端" : "当前公开"}预览</h3><p>{published.map(x => x.title).join("　·　") || "暂无可展示位"}</p></div></StateGate></Frame>; }

function Events({state,go}:Props){
 useSyncExternalStore(sharedSubscribe,()=>sharedSnapshot('bp-op-event-configs'),()=> '');
 const configs=readEventConfigs(),published=readPublishedEventConfigs();
 const rows:Row[]=configs.map(c=>({id:'ev-'+c.code,title:c.name,type:c.type==='referral'?'邀请裂变':c.type==='campaign'?'档期活动':'长期活动',status:published.find(p=>p.code===c.code)?.status||'草稿',detail:c.tasks.length+' 项任务 · '+c.max_points+' 展示积分'}));
 return <Frame title="活动管理" action={<Button onClick={()=>go('op-event-edit?id=new')}>新建活动</Button>}><StateGate state={state}>{state==='empty'?<p>暂无活动。</p>:<Table rows={rows} columns={['type','status','detail']} action={r=><><button onClick={()=>go('op-event-edit?id='+r.id)}>维护规则与任务</button><button onClick={()=>go('op-submissions')}>查看投稿</button><button disabled={r.status==='草稿'} onClick={()=>{const c=published.find(p=>'ev-'+p.code===r.id);if(c)publishEventConfig({...c,status:c.status==='进行中'?'已结束':'进行中'});}}>{r.status==='已结束'?'重新开放':'结束活动'}</button></>}/>}</StateGate></Frame>;
}
function EventEdit({state,go}:Props){const id=typeof window==='undefined'?'new':new URLSearchParams(location.search).get('id')||'new';return <RetainedEventConfig key={id} id={id} state={state} go={go}/>;}

function Submissions({ state }: Props) {
  useSyncExternalStore(sharedSubscribe,()=>sharedSnapshot('cp-activity-submissions'),()=> '[]');
  const live=readActivitySubmissions();
  const [sampleRows,saveSamples]=useSaved('submissions',sample.submissions);
  const [selected,setSelected]=useState<string|null>(null);
  const [eligibility,setEligibility]=useState('通过');
  const [decision,setDecision]=useState('通过');
  const [reason,setReason]=useState('');
  const [notice,setNotice]=useState('');
  const rows:Row[]=[...live.map(x=>({id:x.id,title:x.title,type:x.activityName||x.activityCode||'活动投稿',status:x.contentStatus==='review'?'待评审':x.contentStatus==='approved'?'评审通过':x.contentStatus==='rejected'?'评审不通过':'待补正',owner:'投稿人',detail:'接受材料 · '+new Date(x.submittedAt).toLocaleDateString('zh-CN')})),...sampleRows];
  const row=rows.find(x=>x.id===selected);
  const source=live.find(x=>x.id===selected);
  const update=(patch:Partial<(typeof live)[number]>)=>{if(!source)return;saveActivitySubmissions(live.map(x=>x.id===source.id?{...x,...patch}:x));};
  return <Frame title="投稿与评审" note="资格核验、评审结论与奖励发放分别记录。"><StateGate state={state}>
    {state==='content-removed'&&<Alert tone="warn">原作品已下架；已接受材料和评审依据保留。</Alert>}
    {state==='empty'||!rows.length?<div className="bop-empty">暂无投稿。</div>:<Table rows={rows} columns={['type','status','owner','detail']} action={r=><button onClick={()=>setSelected(r.id)}>查看与评审</button>}/>}
    {row&&<div className="bop-panel bop-editor"><h3>{row.title}</h3><p>活动：{row.type} · 对象 ID：{row.id}</p><p>{row.detail}</p>
      <p>资格：{source?({passed:'通过',failed:'不通过',pending:'待核验'}[source.eligibility]||source.eligibility):row.eligibility||'待核验'} · 评审：{row.status} · 奖励：{source?({pending:'未登记',ready:'待核发',issued:'已核发'}[source.reward]||source.reward):row.award||'未登记'}</p>
      <div className="bop-inline"><Select label="资格核验" value={eligibility} options={['通过','不通过','待核验']} onChange={setEligibility}/><Button onClick={()=>{if(source)update({eligibility:eligibility==='通过'?'passed':eligibility==='不通过'?'failed':'pending'});setNotice('资格结果已记录。');}}>保存资格</Button></div>
      <div className="bop-inline"><Select label="评审结论" value={decision} options={['通过','不通过','待补正']} onChange={setDecision}/><Field label="反馈给投稿人的说明" value={reason} onChange={setReason}/></div>
      <div className="bop-actions"><Button onClick={()=>{if(source){if(source.eligibility!=='passed'){setNotice('请先核验投稿资格。');return;}update({contentStatus:decision==='通过'?'approved':decision==='不通过'?'rejected':'correction',reviewReason:reason});}else saveSamples(sampleRows.map(x=>x.id===row.id?{...x,status:'评审'+decision}:x));setNotice('评审结论已记录，奖励仍单独核发。');}}>保存评审</Button>
      <Button muted onClick={()=>{if(source){if(source.eligibility!=='passed'||source.contentStatus!=='approved'){setNotice('资格与评审均通过后才能登记奖励。');return;}update({reward:'ready'});}else if(row.status.includes('通过'))saveSamples(sampleRows.map(x=>x.id===row.id?{...x,award:'待核发'}:x));else{setNotice('请先确认评审通过。');return;}setNotice('奖励已登记为待核发。');}}>登记奖励</Button></div>{notice&&<Alert>{notice}</Alert>}
    </div>}
  </StateGate></Frame>;
}

function Points({state}:Props){
  useSyncExternalStore(sharedSubscribe,()=>['cp-tasks','cp-checkin','cp-shop-records','cp-redeemed','cp-activity-submissions'].map(sharedSnapshot).join('|'),()=> '[]');
  const [tab,setTab]=useState('全部');
  const [selected,setSelected]=useState<Row|null>(null);
  const rows:Row[]=taskHistory().filter(t=>t.item?.startsWith('light-')).map(t=>{
    const released=['cancelled','unaccepted','failed'].includes(t.status);
    const consumed=['completed','partial'].includes(t.status);
    const amount=t.status==='partial'?(t.settledPoints??t.points??0):(t.points??0);
    const title:Record<string,string>={'light-image':'社区轻创作 · 图片','light-video':'社区轻创作 · 视频','light-text':'社区轻创作 · 文字'};
    return {id:t.id||'light-legacy',title:title[t.item||'']||'社区轻创作',type:released?'释放':consumed?'消耗':'预占',status:released?'已释放':consumed?'已结算':'占用中',owner:'演示用户',detail:(released?t.points??0:amount)+' 积分 · '+(t.createdAt?new Date(t.createdAt).toLocaleString('zh-CN'):'历史任务')};
  });
  if(sessionStorage.getItem('cp-checkin')==='done')rows.push({id:'checkin-today',title:'每日签到',type:'获得',status:'已记录',owner:'演示用户',detail:'20 积分'});
  readActivitySubmissions().filter(r=>['ready','issued'].includes(r.reward)).forEach(r=>rows.push({id:'reward-'+r.id,title:(r.activityName||'社区活动')+' · '+r.title,type:r.reward==='issued'?'获得':'活动奖励',status:r.reward==='issued'?'已发放':'待发放',owner:'演示用户',detail:'奖励积分数以活动发奖记录为准'}));
  shopRecords().forEach(r=>rows.push({id:r.id,title:r.name,type:'兑换',status:r.status==='success'?'已兑换':r.status==='pending'?'待确认':'失败',owner:'演示用户',detail:r.status==='success'?`${r.price} 积分 · ${r.site}`:`积分扣除未确认 · ${r.site}`}));
  if(sessionStorage.getItem('cp-redeemed')==='1')rows.push({id:'legacy-shop-redeemed',title:'AI 体验权益',type:'兑换',status:'已兑换',owner:'演示用户',detail:'50 积分 · 旧商城演示记录'});
  const shown=state==='empty'?[]:rows.filter(r=>tab==='全部'||r.type===tab);
  return <Frame title="积分与任务记录" note="社区积分账户"><StateGate state={state}>
    {state==='hold'&&<Alert tone="warn">社区轻创作积分已预占，结果未确认前不可重复结算。</Alert>}
    {state==='release'&&<Alert>取消或失败的社区轻创作已释放预占。</Alert>}
    {state==='failed'&&<Alert tone="error">记录暂不可核对。不要补记消耗或发放。</Alert>}
    <div className="bop-tabs">{['全部','预占','消耗','获得','释放','活动奖励','兑换'].map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</div>
    {shown.length?<Table rows={shown} columns={['type','status','owner','detail']} action={r=><button onClick={()=>setSelected(r)}>查看记录</button>}/>:<div className="bop-empty">暂无相关记录。</div>}
    {selected&&<div className="bop-panel bop-editor"><h3>{selected.title}</h3><p>对象 ID：{selected.id} · {selected.type} · {selected.status}</p><p>{selected.detail}</p><Button muted onClick={()=>setSelected(null)}>关闭</Button></div>}
  </StateGate></Frame>;
}
function Shop({state}:Props){return <RetainedStoreConfig state={state}/>;}

function Permissions({ state }: Props) { const [role, setRole] = useState("内容编辑与运营"); const [checks, setChecks, persistChecks] = useDraft<Record<string, string[]>>("permissions", { "内容编辑与运营": ["编辑官方内容", "维护专题圈子"], "审核治理": ["审核内容"], "能力维护": ["能力维护"], "管理员": ["分配权限"] }); const roleChecks = checks[role] || []; const [notice, setNotice] = useState(""); const all = ["编辑官方内容", "审核内容", "正式发布", "推荐编排", "维护专题圈子", "能力维护", "分配权限"]; return <Frame title="职责与权限"><StateGate state={state}>{state === "empty" ? <div className="bop-empty">暂无职责配置。</div> : <Table rows={sample.permissions} columns={["type", "status", "detail"]} action={r => <button onClick={() => setRole(r.title)}>查看配置</button>} />}<div className="bop-panel bop-editor"><h3>{role}</h3><p>同一人可兼任多个职责；编辑、发布与推荐分别授权。</p><div className="bop-checks">{all.map(x => <label className="bop-check" key={x}><input type="checkbox" checked={roleChecks.includes(x)} onChange={e => setChecks({ ...checks, [role]: e.target.checked ? [...roleChecks, x] : roleChecks.filter(y => y !== x) })} />{x}</label>)}</div><div className="bop-actions"><Button onClick={() => setNotice(state === "change-failed" ? "保存失败，权限未变更。" : (persistChecks(), "职责配置已保存。"))}>保存配置</Button></div>{notice && <Alert>{notice}</Alert>}</div></StateGate></Frame>; }

export function OperationsPage({ page, state, go }: Props) {
  if (state === "permission-denied") {
    return <Frame title={operationPages.find(item => item.id === page)?.title || "页面无权限"}>
      <Alert tone="error">当前账号没有此操作权限。请联系管理员核对职责。</Alert>
    </Frame>;
  }
  const props = { page, state, go };
  switch (page) {
  case "op-topics": return <Topics {...props} />; case "op-topic-edit": return <TopicEdit {...props} />;
  case "op-circles": return <Circles {...props} />; case "op-circle-edit": return <CircleEdit {...props} />;
  case "op-taxonomy": return <Taxonomy {...props} />; case "op-features": return <Features {...props} />;
  case "op-slots": return <Slots {...props} />; case "op-events": return <Events {...props} />;
  case "op-event-edit": return <EventEdit {...props} />; case "op-submissions": return <Submissions {...props} />;
  case "op-points": return <Points {...props} />;
  case "op-shop": return <Shop {...props} />;
  case "op-permissions": return <Permissions {...props} />; default: return <Frame title="页面未找到"><p>请从导航选择页面。</p></Frame>;
} }









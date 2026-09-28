"use client";

import { useEffect, useState } from "react";
import { prototypeStore } from "../c-prototype/storage";
import { defaultEventConfigs } from "./retained-event-defaults";
import "./retained-event-config.css";

export type EventType = "long_term" | "referral" | "campaign";
export type EventTask = {
  task_code: string; name: string; description: string; operator_note?: string; event_type: string;
  target_count: number; reward_points: number; expire_days: number;
  reward_dispatch_mode: "realtime" | "deferred" | "manual"; sort_order: number;
  day_index?: number; unlock_day?: number; cta_text: string; cta_route: string;
  event_filter: { biz_type?: string; content_types?: number[]; min_image_count?: number };
  quota_rule: { scope?: "per_period" | "per_day" | "per_month"; limit?: number };
  validation_rule: { title_min_len?: number; content_min_cn_chars?: number; required_fields?: string[] };
};
export type EventConfig = {
  code: string; name: string; type: EventType; cover_url: string; description: string;
  start_time: string; end_time: string; max_points: number; sort_order: number;
  is_featured: boolean; status: "草稿" | "进行中" | "已结束";
  unlock_rule: { requires: string[]; requires_condition?: "all_completed" | "all_claimed"; duration_days?: number; unlock_day?: number; next_activity_code?: string; period_code?: string };
  extra_config: {
    quota_config?: { scope: "per_period" | "per_day" | "per_month"; limit: number };
    publish_config: { biz_type: "work" | "post" | "prompt"; content_types: number[]; media_types: string[]; required_topic: boolean; required_category: boolean; required_model: boolean; required_scene: boolean; topic_codes: string[]; category_codes: string[]; model_codes: string[]; scene_codes: string[]; min_image_count: number; min_video_count: number; title_min_len: number; require_join_token: boolean };
    streak_config?: { timezone: "Asia/Shanghai"; milestones: { days: number; points: number }[] };
  };
  tasks: EventTask[];
};

const key = "bp-op-event-configs";
const eventTypeLabels: Record<EventType, string> = { long_term: "长期活动", referral: "邀请活动", campaign: "档期活动" };
const contentTypeOptions = {
  work: [{ value: 4, label: "文字作品" }, { value: 2, label: "图片作品" }, { value: 3, label: "视频作品" }],
  post: [{ value: 1, label: "纯文字圈子帖子" }, { value: 2, label: "图文圈子帖子" }],
  prompt: [{ value: 4, label: "文字 Prompt" }, { value: 2, label: "图片 Prompt" }, { value: 3, label: "视频 Prompt" }],
} as const;
const defaults = (): EventConfig[] => defaultEventConfigs();
const canonicalCode = (code: string) => code === "referral" ? "invite_reward" : code;
const hydrate = (rows: EventConfig[]): EventConfig[] => {
  const base = defaults();
  const normalized = rows.map(row => {
    const code = canonicalCode(row.code);
    const seed = base.find(item => item.code === code);
    const rule = seed?.extra_config.publish_config || blankEventConfig().extra_config.publish_config;
    const obsoleteSeed = Boolean(seed && !row.cover_url && !row.max_points && !row.tasks?.length);
    if (obsoleteSeed && seed) return structuredClone(seed);
    const savedPublish = row.extra_config?.publish_config;
    const savedTypes = savedPublish?.content_types || rule.content_types;
    const displayTypes = (savedPublish?.biz_type || rule.biz_type) === "post" ? savedTypes : [...new Set(savedTypes.map(value => value === 1 ? 3 : value))];
    return { ...seed, ...row, code, type: String(row.type) === "time_limited" ? "campaign" : row.type,
      unlock_rule: { ...seed?.unlock_rule, ...row.unlock_rule, requires: row.unlock_rule?.requires || seed?.unlock_rule.requires || [] },
      extra_config: { ...seed?.extra_config, ...row.extra_config, publish_config: { ...rule, ...savedPublish, content_types: displayTypes } },
      tasks: row.tasks || [],
    } as EventConfig;
  });
  return [...normalized, ...base.filter(item => !normalized.some(row => row.code === item.code))];
};

export const readEventConfigs = (): EventConfig[] => {
  if (typeof window === "undefined") return defaults();
  try {
    const stored = JSON.parse(prototypeStore.getItem(key) || "null");
    if (!stored || !Array.isArray(stored.drafts)) return defaults();
    return hydrate(stored.drafts as EventConfig[]);
  } catch { return defaults(); }
};
export const readPublishedEventConfigs = (): EventConfig[] => {
  if (typeof window === "undefined") return defaults();
  try {
    const stored = JSON.parse(prototypeStore.getItem(key) || "null");
    return Array.isArray(stored?.published) ? hydrate(stored.published as EventConfig[]) : defaults();
  } catch { return defaults(); }
};
const persist = (drafts: EventConfig[], published: EventConfig[]) => {
  prototypeStore.setItem(key, JSON.stringify({ drafts, published }));
  window.dispatchEvent(new Event("bp-operations-change"));
};
export const saveEventDraft = (item: EventConfig) => {
  const drafts = readEventConfigs();
  const next = drafts.some(row => row.code === item.code) ? drafts.map(row => row.code === item.code ? item : row) : [item, ...drafts];
  persist(next, readPublishedEventConfigs());
};
export const publishEventConfig = (item: EventConfig) => {
  const drafts = readEventConfigs();
  const nextDrafts = drafts.some(row => row.code === item.code) ? drafts.map(row => row.code === item.code ? item : row) : [item, ...drafts];
  const published = readPublishedEventConfigs();
  const nextPublished = published.some(row => row.code === item.code) ? published.map(row => row.code === item.code ? item : row) : [item, ...published];
  persist(nextDrafts, nextPublished);
  const rows = JSON.parse(prototypeStore.getItem("bp-op-events") || "[]") as { id: string; title: string; status: string; type?: string; owner?: string; detail?: string }[];
  const id = "ev-" + item.code;
  const nextRow = { id, title: item.name, status: item.status, type: eventTypeLabels[item.type], owner: "活动运营", detail: `${item.tasks.length} 项任务 · 最高可得 ${item.max_points} 积分` };
  const withoutLegacyAlias = item.code === "invite_reward" ? rows.filter(row => row.id !== "ev-referral") : rows;
  prototypeStore.setItem("bp-op-events", JSON.stringify(withoutLegacyAlias.some(row => row.id === id) ? withoutLegacyAlias.map(row => row.id === id ? nextRow : row) : [nextRow, ...withoutLegacyAlias]));
  window.dispatchEvent(new Event("bp-operations-change"));
};

const emptyTask = (index: number): EventTask => ({ task_code: `task_${Date.now().toString(36)}_${index}`, name: "", description: "", event_type: "work.publish", target_count: 1, reward_points: 0, expire_days: 30, reward_dispatch_mode: "realtime", sort_order: index + 1, cta_text: "去参与", cta_route: "/publish", event_filter: {}, quota_rule: { scope: "per_period", limit: 1 }, validation_rule: {} });
export const blankEventConfig = (): EventConfig => ({ code: "", name: "", type: "long_term", cover_url: "", description: "", start_time: "", end_time: "", max_points: 0, sort_order: 100, is_featured: false, status: "草稿", unlock_rule: { requires: [] }, extra_config: { publish_config: { biz_type: "work", content_types: [2], media_types: ["image"], required_topic: false, required_category: false, required_model: false, required_scene: false, topic_codes: [], category_codes: [], model_codes: [], scene_codes: [], min_image_count: 0, min_video_count: 0, title_min_len: 0, require_join_token: false } }, tasks: [] });

const validate = (item: EventConfig, publish: boolean): string => {
  if (!item.name.trim()) return "请填写活动名称。";
  if (!/^[a-z][a-z0-9_]{2,63}$/.test(item.code)) return "活动编码须以小写字母开头，使用 3—64 位小写字母、数字和下划线。";
  if (!publish) return "";
  if (item.status === "草稿") return "请先选择进行中或已结束的公开状态，再发布配置。";
  if (!item.cover_url.trim()) return "请填写活动封面地址。";
  if (item.type === "campaign" && (!item.start_time || !item.end_time || item.end_time <= item.start_time)) return "档期活动需要有效的开始与结束时间。";
  if (!Number.isInteger(item.max_points) || item.max_points < 0 || !Number.isInteger(item.sort_order) || item.sort_order < 0) return "展示积分与排序须为非负整数。";
  if (item.unlock_rule.duration_days !== undefined && (!Number.isInteger(item.unlock_rule.duration_days) || item.unlock_rule.duration_days < 1)) return "参与窗口须为正整数天数。";
  const publishRule = item.extra_config.publish_config;
  if (!publishRule.content_types.length) return "请选择至少一种内容类型。";
  for (const [required, codes, label] of [[publishRule.required_topic, publishRule.topic_codes, "话题"], [publishRule.required_category, publishRule.category_codes, "分类"], [publishRule.required_model, publishRule.model_codes, "模型"], [publishRule.required_scene, publishRule.scene_codes, "场景"]] as const) {
    if (required && !codes.length) return `请填写必须${label}的具体编码。`;
  }
  if (publishRule.require_join_token && item.tasks.length === 0) return "先参与再发布的活动需先配置任务。";
  const streak = item.extra_config.streak_config;
  if (streak) {
    if (item.type !== "long_term" || item.unlock_rule.duration_days !== 14 || streak.timezone !== "Asia/Shanghai") return "连续挑战须为长期活动、14 天参与窗口并按北京时间计日。";
    if (streak.milestones.length !== 3 || [3, 5, 7].some(days => !streak.milestones.some(row => row.days === days && Number.isInteger(row.points) && row.points >= 0))) return "连续挑战需设置 3、5、7 天三个有效里程碑积分。";
    const daily = (event: string) => item.tasks.some(task => task.event_type === event && task.target_count === 1 && task.quota_rule.scope === "per_day" && task.quota_rule.limit === 1);
    if (!daily("aigc.generation_success") || !daily("work.publish")) return "连续挑战需配置每日生成和每日发布两项任务，且每项按天最多发奖 1 次。";
  }
  for (const task of item.tasks) {
    if (!task.name.trim() || !task.event_type.trim()) return "任务名称和事件类型不能为空。";
    if (!Number.isInteger(task.target_count) || task.target_count < 1 || !Number.isInteger(task.reward_points) || task.reward_points < 0) return "任务目标次数须为正整数，奖励积分须为非负整数。";
    if (!Number.isInteger(task.expire_days) || task.expire_days < 1) return "任务积分有效天数须为正整数。";
    if (task.quota_rule.limit !== undefined && (!Number.isInteger(task.quota_rule.limit) || task.quota_rule.limit < 1)) return "任务最大发奖次数须为正整数。";
  }
  return "";
};

type Props = { id?: string; state?: string; go?: (target: string) => void };
export function RetainedEventConfig({ id, state, go }: Props) {
  const [draft, setDraft] = useState<EventConfig>(blankEventConfig);
  const [notice, setNotice] = useState("");
  const [isExisting, setIsExisting] = useState(false);
  useEffect(() => {
    const code = canonicalCode(id?.replace(/^ev-/, "") || new URLSearchParams(location.search).get("id")?.replace(/^ev-/, "") || "");
    const current = readEventConfigs().find(row => row.code === code);
    queueMicrotask(() => { setDraft(current ? structuredClone(current) : blankEventConfig()); setIsExisting(Boolean(current)); setNotice(""); });
  }, [id]);
  const set = <K extends keyof EventConfig>(field: K, value: EventConfig[K]) => setDraft(old => ({ ...old, [field]: value }));
  const setUnlock = (field: keyof EventConfig["unlock_rule"], value: unknown) => setDraft(old => ({ ...old, unlock_rule: { ...old.unlock_rule, [field]: value } }));
  const setPublish = (field: keyof EventConfig["extra_config"]["publish_config"], value: unknown) => setDraft(old => ({ ...old, extra_config: { ...old.extra_config, publish_config: { ...old.extra_config.publish_config, [field]: value } } }));
  const setTask = (index: number, value: EventTask) => setDraft(old => ({ ...old, tasks: old.tasks.map((task, i) => i === index ? value : task) }));
  const applyStreakPreset = () => setDraft(old => ({
    ...old, name: old.name || "7日连续创作挑战", code: old.code || "creation_streak_7day", type: "long_term",
    unlock_rule: { ...old.unlock_rule, requires: [], duration_days: 14 },
    extra_config: {
      ...old.extra_config,
      publish_config: { ...old.extra_config.publish_config, biz_type: "work", content_types: [2, 3, 4], media_types: ["image", "video"], min_image_count: 0, min_video_count: 0, require_join_token: true },
      streak_config: { timezone: "Asia/Shanghai", milestones: [{ days: 3, points: 50 }, { days: 5, points: 100 }, { days: 7, points: 200 }] },
    },
  }));
  const save = (publish: boolean) => {
    const error = validate(draft, publish);
    if (error) { setNotice(error); return; }
    if (!isExisting && readEventConfigs().some(row => row.code === draft.code)) { setNotice("活动编码已存在，请更换编码。"); return; }
    if (state === "conflict") { setNotice("当前配置有更新冲突，请返回列表重新打开。"); return; }
    if (publish) { publishEventConfig(draft); setNotice("活动配置已发布到本地原型，C 端可读取公开版本。"); }
    else { saveEventDraft(draft); setNotice("草稿已保存，公开版本未改变。"); }
    setIsExisting(true);
  };
  if (state === "permission-denied") return <div className="rec-alert">当前账号没有活动配置权限。</div>;
  return <section className="rec-page">
    <header className="rec-head"><div><h2>{isExisting ? "维护活动" : "新建活动"}</h2><p>先配置活动规则和任务，核对后发布到本地 C 端原型。</p></div>{go && <button type="button" onClick={() => go("op-events")}>返回活动列表</button>}</header>
    <div className="rec-columns"><div className="rec-main">
      <section className="rec-card"><div className="rec-section-head"><h3>基本信息</h3><button type="button" onClick={applyStreakPreset}>套用 7 日连续创作挑战</button></div><div className="rec-grid">
        <label>活动名称<input value={draft.name} onChange={e => set("name", e.target.value)} maxLength={128} /></label>
        <label>活动编码<input value={draft.code} disabled={isExisting} onChange={e => set("code", e.target.value.toLowerCase())} placeholder="小写英文、数字和下划线" /></label>
        <label>封面图地址<input value={draft.cover_url} onChange={e => set("cover_url", e.target.value)} placeholder="/retained/activity/… 或 HTTPS 地址" /></label>
        <label>活动类型<select value={draft.type} onChange={e => set("type", e.target.value as EventType)}><option value="long_term">长期活动</option><option value="referral">邀请活动</option><option value="campaign">档期活动</option></select></label>
        {draft.type === "campaign" && <><label>开始时间<input type="datetime-local" value={draft.start_time} onChange={e => set("start_time", e.target.value)} /></label><label>结束时间<input type="datetime-local" value={draft.end_time} onChange={e => set("end_time", e.target.value)} /></label></>}
        <label>最高可得积分（展示）<input type="number" min="0" value={draft.max_points} onChange={e => set("max_points", Number(e.target.value))} /></label>
        <label>排序（越大越靠前）<input type="number" min="0" value={draft.sort_order} onChange={e => set("sort_order", Number(e.target.value))} /></label>
        <label>公开状态<select value={draft.status} onChange={e => set("status", e.target.value as EventConfig["status"])}><option>草稿</option><option>进行中</option><option>已结束</option></select></label>
        <label className="rec-check"><input type="checkbox" checked={draft.is_featured} onChange={e => set("is_featured", e.target.checked)} />主推活动</label>
        <label className="rec-wide">活动说明<textarea value={draft.description} onChange={e => set("description", e.target.value)} rows={3} /></label>
      </div>{draft.extra_config.streak_config && <div className="rec-streak"><p className="rec-hint">连续判断按 Asia/Shanghai 自然日；发布前需配置每日生成与每日发布任务。</p><div className="rec-grid">{[3, 5, 7].map(days => <label key={days}>连续 {days} 天里程碑积分<input type="number" min="0" value={draft.extra_config.streak_config?.milestones.find(row => row.days === days)?.points ?? ""} onChange={e => setDraft(old => ({ ...old, extra_config: { ...old.extra_config, streak_config: { timezone: "Asia/Shanghai", milestones: [3, 5, 7].map(day => ({ days: day, points: day === days ? Number(e.target.value) : old.extra_config.streak_config?.milestones.find(row => row.days === day)?.points ?? 0 })) } } }))} /></label>)}</div></div>}</section>
      <section className="rec-card"><h3>参与与解锁</h3><div className="rec-grid">
        <label>依赖活动编码（逗号分隔）<input value={draft.unlock_rule.requires.join(", ")} onChange={e => setUnlock("requires", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /></label>
        <label>依赖达成条件<select value={draft.unlock_rule.requires_condition || "all_completed"} onChange={e => setUnlock("requires_condition", e.target.value)}><option value="all_completed">依赖活动全部完成</option><option value="all_claimed">依赖活动奖励全部领取</option></select></label>
        <label>个人参与窗口（天）<input type="number" min="1" value={draft.unlock_rule.duration_days ?? ""} onChange={e => setUnlock("duration_days", e.target.value ? Number(e.target.value) : undefined)} /></label>
        <label>解锁天数<input type="number" min="0" value={draft.unlock_rule.unlock_day ?? ""} onChange={e => setUnlock("unlock_day", e.target.value ? Number(e.target.value) : undefined)} /></label>
        <label>下游活动编码<input value={draft.unlock_rule.next_activity_code || ""} onChange={e => setUnlock("next_activity_code", e.target.value)} /></label>
        <label>期次编码<input value={draft.unlock_rule.period_code || ""} onChange={e => setUnlock("period_code", e.target.value)} /></label>
        {draft.type === "referral" && <><label>邀请配额周期<select value={draft.extra_config.quota_config?.scope || "per_period"} onChange={e => setDraft(old => ({ ...old, extra_config: { ...old.extra_config, quota_config: { scope: e.target.value as "per_period" | "per_day" | "per_month", limit: old.extra_config.quota_config?.limit || 1 } } }))}><option value="per_period">每期</option><option value="per_day">每天</option><option value="per_month">每月</option></select></label><label>邀请配额<input type="number" min="1" value={draft.extra_config.quota_config?.limit || 1} onChange={e => setDraft(old => ({ ...old, extra_config: { ...old.extra_config, quota_config: { scope: old.extra_config.quota_config?.scope || "per_period", limit: Number(e.target.value) } } }))} /></label></>}
      </div></section>
      <section className="rec-card"><h3>发布要求</h3><div className="rec-grid">
        <label>业务类型<select value={draft.extra_config.publish_config.biz_type} onChange={e => { const biz = e.target.value as EventConfig["extra_config"]["publish_config"]["biz_type"]; setDraft(old => ({ ...old, extra_config: { ...old.extra_config, publish_config: { ...old.extra_config.publish_config, biz_type: biz, content_types: biz === "post" ? [1] : [2] } } })); }}><option value="work">作品</option><option value="post">圈子帖子</option><option value="prompt">Prompt</option></select></label>
        <fieldset className="rec-content-types"><legend>可参与内容类型</legend>{contentTypeOptions[draft.extra_config.publish_config.biz_type].map(option => <label className="rec-check" key={option.value}><input type="checkbox" checked={draft.extra_config.publish_config.content_types.includes(option.value)} onChange={e => { const current = draft.extra_config.publish_config.content_types; setPublish("content_types", e.target.checked ? [...new Set([...current, option.value])] : current.filter(value => value !== option.value)); }} />{option.label}</label>)}</fieldset>
        <label>媒体类型<select multiple value={draft.extra_config.publish_config.media_types} onChange={e => setPublish("media_types", Array.from(e.target.selectedOptions, option => option.value))}><option value="image">图片</option><option value="video">视频</option></select></label>
        <label>指定话题编码（逗号分隔）<input value={draft.extra_config.publish_config.topic_codes.join(", ")} onChange={e => setPublish("topic_codes", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /></label>
        <label>指定分类编码（逗号分隔）<input value={draft.extra_config.publish_config.category_codes.join(", ")} onChange={e => setPublish("category_codes", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /></label>
        <label>指定模型编码（逗号分隔）<input value={draft.extra_config.publish_config.model_codes.join(", ")} onChange={e => setPublish("model_codes", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /></label>
        <label>指定场景编码（逗号分隔）<input value={draft.extra_config.publish_config.scene_codes.join(", ")} onChange={e => setPublish("scene_codes", e.target.value.split(",").map(x => x.trim()).filter(Boolean))} /></label>
        {([ ["required_topic", "必须话题"], ["required_category", "必须分类"], ["required_model", "必须模型"], ["required_scene", "必须场景"] ] as const).map(([field, label]) => <label className="rec-check" key={field}><input type="checkbox" checked={draft.extra_config.publish_config[field]} onChange={e => setPublish(field, e.target.checked)} />{label}</label>)}
        <label>最少图片数<input type="number" min="0" value={draft.extra_config.publish_config.min_image_count} onChange={e => setPublish("min_image_count", Number(e.target.value))} /></label>
        <label>最少视频数<input type="number" min="0" value={draft.extra_config.publish_config.min_video_count} onChange={e => setPublish("min_video_count", Number(e.target.value))} /></label>
        <label>标题最少字数<input type="number" min="0" value={draft.extra_config.publish_config.title_min_len} onChange={e => setPublish("title_min_len", Number(e.target.value))} /></label>
        <label className="rec-check"><input type="checkbox" checked={draft.extra_config.publish_config.require_join_token} onChange={e => setPublish("require_join_token", e.target.checked)} />先参与再发布</label>
      </div></section>
      <section className="rec-card"><div className="rec-section-head"><h3>活动任务</h3><button type="button" onClick={() => setDraft(old => ({ ...old, tasks: [...old.tasks, emptyTask(old.tasks.length)] }))}>新增任务</button></div><p className="rec-hint">任务奖励以任务配置为准；上方最高积分只用于展示。</p>
        {draft.tasks.length === 0 && <p className="rec-hint">尚未添加任务。</p>}
        {draft.tasks.map((task, index) => <details className="rec-task" key={task.task_code} open><summary>{task.name || `任务 ${index + 1}`} · {task.event_type}</summary><div className="rec-grid">
          <label>任务名称<input value={task.name} onChange={e => setTask(index, { ...task, name: e.target.value })} /></label>
          <label>事件类型<input value={task.event_type} onChange={e => setTask(index, { ...task, event_type: e.target.value })} placeholder="work.publish" /></label>
          <label>目标次数<input type="number" min="1" value={task.target_count} onChange={e => setTask(index, { ...task, target_count: Number(e.target.value) })} /></label>
          <label>奖励积分<input type="number" min="0" value={task.reward_points} onChange={e => setTask(index, { ...task, reward_points: Number(e.target.value) })} /></label>
          <label>积分有效天数<input type="number" min="1" value={task.expire_days} onChange={e => setTask(index, { ...task, expire_days: Number(e.target.value) })} /></label>
          <label>发奖模式<select value={task.reward_dispatch_mode} onChange={e => setTask(index, { ...task, reward_dispatch_mode: e.target.value as EventTask["reward_dispatch_mode"] })}><option value="realtime">实时</option><option value="deferred">延后</option><option value="manual">人工</option></select></label>
          <label>排序（越小越靠前）<input type="number" min="0" value={task.sort_order} onChange={e => setTask(index, { ...task, sort_order: Number(e.target.value) })} /></label>
          <label>第几天任务<input type="number" min="0" value={task.day_index ?? ""} onChange={e => setTask(index, { ...task, day_index: e.target.value ? Number(e.target.value) : undefined, unlock_day: e.target.value ? Number(e.target.value) : undefined })} /></label>
          <label>解锁天数<input type="number" min="0" value={task.unlock_day ?? ""} onChange={e => setTask(index, { ...task, unlock_day: e.target.value ? Number(e.target.value) : undefined })} /></label>
          <label>入口文案<input value={task.cta_text} onChange={e => setTask(index, { ...task, cta_text: e.target.value })} /></label>
          <label>跳转地址<input value={task.cta_route} onChange={e => setTask(index, { ...task, cta_route: e.target.value })} /></label>
          <label>业务过滤<select value={task.event_filter.biz_type || ""} onChange={e => setTask(index, { ...task, event_filter: { ...task.event_filter, biz_type: e.target.value || undefined } })}><option value="">不限</option><option value="work">作品</option><option value="post">闪念</option><option value="prompt">Prompt</option></select></label>
          <label>任务内容类型（数字，逗号分隔）<input value={task.event_filter.content_types?.join(",") || ""} onChange={e => setTask(index, { ...task, event_filter: { ...task.event_filter, content_types: e.target.value.split(",").map(Number).filter(Number.isInteger) } })} /></label>
          <label>最少图片数<input type="number" min="0" value={task.event_filter.min_image_count ?? ""} onChange={e => setTask(index, { ...task, event_filter: { ...task.event_filter, min_image_count: e.target.value ? Number(e.target.value) : undefined } })} /></label>
          <label>配额周期<select value={task.quota_rule.scope || "per_period"} onChange={e => setTask(index, { ...task, quota_rule: { ...task.quota_rule, scope: e.target.value as EventTask["quota_rule"]["scope"] } })}><option value="per_period">每期</option><option value="per_day">每天</option><option value="per_month">每月</option></select></label>
          <label>最大发奖次数<input type="number" min="1" value={task.quota_rule.limit ?? ""} onChange={e => setTask(index, { ...task, quota_rule: { ...task.quota_rule, limit: e.target.value ? Number(e.target.value) : undefined } })} /></label>
          <label>标题最少字数<input type="number" min="0" value={task.validation_rule.title_min_len ?? ""} onChange={e => setTask(index, { ...task, validation_rule: { ...task.validation_rule, title_min_len: e.target.value ? Number(e.target.value) : undefined } })} /></label>
          <label>正文最少汉字<input type="number" min="0" value={task.validation_rule.content_min_cn_chars ?? ""} onChange={e => setTask(index, { ...task, validation_rule: { ...task.validation_rule, content_min_cn_chars: e.target.value ? Number(e.target.value) : undefined } })} /></label>
          <label>必填字段（逗号分隔）<input value={task.validation_rule.required_fields?.join(", ") || ""} onChange={e => setTask(index, { ...task, validation_rule: { ...task.validation_rule, required_fields: e.target.value.split(",").map(x => x.trim()).filter(Boolean) } })} placeholder="title, content, scene, model" /></label>
          <label className="rec-wide">任务描述<textarea rows={2} value={task.description} onChange={e => setTask(index, { ...task, description: e.target.value })} /></label>
          <label className="rec-wide">后台核对说明<textarea rows={2} value={task.operator_note || ""} onChange={e => setTask(index, { ...task, operator_note: e.target.value })} placeholder="仅后台可见，不进入 C 端任务文案" /></label>
        </div><button type="button" className="rec-danger" onClick={() => setDraft(old => ({ ...old, tasks: old.tasks.filter((_, i) => i !== index) }))}>移除任务</button></details>)}
      </section>
    </div><aside className="rec-card rec-aside"><h3>当前编辑预览</h3><p><strong>{draft.name || "未命名活动"}</strong></p><p>{eventTypeLabels[draft.type]} · {draft.status}</p><p>最高可得 {draft.max_points} 积分 · {draft.tasks.length} 项任务</p><p>{draft.description || "活动说明待填写"}</p><small>保存草稿不会改变 C 端；发布后 C 端读取公开配置。</small></aside></div>
    <footer className="rec-footer"><button type="button" onClick={() => save(false)}>保存草稿</button><button type="button" className="rec-primary" onClick={() => save(true)}>发布配置</button></footer>{notice && <output className="rec-alert">{notice}</output>}
  </section>;
}

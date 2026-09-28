import type { EventConfig, EventTask } from "./retained-event-config";

// Public C-page snapshot supplies display copy and known rewards. Unknown event codes stay blank
// until an operator checks the real B-end configuration; this is prototype data, not backend truth.
const task = (code: string, name: string, description: string, points: number, target = 1, day?: number, event = "", action = "去参与"): EventTask => ({
  task_code: code, name, description, event_type: event, target_count: target, reward_points: points,
  expire_days: 30, reward_dispatch_mode: "realtime", sort_order: day || 1,
  ...(day ? { day_index: day, unlock_day: day } : {}), cta_text: action, cta_route: "",
  event_filter: {}, quota_rule: { scope: "per_period", limit: 1 }, validation_rule: {},
});
const activity = (code: string, name: string, cover: string, max: number, description: string, tasks: EventTask[], index: number): EventConfig => ({
  code, name, type: "long_term", cover_url: `/retained/activity/${cover}`, description,
  start_time: "", end_time: "", max_points: max, sort_order: 100 - index,
  is_featured: index === 0, status: "进行中", unlock_rule: { requires: [] },
  extra_config: { publish_config: { biz_type: "work", content_types: [2], media_types: ["image"], required_topic: false, required_category: false, required_model: false, required_scene: false, topic_codes: [], category_codes: [], model_codes: [], scene_codes: [], min_image_count: 0, min_video_count: 0, title_min_len: 0, require_join_token: false } },
  tasks,
});

export const defaultEventConfigs = (): EventConfig[] => {
  const weekly = activity("meizhourenwu", "每周任务", "activity-live-weekly.png", 350,
    "本期活动时间：9月24日—9月30日。七天依次解锁任务，每轮每项任务仅可领取 1 次奖励。", [
      task("weekly_browse", "第 1 天 · 浏览 5 条社区内容", "浏览 5 条社区内容，熟悉本周的灵感与作品。", 20, 5, 1, "", "去浏览"),
      task("weekly_favorite", "第 2 天 · 收藏 3 个 AI 作品", "收藏 3 个想参考的 AI 作品。", 30, 3, 2, "", "去收藏"),
      task("weekly_text_post", "第 3 天 · 发布 1 条纯文字圈子帖子", "记录一个灵感、想法或创作计划。", 40, 1, 3, "", "去发布"),
      task("weekly_image_post", "第 4 天 · 发布 1 条图片圈子帖子", "用至少 1 张图片表达一个想法。", 50, 1, 4, "", "去发布"),
      task("weekly_image_work_1", "第 5 天 · 发布 1 个图片作品", "完成图片作品发布。", 60, 1, 5, "work.publish", "去发布"),
      task("weekly_image_work_2", "第 6 天 · 发布 2 个不同图片作品", "发布 2 个不同的图片作品。", 70, 2, 6, "work.publish", "去发布"),
      task("weekly_image_work_3", "第 7 天 · 发布 3 个不同图片作品", "发布 3 个不同图片作品。", 80, 3, 7, "work.publish", "去发布"),
    ], 0);
  weekly.unlock_rule.period_code = "";
  const image = activity("ai_image_challenge", "生图挑战", "activity-live-image-challenge.png", 5100,
    "发布原创图片作品并带上 #生图挑战。标题不少于 4 个字，正文不少于 30 个汉字；填写创作场景与使用模型，至少上传 1 张图片。前 2 条合格作品每条奖励 50 积分；首页推荐每篇额外奖励 500 积分，每人每期最多 10 次。", [
      task("image_publish", "发布图片作品", "发布原创 AI 图片并带上 #生图挑战；本期前 2 条计入发布奖励。", 50, 1, undefined, "work.publish", "去发布图片"),
      { ...task("image_home_featured", "首页推荐奖励", "作品被推荐至首页后额外奖励；每人每期最多 10 次。", 500), reward_dispatch_mode: "manual", quota_rule: { scope: "per_period", limit: 10 } },
    ], 1);
  image.extra_config.publish_config = { ...image.extra_config.publish_config, required_topic: true, required_model: true, required_scene: true, topic_codes: [], model_codes: [], scene_codes: [], title_min_len: 4, min_image_count: 1, require_join_token: true };
  image.tasks[0].quota_rule.limit = 2;
  image.tasks[0].validation_rule = { title_min_len: 4, content_min_cn_chars: 30, required_fields: ["title", "content", "scene", "model"] };
  const prompt = activity("prompt_co_creation", "Prompt 共创计划", "activity-live-prompt.png", 3000,
    "分享经过验证的 Prompt。发布带图片、视频或漫剧素材的作品；标题不少于 4 个字，中文正文不少于 30 个汉字，填写场景、模型和案例。每天前 2 条合格作品每条奖励 50 积分；首页精选另行人工加奖。", [
      task("prompt_publish", "发布带素材 Prompt", "每天前 2 条满足要求的作品，每条奖励 50 积分。", 50, 1, undefined, "work.publish", "去发布"),
      { ...task("prompt_featured", "首页精选加奖", "审核精选后另行发放，同一篇仅奖励 1 次。", 500), reward_dispatch_mode: "manual" },
    ], 2);
  prompt.extra_config.publish_config = { ...prompt.extra_config.publish_config, biz_type: "prompt", content_types: [2, 3], media_types: ["image", "video"], required_model: true, required_scene: true, model_codes: [], scene_codes: [], title_min_len: 4, require_join_token: true };
  prompt.tasks[0].quota_rule = { scope: "per_day", limit: 2 };
  prompt.tasks[0].validation_rule = { title_min_len: 4, content_min_cn_chars: 30, required_fields: ["title", "content", "scene", "model"] };
  const invite = activity("invite_reward", "邀请有礼", "activity-live-invite.png", 10000,
    "邀请好友加入，一起创作。", [], 3);
  invite.type = "referral";
  invite.extra_config.quota_config = { scope: "per_period", limit: 1 };
  // C snapshot does not state the three B task reward amounts; keep these visible for review.
  invite.tasks = [
    task("invite_register", "邀请注册", "好友注册后进入该阶段。奖励数待核对。", 0, 1, undefined, "invite.register"),
    task("invite_interact", "邀请互动", "好友完成首次互动后进入该阶段。奖励数待核对。", 0, 1, undefined, "invite.interact"),
    task("invite_publish", "邀请发布", "好友完成首次发布后进入该阶段。奖励数待核对。", 0, 1, undefined, "invite.publish"),
  ];
  const newbie = activity("newbie_task", "新手任务", "activity-live-newbie.png", 150,
    "完成注册、浏览、完善资料、首次互动和转发作品五项任务，最高领取 150 积分；完成后解锁七日成长计划。", [
      task("newbie_register", "注册成功，领取新人积分", "完成注册后自动到账。", 20),
      task("newbie_browse", "浏览 1 个 AIGC 作品", "浏览任意作品详情。", 30, 1, undefined, "", "去浏览"),
      task("newbie_profile", "完善个人资料", "完善头像、名称、性别和个性签名。", 30, 1, undefined, "", "去完善"),
      task("newbie_interact", "完成首次互动", "首次点赞、评论或收藏任一内容。", 30, 1, undefined, "", "去互动"),
      task("newbie_share", "转发 1 个 AI 作品", "打开作品详情并完成转发。", 40, 1, undefined, "", "去转发作品"),
    ], 4);
  newbie.unlock_rule.next_activity_code = "growth_7day";
  const growth = activity("growth_7day", "七日成长计划", "activity-live-growth.png", 300,
    "完成新手任务后开启专属七日成长计划，按日完成从发现灵感到创作发布的任务。", [
      task("day1_browse_content", "浏览5条AIGC内容", "浏览 5 条 AIGC 内容。", 20, 5, 1, "content.view", "去浏览"),
      task("day2_copy_prompt", "收藏3个AI作品", "收藏 3 个 AI 作品。", 30, 3, 2, "interaction.favorite", "去收藏"),
      task("day3_favorite_work", "发布2条闪念", "发布 2 条闪念。", 30, 2, 3, "post.publish", "去发布"),
      task("day4_like_or_comment", "点赞或评论5个AI作品", "点赞或评论 5 个 AI 作品。", 40, 5, 4, "interaction.like_or_comment", "去互动"),
      { ...task("day5_share_work", "发布2条带图闪念", "发布 2 条带图闪念。", 50, 2, 5, "post.publish", "去发布"), operator_note: "当前测试端带图过滤字段未确认；本原型不能保证仅带图闪念自动计数。" },
      task("day6_share_post", "生成3次AIGC内容", "生成 3 次 AIGC 内容。", 60, 3, 6, "aigc.generation_success", "去创作"),
      task("day7_publish_work", "发布1个AI作品", "发布 1 个 AI 作品。", 70, 1, 7, "work.publish", "去发布"),
    ].map((item, index) => ({ ...item, expire_days: 365, reward_dispatch_mode: "realtime", sort_order: index + 1, cta_route: "" })), 5);
  growth.unlock_rule = { requires: ["newbie_task"], requires_condition: "all_completed", duration_days: 7 };
  return [weekly, image, prompt, invite, newbie, growth];
};

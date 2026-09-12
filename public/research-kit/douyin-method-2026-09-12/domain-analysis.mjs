import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const files = ['domain-author-details.json', 'child-profile.json', 'story-profile.json', 'tutorial-profile.json', 'comment-observations.json'];
const sources = files.map(file => { const raw = fs.readFileSync(path.join(dir, file), 'utf8'); return { file, sha256: crypto.createHash('sha256').update(raw).digest('hex'), data: JSON.parse(raw) }; });
const rawDetails = sources[0].data;
const profiles = sources.filter(x => Array.isArray(x.data.works)).map(x => x.data);
const commentsSource = sources.find(x => x.file === 'comment-observations.json').data;
const DAY = 86400000;
const start = Date.parse('2026-07-13T00:00:00+08:00');
const end = Date.parse('2026-09-07T00:00:00+08:00');
const stamp = raw => /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/u.test(raw ?? '') ? Date.parse(`${raw.replace(' ', 'T')}:00+08:00`) : null;
const date = n => new Date(n + 8 * 3600000).toISOString().slice(0, 10);
const finite = n => typeof n === 'number' && Number.isFinite(n);
const fmt = (n, k = 1) => n === null || n === undefined ? '缺失' : Number(n.toFixed(k)).toLocaleString('en-US', { maximumFractionDigits: k });
const pct = n => n === null || n === undefined ? '缺失' : `${fmt(100 * n)}%`;
function number(raw) {
  if (raw === null || raw === undefined || raw === '') return { raw: raw ?? null, value: null, kind: 'missing' };
  const m = String(raw).match(/^(\d+(?:\.\d+)?)(万|亿)?$/u);
  return m ? { raw, value: Number(m[1]) * ({ 万: 10000, 亿: 100000000 }[m[2]] || 1), kind: m[2] ? 'abbreviated-display' : 'display-integer' } : { raw, value: null, kind: 'unparsed' };
}
function stats(values, totalN = values.length) {
  const a = values.filter(finite).sort((a, b) => a - b);
  const q = p => { if (!a.length) return null; const at = (a.length - 1) * p; const lo = Math.floor(at), hi = Math.ceil(at); return a[lo] + (a[hi] - a[lo]) * (at - lo); };
  const sum = a.length ? a.reduce((s, x) => s + x, 0) : null;
  return { totalN, validN: a.length, missingN: totalN - a.length, min: a[0] ?? null, q1: q(0.25), median: q(0.5), q3: q(0.75), iqr: a.length ? q(0.75) - q(0.25) : null, max: a.at(-1) ?? null, mean: a.length ? sum / a.length : null, sum, top1Share: sum ? a.at(-1) / sum : null };
}
function group(rows, key) {
  const map = new Map();
  for (const row of rows) { if (!map.has(row[key])) map.set(row[key], []); map.get(row[key]).push(row); }
  return map;
}
const storyEpisodeNames = ['预兆', '鼠疫', '山海署', '饥线', '边界', '地渊', '遗土', '真相'];
function safeTitle(author, rawTitle) {
  if (!rawTitle) return null;
  if (author !== '孩子的一棠课') return rawTitle;
  if (rawTitle.startsWith('杜甫草堂')) return '杜甫草堂的秘密';
  const work = rawTitle.match(/《[^》]+》/u)?.[0];
  if (work) return work;
  if (rawTitle.startsWith('孩子，你的朋友')) return '孩子，你的朋友不是“人”';
  if (rawTitle.includes('谁是最可爱的人')) return '谁是最可爱的人';
  return rawTitle.split(/[\n。？！]/u)[0].slice(0, 20);
}
function classify(row) {
  const title = row.title ?? '';
  if (row.author === '编导_拾光') {
    if (title.includes('合集')) return { kind: '合集', series: '山海第一季', episode: null };
    if (title.includes('正片周六上映')) return { kind: '预告', series: '山海第一季', episode: null };
    if (title.includes('山海第二季')) {
      const m = title.match(/第(\d+)集/u); return { kind: '分集', series: '山海第二季', episode: m ? Number(m[1]) : null };
    }
    if (title.includes('缺席证明')) {
      const m = title.match(/第(\d+)集/u); return { kind: '分集', series: '缺席证明', episode: m ? Number(m[1]) : null };
    }
    const idx = storyEpisodeNames.findIndex(name => title.includes(`：${name}`));
    if (idx >= 0 && title.includes('山海')) return { kind: '分集', series: '山海第一季', episode: idx + 1, episodeName: storyEpisodeNames[idx] };
    return { kind: '内容未明', series: null, episode: null };
  }
  if (row.author === 'foyege') {
    const d = row.publishedAt?.slice(0, 10);
    const tutorialDays = ['2026-08-02', '2026-08-06', '2026-08-12', '2026-08-19', '2026-08-21', '2026-08-26', '2026-09-11'];
    const testDays = ['2026-08-01', '2026-08-07', '2026-08-13', '2026-09-09'];
    return { kind: tutorialDays.includes(d) ? '教程线索' : testDays.includes(d) ? '成品/测试线索' : '工具/流程介绍线索', series: null, episode: null };
  }
  return { kind: '教育/亲子叙事线索', series: null, episode: null };
}
const rows = rawDetails.map((r, index) => {
  const publishedMs = stamp(r.publishedAt);
  const observedMs = Date.parse(r.observedAt);
  const status = publishedMs === null ? 'unknown-date' : publishedMs < start ? 'before-window' : publishedMs >= end ? 'after-window' : 'in-window';
  const profile = profiles.find(x => x.author === r.author);
  const profileWork = profile?.works.find(x => x.url === r.url);
  return {
    id: `D-${String(index + 1).padStart(3, '0')}`, sourceIndex: index, author: r.author, url: r.url, titleExcerpt: safeTitle(r.author, r.title),
    publishedAt: r.publishedAt ?? null, observedAt: r.observedAt ?? null, windowStatus: status, week: status === 'in-window' ? Math.floor((publishedMs - start) / (7 * DAY)) + 1 : null,
    ageAtObservationDays: publishedMs !== null && finite(observedMs) ? (observedMs - publishedMs) / DAY : null,
    durationSeconds: finite(r.durationSeconds) ? r.durationSeconds : null,
    likes: number(r.likeRaw), comments: number(r.commentRaw), favorites: number(r.collectRaw), shares: number(r.shareRaw),
    aiDeclared: r.aiDeclared ?? null, videoWatchedInFull: r.videoWatchedInFull ?? null,
    pinnedAtProfileObservation: profileWork?.pinned ?? null,
    classification: { ...classify(r), evidence: 'title/description only; not a full-watch or frame-by-frame judgment' },
  };
});
const inWindow = rows.filter(r => r.windowStatus === 'in-window');
function metrics(entries) {
  return { likes: stats(entries.map(x => x.likes.value)), comments: stats(entries.map(x => x.comments.value)), favorites: stats(entries.map(x => x.favorites.value)), shares: stats(entries.map(x => x.shares.value)), durationSeconds: stats(entries.map(x => x.durationSeconds)), ageAtObservationDays: stats(entries.map(x => x.ageAtObservationDays)) };
}
const versionPairs = [];
for (let ep = 1; ep <= 7; ep++) {
  const candidates = inWindow.filter(x => x.author === '编导_拾光' && x.classification.series === '山海第一季' && x.classification.episode === ep).sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  if (candidates.length !== 2) continue;
  const [early, later] = candidates;
  versionPairs.push({ series: '山海第一季', episode: ep, episodeName: storyEpisodeNames[ep - 1], earlyId: early.id, laterId: later.id, earlyPublishedAt: early.publishedAt, laterPublishedAt: later.publishedAt, earlyDurationSeconds: early.durationSeconds, laterDurationSeconds: later.durationSeconds, absoluteDurationDifferenceSeconds: Math.abs(early.durationSeconds - later.durationSeconds), earlyLikes: early.likes, laterLikes: later.likes, earlyToLaterLikesRatio: later.likes.value > 0 ? early.likes.value / later.likes.value : null, candidateBasis: 'same series/episode subtitle; duration difference <=0.05s; different URLs', status: 'candidate-republication-or-version-not-frame-verified' });
}
const laterCandidateIds = new Set(versionPairs.map(x => x.laterId));
const story = inWindow.filter(x => x.author === '编导_拾光');
const candidateGroups = story.filter(x => !laterCandidateIds.has(x.id));
const batch = story.filter(x => x.publishedAt === '2026-08-26 00:55');
const compilation = story.find(x => x.classification.kind === '合集');
const authors = [...group(rows, 'author')].map(([author, allRows]) => {
  const profile = profiles.find(x => x.author === author);
  const included = allRows.filter(x => x.windowStatus === 'in-window');
  const detailUrls = new Set(allRows.map(x => x.url));
  const profileWorks = profile?.works ?? [];
  const pinned = profileWorks.filter(x => x.pinned).map(x => ({ titleExcerpt: safeTitle(author, x.title), matchedDetailId: allRows.find(y => y.url === x.url)?.id ?? null, windowStatus: allRows.find(y => y.url === x.url)?.windowStatus ?? 'date-not-checked' }));
  const weekly = Array.from({ length: 8 }, (_, i) => {
    const weeklyRows = included.filter(x => x.week === i + 1);
    return { week: i + 1, startDate: date(start + i * 7 * DAY), endDateInclusive: date(start + (i + 1) * 7 * DAY - DAY), verifiedUploadObjectsN: weeklyRows.length, authorActualUploadsN: null, candidateVersionLaterObjectsN: weeklyRows.filter(x => laterCandidateIds.has(x.id)).length, candidateGroupsFirstObservedStandaloneN: author === '编导_拾光' ? weeklyRows.filter(x => !laterCandidateIds.has(x.id)).length : null, sampleIds: weeklyRows.map(x => x.id), metrics: metrics(weeklyRows) };
  });
  return {
    author, detailsN: allRows.length, inWindowN: included.length, beforeWindowN: allRows.filter(x => x.windowStatus === 'before-window').length, afterWindowN: allRows.filter(x => x.windowStatus === 'after-window').length,
    profileCoverage: { sourceFile: sources.find(s => s.data.author === author)?.file ?? null, observedAt: profile?.observedAt ?? null, displayedWorkCount: profile?.displayedWorkCount ?? null, extractedObjectsN: profileWorks.length, videoObjectsN: profileWorks.filter(x => x.url?.includes('/video/')).length, noteObjectsN: profileWorks.filter(x => x.url?.includes('/note/')).length, unknownTypeObjectsN: profileWorks.filter(x => !x.url?.includes('/video/') && !x.url?.includes('/note/')).length, listEndVisible: profile?.listEndVisible ?? null, objectsWithDetailDateN: profileWorks.filter(x => detailUrls.has(x.url)).length, objectsWithoutDetailDateN: profileWorks.filter(x => !detailUrls.has(x.url)).length, completeness: 'partial-evidence; visible list end does not certify account history or date-window completeness', pinned },
    weekly, verifiedObjectsPerWeek: stats(weekly.map(x => x.verifiedUploadObjectsN)), metrics: metrics(included), withoutLargestLikeObject: metrics([...included].sort((a, b) => b.likes.value - a.likes.value).slice(1)),
    formats: [...group(included.map(x => ({ ...x, formatKey: x.classification.kind })), 'formatKey')].map(([format, entries]) => ({ format, n: entries.length, metrics: metrics(entries), sourceIds: entries.map(x => x.id) })),
    inWindowSampleIds: included.map(x => x.id), boundarySamples: allRows.filter(x => x.windowStatus !== 'in-window').map(x => ({ id: x.id, titleExcerpt: x.titleExcerpt, publishedAt: x.publishedAt, windowStatus: x.windowStatus })),
  };
});
const byAuthorDate = (author, day) => rows.find(x => x.author === author && x.publishedAt.startsWith(day));
const tutorialPairs = [
  { name: '表演成品与次日教程', a: byAuthorDate('foyege', '2026-08-01'), b: byAuthorDate('foyege', '2026-08-02'), meaning: '成品点赞显示值较高；两条并非随机分配或同龄暴露。' },
  { name: '群像控场教程与次日测试', a: byAuthorDate('foyege', '2026-08-12'), b: byAuthorDate('foyege', '2026-08-13'), meaning: '教程点赞显示值较高，与上组方向相反。不能一般化为成品优于教程。' },
  { name: '两条约30秒成品线索', a: byAuthorDate('foyege', '2026-08-01'), b: byAuthorDate('foyege', '2026-08-07'), meaning: '几乎相同长度但累计计数差异很大，时长本身不能解释；标题/表演内容/曝光未知。' },
].map(p => ({ name: p.name, aId: p.a.id, bId: p.b.id, aPublishedAt: p.a.publishedAt, bPublishedAt: p.b.publishedAt, aFormat: p.a.classification.kind, bFormat: p.b.classification.kind, aLikes: p.a.likes, bLikes: p.b.likes, aDurationSeconds: p.a.durationSeconds, bDurationSeconds: p.b.durationSeconds, aToBLikesRatio: p.b.likes.value > 0 ? p.a.likes.value / p.b.likes.value : null, interpretation: p.meaning, fullWatchVerified: false }));
const result = {
  sourceFiles: sources.map(({ file, sha256 }) => ({ file, sha256 })),
  window: { startInclusive: '2026-07-13 00:00:00', endExclusive: '2026-09-07 00:00:00', timezone: 'Asia/Shanghai (+08:00)', durationDays: (end - start) / DAY, weeks: 8, rule: '八周为周一至周日；9月7日当天归窗外。发布日期原文按北京时间解释，观察时间以源ISO时间为准。' },
  methods: { unit: 'Published object / video URL, distinct from underlying content or new production', metrics: 'Explicit detail fields likeRaw/commentRaw/collectRaw/shareRaw; convert 万/亿 display values only, preserving raw text. Do not extract claimed plays from titles.', quantiles: 'Linear interpolation at (n-1)*p, type 7', missing: 'Unseen/missing numeric value=null; weekly verified objects may be 0 but actual account posting count remains unknown/null', comparison: 'Separate author cohorts; no cross-author absolute ranking. Counts accumulated to observation time, not per-post-age outcomes. No causal or general statistical inference.', versionMatch: 'Same series/episode name plus duration difference <=0.05s; candidate only; no full-watch or frame match', tutorialFormat: 'Manually classified by title/description and date; no full video inspection or experimental control', profileCompleteness: 'Pinned cards are not reverse chronological; visible list end and displayed totals do not prove complete account history. No deletion/unlisted/private-state inference.' },
  validation: { detailsN: rows.length, uniqueUrlsN: new Set(rows.map(x => x.url)).size, inWindowN: inWindow.length, windowUnknownDatesN: rows.filter(x => x.windowStatus === 'unknown-date').length, knownDurationInWindowN: inWindow.filter(x => x.durationSeconds !== null).length, missingDurationInWindowIds: inWindow.filter(x => x.durationSeconds === null).map(x => x.id), fullyWatchedN: rows.filter(x => x.videoWatchedInFull === true).length },
  authors,
  storyVersionAudit: { windowUploadObjectsN: story.length, sameMinuteBatchTimestamp: '2026-08-26 00:55', sameMinuteBatchObjectsN: batch.length, candidateVersionPairsN: versionPairs.length, candidateGroupsIfSevenPairsCollapsedN: candidateGroups.length, distinctEpisodeLabelGroupsN: new Set(candidateGroups.filter(x => x.classification.kind === '分集').map(x => `${x.classification.series}:${x.classification.episode}`)).size, remainingTypes: candidateGroups.filter(x => x.classification.kind !== '分集').map(x => ({ id: x.id, kind: x.classification.kind })), compilationPublishedAt: compilation?.publishedAt ?? null, compilationTitle: compilation?.titleExcerpt ?? null, firstStandaloneEpisode8At: batch.find(x => x.classification.episode === 8)?.publishedAt ?? null, status: 'The 8-object batch is not 8 newly independent productions. Seven have earlier candidates; episode 8 is advertised in an earlier 1-8 compilation. Content identity/edits remain unverified.', versionPairs },
  tutorialPairs,
  commentEvidence: { sourceFile: 'comment-observations.json', observedOn: commentsSource.observedOn, method: commentsSource.method, independentUsersN: null, sources: commentsSource.sources.map(s => ({ author: s.author, matchedDetailId: rows.find(r => r.url === s.url)?.id ?? null, fragmentsN: s.comments.length, comments: s.comments, inference: s.inference })) },
  rows,
};
assert.equal(result.window.durationDays, 56);
assert.equal(rows.length, new Set(rows.map(x => x.url)).size);
assert.equal(versionPairs.length, 7);
assert.equal(batch.length, 8);
assert.equal(candidateGroups.length, 14);
assert.equal(result.storyVersionAudit.distinctEpisodeLabelGroupsN, 11);
for (const a of authors) assert.equal(a.weekly.reduce((sum, x) => sum + x.verifiedUploadObjectsN, 0), a.inWindowN);
assert.equal(authors.find(x => x.author === '孩子的一棠课').inWindowN, 7);
assert.equal(authors.find(x => x.author === '编导_拾光').inWindowN, 21);
assert.equal(authors.find(x => x.author === 'foyege').inWindowN, 10);
assert.equal(number(null).value, null);
assert.equal(stats([]).median, null);
assert(versionPairs.every(x => x.absoluteDurationDifferenceSeconds < 0.05));
assert(rows.every(x => ['likes', 'comments', 'favorites', 'shares'].every(key => x[key].kind !== 'unparsed')));
assert(rows.filter(x => x.author === '孩子的一棠课').every(x => !x.titleExcerpt.includes('\n')));
assert.equal(result.commentEvidence.sources.reduce((sum, x) => sum + x.fragmentsN, 0), 10);

const table = (h, rs) => [h, h.map(() => '---'), ...rs].map(r => `| ${r.map(x => String(x ?? '缺失').replaceAll('|', '\\|').replaceAll('\n', ' ')).join(' | ')} |`).join('\n');
const minutes = n => n === null ? '缺失' : `${fmt(n / 60, 2)}分`;
const child = authors.find(x => x.author === '孩子的一棠课');
const storyAuthor = authors.find(x => x.author === '编导_拾光');
const tutorial = authors.find(x => x.author === 'foyege');
const title = r => (r.titleExcerpt ?? '').split('\n')[0].slice(0, 45);
const md = [
  '# 三位作者固定8周观察：发布对象、版本关系与反例', '',
  '结论：本轮把推荐卡片扩成了作者内的固定时间窗，能进一步检查“同作者、同题材、不同作品”之间的差异。现有结果仍是少量作者的公开页面切片；作品版本、曝光、粉丝变化和同龄互动结果没有齐备，不能形成题材、时长或作者的成功排名。', '',
  '## 时间窗与来源', '',
  '- 固定8周：北京时间2026-07-13 00:00（含）至2026-09-07 00:00（不含），共56天。周表按周一至周日划分，9月7日属于窗外。',
  '- 来源：本目录的[domain-author-details.json](domain-author-details.json)、[child-profile.json](child-profile.json)、[story-profile.json](story-profile.json)、[tutorial-profile.json](tutorial-profile.json)和[comment-observations.json](comment-observations.json)。源哈希保存在[domain-analysis.json](domain-analysis.json)。复算脚本为[domain-analysis.mjs](domain-analysis.mjs)。',
  `- 48条详情中38条窗内：孩子的一棠课7条、编导_拾光21条、foyege10条。窗内${result.validation.knownDurationInWindowN}条时长可读，${result.validation.missingDurationInWindowIds.length}条缺失；全部${rows.length}条均未标记完整观看。`,
  '- 周发布数指“已核验发布日期的发布对象数”，不是新生产的独立内容数。某周0条只表示这份证据中未找到，不能证明账号实际停更；真实全量周发布数在JSON中留null。',
  '- 互动列采用详情明确命名的点赞、评论、收藏、分享原字段；“万”仅换算显示值，保留原文。标题写“400万播放”属于作者文案，不作已核验播放量。周中位数是该周发布对象在9月12日观察时的累计值，不是该周新增互动，也未对齐发布后年龄。', '',
  '## 已确认事实和反例', '',
  `1. **置顶与最新发布不能混为一谈。**孩子的一棠课主页显示${child.profileCoverage.displayedWorkCount ?? '未记录总数'}作品，可见${child.profileCoverage.extractedObjectsN}个对象，其中${child.profileCoverage.videoObjectsN}个video、${child.profileCoverage.noteObjectsN}个note；三条置顶有6月26日旧片。10条详情中7条窗内，6月26日和7月9日在窗前、9月11日在窗后。近窗日期已核到7月9日，但其余对象未逐条核日，不能把“到底可见”写成完整账号历史。`,
  `2. **8月26日的批量上架会显著抬高表面的产能。**编导_拾光在同一分钟00:55有8条《山海》第一季对象；1–7集分别有7月18日至8月18日的早版，集名一致、时长差最多${fmt(Math.max(...versionPairs.map(x => x.absoluteDurationDifferenceSeconds)), 3)}秒。它们只能标“候选重发/版本”，不能算7条新增独立内容；也未逐帧确认完全相同。21个窗内发布对象在仅合并这7对的演示口径下变成14个候选组。`,
  '3. **追更反应不能证明内容不存在。**8月24日已发布标题明确的《山海》第一季1–8集合集，早于8月26日分集批量上架；第8集的内容可能已由合集承载，但本次没有完整观看核对。因此即使看到催更评论，也应先核作品关系、评论时间和用户是否发现合集，不能写“尚无续作”或“作者未补全集”。',
  '4. **“成品优于教程”遇到同作者反例。**foyege的8月1日约30秒成品线索有30.0万赞，8月2日教程4.2万；但8月12日控场法教程4659赞，8月13日测试短片524赞，方向反转。8月7日另一条约30秒成品只有272赞。这些是题材/形式的观察线索，发布时间、曝光、受众和内容质量未受控，不能归结成“短成品必然更好”。',
  `5. **高值不能代替稳定结果或知识核验。**孩子的一棠课7条窗内点赞中位数${fmt(child.metrics.likes.median, 0)}，最高的《敕勒歌》117.2万占这7条点赞显示值和的${pct(child.metrics.likes.top1Share)}；去掉最高对象后的中位数为${fmt(child.withoutLargestLikeObject.likes.median, 0)}。9月12日默认前五评论的匿名记录中仍有不同历史数量解释、民歌与近现代事件关联方式的质疑。这里确认的是争议线索存在，不是评论说法为真；高赞不能验证历史数字、课文关联或知识准确性。`, '',
  '## 分作者周表', '',
  '三个作者分别阅读；下列顺序不是绝对互动排名。无条目的周，中位数保持缺失。连续序列和主页完整性仍需复核。', '',
  ...authors.flatMap(a => [
    `### ${a.author}`, '',
    `已核验详情${a.detailsN}条，窗内${a.inWindowN}条，窗前${a.beforeWindowN}条，窗后${a.afterWindowN}条；主页可见${a.profileCoverage.extractedObjectsN}个对象，${a.profileCoverage.objectsWithDetailDateN}个已核验详情日期，${a.profileCoverage.objectsWithoutDetailDateN}个未核。主页${a.profileCoverage.listEndVisible ? '记录到底可见' : '未确认到底'}；完整性统一标为partial-evidence。${a.author === 'foyege' ? `源JSON的显示总数为${a.profileCoverage.displayedWorkCount ?? '未记录'}；本轮采集补充说明为页面显示28、提取27，因此不能声称完整。` : ''}`, '',
    table(['周', '日期（含首尾）', '已核发布对象', '其中候选较晚版本', '点赞中位数', '收藏中位数', '分享中位数', '时长中位数/有效n'], a.weekly.map(w => [`W${w.week}`, `${w.startDate}—${w.endDateInclusive}`, w.verifiedUploadObjectsN, a.author === '编导_拾光' ? w.candidateVersionLaterObjectsN : '不适用', fmt(w.metrics.likes.median, 2), fmt(w.metrics.favorites.median, 2), fmt(w.metrics.shares.median, 2), `${minutes(w.metrics.durationSeconds.median)}/${w.metrics.durationSeconds.validN}`])), '',
    `作者内窗内描述：8周已核发布对象数中位数${fmt(a.verifiedObjectsPerWeek.median, 2)}条/周（含未观察到对象的周，非账号真实产能）；点赞中位数${fmt(a.metrics.likes.median, 2)}，Q1–Q3为${fmt(a.metrics.likes.q1, 2)}–${fmt(a.metrics.likes.q3, 2)}；观察时作品年龄范围${fmt(a.metrics.ageAtObservationDays.min, 1)}–${fmt(a.metrics.ageAtObservationDays.max, 1)}天。年龄不同，不能把周表高低当成增长趋势或改版效果。`, '',
    table(['窗外ID', '发布日期', '边界', '标题线索'], a.boundarySamples.map(r => [r.id, r.publishedAt, r.windowStatus === 'before-window' ? '窗前' : '窗后', (r.titleExcerpt ?? '').split('\n')[0].slice(0, 45)])), '',
  ]),
  '## 《山海》版本关系复核', '',
  table(['集号/集名', '早版发布', '8月26日版本发布', '早版秒数', '较晚版秒数', '绝对差秒', '早版点赞原值', '较晚版点赞原值'], versionPairs.map(p => [`${p.episode}/${p.episodeName}`, p.earlyPublishedAt, p.laterPublishedAt, fmt(p.earlyDurationSeconds, 3), fmt(p.laterDurationSeconds, 3), fmt(p.absoluteDurationDifferenceSeconds, 3), p.earlyLikes.raw, p.laterLikes.raw])), '',
  '- 七对都是不同URL；同集名和相同时长提供强版本线索，但没有逐帧、音轨、字幕或编辑记录对比，不能写成已证实的完全相同重发。',
  '- 8月24日合集长4154.778秒（约69.25分钟）。合集标题包含1–8集，能够反驳“页面上没看到单独第8集就代表没有续作”的推断，但不能据标题验证合集完整内容。',
  '- 三个计数口径分别保留：21个发布对象；将七对候选版本合并后的14个候选组；其中11个不同集号标签（第一季8、第二季2、缺席证明1），另有合集、预告和标题“1”的未明对象各1。11个集号标签不等于11条已确认新生产内容。',
  '- W7（8月24–30日）原始10个对象含7个候选较晚版本，合并演示后该周只保留3个候选组首个单独发布记录；第8集又可能先在合集出现。这一周不能报告为“新做了10条”。',
  '- 早版均有更长累积时间；较晚版本点赞更低不能直接证明重发无效、质量下降或被限流。需要同一发布后时点、曝光、内容差异和是否推广等证据。', '',
  '## foyege的成品—教程对照及反向例', '',
  table(['对照线索', 'A日期/形式', 'A时长/点赞', 'B日期/形式', 'B时长/点赞', 'A/B点赞显示值'], tutorialPairs.map(p => [p.name, `${p.aPublishedAt}/${p.aFormat}`, `${minutes(p.aDurationSeconds)}/${p.aLikes.raw}`, `${p.bPublishedAt}/${p.bFormat}`, `${minutes(p.bDurationSeconds)}/${p.bLikes.raw}`, `${fmt(p.aToBLikesRatio, 2)}倍`])), '',
  '这里的“成品”“教程”都由标题说明判断；未完整观看，不判断表演质量、运镜质量或教学是否有效。8月2日教程时长缺失，不能补0秒，也不能拿它构造精确时长控制组。两组的相反方向优先用来拒绝过度概括，而不是选自己喜欢的一组支持策略。', '',
  '## 评论线索：知识核验与适用条件', '',
  '来源为9月12日已登录详情页默认顺序前五条评论，两个页面共10个匿名归纳片段；未展开回复，不等于10名独立用户，也不能计算反馈比例或问题发生率。报告不复述长篇原评论、账号身份或家庭私事。', '',
  table(['作品/对象', '可见线索', '能支持什么', '不能支持什么'], [
    ['《敕勒歌》/D-001', '情绪共鸣与相关内容推荐并存；两条给出不同的历史数量解释；另一条质疑民歌与近现代事件的关联', '历史数量、来源与叙事关联需要独立核验', '不能把任何一条评论的数字采信为事实；不能把高互动当知识可信度'],
    ['群像控场教程/D-045', '学习起点、模型条件、真人限制、收费、替代方法；一条称更多人物或频繁切镜时不灵', '可把人物数量、切镜方式、工具条件、成本作为后续验证项', '未复现，不能认定工具缺陷；不能推算失败率或大多数人的体验'],
  ]), '',
  '评论里对更多人物、频繁切镜的质疑是待复现主张。本轮没有测试生成结果；下一步若验证，应预先固定模型版本、人物数量、镜头变化及成功标准，保存成功与失败，避免只用精选示例。', '',
  '## 38条窗内对象明细', '',
  '明细按作者分组、发布时间排序；对象ID可回到JSON中的原URL、源数组位置、观察时间和原字段。', '',
  ...authors.flatMap(a => [
    `### ${a.author}的窗内对象`, '',
    table(['ID', '发布日期', '类型线索', '标题线索', '时长', '点赞原值', '评论原值', '收藏原值', '分享原值'], inWindow.filter(r => r.author === a.author).sort((x, y) => x.publishedAt.localeCompare(y.publishedAt)).map(r => [r.id, r.publishedAt, r.classification.kind + (laterCandidateIds.has(r.id) ? '/候选较晚版' : ''), title(r), minutes(r.durationSeconds), r.likes.raw, r.comments.raw, r.favorites.raw, r.shares.raw])), '',
  ]),
  '## 待验证假设与最小下一步', '',
  table(['可提出的假设', '现在缺少什么', '最小验证动作'], [
    ['同系列持续发布有助于用户寻找下一集', '评论时间、用户发现路径、合集/分集关系、跨周回访', '给作品建立集号与版本图；先检查已有合集与版本，补固定时点的寻找续作反馈'],
    ['成品吸引观看、教程承接复用可能各有作用', '播放、来源、收藏后使用、同题材可比样本', '预先选同题材的一组展示与教程，记录制作成本和同龄指标；保留反向结果'],
    ['课文连接生活或历史能持续引起兴趣', '事实核验、教学适配、孩子理解程度、后续回访', '把课文原文、历史来源和创作补叙分开核验；收集同龄作品及低表现作品'],
    ['表面高频可能主要来自版本整理', '逐帧/音轨/字幕比对、制作记录、实际新增部分', '先手工核对七对候选版本，仅把确认新增部分计入生产记录'],
  ]), '',
  '风险与边界：账号不是随机抽取，主页可能受置顶、隐藏、删除、图文混合或页面提取遗漏影响；未读取非公开数据，也没有粉丝增长序列、收入、实际制作时间或完整观看证据。本文不把互动高解释为知识正确、用户留存、商业成功或一人公司可复制产能。本次脚本只读取既有本地文件，不访问站外、不修改Site。', '',
  '复算：在本目录运行`node ./domain-analysis.mjs`。输出仅为domain-analysis.json与domain-analysis.md；无需安装依赖。检查56天窗口、URL唯一、各周加总、三作者7/21/10条窗内、7对候选版本、8条同分钟批次、14个候选组及缺失值保留。', '',
];
fs.writeFileSync(path.join(dir, 'domain-analysis.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(dir, 'domain-analysis.md'), md.join('\n'), 'utf8');
console.log(JSON.stringify({ validation: result.validation, authors: authors.map(a => ({ author: a.author, detailsN: a.detailsN, inWindowN: a.inWindowN, weeklyCounts: a.weekly.map(w => w.verifiedUploadObjectsN), likesMedian: a.metrics.likes.median, coverage: a.profileCoverage })), versionPairsN: versionPairs.length, candidateGroupsN: candidateGroups.length }, null, 2));

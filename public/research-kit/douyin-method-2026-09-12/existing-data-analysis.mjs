import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

// Read-only source; writes only the two named sibling deliverables. No network/dependencies.
const here = path.dirname(fileURLToPath(import.meta.url));
const inputPath = path.resolve(here, './douyin-observed.json');
const raw = fs.readFileSync(inputPath, 'utf8');
const source = JSON.parse(raw);
const MIN_PAIRS = 20;
const bins = [
  { label: '<1分钟', min: 0, max: 60 },
  { label: '1–<3分钟', min: 60, max: 180 },
  { label: '3–<5分钟', min: 180, max: 300 },
  { label: '5–<10分钟', min: 300, max: 600 },
  { label: '10–<20分钟', min: 600, max: 1200 },
  { label: '≥20分钟', min: 1200, max: null },
];
const round = (n, k = 6) => n === null ? null : Number(n.toFixed(k));
function parseVisibleNumber(value) {
  if (value === null || value === undefined || value === '') return { value: null, status: 'missing', raw: value ?? null, unit: null };
  const text = String(value).trim();
  const match = text.match(/^(\d+(?:,\d{3})*(?:\.\d+)?)(万|亿)?$/u);
  if (!match) return { value: null, status: 'unparsed', raw: value, unit: null };
  const unit = match[2] || 'bare';
  return { value: Number(match[1].replaceAll(',', '')) * ({ 万: 10000, 亿: 100000000 }[unit] || 1), raw: value, unit, status: unit === 'bare' ? 'display-integer' : 'abbreviated-display' };
}
function parseDuration(value) {
  if (value === null || value === undefined || value === '') return null;
  const parts = String(value).split(':');
  if (parts.length < 2 || parts.length > 3 || parts.some(v => !/^\d+$/u.test(v))) return null;
  const ns = parts.map(Number);
  if (ns.at(-1) >= 60 || (ns.length === 3 && ns[1] >= 60)) return null;
  return ns.reduce((sum, n) => sum * 60 + n, 0);
}
function quantile(sorted, p) {
  if (!sorted.length) return null;
  const at = (sorted.length - 1) * p;
  const lower = Math.floor(at), upper = Math.ceil(at);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (at - lower);
}
function describe(values, totalN = values.length) {
  const sorted = values.filter(x => Number.isFinite(x)).sort((a, b) => a - b);
  if (!sorted.length) return { totalN, validN: 0, missingN: totalN, min: null, q1: null, median: null, q3: null, iqr: null, mean: null, max: null, sum: null, top10PercentN: 0, top10PercentShare: null };
  const sum = sorted.reduce((a, b) => a + b, 0), topN = Math.ceil(sorted.length * 0.1);
  const q1 = quantile(sorted, 0.25), q3 = quantile(sorted, 0.75);
  return { totalN, validN: sorted.length, missingN: totalN - sorted.length, min: sorted[0], q1, median: quantile(sorted, 0.5), q3, iqr: q3 - q1, mean: sum / sorted.length, max: sorted.at(-1), sum, top10PercentN: topN, top10PercentShare: sum ? sorted.slice(-topN).reduce((a, b) => a + b, 0) / sum : null };
}
function group(rows, key) {
  const map = new Map();
  for (const row of rows) {
    const v = row[key];
    if (!map.has(v)) map.set(v, []);
    map.get(v).push(row);
  }
  return map;
}
function ranks(values) {
  const sorted = values.map((value, i) => ({ value, i })).sort((a, b) => a.value - b.value);
  const result = Array(values.length);
  for (let i = 0; i < sorted.length;) {
    let j = i + 1;
    while (j < sorted.length && sorted[j].value === sorted[i].value) j++;
    const rank = (i + 1 + j) / 2;
    for (let k = i; k < j; k++) result[sorted[k].i] = rank;
    i = j;
  }
  return result;
}
function pearson(xs, ys) {
  const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
  const my = ys.reduce((a, b) => a + b, 0) / ys.length;
  let xy = 0, xx = 0, yy = 0;
  for (let i = 0; i < xs.length; i++) { const x = xs[i] - mx, y = ys[i] - my; xy += x * y; xx += x * x; yy += y * y; }
  return xx && yy ? xy / Math.sqrt(xx * yy) : null;
}
function relationship(rows) {
  const pairs = rows.filter(x => x.durationSeconds !== null && x.visibleCount.value !== null);
  const xs = pairs.map(x => x.durationSeconds), ys = pairs.map(x => x.visibleCount.value);
  const canCalculate = pairs.length >= MIN_PAIRS && new Set(xs).size >= 5 && new Set(ys).size >= 5;
  const sorted = [...pairs].sort((a, b) => b.visibleCount.value - a.visibleCount.value);
  const trimmed = sorted.slice(1);
  return {
    totalN: rows.length, pairedN: pairs.length, missingPairN: rows.length - pairs.length,
    status: canCalculate ? 'descriptive-only' : 'insufficient-pairs-or-variation',
    spearman: canCalculate ? round(pearson(ranks(xs), ranks(ys))) : null,
    pearsonDurationVsLog1pCount: canCalculate ? round(pearson(xs, ys.map(Math.log1p))) : null,
    spearmanWithoutLargestCount: canCalculate && trimmed.length >= MIN_PAIRS ? round(pearson(ranks(trimmed.map(x => x.durationSeconds)), ranks(trimmed.map(x => x.visibleCount.value)))) : null,
    removedLargestCountId: canCalculate ? sorted[0].id : null,
  };
}
function concentration(rows) {
  const eligible = rows.filter(x => x.authorCode !== null);
  const authors = [...group(eligible, 'authorCode')].map(([authorCode, entries]) => ({ authorCode, placements: entries.length, visibleCountSum: entries.every(x => x.visibleCount.value !== null) ? entries.reduce((sum, x) => sum + x.visibleCount.value, 0) : null, categories: [...new Set(entries.map(x => x.category))], sampleIds: entries.map(x => x.id) })).sort((a, b) => b.placements - a.placements || a.authorCode.localeCompare(b.authorCode, 'en', { numeric: true }));
  const hhi = eligible.length ? authors.reduce((sum, x) => sum + (x.placements / eligible.length) ** 2, 0) : null;
  return { measuredBy: 'authorCode occurrence share; not follower share or market share', knownAuthorPlacements: eligible.length, missingAuthorPlacements: rows.length - eligible.length, uniqueAuthors: authors.length, singletonAuthors: authors.filter(x => x.placements === 1).length, repeatedAuthors: authors.filter(x => x.placements > 1).length, repeatedAuthorPlacements: authors.filter(x => x.placements > 1).reduce((sum, x) => sum + x.placements, 0), excessPlacementsBeyondOnePerAuthor: eligible.length - authors.length, maxPlacements: authors[0]?.placements ?? null, cr1: eligible.length ? authors[0].placements / eligible.length : null, cr5: eligible.length ? authors.slice(0, 5).reduce((sum, x) => sum + x.placements, 0) / eligible.length : null, hhi, hhi10000: hhi === null ? null : hhi * 10000, effectiveAuthorCount: hhi ? 1 / hhi : null, authors };
}
const samples = source.samples.map(x => ({ id: x.id, category: x.category ?? null, authorCode: x.authorCode ?? null, durationRaw: x.duration ?? null, durationSeconds: parseDuration(x.duration), visibleCount: parseVisibleNumber(x.unlabeledCount), dateText: x.dateText ?? null, observedAt: x.observedAt ?? null, tags: x.tags ?? null }));
function durationBins(rows) {
  return bins.map(bin => {
    const entries = rows.filter(x => x.durationSeconds !== null && x.durationSeconds >= bin.min && (bin.max === null || x.durationSeconds < bin.max));
    return { ...bin, n: entries.length, shareOfKnownDuration: rows.some(x => x.durationSeconds !== null) ? entries.length / rows.filter(x => x.durationSeconds !== null).length : null, visibleCount: describe(entries.map(x => x.visibleCount.value), entries.length) };
  });
}
const categories = [...group(samples, 'category')].map(([category, rows]) => ({ category, n: rows.length, visibleCount: describe(rows.map(x => x.visibleCount.value)), durationSeconds: describe(rows.map(x => x.durationSeconds)), durationBins: durationBins(rows), authors: concentration(rows), durationCountRelationship: relationship(rows) }));
const repeatedAuthorComparisons = [...group(samples, 'authorCode')].filter(([authorCode, rows]) => authorCode !== null && rows.length > 1).map(([authorCode, works]) => {
  const commonTags = works.every(x => Array.isArray(x.tags)) ? works[0].tags.filter(t => works.every(x => x.tags.includes(t))) : null;
  const eligible = works.filter(x => x.visibleCount.value !== null);
  const min = eligible.length ? Math.min(...eligible.map(x => x.visibleCount.value)) : null;
  const max = eligible.length ? Math.max(...eligible.map(x => x.visibleCount.value)) : null;
  return { authorCode, worksN: works.length, commonTags, categories: [...new Set(works.map(x => x.category))], maxToMinVisibleCountRatio: min > 0 ? max / min : null, works };
});
const details = source.details.map((entry, index) => {
  const verifiedOrder = entry.metricOrder === '点赞、评论、收藏、分享；图标位置经截图核对';
  const nums = (entry.metricsRaw ?? '').split(/\r?\n/u).slice(0, 4).map(parseVisibleNumber);
  const metrics = Object.fromEntries(['likes', 'comments', 'favorites', 'shares'].map((name, i) => [name, verifiedOrder ? nums[i] ?? { value: null, raw: null, status: 'missing', unit: null } : { value: null, raw: null, status: 'unverified-order', unit: null }]));
  const matchedSource = source.samples.filter(x => x.url === entry.url);
  const matched = matchedSource.map(s => samples.find(x => x.id === s.id));
  const like = metrics.likes.value;
  return { detailId: `DETAIL-${String(index + 1).padStart(2, '0')}`, observedAt: entry.observedAt ?? null, metricOrderEvidence: entry.metricOrder ?? null, metricOrderVerifiedInSource: verifiedOrder, metrics, matchedSampleIds: matched.map(x => x.id), matchedCategories: [...new Set(matched.map(x => x.category))], listMinusDetailLikes: matched.map(x => ({ id: x.id, difference: x.visibleCount.value !== null && like !== null ? x.visibleCount.value - like : null, listObservedAt: x.observedAt })), favoritesToLikes: like > 0 && metrics.favorites.value !== null ? metrics.favorites.value / like : null, sharesToLikes: like > 0 && metrics.shares.value !== null ? metrics.shares.value / like : null, ratioMeaning: 'displayed favorites / displayed likes and shares / likes; not user conversion or per-view engagement rates', aiDeclaration: entry.aiDeclaration ?? null, videoWatchedInFull: entry.videoWatchedInFull ?? null, publicationTimeRaw: entry.metricsRaw?.match(/发布时间：([^\n]+)/u)?.[1] ?? null };
});
function parseIndexCard(card) {
  const metricName = card.startsWith('关键词搜索指数') ? '关键词搜索指数' : card.startsWith('关键词综合指数') ? '关键词综合指数' : null;
  const yoy = card.match(/同比\s*([+-]?\d+(?:\.\d+)?)%/u);
  const mom = card.match(/环比\s*([+-]?\d+(?:\.\d+)?)%/u);
  const meanRaw = card.match(/平均值\s+(\d+(?:\.\d+)?(?:万|亿)?)\s*$/u)?.[1] ?? null;
  return { metricName, meanDisplay: parseVisibleNumber(meanRaw), yoyPercent: yoy ? Number(yoy[1]) : null, momPercent: mom ? Number(mom[1]) : null };
}
const queryObservations = source.queries.map((q, i) => ({ observationId: i + 1, keyword: q.keyword, status: q.status, period: q.period ?? null, observedAt: q.observedAt ?? null, indexCards: [...new Set(q.cards ?? [])].map(parseIndexCard) }));
const keywordTrend = [...group(queryObservations, 'keyword')].map(([keyword, observations]) => {
  const candidates = observations.flatMap(o => o.indexCards.filter(c => c.metricName === '关键词搜索指数').map(c => ({ ...c, observationId: o.observationId, period: o.period, observedAt: o.observedAt })));
  const complete = candidates.filter(c => c.meanDisplay.value !== null && c.yoyPercent !== null && c.momPercent !== null);
  const selected = complete.at(-1) ?? candidates.at(-1) ?? null;
  const yoy = selected?.yoyPercent ?? null, mom = selected?.momPercent ?? null;
  const quadrant = yoy === null || mom === null ? '缺失' : yoy === 0 || mom === 0 ? '零增长边界' : yoy > 0 ? (mom > 0 ? '同比正、环比正' : '同比正、环比负') : (mom > 0 ? '同比负、环比正' : '同比负、环比负');
  return { keyword, observationsN: observations.length, selectedSearchIndex: selected, quadrant };
});
const quadrantSummary = [...group(keywordTrend, 'quadrant')].map(([quadrant, rows]) => ({ quadrant, n: rows.length, keywords: rows.map(x => x.keyword) }));
const guideRows = source.guide.flatMap(g => (g.rows ?? []).map(row => ({ category: g.category, period: g.period ?? null, keyword: row.keyword, videoRaw: row.videoRaw ?? null })));
const guideVideoRawFormats = [...new Set(guideRows.map(x => x.videoRaw))];
const allAuthors = concentration(samples);
const overall = { n: samples.length, visibleCount: describe(samples.map(x => x.visibleCount.value)), durationSeconds: describe(samples.map(x => x.durationSeconds)), durationBins: durationBins(samples), authors: allAuthors, durationCountRelationship: relationship(samples) };
const firstWorkPerAuthor = [...group(samples.filter(x => x.authorCode !== null), 'authorCode')].map(([, rows]) => rows[0]);
const withinRanks = categories.flatMap(cat => {
  if (cat.durationCountRelationship.status !== 'descriptive-only') return [];
  const pairs = samples.filter(x => x.category === cat.category && x.durationSeconds !== null && x.visibleCount.value !== null);
  const rx = ranks(pairs.map(x => x.durationSeconds)), ry = ranks(pairs.map(x => x.visibleCount.value));
  // Rank / (n + 1) standardizes categories to a common relative-position scale.
  return pairs.map((_, i) => ({ x: rx[i] / (pairs.length + 1) - 0.5, y: ry[i] / (pairs.length + 1) - 0.5 }));
});
const sensitivity = { firstListedWorkPerAuthor: { authorSelectionRule: 'First occurrence in fixed source sample order; sensitivity only, not a representative sample', n: firstWorkPerAuthor.length, visibleCount: describe(firstWorkPerAuthor.map(x => x.visibleCount.value)), durationCountRelationship: relationship(firstWorkPerAuthor) }, pooledWithinCategoryRankRelationship: { pairedN: withinRanks.length, includedCategories: categories.filter(x => x.durationCountRelationship.status === 'descriptive-only').map(x => x.category), excludedCategories: categories.filter(x => x.durationCountRelationship.status !== 'descriptive-only').map(x => x.category), coefficient: round(pearson(withinRanks.map(x => x.x), withinRanks.map(x => x.y))), method: 'Within each eligible category, average-tie rank/(n+1)-0.5 for duration and count; Pearson correlation over pooled centered ranks. Descriptive sensitivity, not causal adjustment.' } };
const analysis = {
  source: { relativePath: '../douyin-ecosystem-expansion-2026-09-12/douyin-observed.json', sha256: crypto.createHash('sha256').update(raw).digest('hex'), sourceDate: source.date, selection: source.selection, sampleSelections: [...new Set(source.samples.map(x => x.selection))] },
  methods: { countField: 'samples[].unlabeledCount', countSemanticLabel: '卡片可见计数', fieldSemanticLimit: '列表无标签；不把计数当播放量、点赞量、点赞率或用户数。详情只在源文件注明图标顺序核对时按点赞/评论/收藏/分享解析。', abbreviatedUnits: '万 × 10000、亿 × 100000000；只换算显示中心值，不重建精确底数。带单位的原文本和status保留；不能据此断言平台按四舍五入还是截断显示。', quantile: 'Sorted values, linear interpolation at (n-1)*p (Hyndman-Fan type 7)', top10PercentShare: 'Largest ceil(0.1*validN) displayed counts / sum of valid displayed counts; ties not expanded. This describes count concentration, not user concentration.', missing: 'null or unparseable remains null; excluded from numeric denominators and separately counted', correlation: `Spearman with average ranks for ties; report only when pairedN >= ${MIN_PAIRS} and at least 5 unique values on each axis. Also Pearson(duration,log1p(count)) and removal of largest count if >=${MIN_PAIRS} pairs remain. No p-values/inferential population claims; recommendation sample is not random.`, authors: 'Use existing anonymized authorCode as identity key; no independent identity verification. HHI = sum((author placements / known-author placements)^2).', durationBins: bins, keywords: 'Exact duplicate cards within an observation are removed; for each keyword retain the last complete explicitly labeled search-index observation. Do not replace missing with zero or sum index averages.' },
  validation: { samplesN: source.samples.length, placementsN: source.placements.length, samplesEqualPlacements: JSON.stringify(source.samples) === JSON.stringify(source.placements), uniqueSampleIds: new Set(source.samples.map(x => x.id)).size, uniqueVideoUrls: new Set(source.samples.map(x => x.url)).size, missingCountIds: samples.filter(x => x.visibleCount.status === 'missing').map(x => x.id), unparsedCountIds: samples.filter(x => x.visibleCount.status === 'unparsed').map(x => x.id), countUnits: Object.fromEntries([...group(samples.map(x => ({ unit: x.visibleCount.unit })), 'unit')].map(([unit, entries]) => [unit, entries.length])), integerDisplayCount: samples.filter(x => x.visibleCount.status === 'display-integer').length, abbreviatedDisplayCount: samples.filter(x => x.visibleCount.status === 'abbreviated-display').length, missingDurationIds: samples.filter(x => x.durationRaw === null).map(x => x.id), unparsedDurationIds: samples.filter(x => x.durationRaw !== null && x.durationSeconds === null).map(x => x.id), detailsN: details.length, matchedDetailsN: details.filter(x => x.matchedSampleIds.length).length, matchedListCountEqualsDetailLikesN: details.filter(x => x.listMinusDetailLikes.length && x.listMinusDetailLikes.every(y => y.difference === 0)).length, detailMetricOrderVerifiedInSourceN: details.filter(x => x.metricOrderVerifiedInSource).length, queryObservationsN: queryObservations.length, uniqueKeywordsN: keywordTrend.length, completeSearchIndexKeywordsN: keywordTrend.filter(x => x.selectedSearchIndex && x.selectedSearchIndex.meanDisplay.value !== null && x.selectedSearchIndex.yoyPercent !== null && x.selectedSearchIndex.momPercent !== null).length },
  overall, categories, sensitivity, repeatedAuthorComparisons, details, keywordTrend, quadrantSummary, queryObservations,
  supplyDimensionAudit: { guidePagesN: source.guide.length, rowsN: guideRows.length, periods: [...new Set(guideRows.map(x => x.period))], sourceField: 'guide[].rows[].videoRaw', originalUnitsAndSuffixes: guideVideoRawFormats, sourceContainsMetricDefinition: false, findings: ['videoRaw 是已有采集字段名，JSON 没有该列原始表头及计算口径；不能仅凭字段名确认它是当日新增作品数、累计作品数还是关联结果数。', 'w/万及+必须保留；例如12w+不是精确120000，不能当成精确分母。', '关键词趋势周期是2026-08-10至2026-09-10，guide记录显示2026-09-09且选择近1日，时间窗不一致。', '综合指数不是已确认的供给量；没有作者数、作品新增量或在给定曝光下的结果，不能计算供需比、竞争强度或蓝海排序。'] },
  normalizedSamples: samples,
};
// Data/accounting checks catch lost rows and accidental null-to-zero coercion.
assert.equal(samples.length, 343);
assert.equal(analysis.validation.uniqueSampleIds, samples.length);
assert.equal(categories.reduce((sum, x) => sum + x.n, 0), samples.length);
assert.equal(overall.durationBins.reduce((sum, x) => sum + x.n, 0) + overall.durationSeconds.missingN, samples.length);
assert.equal(overall.visibleCount.validN + overall.visibleCount.missingN, samples.length);
assert.equal(parseVisibleNumber(null).value, null);
assert.equal(parseDuration(null), null);
assert.equal(parseVisibleNumber('1.9万').value, 19000);
assert.equal(quantile([1, 2, 3, 4], 0.25), 1.75);
assert.deepEqual(ranks([1, 2, 2, 4]), [1, 2.5, 2.5, 4]);
assert.equal(pearson(ranks([1, 2, 3]), ranks([3, 2, 1])), -1);
assert.equal(analysis.validation.unparsedCountIds.length, 0);
assert.equal(analysis.validation.unparsedDurationIds.length, 0);

const fmt = (n, digits = 1) => n === null || n === undefined ? '缺失' : Number(n.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits });
const pct = (n, digits = 1) => n === null || n === undefined ? '缺失' : `${fmt(n * 100, digits)}%`;
const esc = v => String(v ?? '缺失').replaceAll('|', '\\|').replaceAll('\n', ' ');
const rho = n => fmt(n, 3);
const mins = n => n === null ? '缺失' : `${fmt(n / 60, 2)}分钟`;
const table = (headers, rows) => [headers, headers.map(() => '---'), ...rows].map(row => `| ${row.map(esc).join(' | ')} |`).join('\n');
const visible = overall.visibleCount;
const knownDurationN = overall.durationSeconds.validN;
const fewerThan3 = samples.filter(x => x.durationSeconds !== null && x.durationSeconds < 180).length;
const topCategories = [...categories].sort((a, b) => b.visibleCount.median - a.visibleCount.median);
const eligibleCats = categories.filter(x => x.durationCountRelationship.status === 'descriptive-only');
const positiveCats = eligibleCats.filter(x => x.durationCountRelationship.spearman > 0).length;
const negativeCats = eligibleCats.filter(x => x.durationCountRelationship.spearman < 0).length;
const zeroCats = eligibleCats.filter(x => x.durationCountRelationship.spearman === 0).length;
const matchedDetails = details.filter(x => x.matchedSampleIds.length);
const favoriteRatios = describe(details.map(x => x.favoritesToLikes));
const shareRatios = describe(details.map(x => x.sharesToLikes));
const lines = [
  '# 已有抖音数据复算：分布、重复作者与时间关系', '',
  '结论：这份数据能描述已登录精选入口中的一批作品，并能找出值得跟踪的同作者对照；还不能验证某种时长或题材更容易成功，也不能据此确定市场份额或供需缺口。本次只复算已有 JSON，没有新增页面采集、用户采集或线上操作。', '',
  `来源：[douyin-observed.json](../douyin-ecosystem-expansion-2026-09-12/douyin-observed.json)。源标记日期 ${source.date}；SHA-256：\`${analysis.source.sha256}\`。复算脚本：[existing-data-analysis.mjs](existing-data-analysis.mjs)，结构化结果：[existing-data-analysis.json](existing-data-analysis.json)。`, '',
  '## 5个具体发现', '',
  `1. **这是一份作者覆盖较宽、单作者历史很浅的切片。**343张卡片、16个分类、${allAuthors.uniqueAuthors}个作者编码；${allAuthors.singletonAuthors}位作者只有1条，${allAuthors.repeatedAuthors}位有2–3条，重复作者合计${allAuthors.repeatedAuthorPlacements}条，超过“一作者一条”的条目只有${allAuthors.excessPlacementsBeyondOnePerAuthor}条。作者出现次数最大占比${pct(allAuthors.cr1)}，前5作者占${pct(allAuthors.cr5)}。这些指标描述本次入选位置；低集中度不等于平台创作者竞争不集中。`,
  `2. **计数明显右偏，平均数会被少量高值拉高。**卡片可见计数中位数${fmt(visible.median, 0)}，Q1–Q3为${fmt(visible.q1, 0)}–${fmt(visible.q3, 0)}，均值${fmt(visible.mean)}；最大的${visible.top10PercentN}张卡片占可见计数和的${pct(visible.top10PercentShare)}，最大值${fmt(visible.max, 0)}。跨分类中位数最高为${topCategories[0].category}（${fmt(topCategories[0].visibleCount.median, 0)}）、最低为${topCategories.at(-1).category}（${fmt(topCategories.at(-1).visibleCount.median, 0)}），这是不同精选序列的结果，不是赛道收益排序。`,
  `3. **当前样本几乎不能检验短视频与中长视频之间的胜负。**${knownDurationN}条时长可读，${overall.durationSeconds.missingN}条缺失；小于3分钟只有${fewerThan3}条（${pct(fewerThan3 / knownDurationN)}），时长中位数${mins(overall.durationSeconds.median)}。整体时长与可见计数的Spearman为${rho(overall.durationCountRelationship.spearman)}；够门槛的${eligibleCats.length}个分类里，${positiveCats}个为正、${negativeCats}个为负、${zeroCats}个为零。类内居中秩敏感性系数为${rho(sensitivity.pooledWithinCategoryRankRelationship.coefficient)}，每位作者只保留首次卡片后为${rho(sensitivity.firstListedWorkPerAuthor.durationCountRelationship.spearman)}。方向与强弱须按分类阅读，不能把相关写成时长造成效果。`,
  `4. **详情补足了互动种类，但不足以跨类推断。**13条详情均在原数据中注明点赞、评论、收藏、分享的图标顺序已核对，${matchedDetails.length}条能按URL对上列表，${analysis.validation.matchedListCountEqualsDetailLikesN}条与详情点赞显示值相同；DC-008列表1939、详情1938且观察时刻不同。本次不会因此给其余列表数值补上点赞标签。详情的收藏/点赞比介于${pct(favoriteRatios.min)}–${pct(favoriteRatios.max)}、分享/点赞比介于${pct(shareRatios.min)}–${pct(shareRatios.max)}，只描述这些特意选取的个案；分母不是播放或用户，不能称收藏率、分享率。`,
  `5. **关键词增长必须同时看同比、环比和指数水平。**34次查询归并为32个关键词，每个都有一次可读搜索指数；“天文”早次无数值、“历史人物”早次报错都保留，未填0。${quadrantSummary.map(x => `${x.quadrant}${x.n}个`).join('，')}。例如历史人文同比+233.60%、环比+9.74%，平均搜索指数只有417；历史故事同比+176.90%而环比-19.06%。这能帮助设定跟踪问题，不能证明需求转化或蓝海。`, '',
  '## 字段核对和分母', '',
  `- 列表原字段为\`unlabeledCount\`，没有指标标签，全文称“卡片可见计数”。${analysis.validation.integerDisplayCount}条是裸数字，${analysis.validation.abbreviatedDisplayCount}条带“万”；换算只用于对显示值做近似统计，原始文本保留，不知道平台是四舍五入还是截断。`,
  `- samples与placements逐字结构相同，不能相加为686条；${analysis.validation.uniqueSampleIds}个唯一样本ID，${analysis.validation.uniqueVideoUrls}个唯一视频URL。缺失计数${analysis.validation.missingCountIds.length}条，未解析计数${analysis.validation.unparsedCountIds.length}条；缺失时长：${analysis.validation.missingDurationIds.join('、') || '无'}。`,
  '- 分位数用(n−1)×p位置线性插值；IQR=Q3−Q1；前10%份额取最大的ceil(有效n×10%)条，占有效计数和，不是用户份额。同值不扩张条数，因此n=24时实际取3条。',
  '- 作者集中度按匿名authorCode出现次数计算，未重新核实账号身份；HHI为出现份额平方和。没有粉丝量、粉丝变化、播放量、曝光、完播、唯一互动用户或作品是否投流。',
  '- 相关系数只在至少20对有效数值且两轴各至少5个不同值时计算；并列值使用平均秩。这个门槛是本次描述性分析规则，不能使推荐样本变成代表性样本；不做总体显著性结论。', '',
  '## 分类分布与计数集中度', '',
  '单位：按页面显示文本换算的近似计数。各分类19–24张是采样配额与可见结果，不能推算平台内容或用户的市场份额。', '',
  table(['分类', '卡片n', '有效计数n', '作者数/重复作者数', '计数中位数', 'Q1–Q3', 'IQR', '均值', '最大值', '前10%条数/份额'], categories.map(x => [x.category, x.n, x.visibleCount.validN, `${x.authors.uniqueAuthors}/${x.authors.repeatedAuthors}`, fmt(x.visibleCount.median, 2), `${fmt(x.visibleCount.q1, 2)}–${fmt(x.visibleCount.q3, 2)}`, fmt(x.visibleCount.iqr, 2), fmt(x.visibleCount.mean), fmt(x.visibleCount.max, 0), `${x.visibleCount.top10PercentN}/${pct(x.visibleCount.top10PercentShare)}`])), '',
  `整体作者出现次数HHI=${fmt(allAuthors.hhi, 6)}（乘10000=${fmt(allAuthors.hhi10000, 2)}），对应有效作者数${fmt(allAuthors.effectiveAuthorCount, 2)}。所有分类的CR1、CR5、HHI及作者出现列表见JSON，不能当成平台集中度。`, '',
  '## 时长分箱与计数关系', '',
  '分箱左闭右开；例如3–<5分钟为180≤秒数<300。已知时长是分箱占比的分母；缺失另列。空箱的均值、中位数、份额为null，不填0。', '',
  table(['时长箱', '卡片n', '已知时长占比', '可见计数中位数', 'Q1–Q3', '均值'], overall.durationBins.map(x => [x.label, x.n, pct(x.shareOfKnownDuration), fmt(x.visibleCount.median, 2), `${fmt(x.visibleCount.q1, 2)}–${fmt(x.visibleCount.q3, 2)}`, fmt(x.visibleCount.mean)])), '',
  table(['分类', '有效时长n', '时长中位数', '成对n', 'Spearman', '时长与log(1+计数)相关', '删除最大计数后Spearman'], [{ category: '整体', ...overall }, ...categories].map(x => [x.category, x.durationSeconds.validN, mins(x.durationSeconds.median), x.durationCountRelationship.pairedN, rho(x.durationCountRelationship.spearman), rho(x.durationCountRelationship.pearsonDurationVsLog1pCount), rho(x.durationCountRelationship.spearmanWithoutLargestCount)])), '',
  '表中的缺失相关系数表示未达到计算门槛，不代表没有关系。分类内系数仍混杂题材、发布时间、作者体量、入选机制、曝光及制作水平。删除一个高值后的变化只检查敏感性；不是稳健因果估计。每位作者首次卡片的保留规则按源数组顺序执行，并非随机抽一条。各分类时长分箱完整存于JSON。', '',
  '## 同作者2–3条逐作品对照', '',
  '这15组是后续“作者×作品×时间”跟踪的现成种子。题材线索仅列原标签，不代替完整观看后的内容编码；日期沿用原文，不补年份或把累计值除以“存活天数”。比值是同一作者入选作品中最大/最小可见计数，不能控制曝光、内容年龄或账号阶段。', '',
  '三个可直接追问的个案：', '',
  '- DC-A150的两条均带“归墟”标签，时长8:36与8:07很接近，可见计数却为12.3万与5.5万（约2.24倍）；原日期是7月4日与8月4日。值得比较同系列题材、叙事和统一内容年龄下的变化，当前不能归因为29秒的时长差。',
  '- DC-A231的两条同带“越南、帝王洗头、安的旅行、交换世界计划”，3:51为2.5万，11:44为6989（约3.58倍）。两条日期均缺失，应先补齐时间和内容编码；不能据此直接推荐缩短时长。',
  '- DC-A4的两条跨知识/生活vlog，23:46为6825，3:30为102.6万（约150.33倍），且标签、日期缺失。同一作者也可能有极端不同的作品表现，保留作者ID只是控制的一部分，不能把这一组当成短时长的成功证明。', '',
  ...repeatedAuthorComparisons.flatMap(x => [
    `### ${x.authorCode}：${x.worksN}条，最大/最小可见计数${fmt(x.maxToMinVisibleCountRatio, 2)}倍`, '',
    `共同原标签：${x.commonTags?.length ? x.commonTags.join('、') : '无完全相同的标签'}。`, '',
    table(['样本ID', '精选分类', '原日期', '时长', '原可见计数', '题材标签线索'], x.works.map(w => [w.id, w.category, w.dateText, w.durationRaw, w.visibleCount.raw, (w.tags ?? []).join('、') || '未记录标签'])), '',
  ]),
  '以上作品均来自可见推荐卡片，缺少同作者未入选、普通表现和低表现作品。最多3条不能构成账号历史，也不足以给作者内相关系数。后续跟踪应以每位作者固定时间窗的连续作品为分母，保留未成功作品；同作者对照仍不能自动消除题材和曝光差异。', '',
  '## 13条详情的标签明确计数', '',
  '直接采用原文件注明的图标顺序，未在本次重新打开网页。原“万”显示保留；未匹配详情只能作为独立个案，不补精选分类。', '',
  table(['详情ID/对应卡片', '匹配分类', '点赞原值', '评论原值', '收藏原值', '分享原值', '收藏/点赞', '分享/点赞'], details.map(x => [`${x.detailId}/${x.matchedSampleIds.join(',') || '未匹配'}`, x.matchedCategories.join('、') || '未知', x.metrics.likes.raw, x.metrics.comments.raw, x.metrics.favorites.raw, x.metrics.shares.raw, pct(x.favoritesToLikes), pct(x.sharesToLikes)])), '',
  '不能把列表与详情计数混在一起构造343条统一点赞、收藏或分享分布；不能把13条的收藏/点赞关系应用于其余作品。多个互动动作可能由同一人完成，也不能相加当成独立消费者人数。', '',
  '## 32个关键词：只做搜索指数四象限', '',
  '共同观察周期：2026-08-10至2026-09-10，页面记录地域全国、应用抖音。同比与环比是页面提供的变化，不自行补齐比较基期边界；指数不是搜索次数或人数。“历史”同次重复搜索卡片去重，“历史人物”和“天文”保留失败/空值历史，选后一次完整值。', '',
  table(['象限', '关键词数', '关键词'], quadrantSummary.map(x => [x.quadrant, x.n, x.keywords.join('、')])), '',
  table(['关键词', '平均搜索指数原值', '同比', '环比', '象限'], keywordTrend.map(x => [x.keyword, x.selectedSearchIndex?.meanDisplay.raw, `${fmt(x.selectedSearchIndex?.yoyPercent, 2)}%`, `${fmt(x.selectedSearchIndex?.momPercent, 2)}%`, x.quadrant])), '',
  '四象限只表示当前指数方向：双正可继续跟踪，年正月负需要识别回落/季节变化，年负月正需要观察反弹是否持续，双负也不能直接判定无需求。词义、词长、品牌同名、查询意图不同；“历史人文417”和“历史246.4万”不能只凭增速互相替代。', '',
  '### 供给维度核查结果', '',
  ...analysis.supplyDimensionAudit.findings.map(x => `- ${x}`), '',
  '现有JSON只能确认采集器存了videoRaw文本。需要原列名、释义/帮助文本、统计窗口、包含范围、去重规则及“+”显示规则，才可判断能否作为某种供给代理；当前不生成“搜索指数÷视频数”的机会分。', '',
  '## 偏差与下一步最小字段', '',
  '- 推荐选择偏差：单个已登录账户、精选分类、可见前序、各分类有限配额；可能存在个性化、编辑选择与成功样本偏差。分类不是互斥题材或明确AIGC标签，不是平台随机样本。',
  '- 时间偏差：卡片是不同发布时间的累计显示值，采集时刻也略有差别。发布年月、统一观察年龄、是否删改重发未知，不能比较单位时间表现或增长速度。',
  '- 作者与控制组不足：311位作者只有1条；15组重复作者也没有完整发布序列、未入选作品、粉丝基数及变化。不能把成功作者案例解释成可复制的投入产出。',
  '- 指标与观看证据不足：列表无明确指标标签；13条详情都未标记完整看完；没有播放/曝光/完播分母。标签和文案只能支撑题材线索，不能确认叙事结构、画面质量与观众留存。', '',
  table(['数据层', '最小补充字段', '为什么需要'], [
    ['作者', '稳定匿名作者ID；样本入选理由；粉丝数及记录时刻；账号连续作品窗口', '保留作者阶段、粉丝变化和入选机制，建立真正的纵向单位'],
    ['作品', '稳定作品ID；完整发布时间与时区；题材编码；内容形式；精确时长；标签；AI声明；是否完整观看', '把关键词、精选分类和真实内容编码分开，对齐内容年龄'],
    ['连续观测', '统一的发布后1/7/14天观察时点；点赞/评论/收藏/分享各自原字段名与原值；缺失原因', '比较同龄作品与新增互动，不把不同年龄累计值放在一个结果中'],
    ['对照', '同作者固定窗口内连续作品（含普通和低表现）；预先确定对照题材/形式；可得时记录推广状态', '形成可追踪对照，而非先找高表现作品再解释成功原因'],
    ['必要分母', '在授权可得时记录曝光、播放、完播及各字段定义；不可得则留空', '没有分母就只比较计数，不能计算每播放互动率或完播率'],
    ['生产成本', '单条制作时间、修改次数、工具成本、可重复环节', '把可见表现与一人公司能否持续生产联系起来'],
    ['关键词与供给', '指数释义、统一窗口；供给列原表头/释义；作品数/作者数范围与去重规则；原w/+值', '先确认口径再构造可比较代理指标，不根据字段名猜供给'],
  ]), '',
  '最小验证方式：先从15组重复作者中按“有清晰共同题材线索、能获得连续作品窗口”选少量种子，建立包含普通表现作品的作者×作品×观察时点表；每轮只比较一个主要变量。本次没有执行新增采集。', '',
  '## 复算与检查', '',
  '在本文件目录运行：', '',
  '```powershell', 'node ./existing-data-analysis.mjs', '```', '',
  '脚本只读取上述已有JSON，只写本目录的existing-data-analysis.json和existing-data-analysis.md；无需安装依赖、不访问网络。校验样本数、ID去重、分类加总、时长分箱加总、缺失保留、数字解析和秩/分位数基础算例。金额、联系人、账号认证信息不进入本输出，作者沿用匿名编码。', '',
];
fs.writeFileSync(path.join(here, 'existing-data-analysis.json'), `${JSON.stringify(analysis, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(here, 'existing-data-analysis.md'), lines.join('\n'), 'utf8');
console.log(JSON.stringify({ output: here, sourceSha256: analysis.source.sha256, validation: analysis.validation, overall: { ...overall, authors: { ...overall.authors, authors: undefined } }, sensitivity, quadrantSummary }, null, 2));

import type { PublicDataProfile, PublicObservation } from './public-data-types';

export const comparisonMonth = '2026-07';
export const comparisonProvider = 'Semrush';
const preferredDomains: Record<string, string> = {
  liblib:'liblib.art',runninghub:'runninghub.cn',tusi:'tensor.art',civitai:'civitai.com',
  seaart:'seaart.ai',openart:'openart.ai',nightcafe:'nightcafe.studio',jimeng:'jimeng.jianying.com',
  kling:'klingai.com',midjourney:'midjourney.com',leonardo:'leonardo.ai',runway:'runwayml.com',
  waytoagi:'waytoagi.com',datawhale:'datawhale.cn',huggingface:'huggingface.co',modelscope:'modelscope.cn',linuxdo:'linux.do',dify:'dify.ai'
};

export function comparisonDomain(profile: PublicDataProfile) {
  return preferredDomains[profile.id] || profile.domains[0];
}

export function comparisonMetric(profile: PublicDataProfile, key: string, month = comparisonMonth): PublicObservation | undefined {
  return profile.observations.find(observation =>
    observation.key === key && observation.provider === comparisonProvider &&
    observation.period === month && observation.domain === comparisonDomain(profile) &&
    observation.evidenceStatus === 'page' && observation.numericValue !== null
  );
}

export function domainNote(id: string) {
  return ({tusi:'本行只比较 Tensor.Art 国际站',runway:'旧主域；当前官网已迁移',kling:'旧域；另有 kling.ai 观察',dify:'主域与 Cloud 分开记录',runninghub:'本行使用 .cn；.ai 另列'} as Record<string,string>)[id] || '';
}

export function observationStatus(status: PublicObservation['evidenceStatus']) {
  return ({page:'已读取公开页','search-index':'仅搜索索引',unavailable:'未取得有效值'})[status];
}

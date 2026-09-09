export type PublicDataSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  publishedAt: string | null;
  accessedAt: string;
  accessNote: string;
  excerpt?: string;
};

export type PublicObservation = {
  key: string;
  domain: string | null;
  metric: string;
  value: string;
  numericValue: number | null;
  unit: string;
  period: string;
  scope: string;
  provider: string;
  evidenceStatus: 'page' | 'search-index' | 'unavailable';
  sourceId: string;
  limitation: string;
};

export type PublicDataProfile = {
  id: string;
  name: string;
  domains: string[];
  summary: string;
  observations: PublicObservation[];
  interpretations: string[];
  gaps: string[];
  sources: PublicDataSource[];
};

export type DataEssay = {
  title: string;
  paragraphs: string[];
  refs: { title: string; url: string }[];
};

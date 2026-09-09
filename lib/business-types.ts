export type BusinessSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  date: string;
  accessedAt: string;
  type: string;
  note: string;
};

export type BusinessMetric = {
  label: string;
  value: string;
  period: string;
  scope: string;
  kind: string;
  meaning: string;
  limitation: string;
  refs: string[];
};

export type BusinessProfileData = {
  id: string;
  name: string;
  summary: string;
  payer: string;
  revenueModel: string;
  commercialization: { title: string; text: string; refs: string[] }[];
  metrics: BusinessMetric[];
  segments: {
    name: string;
    job: string;
    payTrigger: string;
    returnReason: string;
    evidence: string;
    refs: string[];
  }[];
  funnel: string[];
  economics: string[];
  implications: string[];
  unknowns: string[];
  sources: BusinessSource[];
};

export type BusinessInsight = {
  title: string;
  paragraphs: string[];
  refs: { title: string; url: string }[];
};

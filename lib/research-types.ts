export type Source = { title: string; url: string; date: string; type: string; note: string };
export type Section = { title: string; status: '事实' | '历史' | '推断' | '建议' | '边界'; paragraphs: string[]; refs?: number[] };
export type ResearchImage = { file: string; title: string; url: string; date: string; kind: '公开产品页' | '登录产品页' | '官方资料页'; observation: string; limitation: string };
export type Tradeoff = { title: string; action: string; reason: string; cost: string; signal: string };
export type TaskRecord = { date: string; scope: string; steps: string[]; result: string; attempts: number; limit: string; screenshot?: string };
export type DeepDive = {
 website: string;
 question: string;
 judgment: string;
 route: { stage: string; behavior: string; friction: string }[];
 sections: Section[];
 ux: string[];
 tradeoffs: Tradeoff[];
 sources: Source[];
 images: ResearchImage[];
 task?: TaskRecord;
};
export type Profile = {
 id: string; name: string; group: string; focus: string; thesis: string;
 job: string; object: string; first: string; supply: string; repeat: string; business: string;
 relevance: string; notCopy: string; experiment: string; access: string;
 sections: Section[]; gaps: string[]; sources: Source[];
 deep?: DeepDive;
};
export const groups = ['创作与资源', '工具与作者生态', '学习与共建', '开发与应用', '技术讨论'];

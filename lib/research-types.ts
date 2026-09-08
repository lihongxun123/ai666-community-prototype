export type Source = { title: string; url: string; date: string; type: string; note: string };
export type Section = { title: string; status: '事实' | '历史' | '推断' | '建议' | '边界'; paragraphs: string[]; refs?: number[] };
export type Profile = {
 id: string; name: string; group: string; focus: string; thesis: string;
 job: string; object: string; first: string; supply: string; repeat: string; business: string;
 relevance: string; notCopy: string; experiment: string; access: string;
 sections: Section[]; gaps: string[]; sources: Source[];
};
export const groups = ['创作与资源', '工具与作者生态', '学习与共建', '开发与应用', '技术讨论'];

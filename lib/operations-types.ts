export type OperationsSource = {
 id: string; title: string; url: string; publisher: string; date: string; accessedAt: string;
 access: 'full-page' | 'search-index' | 'prior-research';
 type: 'official-rule' | 'official-page' | 'implementation-doc' | 'author-content' | 'user-report' | 'historical-report';
 supports: string; limitation: string;
};
export type OperationsProfile = {
 id: string; name: string; homepage: string; archetype: string; thesis: string; audience: string;
 content: { form: string; unit: string; purpose: string; example: string; sourceIds: string[] }[];
 mechanisms: { stage: 'supply' | 'discovery' | 'activation' | 'participation' | 'return' | 'governance' | 'monetization'; title: string; fact: string; analysis: string; limitation: string; sourceIds: string[] }[];
 journey: { steps: string[]; limitation: string };
 roles: { official: string; creators: string; members: string; limitation: string };
 takeaway: { learn: string; prerequisites: string; avoid: string };
 evidenceScope: string; gaps: string[]; sources: OperationsSource[];
};
export type OperationsResearch = {
 accessedAt: string; profiles: OperationsProfile[];
 synthesis: { title: string; text: string; profileIds: string[]; sourceIds: string[] }[];
 stats: { profiles: number; contentForms: number; mechanisms: number; sources: number; distinctUrls: number; fullPageSources: number; priorResearchSources: number; indexOnlySources: number };
};

import type { OperationsSource } from './operations-types';

export type StudySource = OperationsSource;
export type Referenced = { sourceIds: string[] };
export type Adoption = { suitable: string; conditions: string; avoid: string };
export type PlatformIdentity = { id: string; name: string; homepage: string };
export type OperatingStudy = PlatformIdentity & {
 position: string; audience: string;
 system: (Referenced & { stage: 'supply' | 'discovery' | 'activation' | 'participation' | 'return' | 'governance' | 'monetization'; title: string; confirmed: string; division: string; rhythm: string; reason: string; breakpoint: string })[];
 case: Referenced & { title: string; observed: string; sequence: string[]; operatorWork: string; participantValue: string; unproven: string };
 incentives: Referenced & { supply: string; participation: string; payment: string; distortion: string };
 burden: Referenced & { recurringWork: string; hiddenCost: string; dependency: string };
 takeaway: Adoption; gaps: string[];
};
export type ContentStudy = PlatformIdentity & {
 position: string;
 forms: (Referenced & { name: string; unit: string; fields: string[]; example: string; depth: string; nextAction: string; limits: string })[];
 sample: { title: string; scope: string; parts: (Referenced & { element: string; observed: string; role: string })[]; missing: string[]; notProven: string };
 reuse: Referenced & { available: string; requires: string; notPortable: string };
 quality: Referenced & { useful: string; weak: string };
 takeaway: Adoption; gaps: string[];
};
export type StudyDocument<P> = {
 title: string; lead: string; scope: string; accessedAt: string;
 guide: (Referenced & { title: string; text: string })[];
 profiles: P[]; sources: StudySource[];
 stats: { profiles: number; sources: number; distinctUrls: number; fullPageSources: number; priorResearchSources: number; indexOnlySources: number; detailItems: number; examples: number };
};

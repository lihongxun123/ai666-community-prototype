export type EvidenceSource = {
  id: string; title: string; url: string; publisher: string;
  publishedAt: string | null; accessedAt: string;
  accessLevel: 'full-page' | 'search-index'; supports: string; limitation: string;
};
export type EvidenceClaim = {
  id: string; dimension: 'commercial' | 'scale' | 'usage'; statement: string;
  change: 'new' | 'corroborated' | 'correction';
  evidenceClass: 'official-rule' | 'official-disclosure' | 'third-party-estimate' | 'user-report' | 'case-study' | 'public-counter' | 'author-description' | 'implementation-doc';
  period: string; scope: string; limitation: string; sourceIds: string[];
};
export type EvidenceProfile = {
  id: string; name: string; summary: string; claims: EvidenceClaim[];
  analysis: { text: string; sourceIds: string[] }[];
  gaps: { question: string; whyMissing: string; nextEvidence: string }[];
  sources: EvidenceSource[];
};
export type EvidenceUpdate = {
  accessedAt: string; profiles: EvidenceProfile[];
  stats: { profiles: number; claims: number; sources: number; uniqueUrls: number; newlyReferencedUrls: number; fullPageSources: number; indexOnlySources: number; corrections: number; userReports: number };
  findings: { title: string; text: string; sourceIds: string[] }[];
  userRecords: {
    accessedAt: string; method: string;
    records: { id: string; competitors: string[]; sourceIds: string[]; period: string; task: string; paymentSelfReport: string; actionSelfReport: string; problemSelfReport: string; response: string; outcome: string; limitation: string }[];
  };
  methods: {
    title: string; items: { title: string; fact: string; implication: string; sourceIds: string[] }[];
    collectionOptions: { question: string; evidence: string; limit: string; status: string }[];
    sources: EvidenceSource[];
  };
};

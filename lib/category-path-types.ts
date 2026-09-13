export type PageSource={id:string;title:string;url:string;scope:string;accessedAt:string};
export type PageImage={id?:string;file:string;title:string;url:string;what:string;limitations:string};
export type CategoryPathProfile={
 id:string;name:string;date:string;group:string;
 access:{terminal:string;login:string;scope:string};
 coverage:{completed:string[];gaps:string[];sampling:string};
 navigation:{level:number;label:string;parent:string|null;kind:string;changes:string;evidence:string[]}[];
 surfaces:{type:string;entry:string;cardFields:string[];detailFields:string[];actions:string[];connections:string;evidence:string[]}[];
 paths:{task:string;steps:{action:string;observed:string;status:string;evidence:string[]}[];limit:string}[];
 findings:{title?:string;fact:string;interpretation:string;tradeoff:string;alternative:string;effectUnknown:string;evidence:string[]}[];
 sources:PageSource[];screenshots:PageImage[];
};

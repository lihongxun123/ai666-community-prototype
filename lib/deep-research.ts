import type { DeepDive } from './research-types';
import { deepChina } from './deep-china';
import { deepGlobal } from './deep-global';
import { deepDeveloper } from './deep-developer';
import { deepLearning } from './deep-learning';
import { applyFieldEvidence } from './field-evidence';

export const deepResearch:Record<string,DeepDive>={...deepChina,...deepGlobal,...deepDeveloper,...deepLearning};
applyFieldEvidence(deepResearch);

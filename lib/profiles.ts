import type { Profile } from './research-types';
import { chinaProfiles } from './profiles-china';
import { globalProfiles } from './profiles-global';
import { developerProfiles } from './profiles-developer';
import { learningProfiles } from './profiles-learning';
const order = ['liblib','runninghub','tusi','tensor','civitai','seaart','openart','nightcafe','jimeng','kling','midjourney','leonardo','runway','waytoagi','datawhale','huggingface','modelscope','aistudio','linuxdo','dify','coze'];
export const profiles: Profile[] = [...chinaProfiles,...globalProfiles,...developerProfiles,...learningProfiles].sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));

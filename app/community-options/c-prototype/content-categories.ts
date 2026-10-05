// Both device views use the same categories; mobile only shortens the design label.
export const contentCategories=['全部','电商营销','设计与视觉','IP与文创','摄影','写作','游戏','科普','历史','生活'];
export const normalizeContentCategory=(name:string)=>name==='设计'?'设计与视觉':name;
export const mobileContentCategories=contentCategories.map(name=>name==='设计与视觉'?'设计':name);
export const sampleWorkCategories:Record<string,string>={girl:'IP与文创',anime:'IP与文创',sea:'摄影',letter:'写作',writing:'写作',cat:'游戏',interior:'生活',perfume:'电商营销',underwater:'设计与视觉',portrait:'摄影',restore:'摄影',cup:'电商营销',dog:'生活',headphones:'IP与文创',tram:'生活',leaves:'电商营销'};

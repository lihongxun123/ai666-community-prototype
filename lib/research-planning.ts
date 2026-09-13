export function isPlanningSection(section:{title:string;status:string}) {
 return section.status==='建议'||/多元拾光|采用建议|借鉴|我们的/.test(section.title);
}

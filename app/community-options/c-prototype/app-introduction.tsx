'use client';
export const appSummaries:Record<string,string>={
 copy:'把已有文字改得更清楚，适合发布和分享。',
 background:'为产品图片更换背景，尝试不同的展示场景。',
 video:'用产品素材制作一段展示短片。',
 'repair-color':'调整照片的色彩，让肤色和画面更自然。',
 restore:'改善旧照片中的划痕、模糊和褪色。'
};
export function AppIntroduction({input,output,provider}:{input:string;output:string;provider:string}){
 return <div className="app-introduction">
  <div className="app-introduction-grid">
   <section><h3>准备什么</h3><p>{input||'查看应用说明中的材料要求。'}</p></section>
   <section><h3>得到什么</h3><p>{output||'查看应用说明中的结果形式。'}</p></section>
  </div>
  {provider&&<p className="app-introduction-provider">由 {provider} 提供</p>}
 </div>;
}

import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('../dist/standalone/', import.meta.url));
const base = 'http://127.0.0.1:3187';
const child = spawn(process.execPath, ['server.js'], {
  cwd: root, env: {...process.env, HOST: '127.0.0.1', PORT: '3187'}, stdio: 'inherit',
});
let failure;
child.on('error', error => { failure = error; });
child.on('exit', code => { failure ??= new Error(`Server exited: ${code}`); });
try {
  let ready = false;
  for (let i = 0; i < 40; i++) {
    if (failure) throw failure;
    try { ready = (await fetch(base, {signal: AbortSignal.timeout(2000)})).ok; } catch { /* Starting. */ }
    if (ready) break;
    await delay(500);
  }
  if (!ready) throw new Error('Standalone did not become ready');
  const routes = ['/', '/community-options/prototype-review', '/community-options/home-prototype',
    '/community-options/mobile-home', '/community-options/b-prototype',
    '/research-deliveries/2026-09-11/assets/research-images/datawhale.png',
    '/research-deliveries/2026-09-11-public/attachments/audience-datawhale.md'];
  for (const route of routes) {
    const response = await fetch(base + route, {signal: AbortSignal.timeout(15000)});
    const body = await response.arrayBuffer();
    if (!response.ok || !body.byteLength) throw new Error(`Smoke failed: ${route} (${response.status})`);
    if (route.endsWith('.png') && !response.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`Expected image at ${route}`);
    }
  }
  console.log(JSON.stringify({standaloneSmoke: 'passed', routes: routes.length}));
} finally {
  child.kill();
}

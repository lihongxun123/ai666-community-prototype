import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

// Local collaboration preview without Sites registration or Cloudflare bindings.
const root = fileURLToPath(new URL('..', import.meta.url));
const child = spawn(process.execPath, ['node_modules/vinext/dist/cli.js', 'dev', ...process.argv.slice(2)], {
  cwd: root,
  env: {...process.env, RESEARCH_DEPLOY_TARGET: 'node'},
  stdio: 'inherit',
});
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });

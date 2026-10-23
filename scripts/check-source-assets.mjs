import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

// Check source inputs before a build; never download or modify assets.
const root = fileURLToPath(new URL('..', import.meta.url));
const aliases = JSON.parse(fs.readFileSync(path.join(root, 'lib/report-image-aliases.json'), 'utf8'));
const extras = JSON.parse(fs.readFileSync(path.join(root, 'lib/lossless-assets.json'), 'utf8'));
const prototype = JSON.parse(fs.readFileSync(path.join(root, 'scripts/prototype-assets.json'), 'utf8'));
const required = new Set(prototype.map(asset => 'public/' + asset.path));
for (const [from, to] of Object.entries(aliases)) {
  required.add('public' + from);
  required.add('public' + to);
}
for (const asset of [...extras.attachments, ...extras.conversions]) {
  required.add('public/' + asset.from);
  required.add('public/' + asset.to);
}
const missing = [...required].filter(file => !fs.existsSync(path.join(root, file)));
const differentAttachments = extras.attachments.filter(asset => {
  const from = path.join(root, 'public', asset.from), to = path.join(root, 'public', asset.to);
  return fs.existsSync(from) && fs.existsSync(to) && !fs.readFileSync(from).equals(fs.readFileSync(to));
}).map(asset => asset.from);
let untracked = [];
if (process.argv.includes('--tracked')) {
  const tracked = new Set(execFileSync('git', ['ls-files', '-z'], {cwd: root, encoding: 'utf8'}).split('\0'));
  untracked = [...required].filter(file => !tracked.has(file));
}
console.log(JSON.stringify({required: required.size, missing: missing.length, untracked: untracked.length,
  differentAttachments: differentAttachments.length, missingExamples: missing.slice(0, 12),
  untrackedExamples: untracked.slice(0, 12), differentAttachmentExamples: differentAttachments.slice(0, 12)}, null, 2));
if (missing.length || untracked.length || differentAttachments.length) process.exitCode = 1;

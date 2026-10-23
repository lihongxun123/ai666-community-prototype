#!/usr/bin/env python3
"""Offline integration tests for deploy-release.sh, in a disposable Linux container.

Run on the GitHub Ubuntu runner (pin the image in the workflow):
  docker run --rm --network none -e RESEARCH_DEPLOY_FIXTURE=1 \
    -v "$PWD/deploy:/tests:ro" python:3.12-slim \
    python /tests/test-deploy-release.py

Uses real Bash, tar extraction, SHA256 checking and env-file changes. Docker,
curl, sleep and flock are mocks: this does NOT verify kernel locking, Docker,
real service health, networking, or production deployment.
"""

import hashlib
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
import uuid


ROOT = Path('/opt/research-room')
RELEASE = 'gh-123-1'
SHA = 'a' * 40
PREVIOUS = ROOT / 'releases' / 'previous-fixture'
TARGET = ROOT / 'releases' / RELEASE
ENV_TEXT = f'# fixture only\nOTHER=keep-this-value\nRESEARCH_RELEASE={PREVIOUS}\nTAIL=also-preserved\n'

# Each mock rejects unknown operations. No executable in this mock path contacts
# a network or Docker daemon; docker's state is only a JSON file in /tmp.
MOCK = r'''#!/usr/local/bin/python3
import json, os, pathlib, re, sys
name = pathlib.Path(sys.argv[0]).name
args = sys.argv[1:]
workspace = pathlib.Path(os.environ['FIXTURE_WORKSPACE'])
config = json.loads((workspace / 'config.json').read_text())
with (workspace / 'calls.jsonl').open('a') as log:
    log.write(json.dumps([name, *args]) + '\n')
root = pathlib.Path('/opt/research-room')
def active():
    return re.search(r'^RESEARCH_RELEASE=(.+)$', (root / '.env').read_text(), re.M)[1]
if name == 'flock':
    if args != ['-w', '30', '9']: raise SystemExit('Unexpected flock operation')
elif name == 'sleep':
    if args != ['3']: raise SystemExit('Unexpected sleep operation')
elif name == 'docker':
    if args == ['compose', '--project-directory', str(root), '-f', str(root / 'compose.yaml'),
                'up', '-d', '--no-deps', '--pull', 'never', 'research']:
        (workspace / 'active.json').write_text(json.dumps(active()))
    elif len(args) == 4 and args[:2] == ['inspect', '--format'] and args[3] == 'research-room':
        mounted = json.loads((workspace / 'active.json').read_text())
        is_new = mounted.endswith('/gh-123-1')
        if args[2] == '{{.State.Health.Status}}':
            print('unhealthy' if config['mode'] == 'health_fail' and is_new else 'healthy')
        elif args[2] == '{{range .Mounts}}{{if eq .Destination "/app"}}{{.Source}}{{end}}{{end}}':
            print('/unexpected-fixture-mount' if config['mode'] == 'mount_fail' and is_new else mounted)
        else: raise SystemExit('Unexpected inspect format')
    else: raise SystemExit('Unexpected docker operation')
elif name == 'curl':
    urls = [arg for arg in args if arg.startswith(('https://', 'http://'))]
    if len(urls) != 1: raise SystemExit('Unexpected curl arguments')
    url = urls[0]
    if url == 'https://api.github.com/repos/lihongxun123/ai666-community-prototype/commits/main':
        print(json.dumps({'sha': 'b' * 40 if config['mode'] == 'stale_main' else 'a' * 40}))
    elif url == 'https://research.yuandaokeji.com/community-options/prototype-review':
        if config['mode'] == 'public_fail': raise SystemExit(22)
    elif url == 'http://127.0.0.1:3100/community-options/prototype-review':
        if config['mode'] == 'local_fail' and active().endswith('/gh-123-1'): raise SystemExit(22)
    else: raise SystemExit('Unexpected curl destination')
else: raise SystemExit('Unexpected mock executable')
'''


class DeployReleaseTests(unittest.TestCase):
    def setUp(self):
        # Never reuse or remove a pre-existing directory, even inside a container.
        self.assertFalse(ROOT.exists() or ROOT.is_symlink(), 'Fixture root already exists; refusing to alter it')
        self.owner = uuid.uuid4().hex
        ROOT.mkdir()
        (ROOT / '.fixture-owner').write_text(self.owner)
        self.addCleanup(self.clean_root)
        (ROOT / 'incoming').mkdir()
        PREVIOUS.mkdir(parents=True)
        (PREVIOUS / 'server.js').write_text('// retained fixture\n')
        (ROOT / 'compose.yaml').write_text('services: {}\n')
        (ROOT / '.env').write_text(ENV_TEXT)
        (ROOT / '.env').chmod(0o640)
        self.workspace = Path(self.enterContext(tempfile.TemporaryDirectory(prefix='research-deploy-test-')))
        mockbin = self.workspace / 'bin'
        mockbin.mkdir()
        for name in ('docker', 'curl', 'sleep', 'flock'):
            mock = mockbin / name
            mock.write_text(MOCK)
            mock.chmod(0o755)
        (self.workspace / 'active.json').write_text(json.dumps(str(PREVIOUS)))
        self.child_env = {
            'PATH': f'{mockbin}:/usr/local/bin:/usr/bin:/bin',
            'HOME': str(self.workspace),
            'LANG': 'C.UTF-8',
            'FIXTURE_WORKSPACE': str(self.workspace),
        }

    def clean_root(self):
        if ROOT.is_symlink() or ROOT.resolve() != Path('/opt/research-room'):
            raise RuntimeError('Unsafe fixture cleanup path')
        if (ROOT / '.fixture-owner').read_text() != self.owner:
            raise RuntimeError('Fixture ownership changed; refusing cleanup')
        shutil.rmtree(ROOT)

    def archive(self, unsafe=None, metadata_sha=SHA):
        archive = ROOT / 'incoming' / f'{RELEASE}.tar.gz'
        with tarfile.open(archive, 'w:gz') as bundle:
            files = {'RELEASE.json': json.dumps({'sourceSha': metadata_sha, 'release': RELEASE}),
                     'server.js': '// new fixture\n'}
            if unsafe == 'traversal':
                files['../escaped-fixture'] = 'must not extract'
            for name, data in files.items():
                content = data.encode()
                info = tarfile.TarInfo(name)
                info.size = len(content)
                bundle.addfile(info, io.BytesIO(content))
            if unsafe == 'link':
                link = tarfile.TarInfo('escaping-link')
                link.type = tarfile.SYMTYPE
                link.linkname = '../../outside-fixture'
                bundle.addfile(link)
        return hashlib.sha256(archive.read_bytes()).hexdigest()

    def run_deploy(self, mode='success', *, bad_digest=False, unsafe=None, metadata_sha=SHA):
        digest = self.archive(unsafe, metadata_sha)
        if bad_digest:
            digest = '0' * 64
        (self.workspace / 'config.json').write_text(json.dumps({'mode': mode}))
        script = Path(__file__).with_name('deploy-release.sh')
        # Normalize CRLF in a temporary copy when the source mount comes from a
        # Windows checkout; /tests remains read-only.
        script_copy = self.workspace / 'deploy-release.sh'
        script_copy.write_text(script.read_text())
        result = subprocess.run(['bash', str(script_copy), RELEASE, digest, SHA],
                                env=self.child_env, text=True, capture_output=True, timeout=20)
        calls_file = self.workspace / 'calls.jsonl'
        self.calls = [json.loads(line) for line in calls_file.read_text().splitlines()] if calls_file.exists() else []
        self.assertTrue(PREVIOUS.is_dir(), 'Previous version was removed')
        self.assertEqual((PREVIOUS / 'server.js').read_text(), '// retained fixture\n')
        env = (ROOT / '.env').read_text()
        self.assertEqual(env.replace(f'RESEARCH_RELEASE={TARGET}', f'RESEARCH_RELEASE={PREVIOUS}'), ENV_TEXT)
        self.assertEqual((ROOT / '.env').stat().st_mode & 0o777, 0o640)
        for call in self.calls:
            if call[0] == 'docker':
                self.assertNotIn('down', call)
                self.assertNotIn('prune', call)
                if call[1] == 'compose':
                    self.assertEqual(call[-1], 'research')
                else:
                    self.assertEqual(call[-1], 'research-room')
        self.assertFalse((ROOT / 'releases' / 'escaped-fixture').exists())
        return result

    def compose_calls(self):
        return [call for call in self.calls if call[:2] == ['docker', 'compose']]

    def assert_original(self):
        self.assertEqual((ROOT / '.env').read_text(), ENV_TEXT)
        self.assertEqual(json.loads((self.workspace / 'active.json').read_text()), str(PREVIOUS))

    def test_success_preserves_other_env_fields_and_previous_release(self):
        result = self.run_deploy()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual((ROOT / '.env').read_text(), ENV_TEXT.replace(str(PREVIOUS), str(TARGET)))
        self.assertEqual(len(self.compose_calls()), 1)
        self.assertEqual(json.loads((self.workspace / 'active.json').read_text()), str(TARGET))
        self.assertEqual((ROOT / f'.env.previous-{RELEASE}').read_text(), ENV_TEXT)

    def test_container_health_failure_rolls_back(self):
        self.check_rollback('health_fail')

    def test_mount_mismatch_rolls_back(self):
        self.check_rollback('mount_fail')

    def test_local_health_failure_rolls_back(self):
        self.check_rollback('local_fail')

    def test_public_health_failure_rolls_back(self):
        self.check_rollback('public_fail')

    def check_rollback(self, mode):
        result = self.run_deploy(mode)
        self.assertNotEqual(result.returncode, 0)
        self.assert_original()
        self.assertEqual(len(self.compose_calls()), 2)
        self.assertTrue(TARGET.is_dir(), 'Failed release should remain available for diagnosis')
        self.assertIn('Previous version restored.', result.stdout)

    def test_wrong_sha256_rejected_before_extraction(self):
        result = self.run_deploy(bad_digest=True)
        self.assertNotEqual(result.returncode, 0)
        self.assert_original()
        self.assertFalse(TARGET.exists())
        self.assertFalse(self.compose_calls())

    def test_stale_main_does_not_switch_active_release(self):
        result = self.run_deploy('stale_main')
        self.assertNotEqual(result.returncode, 0)
        self.assert_original()
        self.assertFalse(self.compose_calls())
        self.assertFalse((ROOT / f'.env.previous-{RELEASE}').exists())

    def test_metadata_sha_mismatch_rejected(self):
        result = self.run_deploy(metadata_sha='c' * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assert_original()
        self.assertFalse(TARGET.exists())
        self.assertFalse(self.compose_calls())

    def test_unsafe_tar_traversal_rejected(self):
        self.check_unsafe_tar('traversal')

    def test_unsafe_tar_link_rejected(self):
        self.check_unsafe_tar('link')

    def check_unsafe_tar(self, unsafe):
        result = self.run_deploy(unsafe=unsafe)
        self.assertNotEqual(result.returncode, 0)
        self.assert_original()
        self.assertFalse(TARGET.exists())
        self.assertFalse(self.compose_calls())
        self.assertIn('Unsafe archive', result.stderr)


if __name__ == '__main__':
    if os.environ.get('RESEARCH_DEPLOY_FIXTURE') != '1' or not Path('/.dockerenv').is_file() or sys.platform != 'linux':
        raise SystemExit('Refusing to run: requires an isolated Linux Docker container and RESEARCH_DEPLOY_FIXTURE=1')
    if not Path('/opt').is_dir() or Path('/opt').is_symlink() or os.geteuid() != 0:
        raise SystemExit('Refusing to run: requires the disposable image root user and a real /opt directory')
    unittest.main(verbosity=2)

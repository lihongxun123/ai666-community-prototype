#!/usr/bin/env bash
# Called only by the owner-approved GitHub environment job. No server setup here.
set -Eeuo pipefail
umask 022
release=${1:?release id required}
digest=${2:?SHA256 required}
source_sha=${3:?source commit required}
[[ "$release" =~ ^gh-[0-9]+-[0-9]+$ ]] || exit 2
[[ "$digest" =~ ^[a-f0-9]{64}$ && "$source_sha" =~ ^[a-f0-9]{40}$ ]] || exit 2
root=/opt/research-room
archive="$root/incoming/$release.tar.gz"
target="$root/releases/$release"
env_file="$root/.env"
backup="$root/.env.previous-$release"
[[ -d "$root" && ! -L "$root" && -d "$root/releases" && ! -L "$root/releases" && -d "$root/incoming" && ! -L "$root/incoming" ]] || exit 2
[[ -f "$root/compose.yaml" && -f "$env_file" && ! -L "$env_file" && -f "$archive" && ! -L "$archive" ]] || exit 2
for tool in docker flock curl python3 sha256sum; do command -v "$tool" >/dev/null; done
exec 9>"$root/.deploy.lock"
flock -w 30 9
[[ ! -e "$target" && ! -e "$backup" ]] || { echo 'Release already exists; re-run all jobs to build a new release.'; exit 2; }
printf '%s  %s\n' "$digest" "$archive" | sha256sum -c - >/dev/null

previous=$(python3 - "$env_file" "$root" <<'PY'
import pathlib, re, sys
env, root = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]).resolve()
matches = re.findall(r'^RESEARCH_RELEASE=(.+)$', env.read_text(), re.M)
if len(matches) != 1:
    raise SystemExit('Expected one existing RESEARCH_RELEASE')
previous = pathlib.Path(matches[0].strip().strip('"\''))
if previous.is_symlink() or previous.resolve().parent != root / 'releases' or not previous.is_dir():
    raise SystemExit('Previous release is not an existing version directory')
print(previous)
PY
)

# Validate before extraction: reject absolute paths, traversal, special files and escaping links.
python3 - "$archive" "$target" "$source_sha" "$release" <<'PY'
import json, pathlib, posixpath, sys, tarfile
archive, target, sha, release = sys.argv[1:]
with tarfile.open(archive, 'r:gz') as bundle:
    members = bundle.getmembers()
    for m in members:
        m.mode &= 0o777
        name = posixpath.normpath(m.name)
        if name.startswith('/') or name == '..' or name.startswith('../') or not (m.isfile() or m.isdir() or m.issym() or m.islnk()):
            raise SystemExit('Unsafe archive member')
        if m.issym() or m.islnk():
            link = posixpath.normpath(posixpath.join(posixpath.dirname(name) if m.issym() else '', m.linkname))
            if m.linkname.startswith('/') or link == '..' or link.startswith('../'):
                raise SystemExit('Unsafe archive link')
    links = {posixpath.normpath(m.name) for m in members if m.issym() or m.islnk()}
    for m in members:
        if any(str(parent) in links for parent in pathlib.PurePosixPath(posixpath.normpath(m.name)).parents):
            raise SystemExit('Archive member has a link parent')
    records = [m for m in members if posixpath.normpath(m.name) == 'RELEASE.json' and m.isfile()]
    if len(records) != 1:
        raise SystemExit('Missing release metadata')
    metadata = json.load(bundle.extractfile(records[0]))
    if metadata != {'sourceSha': sha, 'release': release}:
        raise SystemExit('Release metadata differs from approved run')
    pathlib.Path(target).mkdir(mode=0o755)
    bundle.extractall(target, members=members)
if not (pathlib.Path(target) / 'server.js').is_file():
    raise SystemExit('Missing standalone server')
PY
chmod -R a+rX "$target"

# Recheck while holding the server lock, immediately before changing the active version.
current=$(curl --fail --silent --show-error --connect-timeout 10 --max-time 25 \
  https://api.github.com/repos/lihongxun123/ai666-community-prototype/commits/main \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["sha"])')
[[ "$current" == "$source_sha" ]] || { echo 'main changed; active release left unchanged.'; exit 1; }
cp -p "$env_file" "$backup"
switched=0
healthy() {
  local expected=$1
  for ((i=0; i<40; i++)); do
    if [[ $(docker inspect --format '{{.State.Health.Status}}' research-room 2>/dev/null) == healthy ]] &&
       [[ $(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/app"}}{{.Source}}{{end}}{{end}}' research-room 2>/dev/null) == "$expected" ]] &&
       curl --fail --silent --max-time 5 http://127.0.0.1:3100/community-options/prototype-review -o /dev/null; then return 0; fi
    sleep 3
  done
  return 1
}
rollback() {
  local result=$?
  trap - EXIT HUP INT TERM
  set +e
  if ((switched)); then
    echo 'Deployment interrupted or unhealthy; restoring previous version.'
    if cp -p "$backup" "$env_file" && docker compose --project-directory "$root" -f "$root/compose.yaml" up -d --no-deps --pull never research && healthy "$previous"; then
      echo 'Previous version restored.'
    else
      echo 'ROLLBACK FAILED: operator intervention required.' >&2
    fi
  fi
  exit "$result"
}
trap rollback EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM
switched=1
python3 - "$env_file" "$target" <<'PY'
import os, pathlib, re, stat, sys
env, target = pathlib.Path(sys.argv[1]), sys.argv[2]
text, count = re.subn(r'^RESEARCH_RELEASE=.*$', 'RESEARCH_RELEASE=' + target, env.read_text(), flags=re.M)
if count != 1:
    raise SystemExit('Release variable changed concurrently')
temp = env.with_name('.env.next')
with temp.open('x') as f:
    os.fchmod(f.fileno(), stat.S_IMODE(env.stat().st_mode))
    f.write(text)
os.replace(temp, env)
PY
docker compose --project-directory "$root" -f "$root/compose.yaml" up -d --no-deps --pull never research
healthy "$target"
curl --fail --silent --show-error --retry 2 --max-time 20 https://research.yuandaokeji.com/community-options/prototype-review -o /dev/null
switched=0
echo "Release $release is healthy; previous version retained."

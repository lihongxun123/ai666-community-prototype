#!/usr/bin/env bash
# Read-only remote checks. Temporary key files exist only on the runner.
set -euo pipefail
: "${SSH_HOST:?Missing SSH host}"
: "${SSH_PORT:?Missing SSH port}"
: "${SSH_USER:?Missing SSH user}"
: "${SSH_KEY:?Missing private key}"
: "${KNOWN_HOSTS:?Missing verified host key}"
[[ "$SSH_HOST" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]*$ ]]
[[ "$SSH_USER" =~ ^[a-zA-Z_][a-zA-Z0-9_-]*$ ]]
[[ "$SSH_PORT" =~ ^[0-9]{1,5}$ ]]
((10#$SSH_PORT > 0 && 10#$SSH_PORT <= 65535))
key_dir=$(mktemp -d)
trap 'rm -rf "$key_dir"' EXIT
chmod 700 "$key_dir"
printf '%s\n' "$SSH_KEY" > "$key_dir/key"
printf '%s\n' "$KNOWN_HOSTS" > "$key_dir/known_hosts"
chmod 600 "$key_dir/key" "$key_dir/known_hosts"
unset SSH_KEY KNOWN_HOSTS
ssh_args=(-i "$key_dir/key" -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$key_dir/known_hosts" -o ConnectTimeout=15 -o ServerAliveInterval=15 -o ServerAliveCountMax=3)
ssh "${ssh_args[@]}" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" 'bash -se' <<'REMOTE'
set -euo pipefail
root=/opt/research-room
echo 'SSH authentication and verified host identity: passed'
for dir in "$root" "$root/incoming" "$root/releases"; do
  test -d "$dir"
  test ! -L "$dir"
  test -r "$dir"
  test -w "$dir"
  test -x "$dir"
done
for file in "$root/.env" "$root/compose.yaml"; do
  test -f "$file"
  test ! -L "$file"
  test -r "$file"
done
for tool in docker bash python3 curl flock sha256sum; do command -v "$tool" >/dev/null; done
before=$(sha256sum "$root/.env" "$root/compose.yaml")
container_before=$(docker inspect --format '{{.Id}} {{.State.StartedAt}} {{range .Mounts}}{{if eq .Destination "/app"}}{{.Source}}{{end}}{{end}}' research-room)
echo 'Directory permission bits and required commands: passed (no write performed)'
docker compose version --short >/dev/null
python3 - <<'PY'
import pathlib, re
root = pathlib.Path('/opt/research-room')
matches = re.findall(r'^RESEARCH_RELEASE=(.+)$', (root / '.env').read_text(), re.M)
assert len(matches) == 1, 'Expected one active release'
release = pathlib.Path(matches[0].strip().strip('"\''))
assert not release.is_symlink() and release.resolve().parent == root / 'releases' and release.is_dir(), 'Invalid active release directory'
assert (release / 'server.js').is_file(), 'Missing current standalone server'
print('Existing release configuration: passed')
PY
test "$(docker inspect --format '{{.State.Health.Status}}' research-room)" = healthy
curl --fail --silent --show-error --max-time 15 http://127.0.0.1:3100/community-options/prototype-review -o /dev/null
curl --fail --silent --show-error --max-time 20 https://research.yuandaokeji.com/community-options/prototype-review -o /dev/null
curl --fail --silent --show-error --max-time 20 https://api.github.com/repos/lihongxun123/ai666-community-prototype/commits/main | python3 -c 'import json,sys; assert len(json.load(sys.stdin)["sha"]) == 40'
test "$before" = "$(sha256sum "$root/.env" "$root/compose.yaml")"
test "$container_before" = "$(docker inspect --format '{{.Id}} {{.State.StartedAt}} {{range .Mounts}}{{if eq .Destination "/app"}}{{.Source}}{{end}}{{end}}' research-room)"
echo 'Docker read access, health and network: passed'
echo 'Active configuration, container identity, mount and start time unchanged'
REMOTE
# Batch-mode SFTP checks the subsystem only. No upload/download or remote writes.
printf 'pwd\nbye\n' | sftp "${ssh_args[@]}" -P "$SSH_PORT" -b - "$SSH_USER@$SSH_HOST" >/dev/null
echo 'SFTP subsystem: passed'
if [[ -n "${GITHUB_STEP_SUMMARY:-}" ]]; then
  printf '%s\n' 'SSH, SFTP, directory permission bits, Docker read access and network checks passed.' 'No release uploaded, no configuration switched, no service restarted.' 'Write permission bits were inspected; actual writes, deployment and rollback were not exercised.' >> "$GITHUB_STEP_SUMMARY"
fi

#!/bin/sh
set -eu
site=/opt/1panel/www/sites/research.yuandaokeji.com
cert="$site/letsencrypt/live/research.yuandaokeji.com/fullchain.pem"
before=$(sha256sum "$cert")
docker run --rm --name research-cert-renew \
  -v "$site/letsencrypt:/etc/letsencrypt" \
  -v "$site/acme:/var/www/acme" \
  certbot/certbot:v5.8.0 renew --quiet
after=$(sha256sum "$cert")
if [ "$before" != "$after" ]; then
  docker exec 1Panel-openresty-dbvy nginx -t
  docker exec 1Panel-openresty-dbvy nginx -s reload
fi

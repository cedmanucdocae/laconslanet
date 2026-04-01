#!/bin/sh
set -eu

: "${API_BASE_URL:=}"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.RUNTIME_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

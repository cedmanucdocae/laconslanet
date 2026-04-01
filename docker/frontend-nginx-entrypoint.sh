#!/bin/sh
set -eu

: "${API_BASE_URL:=http://localhost:5500}"

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.RUNTIME_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

#!/bin/sh
set -eu

: "${API_BASE_URL:=http://localhost:5000}"
: "${FRONTEND_PORT:=5500}"
: "${FRONTEND_ENTRY:=Login/index.html}"

cat > /app/frontend/runtime-config.js <<EOF
window.RUNTIME_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

exec live-server /app/frontend \
  --host=0.0.0.0 \
  --port="${FRONTEND_PORT}" \
  --no-browser \
  --wait=200 \
  --entry-file="${FRONTEND_ENTRY}"

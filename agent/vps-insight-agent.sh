#!/usr/bin/env bash
set -euo pipefail

INSTALL_DIR="/opt/vps-insight"
CONFIG_FILE="/opt/vps-insight/config.env"

# -----------------------------
# Load config
# -----------------------------
if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ Missing config: $CONFIG_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$CONFIG_FILE"

INGEST_URL="${WORKER_URL%/}/ingest"

# -----------------------------
# Timestamp
# -----------------------------
TS=$(date +%s)

# -----------------------------
# Collect metrics
# -----------------------------
CPU_JSON="$("$INSTALL_DIR/lib/collect_cpu.sh")"
MEM_JSON="$("$INSTALL_DIR/lib/collect_mem.sh")"
DISK_JSON="$("$INSTALL_DIR/lib/collect_disk.sh")"
LOAD_JSON="$("$INSTALL_DIR/lib/collect_load.sh")"
UPTIME_SEC=$(awk '{print int($1)}' /proc/uptime)

# -----------------------------
# Build dynamic payload
# -----------------------------
PAYLOAD=$(cat <<JSON
{
  "ts": $TS,
  "uptime": $UPTIME_SEC,
  $CPU_JSON,
  $MEM_JSON,
  $DISK_JSON,
  $LOAD_JSON
}
JSON
)



# -----------------------------
# Send to Worker
# -----------------------------
curl -fsS -X POST "$INGEST_URL" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  >/dev/null

#!/usr/bin/env bash
set -e

CONFIG_FILE="/opt/vps-insight/config.env"

if [[ $EUID -ne 0 ]]; then
  echo "❌ Please run as root (sudo)"
  exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "❌ Config file not found: $CONFIG_FILE"
  exit 1
fi

# -----------------------------
# Load config
# -----------------------------
set -a
source "$CONFIG_FILE"
set +a

if [[ -z "$WORKER_URL" || -z "$API_TOKEN" || -z "$VPS_ID" ]]; then
  echo "❌ Missing required config values in config.env"
  exit 1
fi

# -----------------------------
# Detect static system info
# -----------------------------
CPU_CORES=$(nproc)

RAM_MB=$(free -m | awk '/^Mem:/ {print $2}')
DISK_GB=$(df -BG / | awk 'NR==2 {gsub("G","",$2); print $2}')
SWAP_MB=$(free -m | awk '/^Swap:/ {print $2}')

OS_NAME=$(grep PRETTY_NAME /etc/os-release | cut -d= -f2 | tr -d '"')

# Provider detection is optional / best-effort
PROVIDER=""

# -----------------------------
# Build meta payload
# -----------------------------
META_PAYLOAD=$(cat <<JSON
{
  "vps_id": "$VPS_ID",
  "display_name": "VPS Monitor",
  "host": "$VPS_ID",

  "cpu_cores": $CPU_CORES,
  "ram_total_mb": $RAM_MB,
  "disk_total_gb": $DISK_GB,
  "swap_total_mb": $SWAP_MB,

  "os": "$OS_NAME",
  "provider": "$PROVIDER"
}
JSON
)

# -----------------------------
# Send to Worker
# -----------------------------
echo "📡 Sending static server metadata..."

curl -fsS -X POST "$WORKER_URL/ingest" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$META_PAYLOAD" || {
    echo "❌ Failed to send meta payload"
    exit 1
  }

echo "✅ Static metadata stored successfully"

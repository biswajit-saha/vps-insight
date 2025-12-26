#!/usr/bin/env bash
set -e

echo "======================================="
echo " VPS Insight — Agent Installer"
echo "======================================="
echo

if [[ $EUID -ne 0 ]]; then
  echo "❌ Please run as root (sudo)"
  exit 1
fi

INSTALL_DIR="/opt/vps-insight"
SERVICE_NAME="vps-insight"

# -----------------------------
# Ask for required inputs
# -----------------------------
read -rp "Cloudflare Worker base URL (e.g. https://monitor.example.workers.dev): " WORKER_URL
read -rp "API Token: " API_TOKEN
read -rp "Server ID / Name (e.g. gbj-prod-1): " VPS_ID

if [[ -z "$WORKER_URL" || -z "$API_TOKEN" || -z "$VPS_ID" ]]; then
  echo "❌ All fields are required"
  exit 1
fi

echo
echo "Installing to $INSTALL_DIR"
echo

# -----------------------------
# Create directories
# -----------------------------
mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/lib"

# -----------------------------
# Copy agent files
# -----------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

cp "$SCRIPT_DIR/vps-insight-agent.sh" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/update-meta.sh" "$INSTALL_DIR/"
cp -r "$SCRIPT_DIR/lib/"* "$INSTALL_DIR/lib/"

cp "$SCRIPT_DIR/systemd/vps-insight.service" /etc/systemd/system/
cp "$SCRIPT_DIR/systemd/vps-insight.timer" /etc/systemd/system/

chmod +x "$INSTALL_DIR/vps-insight-agent.sh"
chmod +x "$INSTALL_DIR/update-meta.sh"
chmod +x "$INSTALL_DIR/lib/"*.sh

# -----------------------------
# Write config.env
# -----------------------------
cat > "$INSTALL_DIR/config.env" <<EOF
WORKER_URL=$WORKER_URL
API_TOKEN=$API_TOKEN
VPS_ID=$VPS_ID
EOF

chmod 600 "$INSTALL_DIR/config.env"

# -----------------------------
# Send static metadata (single source of truth)
# -----------------------------
"$INSTALL_DIR/update-meta.sh"

# -----------------------------
# Enable & start timer
# -----------------------------
systemctl daemon-reexec
systemctl daemon-reload
systemctl enable --now vps-insight.timer

echo
echo "✅ VPS Insight agent installed successfully"
echo "📊 Metrics will be sent every 10 seconds"
echo "ℹ️  To update server metadata later, run:"
echo "   sudo /opt/vps-insight/update-meta.sh"
echo

#!/usr/bin/env bash
set -e

echo "======================================="
echo " VPS Insight — Agent Update"
echo "======================================="
echo

if [[ $EUID -ne 0 ]]; then
  echo "❌ Please run as root (sudo)"
  exit 1
fi

INSTALL_DIR="/opt/vps-insight"
SERVICE_NAME="vps-insight"

if [[ ! -d "$INSTALL_DIR" ]]; then
  echo "❌ VPS Insight is not installed at $INSTALL_DIR"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🔄 Updating agent files..."

# Stop timer to avoid race during update
systemctl stop ${SERVICE_NAME}.timer || true

# Update main agent
cp "$SCRIPT_DIR/vps-insight-agent.sh" "$INSTALL_DIR/"
chmod +x "$INSTALL_DIR/vps-insight-agent.sh"

# Update lib scripts
cp -r "$SCRIPT_DIR/lib/"* "$INSTALL_DIR/lib/"
chmod +x "$INSTALL_DIR/lib/"*.sh

# Update systemd units if changed
cp "$SCRIPT_DIR/systemd/${SERVICE_NAME}.service" /etc/systemd/system/
cp "$SCRIPT_DIR/systemd/${SERVICE_NAME}.timer" /etc/systemd/system/

systemctl daemon-reexec
systemctl daemon-reload

# Restart timer
systemctl enable --now ${SERVICE_NAME}.timer

echo
echo "✅ VPS Insight agent updated successfully"
echo "📊 Metrics will continue sending every 10 seconds"
echo

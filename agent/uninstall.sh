#!/usr/bin/env bash
set -e

# ================================
# VPS Insight — Uninstall Script
# ================================

if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root (use sudo)"
  exit 1
fi

echo ""
echo "🧹 Uninstalling VPS Insight"
echo ""

# --------------------------------------
# Stop and disable timer
# --------------------------------------
systemctl stop vps-insight.timer 2>/dev/null || true
systemctl disable vps-insight.timer 2>/dev/null || true

# --------------------------------------
# Remove systemd units
# --------------------------------------
rm -f /etc/systemd/system/vps-insight.service
rm -f /etc/systemd/system/vps-insight.timer

systemctl daemon-reexec
systemctl daemon-reload

# --------------------------------------
# Remove agent and config
# --------------------------------------
rm -f /usr/local/bin/vps-insight
rm -rf /etc/vps-insight

# --------------------------------------
# Done
# --------------------------------------
echo ""
echo "✅ VPS Insight has been completely removed"
echo ""

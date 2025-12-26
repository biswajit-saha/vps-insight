#!/usr/bin/env bash
set -e

# Root filesystem only (simple + honest)
read total used avail _ < <(df -k / | awk 'NR==2 {print $2, $3, $4}')

cat <<EOF
"disk": {
  "total_kb": $total,
  "used_kb": $used,
  "available_kb": $avail
}
EOF

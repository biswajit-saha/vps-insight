#!/usr/bin/env bash
set -e

# CPU idle and iowait from /proc/stat (cheap + universal)

read -r _ user nice system idle iowait _ < /proc/stat

cat <<EOF
"cpu": {
  "idle": $idle,
  "iowait": $iowait
}
EOF

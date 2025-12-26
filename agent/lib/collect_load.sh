#!/usr/bin/env bash
set -e

read l1 l5 l15 _ < /proc/loadavg

cat <<EOF
"load": {
  "l1": $l1,
  "l5": $l5,
  "l15": $l15
}
EOF

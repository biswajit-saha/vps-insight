#!/usr/bin/env bash
set -e

MEM_TOTAL=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
MEM_AVAILABLE=$(awk '/MemAvailable/ {print $2}' /proc/meminfo)
MEM_CACHED=$(awk '/Cached/ {print $2}' /proc/meminfo)
MEM_BUFFERS=$(awk '/Buffers/ {print $2}' /proc/meminfo)

cat <<EOF
"memory": {
  "total_kb": $MEM_TOTAL,
  "available_kb": $MEM_AVAILABLE,
  "cached_kb": $MEM_CACHED,
  "buffers_kb": $MEM_BUFFERS
}
EOF

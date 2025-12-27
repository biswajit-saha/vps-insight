// ---------------------------------------------
// VPS Insight — UI Logic
// ---------------------------------------------

import { fetchMeta, fetchLatest } from "./api.js";
import { renderCharts } from "./chart.js";

// ---------------------------------------------
// Helpers
// ---------------------------------------------

const $ = (id) => document.getElementById(id);

function pct(v) {
  return `${Math.round(v)}%`;
}

function gb(v) {
  return `${v.toFixed(1)} GB`;
}

function timeAgo(sec) {
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

// ---------------------------------------------
// Theme (persistent)
// ---------------------------------------------

const THEME_KEY = "vps-insight-theme";

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  document.documentElement.dataset.theme =
    saved === "dark" || saved === "light" ? saved : "light";
}

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = next;
  localStorage.setItem(THEME_KEY, next);

  if (window.refreshChartsTheme) {
    window.refreshChartsTheme();
  }
}

// ---------------------------------------------
// Render META (static)
// ---------------------------------------------

async function renderMeta() {
  const meta = await fetchMeta();

  $("display-name").textContent = meta.display_name || "VPS Monitor";
  $("host-name").textContent = meta.host || meta.vps_id || "—";

  $("cap-cpu").textContent = `${meta.cpu_cores} cores`;
  $("cap-ram").textContent = gb(meta.ram_total_mb / 1024);
  $("cap-disk").textContent = `${meta.disk_total_gb} GB`;

  // Swap (hidden if 0)
  const swapRow = $("cap-swap-row");
  if (meta.swap_total_mb && meta.swap_total_mb > 0) {
    $("cap-swap").textContent = gb(meta.swap_total_mb / 1024);
    swapRow.hidden = false;
  } else {
    swapRow.hidden = true;
  }
}

// ---------------------------------------------
// Render LATEST metrics
// ---------------------------------------------

async function renderLatest() {
  const data = await fetchLatest();
  const now = Math.floor(Date.now() / 1000);

  $("status-text").textContent =
    `Online · updated ${timeAgo(now - data.ts)}`;

  /* ---------------- CPU ---------------- */
  // We cannot compute % used reliably from single snapshot idle jiffies,
  // so show load-based approximation instead
  const cpuUsed = Math.min(100, Math.round(data.load.l1 * 100));

  $("cpu-value").textContent = pct(cpuUsed);
  $("cpu-sub").textContent =
    `Load ${data.load.l1.toFixed(2)} · IOwait ${data.cpu.iowait}`;
  $("cpu-ring").style.setProperty("--value", cpuUsed);

  /* ---------------- Memory ---------------- */
  const memUsedKb =
    data.memory.total_kb - data.memory.available_kb;

  const memUsedPct =
    Math.round((memUsedKb / data.memory.total_kb) * 100);

  $("mem-value").textContent = pct(memUsedPct);
  $("mem-sub").textContent =
    `Cached ${(data.memory.cached_kb / 1024 / 1024).toFixed(1)}G · Buffers ${(data.memory.buffers_kb / 1024 / 1024).toFixed(1)}G`;
  $("mem-ring").style.setProperty("--value", memUsedPct);

  /* ---------------- Disk ---------------- */
  const diskUsedPct =
    Math.round((data.disk.used_kb / data.disk.total_kb) * 100);

  const diskFreeGb =
    data.disk.available_kb / 1024 / 1024;

  $("disk-value").textContent = pct(diskUsedPct);
  $("disk-sub").textContent = `Free ${diskFreeGb.toFixed(1)} GB`;
  $("disk-ring").style.setProperty("--value", diskUsedPct);

  /* ---------------- Load ---------------- */
  $("load-value").textContent = data.load.l1.toFixed(2);
  $("load-sub").textContent =
    `5m ${data.load.l5.toFixed(2)} · 15m ${data.load.l15.toFixed(2)}`;

  /* ---------------- Aggregation age ---------------- */
  $("agg-age").textContent = `~${timeAgo(now - data.ts)}`;
}

// ---------------------------------------------
// Filters (charts)
// ---------------------------------------------

function initFilters() {
  const filters = document.querySelectorAll(".filter");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderCharts(btn.dataset.range);
    });
  });
}

// ---------------------------------------------
// Init
// ---------------------------------------------

async function initUI() {
  initTheme();

  const toggle = $("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", toggleTheme);
  }

  await renderMeta();
  await renderLatest();

  initFilters();
  await renderCharts("1h");

  // Live updates
  setInterval(renderLatest, 10_000);     // real-time
  setInterval(renderCharts, 60_000);     // cached history
}

initUI();

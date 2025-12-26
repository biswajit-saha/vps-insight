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

  // CPU
  $("cpu-value").textContent = pct(data.cpu.used);
  $("cpu-sub").textContent =
    `Idle ${data.cpu.idle}% · IOwait ${data.cpu.iowait}%`;
  $("cpu-ring").style.setProperty("--value", data.cpu.used);

  // Memory
  $("mem-value").textContent = pct(data.memory.used_pct);
  $("mem-sub").textContent =
    `Cached ${data.memory.cached_gb}G · Buffers ${data.memory.buffers_gb}G`;
  $("mem-ring").style.setProperty("--value", data.memory.used_pct);

  // Disk
  $("disk-value").textContent = pct(data.disk.used_pct);
  $("disk-sub").textContent =
    `Free ${gb(
      ((100 - data.disk.used_pct) / 100) * data.disk.total_gb
    )}`;
  $("disk-ring").style.setProperty("--value", data.disk.used_pct);

  // Load
  $("load-value").textContent = data.load["1m"].toFixed(2);
  $("load-sub").textContent =
    `5m ${data.load["5m"]} · 15m ${data.load["15m"]}`;

  // Aggregation age
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

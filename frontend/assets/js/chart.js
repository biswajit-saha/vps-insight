// ---------------------------------------------
// VPS Insight — Charts
// ---------------------------------------------

import { fetchMetrics } from "./api.js";

let charts = {};
let currentRange = "1h";

// ---------------------------------------------
// Helpers
// ---------------------------------------------

function getTheme() {
  return document.documentElement.dataset.theme || "light";
}

function chartColor() {
  return getTheme() === "dark"
    ? "rgba(255,255,255,0.8)"
    : "rgba(0,0,0,0.7)";
}

function gridColor() {
  return getTheme() === "dark"
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.08)";
}

function destroyCharts() {
  Object.values(charts).forEach(c => c.destroy());
  charts = {};
}

// ---------------------------------------------
// Build charts
// ---------------------------------------------

function buildChart(id, label, labels, data) {
  const ctx = document.getElementById(id);
  if (!ctx) return;

  charts[id] = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { color: gridColor() },
          ticks: { color: chartColor() }
        },
        y: {
          grid: { color: gridColor() },
          ticks: { color: chartColor() }
        }
      }
    }
  });
}

// ---------------------------------------------
// Render charts
// ---------------------------------------------

export async function renderCharts(range = currentRange) {
  currentRange = range;

  const data = await fetchMetrics(range);
  destroyCharts();

  const labels = data.map(p =>
    new Date(p.ts * 1000).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  );

  buildChart(
    "chart-cpu",
    "CPU %",
    labels,
    data.map(p => p.cpu.used)
  );

  buildChart(
    "chart-mem",
    "Memory %",
    labels,
    data.map(p => p.memory.used_pct)
  );

  buildChart(
    "chart-load",
    "Load (1m)",
    labels,
    data.map(p => p.load["1m"])
  );

  buildChart(
    "chart-disk",
    "Disk %",
    labels,
    data.map(p => p.disk.used_pct)
  );
}

// ---------------------------------------------
// Theme hook (called from ui.js)
// ---------------------------------------------

window.refreshChartsTheme = () => {
  renderCharts(currentRange);
};

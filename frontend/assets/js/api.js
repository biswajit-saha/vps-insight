// ---------------------------------------------
// VPS Insight — API Client
// ---------------------------------------------

const CONFIG = window.__CONFIG__ || {};

const API_BASE = CONFIG.API_BASE?.replace(/\/$/, "");

if (!API_BASE) {
  console.error("❌ API_BASE missing. Check Pages environment variables.");
}

// Generic fetch helper
async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error(`API ${path} failed (${res.status})`);
  }

  return res.json();
}

// ---------------------------------------------
// Endpoints
// ---------------------------------------------

export function fetchMeta() {
  return apiFetch("/meta");
}

export function fetchLatest() {
  return apiFetch("/latest");
}

export function fetchMetrics(range) {
  return apiFetch(`/metrics?range=${range}`);
}

export function fetchHealth() {
  return apiFetch("/health");
}

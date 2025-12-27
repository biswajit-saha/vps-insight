// ---------------------------------------------
// VPS Insight — API Client (config-driven)
// ---------------------------------------------

let API_BASE = null;

// Load config.json once
async function loadConfig() {
  if (API_BASE) return API_BASE;

  const res = await fetch("/config.json", {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("❌ Failed to load /config.json");
  }

  const cfg = await res.json();

  if (!cfg.apiBase) {
    throw new Error("❌ apiBase missing in config.json");
  }

  API_BASE = cfg.apiBase.replace(/\/$/, "");
  return API_BASE;
}

// Generic fetch helper
async function apiFetch(path) {
  const base = await loadConfig();

  const res = await fetch(`${base}${path}`, {
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

// Static metadata
export async function fetchMeta() {
  return apiFetch("/meta");
}

// Latest metrics (no cache)
export async function fetchLatest() {
  return apiFetch("/latest");
}

// Time-range metrics
// range: 1h | 6h | 1d | 1w | 1m
export async function fetchMetrics(range) {
  return apiFetch(`/metrics?range=${range}`);
}

// Optional health check
export async function fetchHealth() {
  return apiFetch("/health");
}

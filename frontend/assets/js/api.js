// ---------------------------------------------
// VPS Insight — API Client
// ---------------------------------------------

// Read API base from <meta name="api-base">
const API_BASE = document
  .querySelector('meta[name="api-base"]')
  ?.getAttribute('content')
  ?.replace(/\/$/, '');

if (!API_BASE) {
  console.error("❌ Missing <meta name='api-base'> in HTML");
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

// Health check (optional)
export async function fetchHealth() {
  return apiFetch("/health");
}

import { noCache } from "./cache";

export async function handleIngest(request, env, options = {}) {
  const body = await request.json();

  // Static metadata
  if (options.metaOnly) {
    await env.VPS_KV.put("meta", JSON.stringify(body));
    return noCache({ ok: true });
  }

  // Dynamic metrics
  if (!body.ts) {
    return new Response("Missing timestamp", { status: 400 });
  }

  const ts = body.ts;

  // Store latest snapshot (no cache)
  await env.VPS_KV.put("latest", JSON.stringify(body));

  // Append to time-series buckets
  await appendMetric(env, "1h", ts, body, 3600);
  await appendMetric(env, "6h", ts, body, 21600);
  await appendMetric(env, "1d", ts, body, 86400);
  await appendMetric(env, "1w", ts, body, 604800);
  await appendMetric(env, "1m", ts, body, 2592000);

  return noCache({ ok: true });
}

async function appendMetric(env, range, ts, payload, maxAge) {
  const key = `metrics:${range}`;
  const existing = await env.VPS_KV.get(key, "json") || [];

  const filtered = existing.filter(p => ts - p.ts <= maxAge);
  filtered.push(payload);

  await env.VPS_KV.put(key, JSON.stringify(filtered));
}

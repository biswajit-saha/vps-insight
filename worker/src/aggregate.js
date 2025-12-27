// ---------------------------------------------
// VPS Insight — Metrics aggregation
// ---------------------------------------------

const RANGES = {
  "1h":  { window: 3600,   step: 10,    max: 360 }, // 10s
  "6h":  { window: 21600,  step: 60,    max: 360 }, // 1m
  "1d":  { window: 86400,  step: 300,   max: 288 }, // 5m
  "1w":  { window: 604800, step: 3600,  max: 168 }, // 1h
  "1m":  { window: 2592000, step: 21600, max: 120 } // 6h
};

export async function aggregate(env, sample) {
  const ts = sample.ts;

  await Promise.all(
    Object.entries(RANGES).map(([range, cfg]) =>
      aggregateRange(env, range, cfg, sample, ts)
    )
  );
}

// ---------------------------------------------
// Per-range aggregation
// ---------------------------------------------

async function aggregateRange(env, range, cfg, sample, ts) {
  const key = `metrics:${range}`;
  const bucketTs = Math.floor(ts / cfg.step) * cfg.step;

  const raw = await env.VPS_KV.get(key, "json");
  const data = Array.isArray(raw) ? raw : [];

  let bucket = data.find(d => d.ts === bucketTs);

  if (!bucket) {
    bucket = createBucket(bucketTs, sample);
    data.push(bucket);
  } else {
    mergeBucket(bucket, sample);
  }

  // Trim old buckets
  const cutoff = ts - cfg.window;
  const trimmed = data
    .filter(d => d.ts >= cutoff)
    .sort((a, b) => a.ts - b.ts)
    .slice(-cfg.max);

  await env.VPS_KV.put(key, JSON.stringify(trimmed));
}

// ---------------------------------------------
// Bucket helpers
// ---------------------------------------------

function createBucket(ts, s) {
  return {
    ts,
    count: 1,

    cpu: s.cpu.used,
    mem: s.memory.used_pct,
    disk: s.disk.used_pct,
    load: s.load["1m"]
  };
}

function mergeBucket(b, s) {
  b.count++;

  b.cpu  = avg(b.cpu,  s.cpu.used, b.count);
  b.mem  = avg(b.mem,  s.memory.used_pct, b.count);
  b.disk = avg(b.disk, s.disk.used_pct, b.count);
  b.load = avg(b.load, s.load["1m"], b.count);
}

function avg(prev, next, n) {
  return prev + (next - prev) / n;
}

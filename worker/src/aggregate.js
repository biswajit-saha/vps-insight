const BUCKETS = {
  "1h":  { interval: 60,    max: 60 },
  "6h":  { interval: 300,   max: 72 },
  "1d":  { interval: 600,   max: 144 },
  "1w":  { interval: 3600,  max: 168 },
  "1m":  { interval: 21600, max: 120 }
};

export async function aggregate(env, sample) {
  const ts = sample.ts;

  for (const [range, cfg] of Object.entries(BUCKETS)) {
    const key = `metrics:${range}`;

    const bucketTs = Math.floor(ts / cfg.interval) * cfg.interval;

    const raw = await env.KV.get(key, "json") || [];
    const last = raw[raw.length - 1];

    const point = {
      ts: bucketTs,
      cpu: sample.cpu.used,
      mem: sample.memory.used_pct,
      load: sample.load["1m"],
      disk: sample.disk.used_pct,
      swap: sample.memory.swap_used_pct
    };

    if (last && last.ts === bucketTs) {
      raw[raw.length - 1] = point;
    } else {
      raw.push(point);
    }

    if (raw.length > cfg.max) {
      raw.splice(0, raw.length - cfg.max);
    }

    await env.KV.put(key, JSON.stringify(raw));
  }
}

export function withCache(data, seconds) {
  return new Response(data || "{}", {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${seconds}`
    }
  });
}

export function noCache(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

import { withCache } from "./cache";

export async function handleRead(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === "/api/meta") {
    return withCache(
      await env.VPS_KV.get("meta"),
      86400
    );
  }

  if (path === "/api/latest") {
    return noStore(
      await env.VPS_KV.get("latest")
    );
  }

  if (path === "/api/metrics") {
    const range = url.searchParams.get("range") || "1h";
    const key = `metrics:${range}`;

    const ttl = range === "1h" ? 0 : 60;
    const data = await env.VPS_KV.get(key);

    return ttl === 0
      ? noStore(data)
      : withCache(data, ttl);
  }

  return new Response("Not found", { status: 404 });
}

function noStore(data) {
  return new Response(data || "[]", {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

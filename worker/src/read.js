export async function handleRead(request, env) {
  const url = new URL(request.url);

  let data;

  if (url.pathname === "/meta") {
    data = await env.VPS_INSIGHT_DATA.get("meta", { type: "json" });
  } else if (url.pathname === "/latest") {
    data = await env.VPS_INSIGHT_DATA.get("latest", { type: "json" });
  } else if (url.pathname === "/metrics") {
    const range = url.searchParams.get("range") || "1h";
    data = await env.VPS_INSIGHT_DATA.get(`metrics:${range}`, { type: "json" });
  } else if (url.pathname === "/health") {
    data = { ok: true, ts: Date.now() };
  } else {
    return new Response("Not found", { status: 404 });
  }

  return new Response(JSON.stringify(data ?? {}), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

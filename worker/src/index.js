import { handleIngest } from "./ingest";
import { handleRead } from "./read";
import { authorize } from "./auth";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;

    // ----------------------------------
    // Health check (no auth)
    // ----------------------------------
    if (pathname === "/health") {
      const last = await env.KV.get("latest", { type: "json" });
      return json({
        ok: true,
        last_ingest: last?.ts ?? null
      });
    }

    // ----------------------------------
    // Auth for everything else
    // ----------------------------------
    const authError = authorize(request, env);
    if (authError) return authError;

    // ----------------------------------
    // Routing
    // ----------------------------------
    if (pathname === "/ingest" && request.method === "POST") {
      return handleIngest(request, env, ctx);
    }

    if (pathname === "/meta") {
      return handleRead.meta(env);
    }

    if (pathname === "/latest") {
      return handleRead.latest(env);
    }

    if (pathname === "/metrics") {
      return handleRead.metrics(url, env);
    }

    return new Response("Not Found", { status: 404 });
  }
};

// ----------------------------------
// Helpers
// ----------------------------------
function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

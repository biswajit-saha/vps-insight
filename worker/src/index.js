import { handleIngest } from "./ingest";
import { handleRead } from "./read";
import { corsHeaders, withCors } from "./cors";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- CORS preflight ---
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders()
      });
    }

    try {
      // --- Routing ---
      if (url.pathname === "/ingest" && request.method === "POST") {
        const res = await handleIngest(request, env);
        return withCors(res);
      }

      if (request.method === "GET") {
        const res = await handleRead(request, env);
        return withCors(res);
      }

      return withCors(
        new Response("Not found", { status: 404 })
      );
    } catch (err) {
      // Ensure CORS headers even on errors
      return withCors(
        new Response(JSON.stringify({ error: err.message }), { status: 500 })
      );
    }
  }
};

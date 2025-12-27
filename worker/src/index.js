import { handleIngest } from "./ingest";
import { handleRead } from "./read";
import { corsHeaders } from "./cors";

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

    // --- Routing ---
    if (url.pathname === "/ingest" && request.method === "POST") {
      return handleIngest(request, env);
    }

    if (request.method === "GET") {
      return handleRead(request, env);
    }

    return new Response("Not found", {
      status: 404,
      headers: corsHeaders()
    });
  }
};

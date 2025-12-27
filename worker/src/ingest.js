import { corsHeaders } from "./cors";
import { aggregate } from "./aggregate";

export async function handleIngest(request, env) {
  try {
    // -----------------------------
    // Auth
    // -----------------------------
    const auth = request.headers.get("Authorization");

    if (!auth || auth !== `Bearer ${env.API_TOKEN}`) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders()
          }
        }
      );
    }

    // -----------------------------
    // Parse payload
    // -----------------------------
    const payload = await request.json();

    if (!payload || typeof payload !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders()
          }
        }
      );
    }

    // -----------------------------
    // Detect payload type
    // -----------------------------
    let key = "latest";
    const isMeta = "cpu_cores" in payload;

    if (isMeta) {
      key = "meta";
    }

    // -----------------------------
    // Attach server timestamp
    // -----------------------------
    // metrics already have ts from agent — trust it
    if (!payload.ts) {
      payload.ts = Math.floor(Date.now() / 1000);
    }

    // -----------------------------
    // Store in KV
    // -----------------------------
    await env.VPS_KV.put(key, JSON.stringify(payload));

    // -----------------------------
    // Aggregate metrics ONLY
    // -----------------------------
    if (!isMeta) {
      await aggregate(env, payload);
    }

    // -----------------------------
    // Success
    // -----------------------------
    return new Response(
      JSON.stringify({
        ok: true,
        stored_as: key,
        aggregated: !isMeta
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Ingest failed",
        message: err.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders()
        }
      }
    );
  }
}

import { corsHeaders } from "./cors";

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

    // Heuristic: static meta always has cpu_cores
    if ("cpu_cores" in payload) {
      key = "meta";
    }

    // Optional: attach server-side timestamp
    payload._ts = Date.now();

    // -----------------------------
    // Store in KV
    // -----------------------------
    await env.VPS_KV.put(key, JSON.stringify(payload));

    // -----------------------------
    // Success
    // -----------------------------
    return new Response(
      JSON.stringify({ ok: true, stored_as: key }),
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

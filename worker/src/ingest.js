import { corsHeaders } from "./cors";

export async function handleIngest(request, env) {
  const auth = request.headers.get("Authorization");

  if (!auth || auth !== `Bearer ${env.API_TOKEN}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json();

  await env.VPS_KV.put("latest", JSON.stringify(payload));

  return new Response("OK", { status: 200 });
}

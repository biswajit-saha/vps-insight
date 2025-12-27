import { corsHeaders } from "./cors";

export async function handleIngest(request, env) {
  const auth = request.headers.get("Authorization");

  if (!auth || auth !== `Bearer ${env.API_TOKEN}`) {
    return new Response("Unauthorized", {
      status: 401,
      headers: corsHeaders()
    });
  }

  const payload = await request.json();

  await env.VPS_INSIGHT_DATA.put(
    "latest",
    JSON.stringify(payload)
  );

  return new Response("OK", {
    headers: corsHeaders()
  });
}

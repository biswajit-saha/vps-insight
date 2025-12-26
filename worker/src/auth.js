// worker/src/auth.js

export function authorize(request, env) {
  const header = request.headers.get("Authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return unauthorized("Missing Authorization header");
  }

  const token = header.slice(7).trim();

  if (!env.API_TOKEN) {
    return new Response("Server misconfigured", { status: 500 });
  }

  if (token !== env.API_TOKEN) {
    return unauthorized("Invalid API token");
  }

  return null;
}

function unauthorized(message) {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
      }
    }
  );
}

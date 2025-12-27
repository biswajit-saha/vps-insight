export function corsHeaders(origin = "*") {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

// Wrap a Response to always include CORS headers
export function withCors(response, origin = "*") {
  const headers = new Headers(response.headers);
  const cors = corsHeaders(origin);

  for (const [key, value] of Object.entries(cors)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

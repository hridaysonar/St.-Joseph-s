export async function readRequest(request) {
  let body = {};
  if (!["GET", "HEAD"].includes(request.method)) {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > 25 * 1024 * 1024)
      throw Object.assign(new Error("Request body too large"), { status: 413 });
    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        throw Object.assign(new Error("Invalid JSON body"), { status: 400 });
      }
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw Object.assign(new Error("Expected a JSON object"), {
          status: 400,
        });
    }
  }
  return {
    pathname: new URL(request.url).pathname,
    body,
    headers: Object.fromEntries(request.headers),
    query: Object.fromEntries(new URL(request.url).searchParams),
  };
}

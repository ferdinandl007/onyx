import { NextRequest } from "next/server";

export const getDomain = (request: NextRequest) => {
  // use env variable if set
  if (process.env.WEB_DOMAIN) {
    const webDomain = process.env.WEB_DOMAIN;
    // Make sure it has a protocol
    if (webDomain.startsWith("http://") || webDomain.startsWith("https://")) {
      return webDomain;
    }
    // Add https by default
    return `https://${webDomain}`;
  }

  // next, try and build domain from headers
  const requestedHost = request.headers.get("X-Forwarded-Host");
  const requestedPort = request.headers.get("X-Forwarded-Port");
  const requestedProto = request.headers.get("X-Forwarded-Proto") || "https";
  
  if (requestedHost) {
    // Safely build the URL
    try {
      // Use standard URL constructor with protocol + host
      const url = new URL(`${requestedProto}://${requestedHost}`);
      if (requestedPort && !requestedHost.includes(":")) {
        url.port = requestedPort;
      }
      return url.origin;
    } catch (e) {
      console.error("Error constructing URL from headers:", e);
      // Fall back to request URL
    }
  }

  // finally just use whatever is in the request
  return request.nextUrl.origin;
};

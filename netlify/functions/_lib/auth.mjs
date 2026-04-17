import crypto from "node:crypto";

const COOKIE_NAME = "admin_session";

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || "replace-this-secret";
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function parseCookies(request) {
  const header = request.headers.get("cookie") || "";

  return header.split(";").reduce((cookies, part) => {
    const [key, ...rest] = part.trim().split("=");

    if (!key) {
      return cookies;
    }

    cookies[key] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

export function createSessionCookie() {
  const payload = encodePayload({
    issuedAt: Date.now()
  });
  const signature = sign(payload);
  const token = `${payload}.${signature}`;

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax; Secure`;
}

export function clearSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax; Secure`;
}

export function isAuthenticated(request) {
  const cookies = parseCookies(request);
  const token = cookies[COOKIE_NAME];

  if (!token) {
    return false;
  }

  const [payload, signature] = token.split(".");

  if (!payload || !signature) {
    return false;
  }

  return sign(payload) === signature;
}

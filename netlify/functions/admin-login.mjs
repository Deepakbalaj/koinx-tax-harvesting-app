import { createSessionCookie } from "./_lib/auth.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return Response.json(
      { error: "Missing ADMIN_PASSWORD environment variable." },
      { status: 500 }
    );
  }

  try {
    const payload = await request.json();
    const password = String(payload.password || "");

    if (password !== adminPassword) {
      return Response.json({ error: "Incorrect password." }, { status: 401 });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": createSessionCookie()
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to login." },
      { status: 500 }
    );
  }
};

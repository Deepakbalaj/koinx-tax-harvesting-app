import { insertMessage } from "./_lib/supabase.mjs";

export default async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  try {
    const payload = await request.json();
    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim();
    const message = String(payload.message || "").trim();

    if (!name || !email || !message) {
      return Response.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    await insertMessage({
      name,
      email,
      message,
      submittedAt: new Date().toISOString()
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to save message." },
      { status: 500 }
    );
  }
};

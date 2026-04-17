import { isAuthenticated } from "./_lib/auth.mjs";
import { fetchMessages } from "./_lib/supabase.mjs";

export default async (request) => {
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405 });
  }

  if (!isAuthenticated(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const messages = await fetchMessages();
    return Response.json({ messages, storage: "Supabase" });
  } catch (error) {
    return Response.json(
      { error: error.message || "Unable to load messages." },
      { status: 500 }
    );
  }
};

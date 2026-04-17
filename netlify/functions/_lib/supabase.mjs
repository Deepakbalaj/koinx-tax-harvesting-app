function getEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function getConfig() {
  const baseUrl = getEnv("SUPABASE_URL").replace(/\/$/, "");
  const apiKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const table = process.env.SUPABASE_MESSAGES_TABLE || "messages";

  return {
    baseUrl,
    apiKey,
    table
  };
}

function getHeaders() {
  const { apiKey } = getConfig();

  return {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };
}

export async function insertMessage({ name, email, message, submittedAt }) {
  const { baseUrl, table } = getConfig();
  const response = await fetch(`${baseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      ...getHeaders(),
      Prefer: "return=representation"
    },
    body: JSON.stringify([
      {
        name,
        email,
        message,
        submitted_at: submittedAt
      }
    ])
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase insert failed: ${text}`);
  }

  return response.json();
}

export async function fetchMessages() {
  const { baseUrl, table } = getConfig();
  const response = await fetch(
    `${baseUrl}/rest/v1/${table}?select=id,name,email,message,submitted_at&order=id.desc`,
    {
      headers: getHeaders()
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase fetch failed: ${text}`);
  }

  const rows = await response.json();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    submittedAt: row.submitted_at
  }));
}

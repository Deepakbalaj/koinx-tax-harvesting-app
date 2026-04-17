const http = require("http");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const PORT = process.env.PORT || 3002;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "deepak";
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const FALLBACK_DATA_DIR = path.join(os.tmpdir(), "deepak-portfolio-data");
const sessions = new Map();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf"
};

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function openDatabase(filePath) {
  const database = new DatabaseSync(filePath);
  database.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      submitted_at TEXT NOT NULL
    )
  `);
  return database;
}

let activeDbPath = path.join(DATA_DIR, "portfolio.sqlite");
let db;

try {
  db = openDatabase(activeDbPath);
} catch {
  fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
  activeDbPath = path.join(FALLBACK_DATA_DIR, "portfolio.sqlite");
  db = openDatabase(activeDbPath);
}

const insertMessage = db.prepare(`
  INSERT INTO messages (name, email, message, submitted_at)
  VALUES (?, ?, ?, ?)
`);

const selectMessages = db.prepare(`
  SELECT
    id,
    name,
    email,
    message,
    submitted_at AS submittedAt
  FROM messages
  ORDER BY id DESC
`);

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function parseCookies(request) {
  const raw = request.headers.cookie || "";
  return raw.split(";").reduce((cookies, entry) => {
    const [key, ...rest] = entry.trim().split("=");

    if (!key) {
      return cookies;
    }

    cookies[key] = decodeURIComponent(rest.join("="));
    return cookies;
  }, {});
}

function isAuthenticated(request) {
  const cookies = parseCookies(request);
  return Boolean(cookies.admin_session && sessions.has(cookies.admin_session));
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function serveStatic(urlPath, response) {
  const requestPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(ROOT, requestPath));

  if (!filePath.startsWith(ROOT)) {
    sendJson(response, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      sendJson(response, 404, { error: "Not found" });
      return;
    }

    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream"
    });
    response.end(data);
  });
}

function handleContact(request, response) {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;

    if (body.length > 1e6) {
      request.destroy();
    }
  });

  request.on("end", () => {
    try {
      const payload = JSON.parse(body || "{}");
      const name = String(payload.name || "").trim();
      const email = String(payload.email || "").trim();
      const message = String(payload.message || "").trim();

      if (!name || !email || !message) {
        sendJson(response, 400, { error: "Name, email, and message are required." });
        return;
      }

      insertMessage.run(name, email, message, new Date().toISOString());
      sendJson(response, 200, { ok: true });
    } catch {
      sendJson(response, 400, { error: "Invalid request payload." });
    }
  });
}

function handleMessages(request, response) {
  if (!isAuthenticated(request)) {
    sendJson(response, 401, { error: "Unauthorized" });
    return;
  }

  const messages = selectMessages.all();
  sendJson(response, 200, { messages, storage: activeDbPath });
}

function readRequestBody(request, callback) {
  let body = "";

  request.on("data", (chunk) => {
    body += chunk;

    if (body.length > 1e6) {
      request.destroy();
    }
  });

  request.on("end", () => callback(body));
}

function handleLogin(request, response) {
  readRequestBody(request, (body) => {
    try {
      const payload = JSON.parse(body || "{}");
      const password = String(payload.password || "");

      if (password !== ADMIN_PASSWORD) {
        sendJson(response, 401, { error: "Incorrect password." });
        return;
      }

      const sessionId = crypto.randomBytes(24).toString("hex");
      sessions.set(sessionId, { createdAt: Date.now() });
      response.writeHead(200, {
        "Content-Type": "application/json; charset=utf-8",
        "Set-Cookie": `admin_session=${sessionId}; HttpOnly; Path=/; Max-Age=86400; SameSite=Lax`
      });
      response.end(JSON.stringify({ ok: true }));
    } catch {
      sendJson(response, 400, { error: "Invalid request payload." });
    }
  });
}

function handleLogout(request, response) {
  const cookies = parseCookies(request);

  if (cookies.admin_session) {
    sessions.delete(cookies.admin_session);
  }

  response.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Set-Cookie": "admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  });
  response.end(JSON.stringify({ ok: true }));
}

const server = http.createServer((request, response) => {
  if (!request.url) {
    sendJson(response, 400, { error: "Invalid request." });
    return;
  }

  if (request.method === "POST" && request.url === "/api/contact") {
    handleContact(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/admin/login") {
    handleLogin(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/admin/logout") {
    handleLogout(request, response);
    return;
  }

  if (request.method === "GET" && request.url === "/api/messages") {
    handleMessages(request, response);
    return;
  }

  if (request.method === "GET") {
    if (request.url === "/admin.html" && !isAuthenticated(request)) {
      redirect(response, "/login.html");
      return;
    }

    if (request.url === "/login.html" && isAuthenticated(request)) {
      redirect(response, "/admin.html");
      return;
    }

    serveStatic(request.url, response);
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
});

server.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
  console.log(`Message storage: ${activeDbPath}`);
});

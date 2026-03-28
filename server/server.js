const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = Number(process.env.PORT || 4000);
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "sos-notifications.json");
const ROOT_DIR = path.join(__dirname, "..");
const AUTHORITY_DIR = path.join(ROOT_DIR, "Authority Dashboard");
const APP_DIR = path.join(ROOT_DIR, "app", "web");

const DEFAULT_INCIDENTS = [
  {
    id: "SOS-9081",
    name: "Emma Lewis",
    location: "Sitabuldi Main Road",
    incidentDescription: "No movement for 34 mins",
    risk: "Critical",
    status: "Dispatch sent",
    source: "seed",
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    id: "SOS-9075",
    name: "Ryo Tanaka",
    location: "Futala Lake Corridor",
    incidentDescription: "Entered unsafe zone",
    risk: "High",
    status: "Verifying",
    source: "seed",
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
  },
  {
    id: "SOS-9069",
    name: "Priya Das",
    location: "Deekshabhoomi Gate 2",
    incidentDescription: "Panic button triggered",
    risk: "Critical",
    status: "Volunteer nearby",
    source: "seed",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: "SOS-9058",
    name: "Mohamed Ali",
    location: "Ambazari Garden Parking",
    incidentDescription: "Phone battery critical",
    risk: "Moderate",
    status: "Monitoring",
    source: "seed",
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
];

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_INCIDENTS, null, 2));
  }
}

function readIncidents() {
  ensureStore();

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INCIDENTS;
  } catch {
    return DEFAULT_INCIDENTS;
  }
}

function writeIncidents(incidents) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(incidents, null, 2));
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });
  response.end(JSON.stringify(payload));
}

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(html);
}

function sendFile(response, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
    };

    const content = fs.readFileSync(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: "File not found" });
  }
}

function inferRisk(description) {
  const text = String(description || "").toLowerCase();

  if (
    text.includes("attack") ||
    text.includes("panic") ||
    text.includes("bleeding") ||
    text.includes("accident") ||
    text.includes("weapon")
  ) {
    return "Critical";
  }

  if (
    text.includes("unsafe") ||
    text.includes("harassment") ||
    text.includes("lost") ||
    text.includes("threat") ||
    text.includes("help")
  ) {
    return "High";
  }

  return "Moderate";
}

function buildIncidentId(existing) {
  const numericIds = existing
    .map((incident) => Number(String(incident.id || "").replace("SOS-", "")))
    .filter((value) => Number.isFinite(value));
  const next = (numericIds.length ? Math.max(...numericIds) : 9100) + 1;
  return `SOS-${next}`;
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let data = "";

    request.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1_000_000) {
        reject(new Error("Payload too large"));
      }
    });

    request.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/") {
    sendHtml(
      response,
      200,
      `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>TourBuddy SOS Server</title>
          <style>
            body { font-family: Arial, sans-serif; background: #08101d; color: #fff; padding: 40px; }
            a { color: #00bfa6; }
            .card { max-width: 720px; background: #132236; border-radius: 18px; padding: 24px; }
            code { background: rgba(255,255,255,0.08); padding: 2px 6px; border-radius: 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>TourBuddy SOS Server</h1>
            <p>This server is running.</p>
            <p><a href="/authority/">Open Authority Dashboard</a></p>
            <p><a href="/api/sos">View SOS Notifications JSON</a></p>
            <p>Health endpoint: <code>/health</code></p>
          </div>
        </body>
      </html>`,
    );
    return;
  }

  if (request.method === "GET" && (requestUrl.pathname === "/authority" || requestUrl.pathname === "/authority/")) {
    sendFile(response, path.join(AUTHORITY_DIR, "index.html"));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/authority/")) {
    const relativePath = requestUrl.pathname.replace("/authority/", "");
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
    sendFile(response, path.join(AUTHORITY_DIR, safePath));
    return;
  }

  if (request.method === "GET" && (requestUrl.pathname === "/app" || requestUrl.pathname === "/app/")) {
    sendFile(response, path.join(APP_DIR, "index.html"));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/app/")) {
    const relativePath = requestUrl.pathname.replace("/app/", "");
    const safePath = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
    sendFile(response, path.join(APP_DIR, safePath));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/api/sos") {
    const incidents = readIncidents().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    sendJson(response, 200, { incidents });
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/sos") {
    try {
      const body = await collectRequestBody(request);
      const incidents = readIncidents();
      const name = String(body.name || "").trim();
      const location = String(body.location || "").trim();
      const incidentDescription = String(body.incidentDescription || body.description || "").trim();

      if (!name || !location || !incidentDescription) {
        sendJson(response, 400, {
          error: "name, location, and incidentDescription are required",
        });
        return;
      }

      const newIncident = {
        id: buildIncidentId(incidents),
        name,
        location,
        incidentDescription,
        risk: body.risk || inferRisk(incidentDescription),
        status: "New SOS",
        source: body.source || "app",
        userId: body.userId || null,
        timestamp: new Date().toISOString(),
      };

      incidents.unshift(newIncident);
      writeIncidents(incidents);
      sendJson(response, 201, { incident: newIncident });
      return;
    } catch (error) {
      sendJson(response, 400, { error: error.message || "Unable to save incident" });
      return;
    }
  }

  sendJson(response, 404, { error: "Not found" });
});

ensureStore();

server.listen(PORT, () => {
  console.log(`TourBuddy SOS server running on http://localhost:${PORT}`);
});

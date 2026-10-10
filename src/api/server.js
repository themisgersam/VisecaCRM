// Zero-dependency server: static files + JSON web service.
//   GET /api/customer?identifier=<phone|email>&channel=<ALL|Manor|Manor,Valiant>
//   GET /api/data        full dataset            POST /api/data   replace dataset (used by the editor's "Publish")
//   DELETE /api/data     reset to original mock data
// Run:  node server.js [port]
const http = require("http"), fs = require("fs"), path = require("path"), vm = require("vm");
const PORT = Number(process.argv[2] || process.env.PORT || 5183);
const DATA_FILE = path.join(__dirname, "data.json");

const ctx = {}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "data.js"), "utf8").replace(/^const /gm, "var "), ctx);
const ISSUERS = ctx.ISSUERS;

function defaults() {
  const interactions = ctx.SEED_INTERACTIONS.map((s, i) => {
    const d = new Date(); d.setDate(d.getDate() - s.daysAgo); d.setHours(s.hour, (i * 7) % 60, 0, 0);
    const { daysAgo, hour, ...rest } = s;
    return { id: "seed-" + i, ts: d.toISOString(), ...rest };
  });
  return { customers: JSON.parse(JSON.stringify(ctx.CUSTOMERS)), interactions };
}
let data = (() => { try { return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch { return defaults(); } })();
const persist = () => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ---- same matching rules as the web page ----
const digits = (s) => String(s || "").replace(/\D/g, "");
function findCustomer(id) {
  const v = String(id || "").trim();
  if (v.includes("@")) return data.customers.find((c) => (c.email || "").toLowerCase() === v.toLowerCase());
  const d = digits(v).slice(-9);
  return d.length >= 7 ? data.customers.find((c) => digits(c.phone).slice(-9) === d) : null;
}
function parseChannels(raw) {
  const parts = String(raw || "").split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.some((p) => p.toLowerCase() === "all")) return { issuers: Object.keys(ISSUERS), all: true, bad: [] };
  const issuers = [], bad = [];
  for (const p of parts) {
    const k = Object.keys(ISSUERS).find((i) => i.toLowerCase() === p.toLowerCase());
    if (!k) bad.push(p); else if (!issuers.includes(k)) issuers.push(k);
  }
  return { issuers, all: false, bad };
}

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };
const send = (res, code, body) => { res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", ...CORS }); res.end(JSON.stringify(body, null, 2)); };
const readBody = (req) => new Promise((ok, no) => { let b = ""; req.on("data", (c) => { b += c; if (b.length > 5e6) req.destroy(); }); req.on("end", () => ok(b)); req.on("error", no); });

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.method === "OPTIONS") { res.writeHead(204, CORS); return res.end(); }

  if (url.pathname === "/api/customer" && req.method === "GET") {
    const q = url.searchParams;
    const id = q.get("identifier") ?? q.get("phone") ?? q.get("email"), channel = q.get("channel") ?? q.get("brand");
    if (!id) return send(res, 400, { error: "missing_parameter", message: "Provide 'identifier' (phone number or email)." });
    const ch = parseChannels(channel);
    if (!ch.issuers.length || ch.bad.length)
      return send(res, 400, { error: "invalid_channel", message: `Unknown or missing channel '${ch.bad.join(",") || channel || ""}'. Use ALL or one or more of: ${Object.keys(ISSUERS).join(", ")} (comma separated).` });
    const cust = findCustomer(id);
    if (!cust) return send(res, 404, { error: "customer_not_found", message: `No customer found for '${id}'.` });
    const cards = cust.cards.filter((c) => ch.issuers.includes(c.issuer));
    const interactions = data.interactions.filter((i) => digits(i.phone) === digits(cust.phone) && ch.issuers.includes(i.issuer)).sort((a, b) => b.ts.localeCompare(a.ts));
    const { cards: _omit, ...profile } = cust;
    return send(res, 200, { channel: ch.all ? "ALL" : ch.issuers, customer: profile, cards, interactions });
  }
  if (url.pathname === "/api/data") {
    if (req.method === "GET") return send(res, 200, data);
    if (req.method === "DELETE") { data = defaults(); try { fs.unlinkSync(DATA_FILE); } catch {} return send(res, 200, { ok: true }); }
    if (req.method === "POST") {
      try {
        const d = JSON.parse(await readBody(req));
        if (!Array.isArray(d.customers) || !Array.isArray(d.interactions)) throw new Error("need customers[] and interactions[]");
        data = { customers: d.customers, interactions: d.interactions }; persist();
        return send(res, 200, { ok: true, customers: data.customers.length, interactions: data.interactions.length });
      } catch (e) { return send(res, 400, { error: "invalid_body", message: e.message }); }
    }
  }
  if (url.pathname.startsWith("/api/")) return send(res, 404, { error: "not_found" });

  // static files
  let p = decodeURIComponent(url.pathname); if (p === "/") p = "/index.html";
  const file = path.join(__dirname, path.normalize(p));
  if (!file.startsWith(__dirname) || path.basename(file) === "data.json" && false) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" }); res.end(buf);
  });
}).listen(PORT, () => console.log(`Card CRM on http://localhost:${PORT}  (API: /api/customer?phone=…&channel=ALL)`));

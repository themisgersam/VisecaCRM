// URL contract:  index.html?phone=<customer phone>&channel=<Manor|Valiant|Viesca|Cumulus>
const $app = document.getElementById("app");
const STORE_KEY = "cardcrm.interactions.v1";
const CHANNEL_ICONS = { Voice: "📞", Chat: "💬", Email: "✉️", WhatsApp: "🟢", SMS: "📱" };

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const digits = (s) => String(s || "").replace(/\D/g, "");
const money = (n) => "AED " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (iso) => new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
// channel = "Manor" | "Manor,Valiant" | "ALL". Returns { issuers: [...], bad: [unknown names] }.
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
// `phone` may be a phone number or an email. Phones match on the last 9 digits so
// +971 50 123 4567, 0501234567 and 971501234567 all resolve; emails match case-insensitively.
const findCustomer = (id) => {
  const v = String(id || "").trim();
  if (v.includes("@")) return DB.data.customers.find((c) => (c.email || "").toLowerCase() === v.toLowerCase());
  const d = digits(v).slice(-9);
  return d.length >= 7 ? DB.data.customers.find((c) => digits(c.phone).slice(-9) === d) : null;
};

// ---- interaction store (see store.js) ----
const allInteractions = () => [...DB.data.interactions].sort((a, b) => b.ts.localeCompare(a.ts));

// ---- rendering ----
function statusBadge(status) {
  const cls = status === "Active" ? "ok" : status === "Blocked" || status === "Expired" ? "bad" : "warn";
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}
function outcomeBadge(o) {
  const cls = o === "Resolved" ? "ok" : o === "Escalated" ? "bad" : "warn";
  return `<span class="badge ${cls}">${esc(o)}</span>`;
}

function renderCard(c) {
  const iss = ISSUERS[c.issuer];
  const credit = c.type === "Credit";
  const usedPct = c.limit ? Math.min(100, Math.round((c.balance / c.limit) * 100)) : 0;
  const stats = credit
    ? `<div><span>Outstanding</span><b>${money(c.balance)}</b></div>
       <div><span>Available credit</span><b>${money(Math.max(0, c.limit - c.balance))}</b></div>
       <div><span>Min. due</span><b>${c.due ? money(c.due) : "—"}</b></div>
       <div><span>Due date</span><b>${fmtDate(c.dueDate)}</b></div>`
    : c.type === "Prepaid"
    ? `<div><span>Balance</span><b>${money(c.balance)}</b></div><div><span>Load limit</span><b>${money(c.limit)}</b></div>`
    : `<div><span>Daily limit</span><b>${money(c.limit)}</b></div><div><span>Linked account</span><b>Current ••${esc(c.last4)}</b></div>`;
  return `
  <article class="card" style="--c:${iss.color}">
    <div class="visual">
      <div class="row"><span>${esc(c.issuer)}</span><span>${esc(c.network)}</span></div>
      <div class="num">•••• •••• •••• ${esc(c.last4)}</div>
      <div class="row"><span class="prod">${esc(c.product)}</span><span>Exp ${esc(c.expiry)}</span></div>
    </div>
    <div class="body">
      <div class="top"><span class="badge">${esc(c.type)}</span>${statusBadge(c.status)}</div>
      ${credit ? `<div class="meter" title="${usedPct}% of limit used"><i class="${usedPct >= 90 ? "high" : ""}" style="width:${usedPct}%"></i></div>` : ""}
      <div class="kv">${credit ? `<div><span>Credit limit</span><b>${money(c.limit)}</b></div><div><span>Utilisation</span><b>${usedPct}%</b></div>` : ""}${stats}
        ${c.rewards !== "—" ? `<div><span>Rewards</span><b>${esc(c.rewards)}</b></div>` : ""}</div>
    </div>
  </article>`;
}

function renderInteraction(i) {
  const iss = ISSUERS[i.issuer];
  return `
  <li>
    <div class="ico" title="${esc(i.channel)}">${CHANNEL_ICONS[i.channel] || "•"}</div>
    <div>
      <div class="head"><b>${esc(i.reason)}</b> ${outcomeBadge(i.outcome)}
        <span class="tag" style="--c:${iss.color};--c-tint:${iss.tint}">${esc(i.issuer)}</span></div>
      <div class="meta">${fmtDateTime(i.ts)} · ${esc(i.channel)} · Agent: ${esc(i.agent)}</div>
      ${i.notes ? `<p>${esc(i.notes)}</p>` : ""}
    </div>
  </li>`;
}

function renderLanding(msg) {
  document.title = "TP Banking CRM";
  $app.innerHTML = `
  <header class="top"><h1>TP Banking CRM</h1><span class="sub">Contact-centre customer view</span></header>
  <div class="landing">
    ${msg ? `<div class="panel" style="margin-bottom:20px;border-color:var(--bad)"><b>${msg}</b></div>` : ""}
    <div class="panel">
      <h2>Look up a customer</h2>
      <form method="get">
        <input name="phone" placeholder="Phone or email, e.g. +971501234567" required>
        <input name="channel" list="chs" value="ALL" required placeholder="Manor,Valiant or ALL"><datalist id="chs"><option>ALL</option>${Object.keys(ISSUERS).map((k) => `<option>${k}</option>`).join("")}</datalist>
        <button>Open</button>
      </form>
      <p style="color:var(--muted);font-size:13px;margin-bottom:0">Normally the contact-centre softphone opens this page with
      <code>?phone=…&amp;channel=Manor</code> (the <code>phone</code> value can be a phone number or an email).
      Channel can be one issuer, several comma-separated (<code>Manor,Valiant</code>) or <code>ALL</code>; only those issuers' cards and interactions are shown.</p>
    </div>
    ${msg ? "" : `<p style="text-align:center;font-size:13px"><a href="demos.html">Browse demo customers</a> · <a href="admin.html">Edit mock data</a></p>`}
  </div>`;
}

function renderCustomer(cust, ch) {
  const issuers = ch.issuers, single = issuers.length === 1;
  const label = ch.all ? "ALL issuers" : issuers.join(" + ");
  const iss = single ? ISSUERS[issuers[0]] : { color: "#1f2a44", tint: "#e9ecf3" };
  const cards = cust.cards.filter((c) => issuers.includes(c.issuer));
  const history = allInteractions().filter((i) => digits(i.phone) === digits(cust.phone) && issuers.includes(i.issuer));
  const initials = cust.name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  document.title = `${cust.name} · ${label} · TP Banking CRM`;
  document.documentElement.style.setProperty("--accent", iss.color);
  document.documentElement.style.setProperty("--tint", iss.tint);

  $app.innerHTML = `
  <header class="top">
    <h1>TP Banking CRM</h1><span class="chip">Contacted via ${esc(label)}</span>
    <span class="sub">Showing ${ch.all ? "data for all issuers" : esc(label) + " data only"}</span>
  </header>
  <main>
    <aside class="panel profile">
      <div class="avatar">${esc(initials)}</div>
      <div class="name">${esc(cust.name)}</div>
      <div class="id">${esc(cust.id)} · ${esc(cust.segment)} customer</div>
      <dl>
        <dt>Phone</dt><dd>${esc(cust.phone)}</dd>
        <dt>Email</dt><dd>${esc(cust.email)}</dd>
        <dt>Date of birth</dt><dd>${fmtDate(cust.dob)}</dd>
        <dt>City</dt><dd>${esc(cust.city)}</dd>
        <dt>Language</dt><dd>${esc(cust.language)}</dd>
        <dt>Customer since</dt><dd>${fmtDate(cust.since)}</dd>
        <dt>Cards shown</dt><dd>${cards.length}</dd>
      </dl>
    </aside>
    <div class="stack">
      <section class="panel">
        <h2>${esc(single ? issuers[0] : label)} cards</h2>
        ${cards.length ? `<div class="cards">${cards.map(renderCard).join("")}</div>`
          : `<div class="empty"><b>No ${esc(label)} cards on file</b>This customer is known to us but holds no products with ${single ? "this issuer" : "these issuers"}.</div>`}
      </section>
      <section class="panel">
        <div class="toolbar"><h2>Recent interactions · ${esc(label)}</h2><button id="toggle">+ Log interaction</button></div>
        <form class="log" id="logForm">
          ${single ? "" : `<label>Issuer<select name="issuer">${issuers.map((k) => `<option>${k}</option>`).join("")}</select></label>`}
          <label>Contact method<select name="channel">${Object.keys(CHANNEL_ICONS).map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label>Reason<select name="reason">${["Balance enquiry", "Statement query", "Dispute / chargeback", "Block / unblock card", "Activate card", "PIN reset", "Credit limit change", "Payment arrangement", "Fee waiver", "Rewards", "Card renewal", "Other"].map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label>Outcome<select name="outcome">${["Resolved", "Follow-up", "Pending", "Escalated"].map((k) => `<option>${k}</option>`).join("")}</select></label>
          <label>Agent<input name="agent" required value="${esc(localStorage.getItem("cardcrm.agent") || "")}" placeholder="Your name"></label>
          <label class="wide">Notes<textarea name="notes" placeholder="What did the customer ask and what was done?"></textarea></label>
          <div class="actions"><button type="button" class="secondary" id="cancel">Cancel</button><button>Save interaction</button></div>
        </form>
        ${history.length ? `<ul class="timeline">${history.map(renderInteraction).join("")}</ul>`
          : `<div class="empty"><b>No previous interactions</b>No recorded contacts for ${esc(label)}.</div>`}
      </section>
    </div>
  </main>`;

  const form = document.getElementById("logForm");
  const close = () => { form.classList.remove("open"); form.reset(); };
  document.getElementById("toggle").onclick = () => form.classList.toggle("open");
  document.getElementById("cancel").onclick = close;
  form.onsubmit = (e) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(form));
    try { localStorage.setItem("cardcrm.agent", f.agent); } catch {}
    DB.data.interactions.push({ id: "u-" + Date.now(), ts: new Date().toISOString(), phone: cust.phone, issuer: issuers[0], ...f });
    DB.save();
    renderCustomer(cust, ch);
  };
}

(function init() {
  const q = new URLSearchParams(location.search);
  const phone = q.get("phone"), channel = q.get("channel");
  if (!phone && !channel) return renderLanding();
  const ch = parseChannels(channel);
  if (!ch.issuers.length || ch.bad.length) return renderLanding(`Unknown or missing channel “${esc(ch.bad.join(", ") || channel || "")}”. Use ALL or one or more of: ${Object.keys(ISSUERS).join(", ")} (comma separated).`);
  const cust = findCustomer(phone);
  if (!cust) return renderLanding(`No customer found for “${esc(phone || "")}”.`);
  renderCustomer(cust, ch);
})();

const root = document.getElementById("root");
const ISS = Object.keys(ISSUERS);
const CH = ["Voice", "Chat", "Email", "WhatsApp", "SMS"];
const OUT = ["Resolved", "Follow-up", "Pending", "Escalated"];
const STATUS = ["Active", "Blocked", "Expired", "Pending activation"];
const TYPES = ["Credit", "Debit", "Prepaid"];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const opts = (list, cur) => list.map((o) => `<option ${o === cur ? "selected" : ""}>${esc(o)}</option>`).join("");
const toast = (m = "Saved") => { const t = document.getElementById("toast"); t.textContent = m; t.classList.add("show"); setTimeout(() => t.classList.remove("show"), 1200); };
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

let tab = "customers", sel = 0, filterPhone = "";

function field(label, name, val, type = "text") { return `<label>${label}<input type="${type}" name="${name}" value="${esc(val)}"></label>`; }
function select(label, name, list, cur) { return `<label>${label}<select name="${name}">${opts(list, cur)}</select></label>`; }

function customerForm(c) {
  const cardHtml = c.cards.map((k, i) => `
    <div class="cardbox" data-card="${i}">
      <div class="hd"><span>Card ${i + 1}</span><button type="button" class="danger" data-del-card="${i}">Remove</button></div>
      <div class="grid">
        ${select("Issuer", "issuer", ISS, k.issuer)}${field("Product", "product", k.product)}${field("Network", "network", k.network)}
        ${field("Last 4", "last4", k.last4)}${select("Type", "type", TYPES, k.type)}${select("Status", "status", STATUS, k.status)}
        ${field("Limit", "limit", k.limit, "number")}${field("Balance", "balance", k.balance, "number")}${field("Min. due", "due", k.due, "number")}
        ${field("Due date", "dueDate", k.dueDate || "", "date")}${field("Expiry (MM/YY)", "expiry", k.expiry)}${field("Rewards", "rewards", k.rewards)}
      </div>
    </div>`).join("");
  return `
  <form id="custForm">
    <div class="grid">
      ${field("Customer ID", "id", c.id)}${field("Name", "name", c.name)}${field("Phone", "phone", c.phone)}${field("Email", "email", c.email)}
      ${field("Date of birth", "dob", c.dob, "date")}${field("City", "city", c.city)}${field("Segment", "segment", c.segment)}
      ${field("Customer since", "since", c.since, "date")}${field("Language", "language", c.language)}
    </div>
    <h2 style="margin-top:20px">Cards (${c.cards.length})</h2>${cardHtml}
    <div class="row-actions">
      <button type="button" class="secondary" id="addCard">+ Add card</button><span style="flex:1"></span>
      <a class="btn secondary" style="background:var(--neutral-bg);color:var(--text)" target="_blank" href="index.html?phone=${encodeURIComponent(c.phone)}&channel=ALL">Open in CRM ↗</a>
      <button type="button" class="danger" id="delCust">Delete customer</button><button>Save customer</button>
    </div>
  </form>`;
}

function readCustomer(form) {
  const f = (el, n) => el.querySelector(`[name=${n}]`).value;
  const num = (el, n) => Number(f(el, n)) || 0;
  const c = DB.data.customers[sel];
  const oldPhone = c.phone;
  for (const n of ["id", "name", "phone", "email", "dob", "city", "segment", "since", "language"]) c[n] = f(form, n);
  c.cards = [...form.querySelectorAll("[data-card]")].map((el) => ({
    issuer: f(el, "issuer"), product: f(el, "product"), network: f(el, "network"), last4: f(el, "last4"), type: f(el, "type"), status: f(el, "status"),
    limit: num(el, "limit"), balance: num(el, "balance"), due: num(el, "due"), dueDate: f(el, "dueDate") || null, expiry: f(el, "expiry"), rewards: f(el, "rewards") || "—",
  }));
  if (oldPhone !== c.phone) DB.data.interactions.forEach((i) => { if (i.phone === oldPhone) i.phone = c.phone; }); // keep history attached
}

function renderCustomers() {
  const cs = DB.data.customers;
  if (sel >= cs.length) sel = Math.max(0, cs.length - 1);
  root.querySelector("#pane").innerHTML = `
  <div class="split">
    <div class="panel"><div class="toolbar"><h2>Customers</h2><button id="addCust">+ New</button></div>
      <div class="list">${cs.map((c, i) => `<button data-sel="${i}" class="${i === sel ? "on" : ""}">${esc(c.name || "(unnamed)")}<small>${esc(c.phone)} · ${[...new Set(c.cards.map((k) => k.issuer))].join(", ") || "no cards"}</small></button>`).join("")}</div></div>
    <div class="panel">${cs[sel] ? customerForm(cs[sel]) : "<div class='empty'>No customers</div>"}</div>
  </div>`;
  root.querySelectorAll("[data-sel]").forEach((b) => b.onclick = () => { sel = +b.dataset.sel; renderCustomers(); });
  root.querySelector("#addCust").onclick = () => {
    cs.push({ id: "C-" + (1000 + cs.length + 1), name: "New Customer", phone: "+97150" + String(Math.floor(Math.random() * 9e7 + 1e7)), email: "", dob: "1990-01-01", city: "", segment: "Standard", since: new Date().toISOString().slice(0, 10), language: "English", cards: [] });
    sel = cs.length - 1; DB.save(); renderCustomers();
  };
  const form = root.querySelector("#custForm"); if (!form) return;
  root.querySelector("#addCard").onclick = () => { readCustomer(form); cs[sel].cards.push({ issuer: "Manor", product: "New Card", network: "Visa", last4: "0000", type: "Credit", status: "Active", limit: 10000, balance: 0, due: 0, dueDate: null, expiry: "12/30", rewards: "—" }); renderCustomers(); };
  root.querySelectorAll("[data-del-card]").forEach((b) => b.onclick = () => { readCustomer(form); cs[sel].cards.splice(+b.dataset.delCard, 1); renderCustomers(); });
  root.querySelector("#delCust").onclick = () => { if (confirm("Delete this customer (their interactions are kept)?")) { cs.splice(sel, 1); DB.save(); renderCustomers(); toast("Deleted"); } };
  form.onsubmit = (e) => { e.preventDefault(); readCustomer(form); DB.save(); renderCustomers(); toast(); };
}

function renderInteractions() {
  const cs = DB.data.customers;
  const list = DB.data.interactions.map((x, idx) => ({ x, idx })).filter(({ x }) => !filterPhone || x.phone === filterPhone).sort((a, b) => b.x.ts.localeCompare(a.x.ts));
  root.querySelector("#pane").innerHTML = `
  <div class="panel">
    <div class="toolbar"><h2>Interactions (${list.length})</h2>
      <div style="display:flex;gap:8px"><select id="flt" style="width:auto"><option value="">All customers</option>${cs.map((c) => `<option value="${esc(c.phone)}" ${c.phone === filterPhone ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select><button id="addInt">+ Add</button></div></div>
    ${list.map(({ x, idx }) => `
    <form class="inter" data-idx="${idx}">
      <div class="grid">
        <label>Customer<select name="phone">${cs.map((c) => `<option value="${esc(c.phone)}" ${c.phone === x.phone ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
        ${select("Issuer", "issuer", ISS, x.issuer)}${select("Contact method", "channel", CH, x.channel)}${field("Reason", "reason", x.reason)}${select("Outcome", "outcome", OUT, x.outcome)}
        ${field("Agent", "agent", x.agent)}${field("When", "ts", toLocal(x.ts), "datetime-local")}
        <label style="grid-column:1/-1">Notes<textarea name="notes">${esc(x.notes)}</textarea></label>
      </div>
      <div class="row-actions"><button>Save</button><button type="button" class="danger" data-del>Delete</button></div>
    </form>`).join("") || "<div class='empty'>No interactions</div>"}
  </div>`;
  root.querySelector("#flt").onchange = (e) => { filterPhone = e.target.value; renderInteractions(); };
  root.querySelector("#addInt").onclick = () => {
    const phone = filterPhone || cs[0]?.phone; if (!phone) return;
    DB.data.interactions.push({ id: "u-" + Date.now(), ts: new Date().toISOString(), phone, issuer: "Manor", channel: "Voice", reason: "New interaction", outcome: "Pending", agent: "", notes: "" });
    DB.save(); renderInteractions();
  };
  root.querySelectorAll("form.inter").forEach((f) => {
    const i = DB.data.interactions[+f.dataset.idx];
    f.onsubmit = (e) => { e.preventDefault(); const v = Object.fromEntries(new FormData(f)); Object.assign(i, v, { ts: new Date(v.ts).toISOString() }); DB.save(); renderInteractions(); toast(); };
    f.querySelector("[data-del]").onclick = () => { DB.data.interactions.splice(+f.dataset.idx, 1); DB.save(); renderInteractions(); toast("Deleted"); };
  });
}

function renderData() {
  root.querySelector("#pane").innerHTML = `
  <div class="panel"><h2>Raw data</h2>
    <p style="color:var(--muted);margin-top:0">Edit everything as JSON, or export/import it to share a dataset.</p>
    <textarea id="raw" style="min-height:380px;font-family:ui-monospace,Menlo,monospace;font-size:12.5px">${esc(JSON.stringify(DB.data, null, 2))}</textarea>
    <div class="row-actions"><button id="applyRaw">Apply JSON</button><button class="secondary" id="export">Download JSON</button>
      <span style="flex:1"></span><button class="danger" id="reset">Reset to original mock data</button></div></div>`;
  document.getElementById("applyRaw").onclick = () => {
    try { const d = JSON.parse(document.getElementById("raw").value); if (!Array.isArray(d.customers) || !Array.isArray(d.interactions)) throw 0; DB.replace(d); toast("Applied"); }
    catch { alert("Invalid JSON: need an object with \"customers\" and \"interactions\" arrays."); }
  };
  document.getElementById("export").onclick = () => {
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(DB.data, null, 2)], { type: "application/json" })); a.download = "card-crm-data.json"; a.click();
  };
  document.getElementById("reset").onclick = () => { if (confirm("Discard all edits and restore the original mock data?")) { DB.reset(); sel = 0; renderData(); toast("Reset"); } };
}

function render() {
  root.innerHTML = `<div class="tabs">${[["customers", "Customers & cards"], ["interactions", "Interactions"], ["data", "Raw data / reset"]].map(([k, l]) => `<button data-tab="${k}" class="${k === tab ? "on" : ""}">${l}</button>`).join("")}</div><div id="pane"></div>`;
  root.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => { tab = b.dataset.tab; render(); });
  ({ customers: renderCustomers, interactions: renderInteractions, data: renderData })[tab]();
}
render();

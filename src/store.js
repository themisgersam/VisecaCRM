// Shared data layer. Defaults come from data.js; edits (admin page or logged interactions) live in localStorage.
const DB_KEY = "cardcrm.data.v2";
const DB = (() => {
  const clone = (x) => JSON.parse(JSON.stringify(x));
  function defaults() {
    const interactions = SEED_INTERACTIONS.map((s, i) => {
      const d = new Date(); d.setDate(d.getDate() - s.daysAgo); d.setHours(s.hour, (i * 7) % 60, 0, 0);
      const { daysAgo, hour, ...rest } = s;
      return { id: "seed-" + i, ts: d.toISOString(), ...rest };
    });
    try { interactions.push(...(JSON.parse(localStorage.getItem("cardcrm.interactions.v1")) || [])); } catch {}
    return { customers: clone(CUSTOMERS), interactions };
  }
  function load() {
    try { const d = JSON.parse(localStorage.getItem(DB_KEY)); if (d && d.customers && d.interactions) return d; } catch {}
    return defaults();
  }
  const api = {
    data: load(),
    save() { try { localStorage.setItem(DB_KEY, JSON.stringify(api.data)); } catch {} },
    reset() { try { localStorage.removeItem(DB_KEY); localStorage.removeItem("cardcrm.interactions.v1"); } catch {} api.data = defaults(); },
    replace(d) { api.data = d; api.save(); },
  };
  return api;
})();

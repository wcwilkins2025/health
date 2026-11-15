/* Shared helpers for every page: sign-in check, nav, and api() over the person's rows.
   A page that is not account.html needs a signed-in person; without one it goes to account.html and comes back. */
const NAV = [
  ["index.html", "Dashboard"], ["weight.html", "Weight"], ["bp.html", "Blood pressure"], ["checkin.html", "Check-in"], ["training.html", "Training"], ["log.html", "Log"],
  ["plan.html", "Meal plan"], ["recipes.html", "Recipes"], ["shopping.html", "Shopping"], ["foods.html", "Foods"], ["blog.html", "Blog"],
];

if (window.Chart) { Chart.defaults.font.family = '"Source Serif 4", Georgia, serif'; Chart.defaults.color = "#5a5f64"; Chart.defaults.borderColor = "#d3cdbf"; }

const PAGE = (location.pathname.split("/").pop() || "index.html");
const CFG = window.HT_CONFIG || {};
HT.configured = !!(CFG.supabaseUrl && CFG.supabaseKey && !/YOUR-/.test(CFG.supabaseUrl + CFG.supabaseKey));
HT.sb = HT.configured && window.supabase ? supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey) : null;

// One promise per page: the signed-in person's rows, loaded. Pages call api() at once; it waits on this.
// Preview on this PC with no Supabase project: one local person, rows kept in this browser only.
HT.local = !HT.configured && /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
HT.ready = (async () => {
  if (HT.local) {
    const S = HT.memoryStore(), saved = JSON.parse(localStorage.getItem("ht_local_db") || "null");
    if (saved) { S.db = Object.assign(S.db, saved.db); S.nextId = saved.nextId || 1; }
    S.email = "local@preview"; S.onChange = x => localStorage.setItem("ht_local_db", JSON.stringify({ db: x.db, nextId: x.nextId }));
    await HT.E.seedDefaultWorkouts(S);
    if (HT.E.get(S, "setup_done") !== "1" && PAGE !== "welcome.html" && PAGE !== "account.html") { location.replace("welcome.html"); throw new Error("Welcome first"); }
    return S;
  }
  if (!HT.sb) { if (PAGE !== "account.html") location.replace("account.html"); throw new Error("Sign-in is not set up yet"); }
  const { data: { session } } = await HT.sb.auth.getSession();
  if (!session) {
    if (PAGE !== "account.html") location.replace("account.html?next=" + encodeURIComponent(PAGE + location.search));
    throw new Error("Sign in to continue");
  }
  const S = new HT.Store(HT.sb, session.user.id);
  S.email = session.user.email || "";
  await S.load();
  await HT.E.seedDefaultWorkouts(S);
  if (HT.E.get(S, "setup_done") !== "1" && PAGE !== "welcome.html" && PAGE !== "account.html") { location.replace("welcome.html"); throw new Error("Welcome first"); }
  return S;
})();
HT.ready.catch(() => {});

function renderNav() {
  const links = NAV.map(([href, label]) => `<a href="${href}" class="${PAGE === href ? "active" : ""}">${label}</a>`).join("");
  document.body.insertAdjacentHTML("afterbegin",
    `<header class="top"><div class="wrap"><span class="brand">Weight Target</span><nav>${links}</nav><span class="acct" id="acct"></span></div></header>`);
  HT.ready.then(S => {
    const who = HT.E.get(S, "name") || S.email;
    el("acct").innerHTML = `<a href="account.html" title="${esc(S.email)}">${esc(who || "Account")}</a>`;
  }).catch(() => {});
}

async function api(path, opts = {}) {
  const S = await HT.ready;
  try { return await HT.route(S, (opts.method || "GET").toUpperCase(), path, opts.body); }
  catch (e) {
    console.error(e);
    if (/JWT|expired|not authenticated/i.test(e.message)) { location.replace("account.html?next=" + encodeURIComponent(PAGE + location.search)); await new Promise(() => {}); }
    throw e;
  }
}

/* Read a SQLite file the person picked (Gym ACE's database, or the old app's) and bring its rows in. */
async function importFile(file, expect) {
  const S = await HT.ready;
  const db = await HT.E.openSqlite(await file.arrayBuffer());
  try {
    const kind = HT.E.kindOf(db);
    if (!kind) throw new Error("That file is not a Gym ACE database or a Weight Target database.");
    if (expect && kind !== expect) throw new Error(kind === "old" ? "That is the old Weight Target database; import it on the Account page." : "That is a Gym ACE database; import it on the Training page.");
    return kind === "gymace" ? await HT.E.importGymAce(S, db) : await HT.E.importOldApp(S, db);
  } finally { db.close(); }
}

function download(name, text, type = "text/html") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

function el(id) { return document.getElementById(id); }
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
const UNIT_NO_S = ["oz", "tbsp", "tsp"], UNIT_PLURAL = { patty: "patties" };
function unitName(unit, qty) { return qty === 1 || UNIT_NO_S.includes(unit) ? unit : (UNIT_PLURAL[unit] || unit + "s"); }
function todayStr() { return HT.E.todayStr(); }
function nowLocal() {
  const d = new Date(); d.setSeconds(0, 0);
  const pad = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fmtDate(s) {
  if (!s) return "";
  const d = new Date(s.length === 10 ? s + "T00:00" : s);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtDateTime(s) {
  const d = new Date(s);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
function flash(id, text, kind = "ok") {
  const m = el(id); if (!m) return;
  m.className = "msg " + kind; m.textContent = text; m.style.display = "block";
  setTimeout(() => { m.style.display = "none"; }, 5000);
}
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

const CAT_LABEL = { normal: "Normal", elevated: "Elevated", stage1: "Stage 1", stage2: "Stage 2", crisis: "Crisis" };

document.addEventListener("DOMContentLoaded", () => { if (PAGE !== "account.html") renderNav(); });

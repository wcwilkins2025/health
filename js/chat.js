/* One chat for the three AI conversations (coach, mycode, kitchen): messages, the cards they offer, starters.
   A page calls HT.chat({kind, starters, onState}) after app.js; it needs #chat, #thinking, #starters, #form,
   #text, #send, #setup and #msg in the page. */
(function () {
  const LABEL = { daily_kcal: "Daily calories", walk_min_per_week: "Walking minutes a week", bike_min_per_week: "Riding minutes a week",
    workout_goal_per_week: "Workouts a week", water_goal_oz: "Water a day (oz)", protein_goal_g: "Protein a day (g)", target_date: "Target date", diet: "Diet" };

  function md(text) {
    const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return String(text).split(/\n{2,}/).map(block => {
      const lines = block.split("\n");
      if (lines.every(l => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
        const items = lines.map(l => `<li>${inline(l.replace(/^\s*([-*•]|\d+\.)\s+/, ""))}</li>`).join("");
        return /^\s*\d+\./.test(lines[0]) ? `<ol>${items}</ol>` : `<ul>${items}</ul>`;
      }
      return `<p>${lines.map(inline).join("<br>")}</p>`;
    }).join("");
  }

  function cardHtml(c, S) {
    const d = c.data, done = c.status === "applied" ? `<span class="pill green">${c.tool === "create_recipe" ? "Added" : "Applied"}</span>` : c.status === "dismissed" ? `<span class="pill">Not now</span>` : "";
    const act = (yes) => done || `<button type="button" class="small" onclick="HT.chatCard(${c.id}, 'apply')">${yes}</button> <button type="button" class="small ghost" onclick="HT.chatCard(${c.id}, 'dismiss')">Not now</button>`;
    if (c.tool === "suggest_change") {
      const val = d.setting === "diet" ? ((HT.E.DIETS.find(x => x.id === d.value) || {}).name || d.value) : d.value;
      return `<div class="sugg"><div><strong>${esc(LABEL[d.setting] || d.setting)}: ${esc(val)}</strong>${c.current && c.status === "open" ? ` <span class="muted small">now ${esc(c.current)}</span>` : ""}
        <div class="small muted">${esc(d.why)}</div></div><div class="sugg-act">${act("Apply")}</div></div>`;
    }
    if (c.tool === "create_recipe") {
      const foods = HT.E.foodMap(S), t = HT.E.zero();
      const lines = d.ingredients.map(i => { const f = foods[i.food_id]; if (f) HT.E.addM(t, HT.E.macros(f, i.qty, i.unit)); return `${i.qty} ${unitName(i.unit, i.qty)} ${esc(f ? f.name : i.food_id)}`; });
      const n = HT.E.rounded(t);
      return `<div class="sugg recipe-card"><div><strong>${esc(d.name)}</strong> <span class="muted small">${esc(d.meal_type)}${d.portable ? ", portable" : ""}${d.batch ? ", batch" : ""}</span>
        <div class="small">${lines.join(", ")}</div><div class="small muted">${n.kcal} kcal · ${n.protein} g protein · ${n.carbs} g net carbs</div>
        ${d.instructions ? `<details class="small"><summary>How to make it</summary>${esc(d.instructions)}</details>` : ""}</div>
        <div class="sugg-act">${act("Add to my recipes")}</div></div>`;
    }
    if (c.tool === "set_food_preference") {
      const f = HT.E.foodMap(S)[d.food_id];
      return `<div class="sugg"><div class="small muted">Noted: ${d.choice === "like" ? "you like" : d.choice === "allergy" ? "allergic to" : "you don't eat"} ${esc(f ? f.name : d.food_id)}. <a href="kitchen.html#likes">Change</a></div></div>`;
    }
    return "";
  }

  HT.chat = function (opts) {
    let busy = false, ready = false, S = null;
    const who = opts.who || "Coach";
    function bubble(m) {
      const when = m.created_at ? new Date(m.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
      return `<div class="bubble ${m.role}"><div class="who">${m.role === "user" ? "You" : who} <span>${when}</span></div>
        <div class="body">${m.role === "user" ? `<p>${esc(m.content).replace(/\n/g, "<br>")}</p>` : md(m.content)}</div>
        ${(m.cards || []).map(c => cardHtml(c, S)).join("")}</div>`;
    }
    function render(st) {
      el("chat").innerHTML = st.messages.map(bubble).join("") || (opts.empty ? `<div class="card muted" style="margin-bottom:12px">${opts.empty}</div>` : "");
      el("starters").innerHTML = st.messages.length ? "" : (opts.starters || []).map(t => `<button type="button" class="ghost small" onclick='HT.chatSend(${esc(JSON.stringify(t))})'>${esc(t)}</button>`).join("");
      el("send").disabled = !ready;
      if (opts.onState) opts.onState(st);
      window.scrollTo(0, document.body.scrollHeight);
    }
    HT.chatLoad = async () => { S = await HT.ready; render(await api(`/api/ai/${opts.kind}`)); };
    HT.chatSend = async text => {
      text = (text ?? el("text").value).trim();
      if (!text || busy || !ready) return;
      busy = true; el("send").disabled = true; el("text").value = "";
      el("chat").insertAdjacentHTML("beforeend", bubble({ role: "user", content: text, created_at: new Date().toISOString() }));
      el("starters").innerHTML = ""; el("thinking").style.display = ""; window.scrollTo(0, document.body.scrollHeight);
      try { render(await api(`/api/ai/${opts.kind}`, { method: "POST", body: { message: text } })); }
      catch (e) { flash("msg", e.message, "err"); el("text").value = text; await HT.chatLoad(); }
      busy = false; el("thinking").style.display = "none"; el("send").disabled = !ready;
    };
    HT.chatCard = async (id, action) => {
      try { render(await api(`/api/ai/cards/${id}/${action}`, { method: "POST" })); if (action === "apply") flash("msg", opts.appliedText || "Done."); }
      catch (e) { flash("msg", e.message, "err"); }
    };
    HT.chatClear = async () => { render(await api(`/api/ai/${opts.kind}`, { method: "DELETE" })); };
    el("form").addEventListener("submit", ev => { ev.preventDefault(); HT.chatSend(); });
    el("text").addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.shiftKey && window.innerWidth > 760) { ev.preventDefault(); HT.chatSend(); } });
    (async () => {
      let st = { configured: false, is_owner: false };
      if (HT.aiCall) { try { st = await HT.aiCall({ action: "status" }); } catch (e) { st.error = e.message; } }
      ready = !!st.configured;
      if (!ready) {
        el("setup").style.display = "";
        el("setup").innerHTML = `<h2>AI is not set up yet</h2><p class="small" style="margin:0">${!HT.aiCall
          ? "AI works once the app is connected to its Supabase project (the local preview has no AI)."
          : st.is_owner || st.error ? `Set it up on the <a href="ai-setup.html">AI setup page</a>: paste one key and it's done.${st.error ? " (" + esc(st.error) + ")" : ""}`
          : "The app's owner sets it up once for everyone. Ask them, or if you run this app, open the <a href=\"ai-setup.html\">AI setup page</a>."}</p>`;
      }
      await HT.chatLoad();
    })().catch(e => flash("msg", e.message, "err"));
  };
})();

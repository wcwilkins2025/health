// Steadfast AI: the one place an AI key is used. The browser sends a conversation and its context; this function
// checks who is asking, enforces the owner's daily limit, calls the chosen provider (core.js) and records usage.
// Keys live in the ai_config table, which no browser can read (row-level security with no policies); only this
// function, with the service role, reads and writes it. Deploy: supabase functions deploy ai  (see docs/SETUP.md).
import Anthropic from "npm:@anthropic-ai/sdk@1.9.0";
import { createClient } from "npm:@supabase/supabase-js@2.119.0";
import * as core from "./core.js";

const URL_ = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const db = createClient(URL_, SERVICE, { auth: { persistSession: false } });

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

// ---------- calls to the providers, with errors in plain words ----------
const clients = new Map<string, Anthropic>();
function claude(key: string) {
  if (!clients.has(key)) clients.set(key, new Anthropic({ apiKey: key }));
  return clients.get(key)!;
}
const deps = {
  async anthropic(params: any, key: string) {
    try {
      return await claude(key).beta.messages.create(params);
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) throw new core.AIError("Anthropic refused the key. Check it on the AI setup page.", 503);
      if (e instanceof Anthropic.PermissionDeniedError) throw new core.AIError("The key does not have access to that model.", 503);
      if (e instanceof Anthropic.RateLimitError) throw new core.AIError("The AI is busy right now. Try again in a minute.", 429);
      if (e instanceof Anthropic.BadRequestError) throw new core.AIError(`The request was refused: ${e.message}`, 502);
      if (e instanceof Anthropic.APIError) throw new core.AIError(`The AI service had an error (${e.status}). Try again shortly.`, 502);
      throw new core.AIError("Could not reach the AI service.", 502);
    }
  },
  async anthropicModels(key: string) {
    const ids: string[] = [];
    try {
      for await (const m of claude(key).models.list()) ids.push(m.id);
    } catch (e) {
      if (e instanceof Anthropic.AuthenticationError) throw new core.AIError("Anthropic refused the key.", 503);
      throw new core.AIError("Could not list Anthropic models.", 502);
    }
    return ids;
  },
  async fetchJson(url: string, key: string, body: unknown, method = "POST") {
    let r: Response;
    try {
      r = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw new core.AIError("Could not reach the AI service.", 502);
    }
    if (r.status === 401 || r.status === 403) throw new core.AIError("The AI service refused the key. Check it on the AI setup page.", 503);
    if (r.status === 404) throw new core.AIError("The AI service does not know that model. Check the AI setup page.", 502);
    if (r.status === 429) throw new core.AIError("The AI service is busy or over its limit. Try again in a minute.", 429);
    const data = await r.json().catch(() => ({}));
    if (r.status >= 400) throw new core.AIError(`The AI service returned an error (${r.status}): ${data?.error?.message ?? ""}`, 502);
    return data;
  },
};

// ---------- the owner's settings ----------
async function loadConfig() {
  const { data } = await db.from("ai_config").select("data").eq("id", 1).maybeSingle();
  return core.defaults(data?.data);
}
async function saveConfig(cfg: unknown) {
  const { error } = await db.from("ai_config").upsert({ id: 1, data: cfg, updated_at: new Date().toISOString() });
  if (error) throw new core.AIError("Could not save the AI settings.", 500);
}
async function isOwner(userId: string, claim: boolean) {
  const { data } = await db.from("app_owners").select("user_id");
  if (data?.some((r: any) => r.user_id === userId)) return true;
  if (claim && !data?.length) {   // the first person to open AI setup becomes the owner (sign-up is by invitation only)
    await db.from("app_owners").insert({ user_id: userId });
    return true;
  }
  return false;
}
async function usageMonth() {
  const start = new Date(); start.setUTCDate(1); start.setUTCHours(0, 0, 0, 0);
  const { data } = await db.from("ai_usage").select("provider, model, tokens_in, tokens_out").gte("at", start.toISOString());
  const u = { month: start.toISOString().slice(0, 7), requests: 0, tokens_in: 0, tokens_out: 0, dollars: 0, priced: true };
  for (const r of data ?? []) {
    u.requests++; u.tokens_in += r.tokens_in; u.tokens_out += r.tokens_out;
    const c = core.cost(r.model, r.tokens_in, r.tokens_out);
    if (c === null) u.priced = false; else u.dollars += c;
  }
  u.dollars = Math.round(u.dollars * 100) / 100;
  return u;
}
async function record(userId: string, kind: string, provider: string, model: string, usage: any) {
  await db.from("ai_usage").insert({ user_id: userId, kind, provider, model, tokens_in: usage?.tokens_in ?? usage?.input_tokens ?? 0, tokens_out: usage?.tokens_out ?? usage?.output_tokens ?? 0 });
}

async function quickSetup(cfg: any, key: string) {
  const provider = core.detectProvider(key);
  if (!provider) throw new core.AIError("That key's format is not one the app knows. Pick the provider under Advanced and paste it there.", 422);
  cfg.provider = provider; cfg.keys[provider] = key;
  let models: string[] = [];
  try { models = await core.listModels(cfg, provider, deps); } catch (e) { if (provider !== "anthropic") throw e; }
  const model = core.pickModel(provider, models, cfg.tier);
  if (!model) throw new core.AIError("No usable model was found for this key.", 502);
  if (provider === "anthropic") delete cfg.models.anthropic; else cfg.models[provider] = model;
  return cfg;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: { user } } = await db.auth.getUser(jwt);
    if (!user) return reply({ error: "Sign in first." }, 401);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "");
    let cfg = await loadConfig();

    if (action === "status") {
      const owner = await isOwner(user.id, false);
      return reply({ configured: core.configured(cfg), provider_name: core.PROVIDERS[cfg.provider]?.name ?? "", model: core.modelFor(cfg, cfg.provider), is_owner: owner });
    }

    if (action.startsWith("admin_")) {
      if (!(await isOwner(user.id, true))) return reply({ error: "Only the app's owner sets up the AI." }, 403);
      if (action === "admin_quick") {
        const key = String(body.key ?? "").trim();
        if (key.length < 8 || /\s/.test(key)) throw new core.AIError("Paste the whole key.", 422);
        cfg = await quickSetup(cfg, key);
        await saveConfig(cfg);
        const test = await core.testConnection(cfg, deps);
        await record(user.id, "setup", cfg.provider, core.modelFor(cfg, cfg.provider), test.usage);
        return reply({ ...core.publicConfig(cfg, await usageMonth()), test: { ok: test.ok, reply: test.reply } });
      }
      if (action === "admin_update") {
        const p = String(body.provider ?? "");
        if (!core.PROVIDERS[p]) throw new core.AIError("Unknown provider.", 422);
        cfg.provider = p;
        if (typeof body.model === "string") { if (body.model.trim()) cfg.models[p] = body.model.trim().slice(0, 120); else delete cfg.models[p]; }
        if (body.clear_key) delete cfg.keys[p];
        else if (typeof body.key === "string" && body.key.trim()) {
          if (body.key.trim().length < 8 || /\s/.test(body.key.trim())) throw new core.AIError("That does not look like an API key.", 422);
          cfg.keys[p] = body.key.trim();
        }
        await saveConfig(cfg);
      } else if (action === "admin_costs") {
        if (body.tier !== undefined) {
          if (!core.TIERS[body.tier]) throw new core.AIError("Unknown cost setting.", 422);
          cfg.tier = body.tier; if (cfg.provider === "anthropic") delete cfg.models.anthropic;
        }
        if (body.daily_limit !== undefined) {
          const n = Math.round(Number(body.daily_limit));
          if (!(n >= 0 && n <= 1000)) throw new core.AIError("The daily limit has to be between 0 and 1000.", 422);
          cfg.daily_limit = n;
        }
        await saveConfig(cfg);
      } else if (action === "admin_models") {
        const p = String(body.provider ?? "");
        if (!core.PROVIDERS[p]) throw new core.AIError("Unknown provider.", 422);
        return reply({ models: await core.listModels(cfg, p, deps) });
      } else if (action === "admin_test") {
        const test = await core.testConnection(cfg, deps);
        await record(user.id, "setup", cfg.provider, core.modelFor(cfg, cfg.provider), test.usage);
        return reply({ ok: test.ok, reply: test.reply });
      } else if (action !== "admin_get") {
        throw new core.AIError("Unknown request.", 400);
      }
      return reply(core.publicConfig(cfg, await usageMonth()));
    }

    if (action === "chat") {
      const kind = String(body.kind ?? "");
      const owner = await isOwner(user.id, false);
      if (cfg.daily_limit && !owner) {
        const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
        const { count } = await db.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).neq("kind", "setup").gte("at", since);
        if ((count ?? 0) >= cfg.daily_limit) throw new core.AIError(`That's the limit of ${cfg.daily_limit} messages a day. It eases as the day goes by.`, 429);
      }
      const ctx = { today: String(body.today ?? "").slice(0, 10) || new Date().toISOString().slice(0, 10),
        foodIds: new Set((body.food_ids ?? []).map(String)), offIds: new Set((body.off_ids ?? []).map(String)) };
      const out = await core.runTurn(cfg, kind, body.history, body.context ?? {}, ctx, deps);
      await record(user.id, kind, out.provider, out.model, out.usage);
      return reply({ replies: out.replies, refused: out.refused, cards: out.cards });
    }
    return reply({ error: "Unknown request." }, 400);
  } catch (e) {
    const status = e instanceof core.AIError ? e.status : 500;
    return reply({ error: e instanceof core.AIError ? e.message : "Something went wrong in the AI service." }, status);
  }
});

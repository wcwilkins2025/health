/* Steadfast AI core: providers, cost tiers, the three conversations (coach, My Code builder, kitchen) and one
   conversation turn. Plain JavaScript with no Deno or Node APIs, so the Supabase function (index.ts) runs it and
   the node tests load it. Claude is called through the Anthropic SDK client the caller passes in; Grok (xAI),
   Groq, OpenAI and Gemini through their OpenAI-compatible chat completions, by the fetchJson the caller passes. */

export const PROVIDERS = {
  anthropic: { name: 'Claude (Anthropic)', kind: 'anthropic', keyUrl: 'https://console.anthropic.com/settings/keys', where: 'console.anthropic.com',
    note: 'Best coaching. Low cost on the lowest tier (Claude Haiku).',
    steps: ['Go to console.anthropic.com and sign in (or sign up).', 'Settings, Billing: add a payment method or a few dollars of credit.', 'Settings, API keys: Create key. Copy it; it is shown once.', 'Paste it in Quick setup.'] },
  groq: { name: 'Groq', kind: 'openai', baseUrl: 'https://api.groq.com/openai/v1', keyUrl: 'https://console.groq.com/keys', where: 'console.groq.com',
    note: 'Free to start. Runs open models on fast chips. Not the same company as Grok.',
    steps: ['Go to console.groq.com and sign in.', 'API Keys: Create API Key. Copy it.', 'Paste it in Quick setup; the app picks a model that can use the buttons.'] },
  gemini: { name: 'Google Gemini', kind: 'openai', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', keyUrl: 'https://aistudio.google.com/apikey', where: 'aistudio.google.com',
    note: 'Free to start. On the free tier Google may use what is sent to improve its products.',
    steps: ['Go to aistudio.google.com and sign in with a Google account.', 'Get API key: Create API key. Copy it.', 'Paste it in Quick setup.'] },
  xai: { name: 'Grok (xAI)', kind: 'openai', baseUrl: 'https://api.x.ai/v1', keyUrl: 'https://console.x.ai', where: 'console.x.ai', defaultModel: 'grok-latest',
    note: "xAI's model, the one in X. Not the same company as Groq.",
    steps: ['Go to console.x.ai and sign in.', 'Billing: add credits.', 'API Keys: Create API key. Copy it.', 'Paste it in Quick setup.'] },
  openai: { name: 'OpenAI (ChatGPT models)', kind: 'openai', baseUrl: 'https://api.openai.com/v1', keyUrl: 'https://platform.openai.com/api-keys', where: 'platform.openai.com',
    note: 'A ChatGPT subscription does not include API use; it is billed separately.',
    steps: ['Go to platform.openai.com and sign in.', 'Settings, Billing: add credits.', 'API keys: Create new secret key. Copy it.', 'Paste it in Quick setup.'] },
};

export const TIERS = { low: 'Lowest cost', balanced: 'Balanced', best: 'Best coaching' };
export const CLAUDE_TIER = { low: 'claude-haiku-5-5', balanced: 'claude-sonnet-5-5', best: 'claude-opus-5-5' };
export const CLAUDE_PRICE = { 'claude-haiku-5-5': [0.10, 0.50], 'claude-sonnet-5-5': [2.00, 10.00], 'claude-opus-5-5': [4.00, 20.00] };   // $ per million tokens in, out
const CLAUDE_FALLBACK = new Set(['claude-opus-5-5', 'claude-opus-5', 'claude-fable-5-2', 'claude-fable-5-1', 'claude-sonnet-5-5']);
const CLAUDE_EFFORT = new Set([...CLAUDE_FALLBACK, 'claude-haiku-5-5']);
const PREFER = {
  groq: { low: ['gpt-oss-20b', 'llama-3.1-8b', 'gpt-oss-120b', 'llama-3.3-70b'], balanced: ['gpt-oss-120b', 'llama-3.3-70b'], best: ['gpt-oss-120b', 'llama-3.3-70b'] },
  openai: { low: ['nano', 'mini'], balanced: ['mini'], best: ['gpt-5', 'gpt-4.1'] },
  gemini: { low: ['flash-lite', 'flash'], balanced: ['flash'], best: ['pro', 'flash'] },
  xai: { low: ['mini', 'fast'], balanced: ['fast', 'grok-latest'], best: ['grok-latest'] },
};
const NOT_CHAT = ['embed', 'whisper', 'tts', 'audio', 'image', 'vision', 'guard', 'moderation', 'transcribe', 'realtime', 'search', 'coder', 'code'];
const KEY_PREFIXES = [['sk-ant-', 'anthropic'], ['xai-', 'xai'], ['gsk_', 'groq'], ['AIza', 'gemini'], ['sk-', 'openai']];
export const HISTORY_SENT = 12, MAX_OUTPUT = 4000, DEFAULT_DAILY_LIMIT = 25;

export class AIError extends Error { constructor(message, status = 502) { super(message); this.status = status; } }

export function detectProvider(key) {
  const k = String(key || '').trim();
  const hit = KEY_PREFIXES.find(([p]) => k.startsWith(p));
  return hit ? hit[1] : null;
}

export function defaults(cfg) {
  return Object.assign({ provider: 'anthropic', models: {}, keys: {}, tier: 'low', daily_limit: DEFAULT_DAILY_LIMIT }, cfg || {},
    { models: Object.assign({}, (cfg || {}).models), keys: Object.assign({}, (cfg || {}).keys) });
}
export function modelFor(cfg, provider) {
  if (cfg.models[provider]) return cfg.models[provider];
  if (provider === 'anthropic') return CLAUDE_TIER[cfg.tier] || CLAUDE_TIER.low;
  return (PROVIDERS[provider] && PROVIDERS[provider].defaultModel) || '';
}
export function configured(cfg) {
  const p = cfg.provider;
  return !!(PROVIDERS[p] && modelFor(cfg, p) && cfg.keys[p]);
}
export function pickModel(provider, models, tier) {
  if (provider === 'anthropic') {
    const want = CLAUDE_TIER[tier] || CLAUDE_TIER.low;
    return !models.length || models.includes(want) ? want : (models.find(m => m.includes('haiku')) || models[0]);
  }
  if (provider === 'xai' && tier !== 'low' && models.includes('grok-latest')) return 'grok-latest';
  const chat = models.filter(m => !NOT_CHAT.some(w => m.toLowerCase().includes(w)));
  const pool = chat.length ? chat : models;
  for (const word of ((PREFER[provider] || {})[tier] || [])) {
    const hit = pool.filter(m => m.toLowerCase().includes(word)).sort((a, b) => a.length - b.length);
    if (hit.length) return hit[0];
  }
  return (PROVIDERS[provider] && PROVIDERS[provider].defaultModel) || pool[0] || '';
}
/** What the owner's setup page may see: never a key, only that one is there and its last four characters. */
export function publicConfig(cfg, usage) {
  return {
    provider: cfg.provider, provider_name: (PROVIDERS[cfg.provider] || {}).name || '', model: PROVIDERS[cfg.provider] ? modelFor(cfg, cfg.provider) : '',
    configured: configured(cfg), tier: cfg.tier, tiers: TIERS, daily_limit: cfg.daily_limit, usage: usage || null,
    providers: Object.entries(PROVIDERS).map(([id, p]) => {
      const k = cfg.keys[id] || '';
      return { id, name: p.name, note: p.note, steps: p.steps, key_url: p.keyUrl, where: p.where, has_key: !!k,
        key_hint: k.length >= 8 ? '…' + k.slice(-4) : (k ? 'set' : ''), model: modelFor(cfg, id) };
    }),
  };
}
export function cost(model, tokensIn, tokensOut) {
  const p = CLAUDE_PRICE[model];
  return p ? tokensIn / 1e6 * p[0] + tokensOut / 1e6 * p[1] : null;
}

/** Whose AI a person uses: the owner and the people the owner invited use the owner's key (invited people under the
    daily limit); everyone who signed up on their own uses their own key, with no limit and no cost to the owner. */
export function chooseConfig({ owner, invited, ownerCfg, userCfg }) {
  if (owner) return { cfg: defaults(ownerCfg), mode: 'owner', limited: false };
  if (invited) return { cfg: defaults(ownerCfg), mode: 'invited', limited: true };
  return { cfg: defaults(Object.assign({ daily_limit: 0 }, userCfg)), mode: 'own', limited: false };
}

// ---------- the three conversations ----------
const SHARED_SAFETY = 'Never advise starting, stopping or changing a medicine; blood pressure and blood sugar medicines go through their doctor, and weight loss can change what they need. A reading over 180/120, chest pain or shortness of breath means call a doctor or 911 now. If they mention wanting to hurt themselves or feeling hopeless, stop, say you are glad they told you, and give the 988 Suicide and Crisis Lifeline (call or text 988 in the US). You are an automated helper, not a person; say so if asked.';

export const SETTINGS = {   // what the coach may offer as a change: label, low, high
  daily_kcal: ['Daily calories', 1000, 4500], walk_min_per_week: ['Walking minutes a week', 0, 1400], bike_min_per_week: ['Riding minutes a week', 0, 1400],
  workout_goal_per_week: ['Workouts a week', 0, 14], water_goal_oz: ['Water a day (oz)', 0, 300], protein_goal_g: ['Protein a day (g)', 40, 400],
  target_date: ['Target date', null, null], diet: ['Diet', null, null],
};
export const DIET_IDS = ['lowcarb', 'keto', 'carnivore', 'clean', 'mediterranean'];

export function checkSetting(setting, value, today) {
  if (!SETTINGS[setting]) throw new Error(`unknown setting ${setting}`);
  const v = String(value).trim(), [label, lo, hi] = SETTINGS[setting];
  if (setting === 'diet') { if (!DIET_IDS.includes(v)) throw new Error('diet must be one of ' + DIET_IDS.join(', ')); return v; }
  if (setting === 'target_date') {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v))) throw new Error('target_date must be YYYY-MM-DD');
    if (v <= today) throw new Error('the target date has to be in the future');
    return v;
  }
  const n = Math.round(Number(v));
  if (!isFinite(n) || n < lo || n > hi) throw new Error(`${label.toLowerCase()} has to be between ${lo} and ${hi}`);
  return String(n);
}

const UNITS = ['oz', 'tbsp', 'tsp', 'cup', 'egg', 'slice', 'link', 'patty', 'stick', 'can', 'clove', 'stalk', 'spear', 'olive', 'wing', 'pepper', 'onion', 'cucumber', 'avocado', 'medium'];

export const KINDS = {
  coach: {
    system: `You are the coach inside Steadfast, a personal app for losing weight and getting stronger. You talk with one person about their own numbers: weigh-ins, the forecast, blood pressure, workouts, the meal plan, their diet, their daily check-ins and their own notes.

Before each reply you get a fresh summary of their numbers as JSON. Trust it over anything said earlier, and never invent numbers that are not in it; if something is missing, say so plainly.

How to coach:
- Start from the numbers: the 7-day average and rate per week, actual against the forecast line, training done against planned, the week's meals, sleep and water from the check-ins, their notes.
- Give one to three concrete recommendations tied to a number, about what to do this week.
- Plain, short sentences. Under about 150 words unless they ask for more. No hype, no moralizing, no lectures. Direct and kind.
- Ask one question back when the answer would change your advice.
- When a recommendation is a change the app can make, call suggest_change so it shows up as a button: daily calories, walking or riding minutes a week, workouts a week, water or protein goal, the target date, or the diet. Say it is there to apply. Never say a change is made; the person decides.
- Take pushback seriously: adjust, or explain the tradeoff with their own numbers.
- Day-to-day scale swings are water and salt; judge by the 7-day average over two or more weeks.
- Diets in the app: lowcarb, keto, carnivore, clean (whole-food reset), mediterranean. Respect the one they chose; suggest a switch only with a reason from their numbers.
- ${SHARED_SAFETY}`,
    tools: [{
      name: 'suggest_change', strict: true,
      description: 'Offer the person a change to one of their settings. It appears under your reply as a card they apply or dismiss; it changes nothing by itself. value: a whole number for calories, minutes, workouts, water and protein; YYYY-MM-DD for target_date; for diet one of lowcarb, keto, carnivore, clean, mediterranean.',
      input_schema: { type: 'object', additionalProperties: false, required: ['setting', 'value', 'why'], properties: {
        setting: { type: 'string', enum: Object.keys(SETTINGS) }, value: { type: 'string' }, why: { type: 'string', description: 'One short sentence: the reason, from their numbers.' } } },
    }],
  },
  mycode: {
    system: `You help one person write their own code: a one-page set of reasons and rules they live by while they lose weight and get stronger. It is theirs, in their words, and they will read it on hard days.

- Ask one question at a time, short and plain. Build on what they said. No lists of questions, no lectures.
- Cover, roughly in order, what you still need: why they are doing this and for whom; what they are done with; how they eat; how they move; what they do on a bad day or after a slip; what they tell themselves when it gets hard; what they promise.
- Use their words. Make it sound like them, not a poster. Short sentences. No hype, no moralizing.
- After about six to eight answers, or sooner if they ask, call write_code with a full draft, then say in a sentence or two that the draft is below and ask what to change. Revise by calling write_code again with the whole updated draft.
- A good code: a title (usually "My Code"), a short eyebrow line (their name, or "Rules I keep"), four to seven sections; each a heading of one to three words, one lead line that states the rule, and one to three short lines in their voice.
- Never borrow wording from anyone else's code. Keep health claims modest.
- ${SHARED_SAFETY}`,
    tools: [{
      name: 'write_code', strict: true,
      description: 'Show the person a full draft of their code below the conversation. Always send the whole code, not a change.',
      input_schema: { type: 'object', additionalProperties: false, required: ['eyebrow', 'title', 'sections'], properties: {
        eyebrow: { type: 'string' }, title: { type: 'string' },
        sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading', 'lead', 'lines'], properties: {
          heading: { type: 'string' }, lead: { type: 'string' }, lines: { type: 'array', items: { type: 'string' } } } } } } },
    }],
  },
  kitchen: {
    system: `You are the kitchen helper inside Steadfast. You learn what one person likes and dislikes, and you write recipes for them that fit their diet, built only from the foods in the app's food list. You also cook from what they have on hand.

The context gives their diet, the foods they may use (id, name, light, units; green and unlocked foods fit their diet), their likes and dislikes so far, what is on hand, and the recipes they already have.

Interview:
- Ask one short question at a time: favorite proteins, foods they won't eat or are allergic to, how much time they have on weekdays, what they cook with (grill, slow cooker, air fryer, stove only), how spicy, cooking for one or a family, and meals they miss. Skip what you already know.
- When they say they like or won't eat a food in the list, call set_food_preference (like, dislike, or allergy). Dislikes and allergies keep that food out of their plans.

Recipes:
- When you know enough, or they ask, call create_recipe for two to four recipes they would want, each its own call. Use only food ids from the list, and only foods that fit their diet (light green, or yellow and unlocked). Never use a disliked or allergy food.
- Protein first: aim for 30 to 50 g of protein in a breakfast, lunch or dinner. Keep instructions short, one sentence a step, with times and temperatures.
- Quantities are one serving, in the units the food list gives for that food (oz, tbsp, tsp, cup, egg, slice...).
- When they ask to cook from what they have, use only on-hand foods plus salt, pepper and spices, and say if one more item would make it much better.
- After creating recipes, say in a sentence that they are below to add to their recipes. They are not saved until the person adds them.
- Plain, short sentences. ${SHARED_SAFETY}`,
    tools: [
      { name: 'set_food_preference', strict: true,
        description: 'Record that the person likes, dislikes or is allergic to a food in the list. Dislike and allergy keep it out of their meal plans; like makes the planner pick it more.',
        input_schema: { type: 'object', additionalProperties: false, required: ['food_id', 'choice'], properties: {
          food_id: { type: 'string' }, choice: { type: 'string', enum: ['like', 'dislike', 'allergy'] } } } },
      { name: 'create_recipe', strict: true,
        description: 'Show the person a new recipe as a card they can add to their recipes. Use only food ids from the list.',
        input_schema: { type: 'object', additionalProperties: false, required: ['name', 'meal_type', 'portable', 'batch', 'instructions', 'ingredients'], properties: {
          name: { type: 'string' }, meal_type: { type: 'string', enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
          portable: { type: 'boolean', description: 'Travels in a cooler bag.' }, batch: { type: 'boolean', description: 'Cooked ahead in a batch.' },
          instructions: { type: 'string' },
          ingredients: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['food_id', 'qty', 'unit'], properties: {
            food_id: { type: 'string' }, qty: { type: 'number' }, unit: { type: 'string', enum: UNITS } } } } } } },
    ],
  },
};

/** Check a tool call before it reaches the person. Returns a cleaned input, or throws with a reason the model can fix. */
export function checkTool(kind, name, input, ctx) {
  const today = ctx.today || new Date().toISOString().slice(0, 10);
  if (kind === 'coach' && name === 'suggest_change') {
    return { setting: input.setting, value: checkSetting(input.setting, input.value, today), why: String(input.why || '').slice(0, 300) };
  }
  if (kind === 'mycode' && name === 'write_code') {
    const t = (x, n) => String(x == null ? '' : x).replace(/\s+/g, ' ').trim().slice(0, n);
    const sections = (input.sections || []).slice(0, 9).map(s => ({ heading: t(s.heading, 60), lead: t(s.lead, 300), lines: (s.lines || []).slice(0, 4).map(x => t(x, 300)).filter(Boolean) }))
      .filter(s => s.heading && s.lead);
    if (!sections.length) throw new Error('a code needs at least one section with a heading and a rule');
    return { eyebrow: t(input.eyebrow, 80), title: t(input.title, 40) || 'My Code', sections };
  }
  if (kind === 'kitchen' && name === 'set_food_preference') {
    if (!ctx.foodIds.has(input.food_id)) throw new Error(`no food with id ${input.food_id}; use an id from the food list`);
    if (!['like', 'dislike', 'allergy'].includes(input.choice)) throw new Error('choice must be like, dislike or allergy');
    return { food_id: input.food_id, choice: input.choice };
  }
  if (kind === 'kitchen' && name === 'create_recipe') {
    const ing = (input.ingredients || []).map(i => ({ food_id: String(i.food_id), qty: Number(i.qty), unit: String(i.unit) }));
    const bad = ing.filter(i => !ctx.foodIds.has(i.food_id)).map(i => i.food_id);
    if (bad.length) throw new Error(`these are not in the food list: ${bad.join(', ')}; use only listed ids`);
    const off = ing.filter(i => ctx.offIds.has(i.food_id)).map(i => i.food_id);
    if (off.length) throw new Error(`these do not fit their diet or they dislike them: ${off.join(', ')}`);
    if (!ing.length || ing.some(i => !(i.qty > 0) || i.qty > 64)) throw new Error('every ingredient needs a quantity between 0 and 64');
    if (!String(input.name || '').trim() || !['breakfast', 'lunch', 'dinner', 'snack'].includes(input.meal_type)) throw new Error('a recipe needs a name and a meal type');
    return { name: String(input.name).trim().slice(0, 80), meal_type: input.meal_type, portable: !!input.portable, batch: !!input.batch,
      instructions: String(input.instructions || '').trim().slice(0, 1500), ingredients: ing.slice(0, 15) };
  }
  throw new Error(`unknown tool ${name}`);
}

// ---------- one conversation turn ----------
function trimHistory(history) {
  const h = (history || []).filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-HISTORY_SENT).map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  while (h.length && h[0].role !== 'user') h.shift();
  if (!h.length) throw new AIError('Say something first.', 400);
  return h;
}

/** deps: { anthropic(params) -> message, fetchJson(url, key, body, method) -> json }.
    Returns { replies, refused, cards: [{tool, input}], usage: {tokens_in, tokens_out} }. */
export async function runTurn(cfg, kind, history, context, ctx, deps, rounds = 4) {
  const K = KINDS[kind];
  if (!K) throw new AIError('Unknown conversation.', 400);
  if (!configured(cfg)) throw new AIError("AI is not set up yet. The app's owner adds a key on the AI setup page.", 503);
  const msgs = trimHistory(history), contextText = 'Current context:\n' + JSON.stringify(context);
  const p = cfg.provider, model = modelFor(cfg, p), key = cfg.keys[p];
  const out = { replies: [], refused: false, cards: [], usage: { tokens_in: 0, tokens_out: 0 }, provider: p, model };
  const handle = (name, input) => {
    try { const clean = checkTool(kind, name, input || {}, ctx); out.cards.push({ tool: name, input: clean }); return [true, 'Shown to the person; nothing is saved until they choose to.']; }
    catch (e) { return [false, 'Not shown: ' + e.message]; }
  };

  if (PROVIDERS[p].kind === 'anthropic') {
    const messages = msgs.concat([{ role: 'system', content: contextText }]);   // fresh numbers as a mid-conversation system message
    for (let r = 0; r < rounds; r++) {
      const params = { model, max_tokens: MAX_OUTPUT, system: K.system, tools: K.tools, messages, cache_control: { type: 'ephemeral' } };
      if (CLAUDE_EFFORT.has(model)) params.output_config = { effort: 'low' };
      if (CLAUDE_FALLBACK.has(model)) Object.assign(params, { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' });
      const resp = await deps.anthropic(params, key);
      out.usage.tokens_in += (resp.usage && resp.usage.input_tokens) || 0;
      out.usage.tokens_out += (resp.usage && resp.usage.output_tokens) || 0;
      if (resp.stop_reason === 'refusal') { out.refused = true; break; }
      const results = [];
      for (const b of resp.content || []) {
        if (b.type === 'text' && b.text.trim()) out.replies.push(b.text.trim());
        else if (b.type === 'tool_use') {
          const [ok, text] = handle(b.name, typeof b.input === 'string' ? JSON.parse(b.input) : b.input);
          results.push(Object.assign({ type: 'tool_result', tool_use_id: b.id, content: text }, ok ? {} : { is_error: true }));
        }
      }
      if (resp.stop_reason === 'tool_use' && results.length) { messages.push({ role: 'assistant', content: resp.content }, { role: 'user', content: results }); continue; }
      break;
    }
    return out;
  }

  const url = PROVIDERS[p].baseUrl + '/chat/completions';
  const messages = [{ role: 'system', content: K.system + '\n\n' + contextText }].concat(msgs);
  const tools = K.tools.map(t => ({ type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }));
  for (let r = 0; r < rounds; r++) {
    const data = await deps.fetchJson(url, key, { model, messages, max_tokens: MAX_OUTPUT, tools, tool_choice: 'auto' });
    out.usage.tokens_in += (data.usage && data.usage.prompt_tokens) || 0;
    out.usage.tokens_out += (data.usage && data.usage.completion_tokens) || 0;
    const choice = (data.choices || [{}])[0], msg = choice.message || {};
    if (choice.finish_reason === 'content_filter') { out.refused = true; break; }
    let text = msg.content || '';
    if (Array.isArray(text)) text = text.map(x => (x && x.text) || '').join('');
    if (text.trim()) out.replies.push(text.trim());
    const calls = msg.tool_calls || [];
    if (!calls.length) break;
    messages.push({ role: 'assistant', content: text || null, tool_calls: calls });
    for (const c of calls) {
      const fn = c.function || {};
      let ok, res;
      try { [ok, res] = handle(fn.name, typeof fn.arguments === 'string' ? JSON.parse(fn.arguments || '{}') : fn.arguments); }
      catch (e) { ok = false; res = 'The arguments were not valid JSON.'; }
      messages.push({ role: 'tool', tool_call_id: c.id || '', content: ok ? res : 'Error: ' + res });
    }
  }
  return out;
}

export async function listModels(cfg, provider, deps) {
  const key = cfg.keys[provider];
  if (!key) throw new AIError('Save a key for this provider first.', 409);
  if (PROVIDERS[provider].kind === 'anthropic') return (await deps.anthropicModels(key)).sort().reverse();
  const data = await deps.fetchJson(PROVIDERS[provider].baseUrl + '/models', key, null, 'GET');
  return (data.data || []).map(m => String(m.id || '').replace(/^models\//, '')).filter(Boolean).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
}

/** One short exchange, to show the setup works. */
export async function testConnection(cfg, deps) {
  const p = cfg.provider, model = modelFor(cfg, p), key = cfg.keys[p];
  if (PROVIDERS[p].kind === 'anthropic') {
    const resp = await deps.anthropic({ model, max_tokens: 200, messages: [{ role: 'user', content: 'Say hello in one short sentence and name the AI model you are.' }] }, key);
    return { ok: resp.stop_reason !== 'refusal', reply: (resp.content || []).filter(b => b.type === 'text').map(b => b.text).join(' ').slice(0, 300), usage: resp.usage };
  }
  const data = await deps.fetchJson(PROVIDERS[p].baseUrl + '/chat/completions', key, { model, max_tokens: 200, messages: [{ role: 'user', content: 'Say hello in one short sentence and name the AI model you are.' }] });
  const msg = ((data.choices || [{}])[0].message || {});
  return { ok: !!msg.content, reply: String(msg.content || '').slice(0, 300) };
}

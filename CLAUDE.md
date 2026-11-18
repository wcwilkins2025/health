# CLAUDE.md — Steadfast Health (health)

Static site on GitHub Pages (`wcwilkins2025/health`, Pages from `main` at the root), data in a Supabase project with row-level security. Public repo: no personal data, names, numbers or paths in any file or commit. The owner's notes and state files stay in the private local folder `C:\Projects\weight-target\docs\state\`.

## Layout

- `data/library.js` the food library and recipes (`window.HT_LIB`). The only place recipes are edited. Ids are slugs and permanent: plans refer to them. Add, never rename an id.
- `js/store.js` the person's rows in memory (`S.db[table]`), written through to Supabase; `HT.memoryStore()` for tests and the localhost preview.
- `js/engine.js` (`HT.E`) all the arithmetic, ported from the Python app: weight and BP stats, nutrition, planner and shopping list, forecast and fit, the adaptive training week, the workout log, the blog.
- `js/api.js` `HT.route(S, method, path, body)`: the old server's `/api/...` routes answered in the browser. Pages call `api(path, opts)` (in `js/app.js`) exactly as they called the server.
- `js/import.js` Gym ACE and old-app SQLite files read with sql.js in the browser.
- `js/app.js` sign-in check (Supabase session, else `account.html`), welcome gate, nav, `api()`, `importFile()`, `download()`, page helpers.
- Daily check-in (`checkins`, one row per date): energy, focus, mood 1 to 10, sleep hours, water oz, habits `{key: true}` for the keys in `E.HABITS`. Goals are settings `water_goal_oz` and `protein_goal_g` (blank = 1 g per lb of the target weight).
- Diets (setting `diet`, `E.DIETS`): `E.dietLight` recolors each library food by its category, id and `tags` (processed, seed_oil, sweetener, alcohol); the library's own light is the low-carb one. A person's own changes in `foods_custom` still win. Keto adds a per-meal net-carb cap. `E.mealFits` decides what the planner and the recipe list use; every diet must keep at least 4 recipes of each meal type (tested).
- AI: `supabase/functions/ai/core.js` (plain JS: providers, tiers, prompts and tools for coach / mycode / kitchen, `runTurn`, tested in node) and `index.ts` (Deno: auth; whose key by `core.chooseConfig`: the owner (row in `app_owners`, set in SQL) and invited people (`invited_at`) use the owner's `ai_config`, invited people under the daily limit; self-signed-up people use their own `user_ai_keys`, set with the `my_*` actions; the owner's with `admin_*`. Keys unreadable by browsers; `ai_usage.billed_to` owner or self). The browser calls it through `HT.aiCall` (`js/app.js`); `js/api.js` routes `/api/ai/{kind}` store messages and cards in `ai_messages` / `ai_cards`; `js/chat.js` is the shared chat UI. Context builders: `E.coachContext`, `E.kitchenContext`, `E.codeContext`.
- Kitchen: likes and dislikes are `foods_custom.data.pref` (dislike and allergy turn the food red), on-hand foods are `pantry`, recipes a person adds are `meals_custom` (ids `u-meal-…`, merged into `E.meals`). Planning `pantry_from: 'kitchen'` uses on-hand foods plus `E.STAPLES`; the planner leans toward liked foods.
- Training beyond lifting: `activities` (kind, minutes, intensity, distance, kcal = extra burn above resting from `E.ACTIVITIES` METs and the latest weight). Shown in the week as `what: Activity`, 20 min or more counts as a workout day, in the blog and the coach context. `data/exercises.js` is the exercise library (group, equipment) and starter routines for the Log page picker.
- `js/store.js` load skips a table the database does not have yet (PGRST205), so a page newer than the schema still opens.
- Open sign-up: `account.html` is the signed-out front page (what it does, Create account, Sign in). Both email a 6-digit code (`signInWithOtp`, `shouldCreateUser` true only for Create account) checked with `verifyOtp` type `email`; no passwords, no links in the emails. The pending email is kept an hour in localStorage so a phone reload keeps the code box. Link previews (og/twitter tags, `og-image.png`) on `index.html` and `account.html`.
- `supabase/schema.sql` tables, one "own rows" policy per table, `delete_me()`.
- Plan day and slot ids are numbers made from the plan id: day = plan*10 + day index, slot = plan*100 + day*10 + slot index.

## Conventions

- Dates are local `YYYY-MM-DD`; `HT.now` overrides today in tests.
- Plain JS, no build step. Cache-bust with `?v=` on script and style links when they change.
- Colors: the shared Homestead Ready nature palette (master `C:\Projects\homestead-ready\palette.css`), light (daylight field) and dark (night woods) by `prefers-color-scheme` or `data-theme`; use only its values. Charts and legends read the tokens (`cssVar("--accent")`, `--c:var(--red)`), never hex. Type: Barlow Condensed + Source Serif 4. The My Code sheet keeps its own printable paper look.
- Today first and loud on every day-based view. Phone first for the log and the shopping list.
- Training lives on Training and Log; the dashboard Move line points there.

## Checks

`npm test` (engine and router over the memory store; sql.js for the imports). Preview: `python -m http.server 8792` in this folder, open `http://localhost:8792` — with no Supabase values in `config.js` it runs as one local person in that browser.

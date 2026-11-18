# Steadfast Health

Meal plans, a shopping list, weigh-ins, blood pressure, a daily check-in, a workout log, a forecast and a daily blog, for getting to a goal weight on a low-carb, protein-first diet. Works on a phone; add it to the home screen and it opens like an app.

Live at **https://steadfasthealth.org**. Free, no ads; anyone can create an account. The coach, the kitchen helper and the My Code builder run on each person's own AI key (Groq and Gemini can be tried for free); people the owner invites use the owner's key.

## How it is built

A static site on GitHub Pages. Each person's rows live in a Supabase project, and the row rules in `supabase/schema.sql` let each signed-in person read and change only their own. The arithmetic runs in the browser: `js/engine.js` (statistics, nutrition, the planner, the check-in, the forecast, the training week, the log, the blog) answers the pages through `js/api.js`, which reads and writes through `js/store.js`. The food library and recipes are the same for everyone and ship with the site in `data/library.js`.

`config.js` holds the Supabase project URL and the publishable key, which are made to be public. The secret key is never in this repo.

The AI runs in a Supabase Edge Function (`supabase/functions/ai`): `core.js` holds the providers, the three conversations and the turn loop (tested in node), `index.ts` checks the person, enforces the daily limit and keeps the key in a table no browser can read.

## Pages

| Page | What it does |
|---|---|
| `index.html` | Today first: what to eat, what to move, the numbers, the chart. |
| `weight.html` | Weigh-ins, the forecast from an energy balance, the goal date and what it takes. |
| `bp.html` | Blood pressure readings with 7- and 30-day averages and the bands. |
| `checkin.html` | The day's water against a goal, protein planned against a goal, energy, focus and mood out of 10, sleep, and four habits, with seven-day averages. |
| `training.html` | The week by day: what was lifted, what was missed, what is still owed. Sessions, volume, records. Gym ACE import. |
| `log.html` | Log a workout on the phone: last time's sets to beat, a rest timer, your workouts and their exercises. |
| `plan.html` | The week's meals, swaps, away days, build a week from last week's groceries. |
| `recipes.html` | Every recipe with its macros. |
| `shopping.html` | The week's list by store section; copy it to paste into Bring! or Notes. |
| `foods.html` | Your diet (low-carb, keto, carnivore, whole-food reset, Mediterranean), then green, yellow, red under it. Unlock a yellow food after testing it; ban one. |
| `blog.html` | A daily post written from the numbers, with room for your own words; save the whole blog as one page. |
| `coach.html` | The coach: a conversation about your own numbers; suggestions come as cards you apply or dismiss. |
| `kitchen.html` | The kitchen helper interviews you about likes and dislikes and writes recipes for your diet; tick what's on hand to get recipes or a week's plan from it. |
| `code-builder.html` | Builds your My Code in an interview, in your own words. |
| `ai-setup.html` | The owner picks the AI (Claude, Grok, Groq, Gemini, OpenAI), pastes a key, sets the cost tier and daily limit. |
| `account.html` | Sign in or create an account with a 6-digit emailed code, import old data, My Code, download everything, delete the account. |

## Running it

Open the pages from any static server. Without a Supabase project in `config.js`, a page opened from `localhost` runs as one local person with the rows kept in that browser, which is how it is checked before a change goes out:

```
python -m http.server 8792
```

Tests run the engine and the router over an in-memory store:

```
npm install
npm test
```

Setting up a Supabase project, inviting people and bringing in data from the old app or Gym ACE: [`docs/SETUP.md`](docs/SETUP.md).

Nutrition figures are estimates within about 10 percent. This is a personal tool, not medical advice; blood pressure or blood sugar medicine changes go through a doctor.

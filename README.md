# whymycatdoesntloveme.com

A one-page site: spin a weighted wheel, get a funny reason your cat doesn't
love you, with a looping background jingle.

## Structure

- `index.html` — page markup
- `style.css` — placeholder styling (swap once a visual style is picked)
- `app.js` — loads `wheel-options.json`, picks a weighted result, handles
  the mute button and starting audio on first click
- `wheel-options.json` — the wheel's outcomes and their odds; edit this file
  and push to change what the wheel says, no other code changes needed
- `music/jingle.m4a` — background loop (not included yet; drop it in this
  folder once recorded)

## Running it locally

No build step. Open `index.html` directly in a browser, or serve the folder
with any static server (e.g. `npx serve .`) so `fetch()` can load the JSON
file (some browsers block `fetch` on `file://` URLs).

## Deploying

Push to the `main` branch on GitHub; Cloudflare Pages is connected to this
repo and redeploys automatically within about a minute.

## Editing the wheel

Open `wheel-options.json`. Each entry is `{ "label": "...", "weight": N }`.
Weights don't have to sum to 100, but keeping them that way makes the odds
readable at a glance. Commit and push when done.

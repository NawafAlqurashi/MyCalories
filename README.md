# MyCalories

A mobile-first PWA for logging meals (with photo/label-based calorie & macro
estimates) and tracking gym progress — weight, reps, and sets per exercise
over time.

## Features

- **Log a meal four ways** — Photo (snap food or a nutrition label), Voice
  (speak a description, transcribed in-browser), Text (type a description),
  or Manual (enter exact macros). Photo/Voice/Text go through an AI estimate
  you can edit before saving.
- **Barcode scanning** — scan a packaged food's barcode (or type the number)
  to pull real nutrition facts from Open Food Facts; scanned products are
  saved to a personal collection for instant re-logging.
- **Saved meal templates** — save any logged meal as a template and re-log it
  in one tap from the Meals collection.
- **Personalized targets** — enter your weight, height, age, activity level,
  and goal in Settings; daily calorie/macro targets are computed with the
  Mifflin-St Jeor formula, not hardcoded.
- **Dashboard** — week-day strip with navigation between days, a streak
  counter, calorie/macro cards with a Consumed/Remaining toggle, and meals
  grouped by breakfast/lunch/dinner/snack.
- **Gym tracking** — log weight × reps × sets per exercise and see a progress
  chart over time.
- **Weekly plan** — assign a label to each day of the week (e.g. Wed = Upper
  Body, Thu = Padel, Fri = Rest) shown as a calendar strip on the Gym tab,
  editable in one place.
- **Installable** — has a web app manifest and icons, so it can be added to
  your phone's home screen and used like a native app.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Meal, exercise, and workout data is stored locally in a SQLite file at
`data/app.db` (created automatically, not committed to git).

### Enabling real photo analysis

Without an API key, the photo/label analyzer returns a clearly-labeled demo
estimate so the app is fully usable end to end. To get real AI-based
nutrition estimates from photos:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com).
2. Copy `.env.example` to `.env` and set `ANTHROPIC_API_KEY=sk-...`.
3. Restart the dev server.

### Browser support notes

- **Voice** uses the Web Speech API, which is Chrome/Android-only today —
  other browsers fall back to a message suggesting Text mode.
- **Live barcode scanning** uses the `BarcodeDetector` API (Chrome/Android).
  Where it's unavailable, a manual barcode-number field always works as a
  fallback.

## Deploying

This is a standard Next.js app and can be deployed to any Node.js host (e.g.
Vercel). Set the `ANTHROPIC_API_KEY` environment variable on the host. Note
that the local SQLite file does not persist across deploys/serverless
instances — for a deployed, multi-device setup, swap `src/lib/db.ts` for a
hosted database.

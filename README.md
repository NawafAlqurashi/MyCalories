# MyCalories

A mobile-first PWA for logging meals (with photo/label-based calorie & macro
estimates) and tracking gym progress — weight, reps, and sets per exercise
over time.

## Features

- **Log a meal** — take a photo of your food or a nutrition label, enter the
  weight in grams, and get an estimated calorie/macro breakdown you can edit
  before saving. A manual entry mode is also available.
- **Today dashboard** — running totals for calories, protein, carbs, and fat.
- **Gym tracking** — log weight × reps × sets per exercise and see a progress
  chart over time.
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

## Deploying

This is a standard Next.js app and can be deployed to any Node.js host (e.g.
Vercel). Set the `ANTHROPIC_API_KEY` environment variable on the host. Note
that the local SQLite file does not persist across deploys/serverless
instances — for a deployed, multi-device setup, swap `src/lib/db.ts` for a
hosted database.

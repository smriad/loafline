# Loafline

**Loafline** is a Hacktoberfest Week 3 (*Slow and Steady*) project: open-weight AI that **rewards laziness** by telling you which commitments you can safely defer, with the smallest closing action and a “safe until” date.

## What it does

1. You paste text or record a short voice memo.
2. **Gemma** (open-weight via OpenRouter) extracts who/what/when.
3. **TabPFN** classifies defer risk from tabular features (with a bundled training set).
4. **Tinker** polishes the sloth-friendly verdict copy.
5. **Backboard** recalls patterns; **SerpApi** optionally grounds deadlines.
6. **Tiger Data** (pgvector) surfaces similar past promises.
7. **MongoDB Atlas** stores the ledger; **ElevenLabs** transcribes voice and reads the verdict aloud.
8. **Sentry** traces the pipeline; **Mastra** orchestrates the workflow.
9. Deploy on **Render** (`render.yaml`).

## Local dev

```bash
cp .env.example .env.local
# fill keys
npm install
npm run dev
```

Set `DEMO_MODE=true` to try the UI without APIs.

## Render deploy

Repo: [github.com/smriad/loafline](https://github.com/smriad/loafline)

### Option A — Blueprint (recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect GitHub and select **`smriad/loafline`**.
3. Render reads `render.yaml` and creates the **loafline** web service.
4. When prompted, set **secret** env vars (same values as your `.env.local`, never commit them):
   - `OLLAMA_API_KEY`, `OLLAMA_BASE_URL`
   - `PRIORLABS_API_KEY`
   - `MONGODB_URI` (use `MONGODB_DB=loafline`)
   - `TIGER_DATABASE_URL`
   - `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`
   - `SENTRY_DSN`, `SERPAPI_API_KEY`
   - `BACKBOARD_API_KEY`, `BACKBOARD_ASSISTANT_ID`
   - `TINKER_API_KEY`, and either `TINKER_MODEL` or `TINKER_BRIEF_MODEL`
5. Set `DEMO_MODE=false` for the live demo.
6. Deploy. Health check path: **`/api/health`**.

### Option B — Manual web service

| Setting | Value |
|--------|--------|
| Runtime | Node |
| Build | `npm install && npm run build` |
| Start | `npm start` |
| Health check | `/api/health` |
| Node version | 22 |

Add all variables from `.env.example` under **Environment**.

### After deploy

- Open `https://<your-service>.onrender.com`
- Run a **Loaf check** and confirm **Partner stack** shows partners as live.
- Paste the URL into your DEV submission (Best Use of **Render**).

## Prize categories (list in your DEV post)

- Best Use of **Render**
- Best Use of **Gemma**
- Best Use of **TabPFN**
- Best Use of **Tinker**
- Best Use of **MongoDB Atlas**
- Best Use of **Tiger Data**
- Best Use of **ElevenLabs**
- Best Use of **Backboard**
- Best Use of **SerpApi**
- Best Use of **Sentry Agent Tracing**
- Best Use of **Mastra**

## License

MIT

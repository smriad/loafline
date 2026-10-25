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

1. New **Web Service** → connect repo.
2. Use `render.yaml` or set build `npm install && npm run build`, start `npm start`.
3. Add environment variables from `.env.example`.
4. Health check: `/api/health`.

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

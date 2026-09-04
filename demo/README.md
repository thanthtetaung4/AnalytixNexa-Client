# The demo recording

A scripted Playwright run that records the product as one continuous take, then
encodes it for GitHub.

```bash
npm run demo          # record + encode  -> demo/out/analytixnexa-demo.mp4
npm run demo:record   # record only      -> demo/out/raw.webm + chapters.json
npm run demo:encode   # encode only, from an existing raw.webm
```

## What it needs running

| | |
| --- | --- |
| API | `make up` in `../analytixNexa-api`, with `OPENROUTER_API_KEY` set — the take selects the AI engine, so it has to be *available* |
| Demo data | `make seed` — the take starts from a workspace that already has files in it, because an empty one demos nothing |
| Mail | Mailpit, which `docker compose up` starts, on `:8025` |
| Client | `npm run dev` on `:5173` |
| Browser | `npx playwright install chromium` once, if this machine has never run Playwright |

Everything is overridable: `DEMO_APP_URL`, `DEMO_API_URL`, `DEMO_MAIL_URL`,
`DEMO_EMAIL`, `DEMO_PASSWORD`.

**The analysis in the video is real.** The take drives the actual AI engine
against the actual model, so the report on screen is one the agent wrote, not a
fixture. It costs about a tenth of a cent and takes ~20 seconds — which
`postprocess.mjs` compresses, see below.

The take resets what it needs before recording: it deletes any previous copy of
the uploaded CSV (the client refuses duplicate filenames, so a second run would
otherwise fail on the upload) and empties the Mailpit inbox. Re-running is safe.

## What it shows

1. Sign in
2. The overview — headline numbers, latest analysis, files
3. Uploading `outdoor-retail-h1.csv`, whose columns are deliberately *wrong*:
   `Purchase Date` (day-first), `Item Name`, `Line Total`, `Shopper Email`,
   and a `Retail Price` sitting next to the real revenue column to see if the
   agent takes the bait
4. Choosing the AI engine and asking a question
5. The run
6. The result: headline, findings, the charts the engine chose
7. **The audit trail** — the part worth pausing on, because it shows the agent
   picked `Line Total` over `Retail Price`, `Shopper Email` for customers, and
   parsed the day-first dates
8. Password reset by email, and the mail arriving in Mailpit
9. Light/dark and the collapsing sidebar

## The pieces

| File | |
| --- | --- |
| `record-demo.mjs` | the take: one page, one video, chapter marks to `out/chapters.json` |
| `overlay.js` | captions and a painted cursor, injected with `addInitScript` |
| `postprocess.mjs` | speeds through the wait, encodes MP4 + GIF + poster |
| `outdoor-retail-h1.csv` | the awkwardly-named upload |

Two details worth knowing before editing:

- **One page for the whole take**, including the hop to Mailpit. Playwright
  writes one video per `Page`, so opening a second tab would leave you with two
  files to stitch.
- **The cursor is painted, not real.** Playwright's video does not draw the
  pointer, so a recording of clicks would be things happening for no visible
  reason. `click()` moves the painted cursor to the target, ripples, *then*
  clicks.

`postprocess.mjs` uses the `waiting`/`waited` chapter marks to play the first
2.5s of the analysis at normal speed and the remaining ~17s at 6×. Nothing else
is retimed — the rest is real time, including how long the charts take to draw.

## Posting it on GitHub

`demo/out/` is git-ignored. Two ways to publish, and the first is usually right:

**Upload the MP4 (recommended).** Open the README (or an issue, PR, or release)
in the GitHub web editor and drag `demo/out/analytixnexa-demo.mp4` into the text
box. GitHub hosts it and inserts a URL that renders as an inline player. Nothing
lands in the repository, so cloning stays cheap. GitHub accepts `.mp4` and
`.mov` up to 10 MB on a free plan — this file is ~4 MB.

**Commit the GIF.** `analytixnexa-demo.gif` is a 16-second cut of the analysis
finishing and the report appearing, sized to stay around 4 MB. Drop the
`demo/out/` ignore rule for it, commit, and embed it the ordinary way:

```markdown
![AnalytixNexa demo](demo/out/analytixnexa-demo.gif)
```

That works on any Git host and in offline clones, at the cost of ~4 MB in the
repository forever. `poster.jpg` is there if you want a click-through thumbnail
pointing at an uploaded MP4 instead.

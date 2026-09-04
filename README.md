# AnalytixNexa Client

React front end for the [AnalytixNexa API](../analytixNexa-api): upload a CSV of
sales data, run it through an analysis engine, read the customer, revenue and
seasonality breakdowns.

Vite + React 18, MUI 5, Chart.js. Auth, files and results all come from the
API — there is no third-party backend in the client any more.

## Demo video

```bash
npm run demo     # records the app end to end -> demo/out/analytixnexa-demo.mp4
```

A scripted Playwright take: sign in, upload a CSV whose columns are deliberately
non-standard, run the AI analyst against it, read the report and its audit
trail, reset a password by email, toggle the theme. The analysis in it is real,
not a fixture. See [`demo/README.md`](demo/README.md) for what it needs running
and how to attach the file to a GitHub README.

## Running the full stack

```bash
# 1. the API (in ../analytixNexa-api)
make up            # Postgres + FastAPI on http://localhost:8000
make seed          # demo@analytixnexa.io / demo1234, with sample data

# 2. the client (here)
npm install
npm run dev        # http://localhost:5173
```

The dev server proxies `/api` and `/health` to `http://localhost:8000`, so the
browser sees one origin and no CORS preflights. Point it elsewhere with
`VITE_API_PROXY_TARGET`, or bypass the proxy entirely in a build with
`VITE_API_BASE_URL` (see `.env.example`).

On the sign-in page, **Explore the demo workspace** signs in as the seeded demo
account — three datasets, two analysed, one queued — so the workspace has
something to show before you upload anything.

```bash
npm run build      # production bundle into dist/
npm run lint       # eslint, zero warnings tolerated
npm run preview    # serve the built bundle
```

## How it talks to the API

```
src/api/
├── client.js      base URL, bearer token, single-flight refresh, ApiError
├── session.js     the token pair + user, in local/sessionStorage, one source
├── auth.js        /auth/*, /users/me
├── datasets.js    /datasets/*
├── analyses.js    /analyses/*, plus queue-then-poll helpers
├── system.js      /health, /analyses/providers
├── normalize.js   API payloads -> the view models the screens render
└── demo.js        the demo account the sign-in button uses
```

* **Tokens.** Login returns a short-lived access token plus a rotating refresh
  token. `client.js` attaches the access token, refreshes it when it has expired
  or a call comes back `401`, and retries once. Concurrent 401s share a single
  refresh so the API never sees a rotation race. If the refresh fails the
  session is dropped and the app falls back to sign-in.
* **"Keep me signed in"** picks `localStorage` over `sessionStorage`. Sign-in
  and sign-out in one tab propagate to the others through a `storage` listener.
* **Errors.** The API answers with `{"error": {"code", "message", "details"}}`.
  `ApiError` carries `status`, `code` and `details`, so screens branch on the
  code and repeat the API's own message where it is specific (a missing column,
  an upload limit) instead of inventing a vague one.
* **Analyses are queued.** `POST /datasets/{id}/analyses` returns `202` with a
  pending job; `runAnalysis` polls `GET /analyses/{id}` until it is terminal and
  surfaces a still-running job honestly instead of calling it a failure.

## State

Two providers, both above the router:

* `AuthProvider` — the session and every call that changes it (`useAuth`).
  One provider, not a hook per component, so there is a single answer to "who is
  signed in".
* `WorkspaceProvider` — the signed-in user's datasets and analyses, fetched once
  and shared (`useWorkspace`), with `uploadDataset`, `deleteDatasets` and
  `analyzeDataset` on top. Every screen reads slices of the same two
  collections, so no two pages can disagree about a count.

A dataset counts as *ready to analyse* when no succeeded job references it —
that is what fills the Analyze queue.

Theme choice lives in `localStorage`: it is a device preference, and reading it
locally means the right palette paints on the first frame.

## Layout

```
src/
├── api/           everything above
├── components/    providers, hooks, layout, tables, charts, ui/ primitives
├── pages/         Login, SignUp, ForgotPassword, ResetPassword,
│                  Dashboard/{Overview,Analyze,Files,Result,Settings,Account}
└── theme/         design tokens and the MUI theme factory
public/
└── sample-dataset.csv   the "Example" download on the upload panel
```

## Analysis engines

The Analyze page picks the engine per run, from
`GET /analyses/providers`:

* **Statistics** — deterministic pandas. Needs the columns `product`,
  `category`, `unit_price`, `sale`, `customer`, `date`; the example file is one
  click away in the upload panel.
* **AI analyst** — reads whatever columns your export has, and takes an
  optional question. Returns a headline, narrative, findings, its own chart
  specs and recommendations, plus an audit trail of the tools it ran, naming
  the model that produced it. Runs on OpenRouter (a small Qwen model by
  default, roughly $0.001 a run); greyed out with an explanation when the
  server has no key, rather than offered and then failing.

`ResultPanel` follows the report rather than padding it out: an AI result leads
with what it found and draws the charts *it* chose; a statistics result shows
the headline numbers and the built-in charts.

### Charts

`AiChart` renders a provider-declared `ChartSpec` and enforces three things
locally, because a wrong chart is worse than a missing one: never two y-axes;
never a series flattened onto a shared axis (measures on incompatible scales
are split into stacked charts, one scale each); and never a recycled series
colour (past four, the tail folds into "Other").

The categorical series colours in `chartTheme.js` were searched for and
verified with a colour-vision validator on *all* pairs — not just neighbours —
against each mode's own chart surface. Re-validate before changing them; the
comment there records what the checks were.

/**
 * Record the product demo as a single continuous take.
 *
 *     npm run demo            # record, then encode to demo/out/analytixnexa-demo.mp4
 *
 * Needs the full stack up: the API (`make up` in ../analytixNexa-api, with
 * OPENROUTER_API_KEY set so the AI engine is selectable) and this dev server
 * (`npm run dev`). It signs in as the seeded demo account, so run `make seed`
 * first — the take starts from a workspace that already has files in it,
 * because an empty one demos nothing.
 *
 * One page for the whole take, including the hop to the Mailpit inbox: Playwright
 * writes one video per page, so a second tab would mean a second file to stitch.
 *
 * The AI analysis really runs, against the real model. That is the point — the
 * result in the video is not a fixture — but it costs a fraction of a cent and
 * takes ~20 seconds, which `postprocess.mjs` speeds up using the chapter marks
 * this script writes to `demo/out/chapters.json`.
 */

import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");

const APP = process.env.DEMO_APP_URL ?? "http://localhost:5173";
const MAIL = process.env.DEMO_MAIL_URL ?? "http://localhost:8025";
const EMAIL = process.env.DEMO_EMAIL ?? "demo@analytixnexa.io";
const PASSWORD = process.env.DEMO_PASSWORD ?? "demo1234";
const UPLOAD = path.join(HERE, "outdoor-retail-h1.csv");

const SIZE = { width: 1280, height: 720 };

/** Wall-clock marks, so the encoder knows which stretch to speed through. */
const chapters = [];
let t0 = 0;
const mark = (name) => {
  const at = (Date.now() - t0) / 1000;
  chapters.push({ name, at });
  console.log(`  ${at.toFixed(1).padStart(6)}s  ${name}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Put the workspace back to how the take expects to find it.
 *
 * Re-recording otherwise accumulates: a second copy of the uploaded CSV (the
 * client rejects duplicate filenames, so the upload chapter would fail) and a
 * pile of old reset emails in the inbox chapter.
 */
async function resetState() {
  const api = process.env.DEMO_API_URL ?? "http://localhost:8000/api/v1";
  const post = async (path, body, token) => {
    const res = await fetch(`${api}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  };

  const { access_token: token } = await post("/auth/login", {
    email: EMAIL,
    password: PASSWORD,
  });
  const page = await (
    await fetch(`${api}/datasets?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  ).json();

  const uploaded = path.basename(UPLOAD);
  const stale = page.items.filter((d) => d.filename === uploaded);
  for (const dataset of stale) {
    await fetch(`${api}/datasets/${dataset.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Mailpit keeps everything it is ever sent; the inbox chapter should show
  // the message this take produced, not a history of earlier ones.
  await fetch(`${MAIL}/api/v1/messages`, { method: "DELETE" }).catch(() => {});

  console.log(
    `  reset: removed ${stale.length} previous upload(s), cleared the mail inbox`
  );
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  await resetState();

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  const context = await browser.newContext({
    viewport: SIZE,
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: SIZE },
    // The demo account is the point of the take; skip the "restore session"
    // flicker by starting from a cold, signed-out browser.
    storageState: undefined,
  });
  await context.addInitScript({ path: path.join(HERE, "overlay.js") });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  // ---- narration helpers -------------------------------------------------

  const caption = (text, sub, where) =>
    page.evaluate(
      ([t, s, w]) => window.__demo?.caption(t, s, w),
      [text, sub ?? null, where ?? "bottom"]
    );

  const card = (title, subtitle) =>
    page.evaluate(([t, s]) => window.__demo?.card(t, s), [title, subtitle ?? null]);

  const hideCursor = () => page.evaluate(() => window.__demo?.hideCursor());

  /** Move the painted cursor to an element and settle, so a click reads. */
  const moveTo = async (locator) => {
    const box = await locator.boundingBox();
    if (!box) throw new Error("cannot move to an element with no box");
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.evaluate(([px, py]) => window.__demo?.cursor(px, py), [x, y]);
    await sleep(700);
    return { x, y };
  };

  /** Move, ripple, then actually click. */
  const click = async (locator) => {
    const { x, y } = await moveTo(locator);
    await page.evaluate(([px, py]) => window.__demo?.ping(px, py), [x, y]);
    await sleep(220);
    await locator.click();
  };

  /** Type slowly enough to be readable on screen. */
  const type = async (locator, text) => {
    await moveTo(locator);
    await locator.click();
    await locator.pressSequentially(text, { delay: 45 });
  };

  const scrollTo = async (y, ms = 900) => {
    await page.evaluate((py) => window.scrollTo({ top: py, behavior: "smooth" }), y);
    await sleep(ms);
  };

  // ---- the take ----------------------------------------------------------

  await page.goto(APP, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  t0 = Date.now();
  mark("start");

  await card("AnalytixNexa", "Upload a CSV. Get an analysis, not a spreadsheet.");
  await sleep(2600);
  await card(null);

  // 1. Sign in ------------------------------------------------------------
  await page.goto(`${APP}/login`, { waitUntil: "networkidle" });
  await sleep(700);
  await caption("Sign in", "Local accounts — JWT access tokens, rotating refresh tokens");
  await type(page.locator('input[type="email"]'), EMAIL);
  await type(page.locator('input[type="password"]'), PASSWORD);
  await click(page.getByRole("button", { name: "Sign in", exact: true }));
  await page.waitForURL("**/dashboard**");
  await page.waitForLoadState("networkidle");
  await sleep(1400);

  // 2. The overview -------------------------------------------------------
  mark("overview");
  await hideCursor();
  await caption(
    "Your workspace at a glance",
    "Headline numbers, the latest analysis, and the files behind them"
  );
  await sleep(3000);
  await caption(null);

  // 3. Upload a file with awkward columns ---------------------------------
  mark("upload");
  await click(page.getByRole("link", { name: "Analyze" }));
  await page.waitForLoadState("networkidle");
  await sleep(900);
  await caption(
    "Upload any sales export",
    "This one has none of the expected column names — on purpose"
  );
  await click(page.getByRole("button", { name: /Upload a dataset/i }));
  await sleep(800);

  // The dropzone stages the file first, then a second click sends it — so the
  // take shows both, the way a user actually experiences it.
  await page.locator('input[type="file"]').setInputFiles(UPLOAD);
  await page.waitForSelector("text=/ready to upload/i", { timeout: 30000 });
  await sleep(1000);
  await caption(
    "Columns: Purchase Date, Item Name, Line Total, Shopper Email…",
    "Day-first dates, and a unit price sitting right next to the real revenue column"
  );
  await sleep(2600);

  await click(page.getByRole("button", { name: /^Upload outdoor-retail/i }));
  await page.waitForSelector("text=/Upload complete|Upload failed/", { timeout: 60000 });
  await sleep(1600);
  await click(page.locator('[aria-label="Close dialog"]'));
  await sleep(700);

  // Collapse the panel so the queue below is visible.
  const collapse = page.getByRole("button", { name: /Hide upload area/i });
  if (await collapse.count()) await click(collapse);
  await sleep(700);

  // 4. Pick the AI engine and ask a question ------------------------------
  mark("engine");
  await caption(
    "Two engines, chosen per run",
    "Statistics is exact and instant. The AI analyst works out the columns for itself."
  );
  await sleep(2200);
  await click(page.getByRole("button", { name: /AI analyst/i }));
  await sleep(900);
  await caption("Ask it something specific", "The question drives which analyses it runs");
  await type(
    page.getByLabel(/Ask a question/i),
    "Which product earns the most per transaction?"
  );
  await sleep(1200);

  // 5. Run it — really -----------------------------------------------------
  const row = page.locator("tbody tr", { hasText: "outdoor-retail-h1" });
  await click(row.getByRole("button", { name: /Analyze/i }));
  mark("waiting");
  await caption(
    "The agent is working",
    "Inspect the columns → decide which analyses fit → run them as tools → write it up"
  );
  await page.waitForSelector("text=/Analysis complete|Analysis failed/", { timeout: 420000 });
  mark("waited");
  await sleep(1500);
  await caption(null);

  const failed = await page.locator("text=/Analysis failed/").count();
  if (failed) throw new Error("the AI analysis failed during recording");

  await click(page.locator('[aria-label="Close dialog"]'));
  await sleep(800);

  // 6. Read the result -----------------------------------------------------
  mark("results");
  await click(page.getByRole("link", { name: "Results" }));
  await page.waitForLoadState("networkidle");
  await sleep(1600);
  await hideCursor();
  await caption("It answers the question you asked", "Every figure comes from pandas, not from the model");
  await sleep(3200);

  await scrollTo(430);
  await caption(
    "Charts it chose itself",
    "The engine picks the cut of the data that carries the finding",
    "top"
  );
  await sleep(3200);

  await scrollTo(980);
  await sleep(2600);

  // The audit trail is the most convincing part: it shows the column choices.
  mark("trace");
  const traceButton = page.getByRole("button", { name: /how this was analysed/i }).first();
  await traceButton.scrollIntoViewIfNeeded();
  await sleep(500);
  // Top, because the trace it is describing renders at the bottom of the panel.
  await caption(
    "Every run is auditable",
    "Which tool ran, on which column, and what came back",
    "top"
  );
  await click(traceButton);
  await sleep(1200);
  await traceButton.scrollIntoViewIfNeeded();
  await sleep(3600);
  await caption(null);

  // 7. Password reset by email --------------------------------------------
  mark("account");
  await click(page.getByRole("link", { name: "Account" }));
  await page.waitForLoadState("networkidle");
  await sleep(1200);
  await caption("Forgot your password?", "Change it by email instead of proving the old one");
  await click(page.getByRole("button", { name: /Email me a link/i }));
  await page.waitForSelector("text=/on its way/i", { timeout: 30000 });
  await sleep(2600);

  mark("inbox");
  await caption(
    "The mail really goes out",
    "docker compose runs Mailpit, so it lands in a real inbox",
    "top"
  );
  await page.goto(MAIL, { waitUntil: "networkidle" });
  await sleep(1800);
  await page.locator("text=/Reset your AnalytixNexa password/i").first().click();
  await sleep(1000);
  await caption(
    "A single-use link, valid for 30 minutes",
    "Setting a new password signs out every device",
    "top"
  );
  await sleep(3400);
  await caption(null);

  // 8. Appearance ----------------------------------------------------------
  mark("theme");
  await page.goto(`${APP}/dashboard`, { waitUntil: "networkidle" });
  await sleep(1400);
  await caption("Light and dark, and a sidebar that gets out of the way");
  await click(page.locator('[aria-label="Toggle colour mode"]'));
  await sleep(1500);
  await click(page.locator('[aria-label="Toggle colour mode"]'));
  await sleep(1400);
  await click(page.locator('[aria-label="Collapse sidebar"]'));
  await sleep(1500);
  await click(page.locator('[aria-label="Expand sidebar"]'));
  await sleep(1400);
  await caption(null);
  await hideCursor();

  mark("outro");
  await card("AnalytixNexa", "FastAPI · PostgreSQL · React · LangChain over OpenRouter");
  await sleep(2600);
  mark("end");

  await context.close();
  await browser.close();

  // Playwright names the file after the page; give it a predictable name.
  const files = (await fs.readdir(OUT)).filter((f) => f.endsWith(".webm"));
  if (files.length !== 1) throw new Error(`expected one video, found ${files.length}`);
  const raw = path.join(OUT, "raw.webm");
  await fs.rename(path.join(OUT, files[0]), raw);
  await fs.writeFile(
    path.join(OUT, "chapters.json"),
    JSON.stringify({ chapters, size: SIZE }, null, 2)
  );

  const { size } = await fs.stat(raw);
  console.log(`\nrecorded ${raw} (${(size / 1e6).toFixed(1)} MB)`);
  console.log("chapters written to demo/out/chapters.json");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

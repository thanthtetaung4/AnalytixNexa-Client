/**
 * Turn the raw take into something postable.
 *
 *     node demo/postprocess.mjs        # after record-demo.mjs
 *
 * Two jobs:
 *
 * 1. **Compress the dead air.** The AI analysis genuinely takes ~20 seconds,
 *    which is honest but unwatchable. The `waiting`/`waited` chapter marks the
 *    recorder wrote bound that stretch, so it plays at normal speed just long
 *    enough to register, then runs fast. Nothing else is altered — the rest of
 *    the take is real time.
 * 2. **Encode for GitHub.** H.264 in MP4, yuv420p, `faststart`. GitHub accepts
 *    .mp4 on drag-and-drop; the WebM Playwright produces it does not.
 *
 * Also writes a poster frame, and a short GIF of the part worth showing inline
 * in a README (an animated GIF of the whole take would be tens of megabytes).
 */

import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import path from "node:path";
import fs from "node:fs/promises";

const run = promisify(execFile);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "out");
const RAW = path.join(OUT, "raw.webm");
const MP4 = path.join(OUT, "analytixnexa-demo.mp4");
const GIF = path.join(OUT, "analytixnexa-demo.gif");
const POSTER = path.join(OUT, "poster.jpg");

/** Seconds of the wait to keep at normal speed before accelerating. */
const WAIT_LEAD_IN = 2.5;
/** How much to accelerate the rest of it. */
const WAIT_SPEED = 6;

const ffmpeg = (args) => run("ffmpeg", ["-hide_banner", "-loglevel", "error", ...args]);

const duration = async (file) => {
  const { stdout } = await run("ffprobe", [
    "-v", "error",
    "-show_entries", "format=duration",
    "-of", "default=nw=1:nk=1",
    file,
  ]);
  return Number.parseFloat(stdout.trim());
};

const megabytes = async (file) => ((await fs.stat(file)).size / 1e6).toFixed(1);

async function main() {
  const { chapters } = JSON.parse(
    await fs.readFile(path.join(OUT, "chapters.json"), "utf8")
  );
  const at = (name) => chapters.find((c) => c.name === name)?.at;

  const total = await duration(RAW);
  const cutFrom = at("waiting") + WAIT_LEAD_IN;
  const cutTo = at("waited");

  if (!(cutTo > cutFrom)) {
    throw new Error("chapters.json has no usable waiting/waited marks");
  }

  console.log(`raw take     ${total.toFixed(1)}s`);
  console.log(
    `speeding     ${cutFrom.toFixed(1)}s → ${cutTo.toFixed(1)}s ` +
      `(${(cutTo - cutFrom).toFixed(1)}s of waiting) at ${WAIT_SPEED}×`
  );

  // One filter graph rather than intermediate files: trim into three segments,
  // rescale the middle one's timestamps, concatenate.
  const filter = [
    `[0:v]trim=0:${cutFrom},setpts=PTS-STARTPTS[a]`,
    `[0:v]trim=${cutFrom}:${cutTo},setpts=(PTS-STARTPTS)/${WAIT_SPEED}[b]`,
    `[0:v]trim=${cutTo},setpts=PTS-STARTPTS[c]`,
    `[a][b][c]concat=n=3:v=1:a=0[v]`,
  ].join(";");

  await ffmpeg([
    "-i", RAW,
    "-filter_complex", filter,
    "-map", "[v]",
    "-r", "25",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "23",
    "-pix_fmt", "yuv420p",       // required for QuickTime/Safari and GitHub
    "-movflags", "+faststart",   // metadata first, so it streams before it downloads
    "-an",
    MP4, "-y",
  ]);

  await ffmpeg(["-ss", "12", "-i", MP4, "-frames:v", "1", "-q:v", "3", POSTER, "-y"]);

  // A README-embeddable loop of the part that sells it: the agent finishing,
  // and the report it wrote. Palette-generated so the gradients do not band.
  const gifFrom = Math.max(0, at("results") - (cutTo - cutFrom) * (1 - 1 / WAIT_SPEED) - 4);
  const palette = path.join(OUT, "palette.png");
  // 800px at 11fps keeps it under ~4 MB, which is the difference between
  // a GIF you can commit and one you should not.
  const gifFilters = "fps=11,scale=800:-1:flags=lanczos";
  await ffmpeg([
    "-ss", String(gifFrom), "-t", "16", "-i", MP4,
    "-vf", `${gifFilters},palettegen=stats_mode=diff`,
    palette, "-y",
  ]);
  await ffmpeg([
    "-ss", String(gifFrom), "-t", "16", "-i", MP4, "-i", palette,
    "-filter_complex", `${gifFilters}[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3`,
    GIF, "-y",
  ]);
  await fs.rm(palette, { force: true });

  console.log();
  console.log(`mp4          ${MP4}`);
  console.log(`             ${(await duration(MP4)).toFixed(1)}s, ${await megabytes(MP4)} MB`);
  console.log(`gif          ${GIF} (${await megabytes(GIF)} MB, from ${gifFrom.toFixed(0)}s)`);
  console.log(`poster       ${POSTER}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

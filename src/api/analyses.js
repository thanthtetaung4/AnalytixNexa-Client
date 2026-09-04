/** Analysis jobs: queue one, poll it to completion, list history. */

import { ApiError, request, sleep } from "./client";

export const ANALYSIS_KINDS = [
  "product_preference",
  "sales",
  "customer_behavior",
  "temporal",
];

const TERMINAL = new Set(["succeeded", "failed"]);

export const listAnalyses = ({ limit = 200, offset = 0, datasetId } = {}) => {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (datasetId) params.set("dataset_id", datasetId);
  return request(`/analyses?${params}`);
};

export const readAnalysis = (jobId) => request(`/analyses/${jobId}`);

/**
 * Queue an analysis. The API answers 202 with a `pending` job and runs the
 * work in the background, so the caller polls — see `waitForAnalysis`.
 */
export const createAnalysis = (
  datasetId,
  { kinds = ANALYSIS_KINDS, question, provider } = {}
) =>
  request(`/datasets/${datasetId}/analyses`, {
    method: "POST",
    json: {
      kinds,
      ...(question ? { question } : {}),
      ...(provider ? { provider } : {}),
    },
  });

/**
 * Poll a queued job until it finishes.
 *
 * A timeout does not mean the job died — it keeps running server-side — so the
 * message says so rather than claiming failure.
 */
/**
 * How long to keep polling, per engine.
 *
 * The statistics engine finishes in well under a second. The AI engine runs an
 * agentic loop — several model turns, each with tool calls — so a couple of
 * minutes is normal and the old shared 2-minute deadline would report a
 * timeout on runs that were about to succeed.
 */
export const POLL_TIMEOUT_MS = { pandas: 120000, ai: 420000 };

export const waitForAnalysis = async (
  jobId,
  { intervalMs = 900, timeoutMs = POLL_TIMEOUT_MS.pandas, onUpdate } = {}
) => {
  const deadline = Date.now() + timeoutMs;
  let job = await readAnalysis(jobId);
  onUpdate?.(job);

  while (!TERMINAL.has(job.status)) {
    if (Date.now() > deadline) {
      throw new ApiError({
        code: "analysis_timeout",
        message:
          "This is taking longer than expected. The analysis is still running — check the Results page shortly.",
      });
    }
    await sleep(intervalMs);
    job = await readAnalysis(jobId);
    onUpdate?.(job);
  }

  if (job.status === "failed") {
    throw new ApiError({
      code: "analysis_failed",
      message: job.error || "The analysis could not be completed.",
    });
  }
  return job;
};

/** Queue + poll in one call, which is what every UI entry point wants. */
export const runAnalysis = async (datasetId, options = {}) => {
  const queued = await createAnalysis(datasetId, options);
  if (TERMINAL.has(queued.status)) return queued;
  return waitForAnalysis(queued.id, {
    // The job row reports which engine actually ran it, which is more reliable
    // than the request options — the server picks a default when none is sent.
    timeoutMs: POLL_TIMEOUT_MS[queued.provider] ?? POLL_TIMEOUT_MS.pandas,
    ...options,
  });
};

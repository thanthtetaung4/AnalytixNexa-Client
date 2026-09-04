/**
 * View models over the API payloads.
 *
 * The API is the source of truth for names (`AnalysisReport.sales`,
 * `customer_behavior.unique_customers`, …). This module is the single place
 * that maps those onto what the screens need, so a contract change lands here
 * instead of in a dozen components.
 */

/** A dataset row for the file library and the analysis queue. */
export const toFile = (dataset, analysedIds) => ({
  id: dataset.id,
  name: dataset.filename,
  size: dataset.size_bytes,
  rowCount: dataset.row_count,
  columns: dataset.columns ?? [],
  createdAt: dataset.created_at,
  // "available" means: nothing has successfully analysed it yet, so it still
  // belongs in the queue on the Analyze page.
  available: !analysedIds.has(dataset.id),
});

/** An analysis job paired with the dataset it ran against. */
export const toAnalysis = (job, datasetsById) => ({
  id: job.id,
  datasetId: job.dataset_id,
  fileName: datasetsById.get(job.dataset_id)?.filename ?? "Deleted dataset",
  createdAt: job.finished_at ?? job.created_at,
  status: job.status,
  provider: job.provider,
  question: job.question,
  error: job.error,
  report: job.result ?? null,
});

/** Flatten an AnalysisReport into the numbers and series the charts plot. */
export const reportMetrics = (report) => ({
  uniqueCustomers: report?.customer_behavior?.unique_customers,
  totalSale: report?.sales?.total_sale,
  averageSale: report?.sales?.average_sale,
  transactionCount: report?.sales?.transaction_count,
  topProduct: report?.product_preference?.top_product,
  products: report?.product_preference?.products ?? [],
  months: report?.temporal?.months ?? [],
  rowCount: report?.meta?.row_count,

  // Everything below only arrives from a provider that writes prose — the AI
  // engine. The pandas engine leaves it all empty, so components render these
  // when present rather than reserving space for them.
  headline: report?.headline ?? null,
  narrative: report?.narrative ?? null,
  keyFindings: report?.key_findings ?? [],
  sections: report?.sections ?? [],
  charts: report?.charts ?? [],
  recommendations: report?.recommendations ?? [],
  // How the agent worked: which tools it called, with what columns.
  trace: report?.trace ?? [],
  model: report?.meta?.model ?? null,
  toolCalls: report?.meta?.tool_calls,
  // Analyses the engine decided the columns could not support. Showing this
  // turns an unexplained gap into a stated one.
  kindsSkipped: report?.meta?.kinds_skipped ?? [],
});

/** Human label for an AnalysisKind, for the "could not run" notice. */
export const KIND_LABELS = {
  product_preference: "product preference",
  sales: "sales",
  customer_behavior: "customer behaviour",
  temporal: "trend over time",
};

export const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return "—";
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

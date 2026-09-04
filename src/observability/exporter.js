/**
 * A small OTLP/HTTP JSON exporter.
 *
 * Hand-rolled rather than pulling in the OpenTelemetry web SDK, and that is a
 * deliberate trade. The SDK is several hundred kilobytes of JavaScript shipped
 * to every visitor, and it earns that in an app doing heavy client-side
 * instrumentation. What this app needs is three signals — errors, API calls,
 * navigations — over one wire format, and that fits in a page of code with no
 * bundle cost and no dependency to keep current. If the requirements grow to
 * context propagation across workers or auto-instrumented fetch, swap this file
 * for the real SDK; nothing outside it knows the difference.
 *
 * The batching rules matter more than the encoding:
 *
 *   - flush on a timer, so a quiet page still reports;
 *   - flush when the queue is full, so a noisy one does not grow unbounded;
 *   - flush on `visibilitychange` via `sendBeacon`, because a tab being closed
 *     is exactly when the last error is worth having, and `fetch` at that point
 *     is routinely cancelled.
 *
 * Failures are swallowed. A telemetry endpoint that is down must not produce
 * console noise on top of whatever the user was already hitting.
 */

const MAX_QUEUE = 64;
const FLUSH_INTERVAL_MS = 5000;

export class OtlpExporter {
  /**
   * @param {object} options
   * @param {string} options.endpoint  base OTLP/HTTP URL, e.g. `/otlp`
   * @param {object} options.resource  resource attributes, as a flat object
   */
  constructor({ endpoint, resource }) {
    this.endpoint = endpoint.replace(/\/+$/, "");
    this.resource = attributes(resource);
    this.logs = [];
    this.spans = [];
    this.timer = null;
    this.installed = false;
  }

  start() {
    if (this.installed) return;
    this.installed = true;

    this.timer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);

    // "hidden" rather than "unload": unload does not fire reliably on mobile,
    // and visibilitychange is the event that survives a backgrounded tab being
    // discarded outright.
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") this.flush({ beacon: true });
    });
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.installed = false;
  }

  emitLog(record) {
    this.logs.push(record);
    if (this.logs.length >= MAX_QUEUE) this.flush();
  }

  emitSpan(span) {
    this.spans.push(span);
    if (this.spans.length >= MAX_QUEUE) this.flush();
  }

  flush({ beacon = false } = {}) {
    if (this.logs.length) {
      const batch = this.logs;
      this.logs = [];
      this.#send("/v1/logs", { resourceLogs: [this.#wrap("scopeLogs", { logRecords: batch })] }, beacon);
    }
    if (this.spans.length) {
      const batch = this.spans;
      this.spans = [];
      this.#send("/v1/traces", { resourceSpans: [this.#wrap("scopeSpans", { spans: batch })] }, beacon);
    }
  }

  #wrap(scopeKey, payload) {
    return {
      resource: { attributes: this.resource },
      [scopeKey]: [{ scope: { name: "analytixnexa-client" }, ...payload }],
    };
  }

  #send(path, payload, beacon) {
    const url = `${this.endpoint}${path}`;
    const body = JSON.stringify(payload);
    try {
      if (beacon && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
        return;
      }
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        // Lets the request outlive the page when it is sent during teardown.
        keepalive: beacon,
      }).catch(() => {});
    } catch {
      // Telemetry never raises into the app.
    }
  }
}

/**
 * Encode a flat object as OTLP `KeyValue` pairs.
 *
 * OTLP types values explicitly, so a number has to be declared an int or a
 * double rather than inferred. Undefined and null entries are dropped: an
 * absent attribute is cleaner to query than one that is present and empty.
 */
export function attributes(source = {}) {
  const out = [];
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined || value === null) continue;
    if (typeof value === "number") {
      out.push({
        key,
        value: Number.isInteger(value) ? { intValue: value } : { doubleValue: value },
      });
    } else if (typeof value === "boolean") {
      out.push({ key, value: { boolValue: value } });
    } else {
      out.push({ key, value: { stringValue: String(value) } });
    }
  }
  return out;
}

/** Milliseconds (what the browser gives) to nanoseconds (what OTLP wants). */
export const toNanos = (ms) => String(Math.round(ms * 1e6));

/**
 * W3C trace-context identifiers.
 *
 * A trace id is 16 bytes and a span id 8, both lower-case hex, and neither may
 * be all zeroes — an all-zero id is the spec's way of spelling "invalid", and a
 * backend that receives one is entitled to drop the trace.
 */

const hex = (bytes) => {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return Array.from(values, (b) => b.toString(16).padStart(2, "0")).join("");
};

/** 32 hex characters. */
export const newTraceId = () => hex(16);

/** 16 hex characters. */
export const newSpanId = () => hex(8);

/**
 * The `traceparent` header, in W3C trace-context format:
 * `<version>-<trace-id>-<parent-id>-<flags>`, flags 01 meaning sampled.
 *
 * Sending this on an API call is what lets the backend's span adopt the
 * browser's trace as its parent, so one user action reads as a single trace
 * from the click through to the SQL.
 */
export const traceparent = (traceId, spanId) => `00-${traceId}-${spanId}-01`;

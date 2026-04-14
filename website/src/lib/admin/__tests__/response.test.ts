import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { ok, err, ErrorCode } from "../response";

// Canonical mapping of ErrorCode to HTTP status
const ERROR_CODE_STATUS_MAP: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const allErrorCodes = Object.keys(ERROR_CODE_STATUS_MAP) as ErrorCode[];

describe("response helpers — property tests", () => {
  // Feature: admin-api, Property 1: Response Envelope Mutual Exclusivity
  it("Property 1: ok() always produces { data: non-null, error: null }", async () => {
    await fc.assert(
      fc.asyncProperty(fc.anything(), async (payload) => {
        // Skip null/undefined and non-finite numbers (JSON serialises them to null)
        fc.pre(
          payload !== null &&
            payload !== undefined &&
            !(typeof payload === "number" && !isFinite(payload))
        );
        const response = ok(payload);
        const body = await response.json();
        expect(body.error).toBeNull();
        expect(body.data).not.toBeNull();
        expect(body.data).not.toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  // Feature: admin-api, Property 1: Response Envelope Mutual Exclusivity
  it("Property 1: err() always produces { data: null, error: non-null }", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.constantFrom(...allErrorCodes),
        fc.integer({ min: 400, max: 599 }),
        async (message, code, status) => {
          const response = err(message, code, status);
          const body = await response.json();
          expect(body.data).toBeNull();
          expect(body.error).not.toBeNull();
          expect(body.error.message).toBe(message);
          expect(body.error.code).toBe(code);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: admin-api, Property 2: Error Code to HTTP Status Mapping
  it("Property 2: err() HTTP status matches canonical mapping for all ErrorCode values", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string(),
        fc.constantFrom(...allErrorCodes),
        async (message, code) => {
          const canonicalStatus = ERROR_CODE_STATUS_MAP[code];
          const response = err(message, code, canonicalStatus);
          expect(response.status).toBe(canonicalStatus);
        }
      ),
      { numRuns: 100 }
    );
  });
});

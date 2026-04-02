import { describe, it } from "vitest";
import * as fc from "fast-check";
import { paginatedResponse, parsePagination } from "../pagination";

describe("pagination helpers — property tests", () => {
  // Feature: admin-api, Property 4: Pagination Total Pages Invariant
  it("Property 4: total_pages === Math.ceil(N / P) for all valid N and P", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 1, max: 100 }),
        (total, per_page) => {
          const result = paginatedResponse([], total, 1, per_page);
          return result.pagination.total_pages === Math.ceil(total / per_page);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: admin-api, Property 5: Per-Page Clamping
  it("Property 5: any per_page > 100 is clamped to 100", () => {
    fc.assert(
      fc.property(fc.integer({ min: 101, max: 10000 }), (rawPerPage) => {
        const params = new URLSearchParams({ per_page: String(rawPerPage) });
        const { per_page } = parsePagination(params);
        return per_page === 100;
      }),
      { numRuns: 100 }
    );
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";

vi.mock("@/lib/admin/auth", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/admin/supabase", () => ({
  getAdminClient: vi.fn(),
}));

import { requireAdminSession } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/admin/supabase";

const mockRequireAdminSession = vi.mocked(requireAdminSession);
const mockGetAdminClient = vi.mocked(getAdminClient);

function makeAdminSession() {
  return {
    user: { id: "user-123", email: "admin@example.com" },
    profile: { id: "user-123", full_name: "Admin", email: "admin@example.com", role: "admin" as const },
  };
}

async function getListHandlers() {
  const mod = await import("../route");
  return { GET: mod.GET, POST: mod.POST };
}

async function getDetailHandlers() {
  const mod = await import("../[id]/route");
  return { GET: mod.GET, PUT: mod.PUT, DELETE: mod.DELETE };
}

// ─── Property Tests ───────────────────────────────────────────────────────────

// Feature: admin-api, Property 12: Category Delete Guard
describe("Property 12: Category Delete Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("any category with ≥1 product must return 409 and not be deleted", async () => {
    // **Validates: Requirements 19.6**
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (productCount) => {
          vi.clearAllMocks();
          vi.resetModules();

          mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

          const hardDeleteMock = vi.fn();

          const mockFrom = vi.fn().mockImplementation((table: string) => {
            if (table === "products") {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: productCount, error: null }),
                }),
              };
            }
            // categories table
            return {
              delete: hardDeleteMock,
            };
          });

          mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

          const { DELETE } = await getDetailHandlers();
          const req = new Request("http://localhost/api/admin/categories/cat-1", { method: "DELETE" });
          const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });
          const body = await res.json();

          // Must return 409 and NOT delete
          expect(res.status).toBe(409);
          expect(body.error.code).toBe("CONFLICT");
          expect(hardDeleteMock).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("GET /api/admin/categories — list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns categories ordered by sort_order with product_count", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const rawCategories = [
      { id: "cat-1", name: "Breakfast", slug: "breakfast", sort_order: 1, products: [{ count: 3 }] },
      { id: "cat-2", name: "Lunch", slug: "lunch", sort_order: 2, products: [{ count: 0 }] },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: rawCategories, error: null }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { GET } = await getListHandlers();
    const req = new Request("http://localhost/api/admin/categories");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.data[0].product_count).toBe(3);
    expect(body.data[1].product_count).toBe(0);
    // products key should be removed
    expect(body.data[0]).not.toHaveProperty("products");
    expect(body.data[1]).not.toHaveProperty("products");
  });

  it("returns product_count=0 when products array is empty", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const rawCategories = [
      { id: "cat-1", name: "Empty", slug: "empty", sort_order: 0, products: [] },
    ];

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: rawCategories, error: null }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { GET } = await getListHandlers();
    const req = new Request("http://localhost/api/admin/categories");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data[0].product_count).toBe(0);
  });
});

describe("POST /api/admin/categories — slug conflict", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 409 when slug already exists", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallCount = 0;
    const mockFrom = vi.fn().mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: { id: "existing-id" }, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { POST } = await getListHandlers();
    const req = new Request("http://localhost/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "breakfast", name: "Breakfast" }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
  });
});

describe("DELETE /api/admin/categories/[id] — with products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 409 when category has products", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const hardDeleteMock = vi.fn();

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 5, error: null }),
          }),
        };
      }
      return { delete: hardDeleteMock };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
    expect(body.error.message).toBe("Category has products. Reassign or delete them first.");
    expect(hardDeleteMock).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/admin/categories/[id] — without products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("hard-deletes and returns { deleted: true } when category has no products", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const hardDeleteEqMock = vi.fn().mockResolvedValue({ error: null });
    const hardDeleteMock = vi.fn().mockReturnValue({ eq: hardDeleteEqMock });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "products") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 0, error: null }),
          }),
        };
      }
      return { delete: hardDeleteMock };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/categories/cat-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "cat-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ deleted: true });
    expect(hardDeleteMock).toHaveBeenCalled();
  });
});

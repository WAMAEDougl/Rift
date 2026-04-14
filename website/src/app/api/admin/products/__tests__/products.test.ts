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
  return { GET: mod.GET, PUT: mod.PUT, PATCH: mod.PATCH, DELETE: mod.DELETE };
}

// ─── Property Tests ───────────────────────────────────────────────────────────

// Feature: admin-api, Property 11: Product Delete Guard
describe("Property 11: Product Delete Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("any product with ≥1 order_items row must be soft-deleted (not hard-deleted)", async () => {
    // **Validates: Requirements 18.3, 18.4**
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 100 }),
        async (orderItemCount) => {
          vi.clearAllMocks();
          vi.resetModules();

          mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

          const hardDeleteMock = vi.fn();
          const softUpdateMock = vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          });

          let fromCallCount = 0;
          const mockFrom = vi.fn().mockImplementation((table: string) => {
            fromCallCount++;
            if (table === "order_items") {
              return {
                select: vi.fn().mockReturnValue({
                  eq: vi.fn().mockResolvedValue({ count: orderItemCount, error: null }),
                }),
              };
            }
            // products table
            return {
              update: softUpdateMock,
              delete: hardDeleteMock,
            };
          });

          mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

          const { DELETE } = await getDetailHandlers();
          const req = new Request("http://localhost/api/admin/products/prod-1", { method: "DELETE" });
          const res = await DELETE(req, { params: Promise.resolve({ id: "prod-1" }) });
          const body = await res.json();

          // Must soft-delete, not hard-delete
          expect(res.status).toBe(200);
          expect(body.data.soft_deleted).toBe(true);
          expect(body.data.reason).toBe("Product has order history. Deactivated instead.");
          expect(hardDeleteMock).not.toHaveBeenCalled();
          expect(softUpdateMock).toHaveBeenCalledWith({ is_active: false });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests ───────────────────────────────────────────────────────────────

describe("POST /api/admin/products — slug conflict", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 409 when slug already exists", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    // First call: products table for slug check
    // Second call: would be insert (not reached)
    let fromCallCount = 0;
    const mockFrom = vi.fn().mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // slug conflict check
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
    const req = new Request("http://localhost/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Product",
        slug: "test-product",
        category_id: "550e8400-e29b-41d4-a716-446655440000",
        price: 500,
      }),
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error.code).toBe("CONFLICT");
  });
});

describe("POST /api/admin/products — defaults", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("defaults in_stock=true, is_active=true, sort_order=0 when not provided", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let capturedInsertData: Record<string, unknown> | null = null;
    let fromCallCount = 0;

    const mockFrom = vi.fn().mockImplementation(() => {
      fromCallCount++;
      if (fromCallCount === 1) {
        // slug conflict check — no conflict
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
            }),
          }),
        };
      }
      // insert call
      return {
        insert: vi.fn().mockImplementation((data: Record<string, unknown>) => {
          capturedInsertData = data;
          return {
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "new-id", ...data },
                error: null,
              }),
            }),
          };
        }),
      };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { POST } = await getListHandlers();
    const req = new Request("http://localhost/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Product",
        slug: "test-product",
        category_id: "550e8400-e29b-41d4-a716-446655440000",
        price: 500,
      }),
    });
    const res = await POST(req);

    expect(res.status).toBe(201);
    expect(capturedInsertData).not.toBeNull();
    expect(capturedInsertData!.in_stock).toBe(true);
    expect(capturedInsertData!.is_active).toBe(true);
    expect(capturedInsertData!.sort_order).toBe(0);
  });
});

describe("GET /api/admin/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns 404 when product not found", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { GET } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/products/nonexistent");
    const res = await GET(req, { params: Promise.resolve({ id: "nonexistent" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});

describe("PUT /api/admin/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("replaces all fields and returns updated product", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const updatedProduct = {
      id: "prod-1",
      name: "Updated Name",
      slug: "updated-slug",
      category_id: "550e8400-e29b-41d4-a716-446655440000",
      price: 999,
      in_stock: true,
      is_active: true,
      sort_order: 5,
    };

    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedProduct, error: null }),
          }),
        }),
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { PUT } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/products/prod-1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Updated Name",
        slug: "updated-slug",
        category_id: "550e8400-e29b-41d4-a716-446655440000",
        price: 999,
        in_stock: true,
        is_active: true,
        sort_order: 5,
      }),
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "prod-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.name).toBe("Updated Name");
    expect(body.data.price).toBe(999);
    expect(body.data.sort_order).toBe(5);
  });
});

describe("PATCH /api/admin/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("updates only provided fields and returns updated product", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let capturedUpdateData: Record<string, unknown> | null = null;

    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockImplementation((data: Record<string, unknown>) => {
        capturedUpdateData = data;
        return {
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { id: "prod-1", name: "Original", price: 500, in_stock: false },
                error: null,
              }),
            }),
          }),
        };
      }),
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { PATCH } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/products/prod-1", {
      method: "PATCH",
      body: JSON.stringify({ in_stock: false }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "prod-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(capturedUpdateData).toMatchObject({ in_stock: false });
    // PATCH should only send provided fields — no extra defaults
    expect(capturedUpdateData).not.toHaveProperty("name");
    expect(capturedUpdateData).not.toHaveProperty("price");
    expect(body.data.in_stock).toBe(false);
  });
});

describe("DELETE /api/admin/products/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("hard-deletes when product has no order_items", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const hardDeleteEqMock = vi.fn().mockResolvedValue({ error: null });
    const hardDeleteMock = vi.fn().mockReturnValue({ eq: hardDeleteEqMock });

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "order_items") {
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
    const req = new Request("http://localhost/api/admin/products/prod-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "prod-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ deleted: true });
    expect(hardDeleteMock).toHaveBeenCalled();
  });

  it("soft-deletes when product has order_items", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const softUpdateEqMock = vi.fn().mockResolvedValue({ error: null });
    const softUpdateMock = vi.fn().mockReturnValue({ eq: softUpdateEqMock });
    const hardDeleteMock = vi.fn();

    const mockFrom = vi.fn().mockImplementation((table: string) => {
      if (table === "order_items") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 3, error: null }),
          }),
        };
      }
      return { update: softUpdateMock, delete: hardDeleteMock };
    });

    mockGetAdminClient.mockReturnValue({ from: mockFrom } as never);

    const { DELETE } = await getDetailHandlers();
    const req = new Request("http://localhost/api/admin/products/prod-1", { method: "DELETE" });
    const res = await DELETE(req, { params: Promise.resolve({ id: "prod-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.soft_deleted).toBe(true);
    expect(body.data.reason).toBe("Product has order history. Deactivated instead.");
    expect(hardDeleteMock).not.toHaveBeenCalled();
    expect(softUpdateMock).toHaveBeenCalledWith({ is_active: false });
  });
});

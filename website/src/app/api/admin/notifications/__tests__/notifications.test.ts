import { describe, it, expect, vi, beforeEach } from "vitest";

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

function makeAdminSession(userId = "admin-user-id") {
  return {
    user: { id: userId, email: "admin@example.com" },
    profile: {
      id: userId,
      full_name: "Admin",
      email: "admin@example.com",
      role: "admin" as const,
    },
  };
}

async function getListHandler() {
  const mod = await import("../route");
  return { GET: mod.GET };
}

async function getUnreadCountHandler() {
  const mod = await import("../unread-count/route");
  return { GET: mod.GET };
}

async function getReadHandler() {
  const mod = await import("../[id]/read/route");
  return { PATCH: mod.PATCH };
}

async function getReadAllHandler() {
  const mod = await import("../read-all/route");
  return { POST: mod.POST };
}

// ─── Notifications List Tests ─────────────────────────────────────────────────

describe("GET /api/admin/notifications — list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns paginated notifications with unread_count", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const notifications = [
      {
        id: "notif-1",
        type: "new_order",
        title: "New Order #ORD-001",
        message: "A new order has been placed.",
        order_id: "order-1",
        is_read: false,
        created_at: "2024-01-02T00:00:00Z",
      },
      {
        id: "notif-2",
        type: "payment_completed",
        title: "Payment Received for #ORD-001",
        message: "Payment completed.",
        order_id: "order-1",
        is_read: true,
        created_at: "2024-01-01T00:00:00Z",
      },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // unread count query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 1, data: null, error: null }),
            }),
          };
        }
        if (fromCallIndex === 2) {
          // items query
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: notifications, error: null }),
              }),
            }),
          };
        }
        // total count query
        return {
          select: vi.fn().mockResolvedValue({ count: 2, data: null, error: null }),
        };
      }),
    } as never);

    const { GET } = await getListHandler();
    const req = new Request("http://localhost/api/admin/notifications");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(2);
    expect(body.data.pagination).toBeDefined();
    expect(body.data.pagination.total).toBe(2);
    expect(body.data.unread_count).toBe(1);
    expect(body.error).toBeNull();
  });

  it("filters by is_read=false", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    const unreadNotifications = [
      {
        id: "notif-1",
        type: "new_order",
        title: "New Order #ORD-001",
        message: "A new order has been placed.",
        order_id: "order-1",
        is_read: false,
        created_at: "2024-01-02T00:00:00Z",
      },
    ];

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // unread count query
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 1, data: null, error: null }),
            }),
          };
        }
        if (fromCallIndex === 2) {
          // items query with is_read filter
          return {
            select: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  range: vi.fn().mockResolvedValue({ data: unreadNotifications, error: null }),
                }),
              }),
            }),
          };
        }
        // total count query with is_read filter
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ count: 1, data: null, error: null }),
          }),
        };
      }),
    } as never);

    const { GET } = await getListHandler();
    const req = new Request("http://localhost/api/admin/notifications?is_read=false");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.items).toHaveLength(1);
    expect(body.data.unread_count).toBe(1);
  });
});

// ─── Unread Count Tests ───────────────────────────────────────────────────────

describe("GET /api/admin/notifications/unread-count", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns count of unread notifications", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: 5, data: null, error: null }),
        }),
      }),
    } as never);

    const { GET } = await getUnreadCountHandler();
    const req = new Request("http://localhost/api/admin/notifications/unread-count");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.count).toBe(5);
    expect(body.error).toBeNull();
  });

  it("returns 0 when no unread notifications", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ count: null, data: null, error: null }),
        }),
      }),
    } as never);

    const { GET } = await getUnreadCountHandler();
    const req = new Request("http://localhost/api/admin/notifications/unread-count");
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.count).toBe(0);
  });
});

// ─── Mark Read Tests ──────────────────────────────────────────────────────────

describe("PATCH /api/admin/notifications/[id]/read", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("marks a notification as read and returns { updated: true }", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
    } as never);

    const { PATCH } = await getReadHandler();
    const req = new Request("http://localhost/api/admin/notifications/notif-1/read", {
      method: "PATCH",
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "notif-1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated).toBe(true);
    expect(body.error).toBeNull();
  });

  it("returns 500 when update fails", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
        }),
      }),
    } as never);

    const { PATCH } = await getReadHandler();
    const req = new Request("http://localhost/api/admin/notifications/notif-1/read", {
      method: "PATCH",
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "notif-1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});

// ─── Read All Tests ───────────────────────────────────────────────────────────

describe("POST /api/admin/notifications/read-all", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("marks all notifications as read and returns updated_count", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          // count unread
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 3, data: null, error: null }),
            }),
          };
        }
        // update all unread
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }),
    } as never);

    const { POST } = await getReadAllHandler();
    const req = new Request("http://localhost/api/admin/notifications/read-all", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated_count).toBe(3);
    expect(body.error).toBeNull();
  });

  it("returns updated_count of 0 when no unread notifications", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: null, data: null, error: null }),
            }),
          };
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }),
    } as never);

    const { POST } = await getReadAllHandler();
    const req = new Request("http://localhost/api/admin/notifications/read-all", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.updated_count).toBe(0);
  });

  it("returns 500 when update fails", async () => {
    mockRequireAdminSession.mockResolvedValue(makeAdminSession() as never);

    let fromCallIndex = 0;
    mockGetAdminClient.mockReturnValue({
      from: vi.fn().mockImplementation(() => {
        fromCallIndex++;
        if (fromCallIndex === 1) {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ count: 2, data: null, error: null }),
            }),
          };
        }
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: { message: "DB error" } }),
          }),
        };
      }),
    } as never);

    const { POST } = await getReadAllHandler();
    const req = new Request("http://localhost/api/admin/notifications/read-all", {
      method: "POST",
    });
    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
  });
});

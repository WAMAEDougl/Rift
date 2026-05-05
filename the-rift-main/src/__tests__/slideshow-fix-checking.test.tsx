/**
 * Fix-checking tests for the slideshow-instant-start bugfix.
 *
 * These tests verify the FIXED behaviour of `SlideshowProvider`:
 *   - Task 4.1: `slides` is `[]` and `ready` is `false` immediately on mount
 *               before the fetch resolves.
 *   - Task 4.2: `slides` equals the mapped DB banner array and `ready` is
 *               `true` after a successful fetch with DB banners.
 *   - Task 4.3: `fromDB` is `true` when DB banners are returned and `false`
 *               otherwise (empty banners or fetch failure).
 *
 * Validates: Requirements 2.1, 2.2, 2.3
 */

import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import {
  SlideshowProvider,
  useSlideshow,
  FALLBACK_SLIDES,
  type BannerSlide,
} from "@/lib/slideshow-context";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface SlideshowSnapshot {
  slides: BannerSlide[];
  ready: boolean;
  fromDB: boolean;
  current: number;
}

/**
 * Consumer component that writes the current context value into a ref so
 * tests can inspect it without needing @testing-library/react.
 */
function ContextCapture({
  snapshotRef,
}: {
  snapshotRef: React.MutableRefObject<SlideshowSnapshot | null>;
}) {
  const ctx = useSlideshow();
  snapshotRef.current = {
    slides: ctx.slides,
    ready: ctx.ready,
    fromDB: ctx.fromDB,
    current: ctx.current,
  };
  return null;
}

/** Minimal DB banner shape returned by the API. */
const DB_BANNERS = [
  {
    id: "db-1",
    image_url: "https://example.com/db-banner-1.jpg",
    mobile_image_url: null,
    title: "DB Banner One",
    subtitle: null,
    description: null,
    link_url: null,
    link_text: null,
    title_color: null,
    subtitle_color: null,
    description_color: null,
  },
  {
    id: "db-2",
    image_url: "https://example.com/db-banner-2.jpg",
    mobile_image_url: null,
    title: "DB Banner Two",
    subtitle: null,
    description: null,
    link_url: null,
    link_text: null,
    title_color: null,
    subtitle_color: null,
    description_color: null,
  },
];

/** Expected mapped slides from DB_BANNERS (mirrors the mapping in slideshow-context). */
const EXPECTED_DB_SLIDES: BannerSlide[] = DB_BANNERS.map((b) => ({
  id: b.id,
  src: b.image_url,
  mobileSrc: b.mobile_image_url,
  alt: b.title,
  title: b.title,
  subtitle: b.subtitle,
  description: b.description,
  linkUrl: b.link_url,
  linkText: b.link_text,
  titleColor: b.title_color,
  subtitleColor: b.subtitle_color,
  descriptionColor: b.description_color,
}));

// ---------------------------------------------------------------------------
// Shared setup / teardown helpers
// ---------------------------------------------------------------------------

function makeContainer() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

// ---------------------------------------------------------------------------
// Task 4.1 — Pending fetch: slides is [] and ready is false immediately
// ---------------------------------------------------------------------------

describe("Task 4.1 — Pending fetch: slides is [] and ready is false on mount", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    container = makeContainer();
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("slides is [] and ready is false immediately on mount before the fetch resolves", async () => {
    // Arrange: a fetch that never resolves so we can inspect the pending state.
    let resolveFetch!: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    // Act: mount the provider and capture the context value.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    const snapshot = snapshotRef.current!;

    // Assert: fixed behaviour — slides is empty, ready is false.
    expect(snapshot.slides).toEqual([]);
    expect(snapshot.ready).toBe(false);

    // Cleanup: resolve the pending fetch so no unhandled promise warnings occur.
    await act(async () => {
      resolveFetch(
        new Response(JSON.stringify({ banners: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
      await Promise.resolve();
    });
  });
});

// ---------------------------------------------------------------------------
// Task 4.2 — Resolved fetch with DB banners: slides equals mapped array, ready is true
// ---------------------------------------------------------------------------

describe("Task 4.2 — Resolved fetch with DB banners: slides equals mapped array and ready is true", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    container = makeContainer();
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("slides equals the mapped DB banner array and ready is true after a successful fetch", async () => {
    // Arrange: mock fetch to resolve with DB banners.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ banners: DB_BANNERS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Act: mount and let the fetch resolve.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    const snapshot = snapshotRef.current!;

    // Assert: slides equals the mapped DB banner array.
    expect(snapshot.slides).toEqual(EXPECTED_DB_SLIDES);

    // Assert: ready is true after the fetch resolved.
    expect(snapshot.ready).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 4.3 — fromDB flag: true when DB banners returned, false otherwise
// ---------------------------------------------------------------------------

describe("Task 4.3 — fromDB flag", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    container = makeContainer();
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("fromDB is true when DB banners are returned", async () => {
    // Arrange: mock fetch to resolve with DB banners.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ banners: DB_BANNERS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Act: mount and let the fetch resolve.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    // Assert: fromDB is true because DB banners were returned.
    expect(snapshotRef.current!.fromDB).toBe(true);
  });

  it("fromDB is false when fetch returns empty banners", async () => {
    // Arrange: mock fetch to resolve with an empty banners array.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ banners: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Act: mount and let the fetch resolve.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    // Assert: fromDB is false because no DB banners were returned.
    expect(snapshotRef.current!.fromDB).toBe(false);

    // Also assert slides fell back to FALLBACK_SLIDES.
    expect(snapshotRef.current!.slides).toEqual(FALLBACK_SLIDES);
    expect(snapshotRef.current!.ready).toBe(true);
  });

  it("fromDB is false when fetch fails (network error)", async () => {
    // Arrange: mock fetch to reject with a network error.
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    // Act: mount and let the fetch reject.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    // Assert: fromDB is false because the fetch failed.
    expect(snapshotRef.current!.fromDB).toBe(false);

    // Also assert slides fell back to FALLBACK_SLIDES.
    expect(snapshotRef.current!.slides).toEqual(FALLBACK_SLIDES);
    expect(snapshotRef.current!.ready).toBe(true);
  });
});

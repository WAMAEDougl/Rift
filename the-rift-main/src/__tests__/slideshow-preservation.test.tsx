/**
 * Preservation tests for the slideshow-instant-start bugfix.
 *
 * These tests verify that all existing slideshow behaviour is preserved after
 * the fix. They run on the FIXED code and assert that non-buggy paths still
 * produce the same results as before.
 *
 * Validates: Requirements 2.3, 3.1, 3.2, 3.4
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
import HeroSlideshow from "@/components/HeroSlideshow";

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

function makeContainer() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
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

// ---------------------------------------------------------------------------
// Task 5.1 — Fetch rejects (network error): fallback slides and ready = true
// ---------------------------------------------------------------------------

/**
 * Task 5.1 — Fetch error preservation.
 *
 * When the fetch rejects with a network error, the provider must fall back to
 * FALLBACK_SLIDES and set ready = true — the same visible result as the
 * original code once the fallback path is reached.
 *
 * Validates: Requirements 2.3, 3.1
 */
describe("Task 5.1 — Fetch error: slides === FALLBACK_SLIDES and ready === true", () => {
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

  it("slides === FALLBACK_SLIDES and ready === true after a fetch that rejects", async () => {
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

    const snapshot = snapshotRef.current!;

    // Assert: fallback slides are shown and slideshow is ready.
    expect(snapshot.slides).toEqual(FALLBACK_SLIDES);
    expect(snapshot.ready).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 5.2 — Fetch returns { banners: [] }: fallback slides and ready = true
// ---------------------------------------------------------------------------

/**
 * Task 5.2 — Empty banners preservation.
 *
 * When the fetch returns { banners: [] }, the provider must fall back to
 * FALLBACK_SLIDES and set ready = true.
 *
 * Validates: Requirements 2.3, 3.1
 */
describe("Task 5.2 — Empty banners: slides === FALLBACK_SLIDES and ready === true", () => {
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

  it("slides === FALLBACK_SLIDES and ready === true after fetch returns { banners: [] }", async () => {
    // Arrange: mock fetch to return an empty banners array.
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

    const snapshot = snapshotRef.current!;

    // Assert: fallback slides are shown and slideshow is ready.
    expect(snapshot.slides).toEqual(FALLBACK_SLIDES);
    expect(snapshot.ready).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Task 5.3 — Auto-advance: current increments every 6000 ms after ready = true
// ---------------------------------------------------------------------------

/**
 * Task 5.3 — Auto-advance preservation.
 *
 * After ready becomes true, the interval timer must advance current by 1 every
 * 6000 ms. Uses vi.useFakeTimers() to control time.
 *
 * Validates: Requirement 3.2
 */
describe("Task 5.3 — Auto-advance: current increments every 6000 ms after ready = true", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    vi.useFakeTimers();
    container = makeContainer();
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("current increments by 1 after 6000 ms once ready is true", async () => {
    // Arrange: mock fetch to resolve with DB banners so ready becomes true.
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ banners: DB_BANNERS }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    // Act: mount and let the fetch resolve so ready becomes true.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    // Confirm ready is true and current starts at 0.
    expect(snapshotRef.current!.ready).toBe(true);
    const initialCurrent = snapshotRef.current!.current;
    expect(initialCurrent).toBe(0);

    // Act: advance fake timers by 6000 ms to trigger one auto-advance tick.
    await act(async () => {
      vi.advanceTimersByTime(6000);
    });

    // Assert: current has incremented by 1 (wraps around if only 1 slide, but
    // we have 2 DB banners so it goes from 0 to 1).
    expect(snapshotRef.current!.current).toBe(initialCurrent + 1);
  });
});

// ---------------------------------------------------------------------------
// Task 5.4 — HeroContent and FloatingBadge visibility based on fromDB
// ---------------------------------------------------------------------------

/**
 * Task 5.4 — fromDB text overlay preservation.
 *
 * HeroContent and FloatingBadge both check `fromDB` from context and return
 * null when fromDB is true. This test verifies:
 *   - When fromDB is true (DB banners returned): HeroContent and FloatingBadge
 *     are not rendered.
 *   - When fromDB is false (no DB banners): HeroContent and FloatingBadge are
 *     rendered.
 *
 * Since HeroContent and FloatingBadge are defined inline in page.tsx and use
 * useSlideshow() directly, we replicate their conditional logic here.
 *
 * Validates: Requirement 3.4
 */

/**
 * Minimal replica of HeroContent's conditional rendering logic.
 * Returns null when fromDB is true, renders a sentinel element otherwise.
 */
function TestHeroContent() {
  const { fromDB } = useSlideshow();
  if (fromDB) return null;
  return <div data-testid="hero-content">Hero Content</div>;
}

/**
 * Minimal replica of FloatingBadge's conditional rendering logic.
 * Returns null when fromDB is true, renders a sentinel element otherwise.
 */
function TestFloatingBadge() {
  const { fromDB } = useSlideshow();
  if (fromDB) return null;
  return <div data-testid="floating-badge">Floating Badge</div>;
}

describe("Task 5.4 — HeroContent and FloatingBadge visibility based on fromDB", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

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

  it("HeroContent and FloatingBadge are NOT rendered when fromDB is true (DB banners returned)", async () => {
    // Arrange: mock fetch to return DB banners → fromDB becomes true.
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
          <TestHeroContent />
          <TestFloatingBadge />
        </SlideshowProvider>
      );
    });

    // Assert: neither component is in the DOM when fromDB is true.
    expect(container.querySelector('[data-testid="hero-content"]')).toBeNull();
    expect(container.querySelector('[data-testid="floating-badge"]')).toBeNull();
  });

  it("HeroContent and FloatingBadge ARE rendered when fromDB is false (no DB banners)", async () => {
    // Arrange: mock fetch to return empty banners → fromDB stays false.
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
          <TestHeroContent />
          <TestFloatingBadge />
        </SlideshowProvider>
      );
    });

    // Assert: both components are in the DOM when fromDB is false.
    expect(container.querySelector('[data-testid="hero-content"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="floating-badge"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 5.5 — Loading skeleton while ready = false, slides after ready = true
// ---------------------------------------------------------------------------

/**
 * Task 5.5 — Loading skeleton preservation.
 *
 * HeroSlideshow renders a skeleton <div> with animate-pulse when !ready, and
 * renders the actual slides once ready = true.
 *
 * Validates: Requirement 2.4
 */
describe("Task 5.5 — Loading skeleton while ready = false, slides after ready = true", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;

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

  it("skeleton with animate-pulse is rendered while ready is false (pending fetch)", async () => {
    // Arrange: a fetch that never resolves so ready stays false.
    let resolveFetch!: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    // Act: mount and inspect while fetch is still pending.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <HeroSlideshow />
        </SlideshowProvider>
      );
    });

    // Assert: the skeleton div with animate-pulse is present.
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).not.toBeNull();

    // Assert: no slide <img> elements are rendered yet.
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(0);

    // Cleanup: resolve the pending fetch to avoid unhandled promise warnings.
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

  it("skeleton is gone and slides are rendered after ready becomes true", async () => {
    // Arrange: mock fetch to resolve with DB banners so ready becomes true.
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
          <HeroSlideshow />
        </SlideshowProvider>
      );
    });

    // Assert: the skeleton is gone.
    const skeleton = container.querySelector(".animate-pulse");
    expect(skeleton).toBeNull();

    // Assert: slide <img> elements are now rendered (one per DB banner).
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(DB_BANNERS.length);
  });
});

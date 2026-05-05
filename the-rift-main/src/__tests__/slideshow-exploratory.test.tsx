/**
 * Exploratory tests for the slideshow-instant-start bugfix.
 *
 * These tests document what the BUG CONDITION looked like and confirm it no
 * longer exists in the fixed code. Each test is written to PASS against the
 * fixed implementation by asserting the CORRECT (fixed) behaviour, with
 * comments explaining what the original buggy behaviour was.
 *
 * Bug summary:
 *   On unfixed code, `SlideshowProvider` initialised `slides` with
 *   `FALLBACK_SLIDES` and `ready = true` synchronously on mount — before the
 *   `/api/banners?position=hero` fetch had even been dispatched. This caused
 *   users to see Unsplash fallback images immediately, even when DB banners
 *   existed, and then experience a jarring mid-play swap once the fetch
 *   resolved.
 */

import React, { useContext, createContext } from "react";
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

/** Captured context snapshot from a render. */
interface SlideshowSnapshot {
  slides: BannerSlide[];
  ready: boolean;
  fromDB: boolean;
  current: number;
}

/**
 * A consumer component that writes the current context value into a ref so
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
// Test 3.1 — Pending fetch: slides is [] and ready is false immediately
// ---------------------------------------------------------------------------

/**
 * Task 3.1 — Bug condition no longer exists on mount.
 *
 * On UNFIXED code:
 *   - `slides` would equal `FALLBACK_SLIDES` immediately on mount (before the
 *     fetch resolved), because the initial state was
 *     `useState<BannerSlide[]>(FALLBACK_SLIDES)`.
 *   - `ready` would be `true` immediately, because the initial state was
 *     `useState(true)`, causing the auto-advance timer to start and
 *     `HeroSlideshow` to render fallback images right away.
 *
 * This test confirms the bug condition NO LONGER EXISTS: with the fix applied,
 * `slides` is `[]` and `ready` is `false` immediately on mount while the fetch
 * is still pending.
 */
describe("Task 3.1 — Pending fetch: bug condition no longer exists on mount", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("slides is [] (not FALLBACK_SLIDES) and ready is false immediately on mount with a pending fetch", async () => {
    // Arrange: mock fetch to never resolve so we can inspect the pending state.
    // On unfixed code, fetch was irrelevant — slides were FALLBACK_SLIDES and
    // ready was true BEFORE the fetch even ran.
    let resolveFetch!: (value: Response) => void;
    const pendingFetch = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.spyOn(globalThis, "fetch").mockReturnValue(pendingFetch);

    // Act: mount the provider and capture the context value synchronously.
    await act(async () => {
      root.render(
        <SlideshowProvider>
          <ContextCapture snapshotRef={snapshotRef} />
        </SlideshowProvider>
      );
    });

    const snapshot = snapshotRef.current!;

    // Assert: fixed behaviour — slides is empty, ready is false.
    //
    // On unfixed code this would have been:
    //   expect(snapshot.slides).toEqual(FALLBACK_SLIDES)  // BUG
    //   expect(snapshot.ready).toBe(true)                 // BUG
    //
    // The assertions below confirm the bug condition no longer exists:
    expect(snapshot.slides).toEqual([]);
    expect(snapshot.ready).toBe(false);

    // Cleanup: resolve the pending fetch and flush all state updates so no
    // unhandled promise or act() warnings occur after the test ends.
    await act(async () => {
      resolveFetch(
        new Response(JSON.stringify({ banners: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      );
      // Yield to the microtask queue so the fetch .then() runs.
      await Promise.resolve();
    });
  });
});

// ---------------------------------------------------------------------------
// Test 3.2 — Resolved fetch: slides go from [] directly to DB slides (no swap)
// ---------------------------------------------------------------------------

/**
 * Task 3.2 — No mid-play swap: slides go from [] directly to DB slides.
 *
 * On UNFIXED code:
 *   - `slides` started as `FALLBACK_SLIDES` immediately on mount.
 *   - After the fetch resolved with DB banners, `slides` was replaced with DB
 *     banner slides — a visible mid-play swap from Unsplash images to DB images.
 *   - Users always saw fallback content first, even when DB banners existed.
 *
 * This test confirms the mid-play swap NO LONGER OCCURS: with the fix applied,
 * `slides` goes from `[]` (pending) directly to the DB banner slides after the
 * fetch resolves — `FALLBACK_SLIDES` never appears in the slides array when DB
 * banners are available.
 */
describe("Task 3.2 — Resolved fetch: no mid-play swap, slides go from [] to DB slides", () => {
  let container: HTMLDivElement;
  let root: ReturnType<typeof createRoot>;
  const snapshotRef: React.MutableRefObject<SlideshowSnapshot | null> = {
    current: null,
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  it("slides equals DB banner slides after fetch resolves and FALLBACK_SLIDES never appeared", async () => {
    // Arrange: track every slides value the context ever emits so we can
    // verify FALLBACK_SLIDES never appeared at any point.
    const slidesHistory: BannerSlide[][] = [];

    function TrackingConsumer() {
      const ctx = useSlideshow();
      // Record every render's slides value.
      slidesHistory.push(ctx.slides);
      snapshotRef.current = {
        slides: ctx.slides,
        ready: ctx.ready,
        fromDB: ctx.fromDB,
        current: ctx.current,
      };
      return null;
    }

    // Mock fetch to resolve with DB banners.
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
          <TrackingConsumer />
        </SlideshowProvider>
      );
    });

    const snapshot = snapshotRef.current!;

    // Assert 1: after fetch resolves, slides equals the mapped DB banner slides.
    //
    // On unfixed code this would have been:
    //   expect(snapshot.slides).toEqual(FALLBACK_SLIDES)  // initial state (BUG)
    //   // then later: expect(snapshot.slides).toEqual(EXPECTED_DB_SLIDES)
    //   // — but the user already saw FALLBACK_SLIDES first (the mid-play swap)
    //
    expect(snapshot.slides).toEqual(EXPECTED_DB_SLIDES);

    // Assert 2: ready is true after the fetch resolved.
    expect(snapshot.ready).toBe(true);

    // Assert 3: fromDB is true because DB banners were returned.
    expect(snapshot.fromDB).toBe(true);

    // Assert 4: FALLBACK_SLIDES never appeared in the slides history.
    //
    // On unfixed code, slidesHistory[0] would have been FALLBACK_SLIDES —
    // confirming the mid-play swap. With the fix, slides goes from [] directly
    // to DB slides, so FALLBACK_SLIDES should never appear.
    const fallbackEverAppeared = slidesHistory.some(
      (s) =>
        s.length === FALLBACK_SLIDES.length &&
        s[0]?.id === FALLBACK_SLIDES[0].id
    );
    expect(fallbackEverAppeared).toBe(false);

    // Assert 5: the slides history shows the expected transition: [] → DB slides.
    // (There may be intermediate renders, but the first non-empty slides value
    //  must be the DB slides, not FALLBACK_SLIDES.)
    const firstNonEmpty = slidesHistory.find((s) => s.length > 0);
    expect(firstNonEmpty).toEqual(EXPECTED_DB_SLIDES);
  });
});

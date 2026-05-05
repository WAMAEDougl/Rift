# Slideshow Instant Start Bugfix Design

## Overview

The hero slideshow in `slideshow-context.tsx` initialises with `FALLBACK_SLIDES` and
`ready = true` on mount. When DB banners exist, users see Unsplash fallback images first,
then experience a mid-play swap to DB banner images. The fix changes the initial state to a
pending/loading mode (`slides = []`, `ready = false`), waits for the `/api/banners?position=hero`
fetch to resolve, then sets the slideshow to either DB banners or fallback slides — never both.
`HeroSlideshow` already gates rendering on `ready`, so a loading skeleton can be shown while
the fetch is in flight.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug — the slideshow starts with
  `FALLBACK_SLIDES` and `ready = true` before the DB fetch completes, causing fallback slides
  to be shown even when DB banners exist.
- **Property (P)**: The desired behaviour — if DB banners exist, only DB banners are ever
  shown; fallback slides are shown only when the DB fetch fails or returns empty.
- **Preservation**: All existing slideshow behaviour (auto-advance, dot indicators, pause on
  hover, progress bar, `fromDB` text overlays, fallback-on-error) must remain unchanged.
- **SlideshowProvider**: The React context provider in `src/lib/slideshow-context.tsx` that
  owns all slideshow state and the DB fetch.
- **HeroSlideshow**: The component in `src/components/HeroSlideshow.tsx` that renders slides;
  it already reads `ready` from context.
- **ready**: Boolean context value — `false` while the DB fetch is in flight, `true` once
  slides have been determined.
- **fromDB**: Boolean context value — `true` when the active slides came from the database.
- **FALLBACK_SLIDES**: The five static Unsplash `BannerSlide` objects used when no DB banners
  are available.

## Bug Details

### Bug Condition

The bug manifests on every homepage load when DB banners exist. `SlideshowProvider` calls
`useState<BannerSlide[]>(FALLBACK_SLIDES)` and `useState(true)` (for `ready`) synchronously
during render, so the slideshow is immediately active with fallback content before the
`useEffect` fetch has even been dispatched.

**Formal Specification:**
```
FUNCTION isBugCondition(state)
  INPUT: state — the SlideshowProvider state at the moment the component first renders
  OUTPUT: boolean

  RETURN state.slides === FALLBACK_SLIDES          // initialised with fallbacks
         AND state.ready === true                  // slideshow already active
         AND dbBannersExist()                      // DB has hero banners
END FUNCTION
```

### Examples

- **DB banners exist**: Page loads → user sees Unsplash slide 1 for ~200–800 ms → DB fetch
  resolves → slides swap to DB banner 1. User has seen content they should never see.
- **DB fetch is slow (>1 s)**: User sees multiple Unsplash slides auto-advance before the
  swap. The swap is jarring and confusing.
- **DB fetch fails**: User sees Unsplash fallbacks — this is correct and must be preserved.
- **DB returns empty array**: User sees Unsplash fallbacks — this is correct and must be
  preserved.

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When the DB fetch fails or returns empty, fallback Unsplash slides are shown as before.
- Once slides are set and `ready = true`, auto-advance on the 6000 ms interval continues
  to work exactly as before.
- Dot-indicator clicks (`goTo`), pause-on-hover, and the progress bar animation are
  unaffected.
- When `fromDB` is true, `HeroContent` and `FloatingBadge` hide themselves and per-slide
  DB text overlays are shown — this logic is unchanged.
- The slideshow context works without errors on pages other than the homepage.

**Scope:**
All behaviour that occurs after `ready` becomes `true` is completely unaffected by this fix.
The only change is what happens between mount and the first time `ready` is set to `true`.

## Hypothesized Root Cause

The root cause is a single, direct initialisation decision:

1. **Eager fallback initialisation**: `useState<BannerSlide[]>(FALLBACK_SLIDES)` sets slides
   to fallback content synchronously. There is no "pending" state — the slideshow is live
   before the fetch runs.

2. **Eager ready flag**: `useState(true)` for `ready` means the interval timer starts
   immediately (the `useEffect` that drives auto-advance checks `ready`), so fallback slides
   begin auto-advancing before the DB response arrives.

3. **No loading placeholder path**: Because `ready` starts as `true`, `HeroSlideshow` never
   enters a loading state; it renders fallback slides immediately.

## Correctness Properties

Property 1: Bug Condition — DB Banners Are Shown Without Fallback Interstitial

_For any_ homepage load where `isBugCondition` holds (DB banners exist and the provider
mounts), the fixed `SlideshowProvider` SHALL initialise with `ready = false` and an empty
slides array, wait for the DB fetch to complete, and then set `slides` to the DB banner
slides and `ready = true` — so fallback Unsplash slides are never rendered to the user.

**Validates: Requirements 2.1, 2.2**

Property 2: Preservation — Fallback Path Is Unchanged

_For any_ homepage load where `isBugCondition` does NOT hold (DB fetch fails or returns
empty), the fixed `SlideshowProvider` SHALL set `slides` to `FALLBACK_SLIDES` and
`ready = true` after the fetch resolves, producing exactly the same visible result as the
original code once the fallback path is reached.

**Validates: Requirements 2.3, 3.1**

## Fix Implementation

### Changes Required

**File**: `src/lib/slideshow-context.tsx`

**Specific Changes:**

1. **Change initial `slides` state**: Replace `useState<BannerSlide[]>(FALLBACK_SLIDES)` with
   `useState<BannerSlide[]>([])` so no slides are shown before the fetch completes.

2. **Change initial `ready` state**: Replace `useState(true)` with `useState(false)` so the
   auto-advance timer does not start and `HeroSlideshow` renders a loading state.

3. **Update the fetch `useEffect`**:
   - In the `.then` success branch: if DB banners exist, call `setSlides(dbSlides)` and
     `setFromDB(true)`, then `setReady(true)`.
   - In the `.catch` error branch: call `setSlides(FALLBACK_SLIDES)` and `setReady(true)`.
   - In the success branch when no banners are returned: call `setSlides(FALLBACK_SLIDES)`
     and `setReady(true)`.
   - Remove the `.finally` block (it is no longer needed; each branch sets `ready`
     explicitly).

4. **Remove `setCurrent(0)` from `.finally`**: `current` starts at `0` by default; resetting
   it in `.finally` is redundant and was masking the mid-play swap issue.

**File**: `src/components/HeroSlideshow.tsx`

5. **Add loading skeleton**: When `!ready`, render a skeleton/placeholder `<div>` in place of
   the slides so the hero area does not appear blank. A simple dark background with a subtle
   pulse animation is sufficient.

### Pseudocode for Fixed `useEffect`

```
useEffect(() => {
  fetch("/api/banners?position=hero")
    .then(r => r.json())
    .then(data => {
      IF data.banners AND data.banners.length > 0 THEN
        setSlides(mapToDBSlides(data.banners))
        setFromDB(true)
      ELSE
        setSlides(FALLBACK_SLIDES)
      END IF
      setReady(true)
    })
    .catch(() => {
      setSlides(FALLBACK_SLIDES)
      setReady(true)
    })
}, [])
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that
demonstrate the bug on unfixed code, then verify the fix works correctly and preserves
existing behaviour.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.
Confirm or refute the root cause analysis.

**Test Plan**: Mock the `/api/banners?position=hero` fetch to return DB banners. Render
`SlideshowProvider` and immediately inspect the context value before the fetch resolves.
Assert that fallback slides are visible — this will pass on unfixed code, confirming the bug.

**Test Cases**:
1. **Immediate fallback render**: Mount provider with mocked fetch (pending). Assert
   `slides === FALLBACK_SLIDES` and `ready === true` on unfixed code. (Demonstrates bug.)
2. **Mid-play swap**: Mount provider, let fetch resolve with DB banners. Assert that `slides`
   changed from `FALLBACK_SLIDES` to DB slides after resolution. (Demonstrates the swap.)
3. **Fallback shown before fetch**: Assert that `HeroSlideshow` renders `<img>` elements with
   Unsplash URLs before the fetch resolves when DB banners exist. (Demonstrates user impact.)

**Expected Counterexamples**:
- On unfixed code: `slides` equals `FALLBACK_SLIDES` immediately on mount even when DB
  banners will be returned.
- On unfixed code: `ready` is `true` before the fetch completes.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed provider
produces the expected behaviour.

**Pseudocode:**
```
FOR ALL mount WHERE isBugCondition(mount) DO
  result := SlideshowProvider_fixed(mount)
  ASSERT result.slides === [] BEFORE fetch resolves
  ASSERT result.ready === false BEFORE fetch resolves
  ASSERT result.slides === dbSlides AFTER fetch resolves
  ASSERT result.ready === true AFTER fetch resolves
  ASSERT FALLBACK_SLIDES never appeared in result.slides
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (fetch fails or
returns empty), the fixed provider produces the same result as the original.

**Pseudocode:**
```
FOR ALL mount WHERE NOT isBugCondition(mount) DO
  ASSERT SlideshowProvider_original(mount).slides_final
       = SlideshowProvider_fixed(mount).slides_final
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because
it can generate many fetch-response shapes (empty arrays, network errors, partial data) and
verify that the final slides state always equals `FALLBACK_SLIDES` in all non-buggy cases.

**Test Cases**:
1. **Fetch error preservation**: Mock fetch to reject. Assert `slides === FALLBACK_SLIDES`
   and `ready === true` after resolution — same as original.
2. **Empty banners preservation**: Mock fetch to return `{ banners: [] }`. Assert
   `slides === FALLBACK_SLIDES` and `ready === true` — same as original.
3. **Auto-advance preservation**: After `ready` becomes `true`, assert the interval timer
   advances `current` every 6000 ms regardless of whether slides came from DB or fallback.
4. **`fromDB` flag preservation**: When DB banners are returned, assert `fromDB === true`
   and `HeroContent` / `FloatingBadge` are not rendered.

### Unit Tests

- Test that `slides` is `[]` and `ready` is `false` immediately on mount (before fetch).
- Test that `slides` equals DB banner slides and `ready` is `true` after a successful fetch.
- Test that `slides` equals `FALLBACK_SLIDES` and `ready` is `true` after a failed fetch.
- Test that `slides` equals `FALLBACK_SLIDES` and `ready` is `true` when fetch returns empty.
- Test that `fromDB` is `true` only when DB banners are returned.

### Property-Based Tests

- Generate random arrays of DB banner objects; verify that after a successful fetch the
  provider's `slides` exactly matches the mapped array and `FALLBACK_SLIDES` never appears.
- Generate random fetch failure modes (network error, non-200, malformed JSON); verify that
  `slides` always ends up as `FALLBACK_SLIDES` and `ready` is always `true`.
- Generate random `current` indices and verify that `goTo` and auto-advance behave
  identically before and after the fix for the same slide array.

### Integration Tests

- Full homepage render with mocked DB banners: assert no Unsplash `<img>` src appears in
  the DOM at any point after `ready` becomes `true`.
- Full homepage render with fetch failure: assert Unsplash fallback images are shown and
  the slideshow auto-advances normally.
- Verify `HeroContent` and `FloatingBadge` are hidden when `fromDB` is `true` and visible
  when `fromDB` is `false`.
- Verify the loading skeleton is rendered while `ready` is `false` and disappears once
  `ready` becomes `true`.

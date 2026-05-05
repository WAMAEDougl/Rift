# Slideshow Instant Start — Implementation Tasks

## Tasks

- [x] 1. Update SlideshowProvider initial state and fetch logic
  - [x] 1.1 Change `useState<BannerSlide[]>(FALLBACK_SLIDES)` to `useState<BannerSlide[]>([])` so no slides are rendered before the DB fetch completes
  - [x] 1.2 Change `useState(true)` for `ready` to `useState(false)` so the auto-advance timer does not start and HeroSlideshow enters a loading state
  - [x] 1.3 In the fetch `.then` success branch, when DB banners exist: call `setSlides(dbSlides)`, `setFromDB(true)`, then `setReady(true)`
  - [x] 1.4 In the fetch `.then` success branch, when no banners are returned: call `setSlides(FALLBACK_SLIDES)` then `setReady(true)`
  - [x] 1.5 In the fetch `.catch` error branch: call `setSlides(FALLBACK_SLIDES)` then `setReady(true)`
  - [x] 1.6 Remove the `.finally` block (each branch now sets `ready` explicitly; `setCurrent(0)` is redundant since `current` starts at `0`)

- [x] 2. Add loading skeleton to HeroSlideshow
  - [x] 2.1 When `!ready`, render a full-size dark placeholder `<div>` with a subtle pulse animation in place of the slides so the hero area does not appear blank during the fetch

- [x] 3. Write exploratory tests (run on unfixed code to confirm bug)
  - [x] 3.1 Write a test that mounts `SlideshowProvider` with a pending fetch mock and asserts `slides === FALLBACK_SLIDES` and `ready === true` immediately — this should PASS on unfixed code, confirming the bug condition
  - [x] 3.2 Write a test that lets the fetch resolve with DB banners and asserts `slides` changed from `FALLBACK_SLIDES` to DB slides — this should PASS on unfixed code, confirming the mid-play swap

- [x] 4. Write fix-checking tests (run on fixed code)
  - [x] 4.1 Assert `slides` is `[]` and `ready` is `false` immediately on mount before the fetch resolves
  - [x] 4.2 Assert `slides` equals the mapped DB banner array and `ready` is `true` after a successful fetch with DB banners
  - [x] 4.3 Assert `fromDB` is `true` when DB banners are returned and `false` otherwise

- [x] 5. Write preservation tests (run on fixed code)
  - [x] 5.1 Assert `slides === FALLBACK_SLIDES` and `ready === true` after a fetch that rejects (network error)
  - [x] 5.2 Assert `slides === FALLBACK_SLIDES` and `ready === true` after a fetch that returns `{ banners: [] }`
  - [x] 5.3 Assert the auto-advance interval still advances `current` every 6000 ms after `ready` becomes `true`
  - [x] 5.4 Assert `HeroContent` and `FloatingBadge` are hidden when `fromDB` is `true` and visible when `fromDB` is `false`
  - [x] 5.5 Assert the loading skeleton is rendered while `ready` is `false` and is replaced by slides once `ready` is `true`

# Bugfix Requirements Document

## Introduction

When a visitor lands on the homepage and DB banners exist in the database, the hero slideshow
incorrectly shows Unsplash fallback slides first, then replaces them with DB banner slides once
the `/api/banners?position=hero` fetch completes. This means users always see Unsplash images
on initial load even when DB banners are available — the fallback slides should never be shown
if DB banners exist. The fix must hold the slideshow in a pending/loading state on mount, wait
for the DB fetch to complete, and only then decide what to show: DB banners if available,
fallback slides only if the fetch fails or returns empty.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the homepage loads and DB banners exist THEN the system immediately initialises
`slides` with `FALLBACK_SLIDES` and sets `ready = true`, causing the slideshow to start
playing Unsplash fallback images before the DB fetch has completed.

1.2 WHEN the DB banner fetch completes and DB banners are found THEN the system calls
`setSlides(dbSlides)` mid-play, causing a visible swap from Unsplash images to DB banner
images — the user has already seen fallback content that should never have been shown.

1.3 WHEN the DB banner fetch fails or returns empty THEN the system falls back to
`FALLBACK_SLIDES`, which is correct, but this path is currently reached even when DB banners
do exist because the fallback is shown unconditionally on mount.

### Expected Behavior (Correct)

2.1 WHEN the homepage loads THEN the system SHALL hold the slideshow in a loading/pending
state (no slides shown, `ready = false`) until the `/api/banners?position=hero` fetch
completes.

2.2 WHEN the DB banner fetch completes and DB banners are found THEN the system SHALL
initialise the slideshow directly with DB banner slides, so fallback Unsplash slides are
never shown to the user.

2.3 WHEN the DB banner fetch fails or returns an empty array THEN the system SHALL
initialise the slideshow with the fallback Unsplash slides, providing a graceful degradation.

2.4 WHEN the slideshow is in the pending/loading state THEN the system SHALL render a
loading placeholder (e.g. skeleton or spinner) in the hero area so the page does not appear
broken while waiting for the fetch.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the DB banner fetch fails or returns no banners THEN the system SHALL CONTINUE TO
display the fallback Unsplash slides without interruption or visible change.

3.2 WHEN DB banners are loaded and the slideshow is running THEN the system SHALL CONTINUE TO
auto-advance slides on the normal 6000 ms interval.

3.3 WHEN DB banners are loaded and the slideshow is running THEN the system SHALL CONTINUE TO
respond to dot-indicator clicks, pause on hover, and display the progress bar animation as
before.

3.4 WHEN the DB banner fetch completes and `fromDB` becomes true THEN the system SHALL
CONTINUE TO hide the fallback hero text (`HeroContent`) and floating badge, and show
per-slide DB banner text overlays.

3.5 WHEN the user is on a page other than the homepage THEN the system SHALL CONTINUE TO
operate the slideshow context without errors or unnecessary network requests.

# About Page Slideshow Implementation

## Changes Made

### 1. Mock Data File (`src/lib/mockdata.ts`)
Created a new mock data module with:
- `aboutTimeline`: 4 timeline items for company history
- `aboutValues`: 6 value items (Excellence, Sustainability, Community, Innovation, Transparency, Integrity)
- `founderInfo`: Founder bio and credentials
- `aboutHero`: Hero section tagline, title, and description
- `ourStory`: Story section tagline, title, and description  
- `missionVision`: Vision and mission statements

### 2. Updated About Page (`src/app/about/page.tsx`)
- Imported and used mock data instead of hardcoded content
- Added React state for slideshow management (`useState`, `useEffect`)
- Implemented auto-advancing slideshow (5-second intervals)
- Added 10 slideshow images with professional alt text:
  1. Farm fresh ingredients
  2. Chef preparing meals
  3. Community dining together
  4. Fresh produce display
  5. Artisanal food preparation
  6. Family style meal service
  7. Kitchen team in action
  8. Gourmet plated dishes
  9. Local sourcing partners
  10. Culinary craftsmanship
- Manual dot navigation controls (click to jump to any slide)
- Accessible ARIA labels on controls
- Active state indicators

### 3. Slideshow Styling (`src/app/globals.css`)
Added to `@layer utilities`:
- `.hero-slideshow`: Absolute-positioned container
- `.slide`: Individual slides with opacity transitions (1s ease-in-out)
- `.slide.active`: Z-index management for active slide
- `.slide-image`: Full-cover image styling
- `.slide-overlay`: Gradient overlay matching design system colors
- `.slide-dot`: Navigation dots with hover/active states
- Professional color-mix() usage with design tokens

### 4. Design System Preservation
- All existing Typography maintained (`font-display`, `font-sans`)
- Color tokens used: `--clay`, `--cream`, `--ochre`, `--ink`
- Spacing and layout consistent with existing pages
- Dark mode support via CSS custom properties
- No hardcoded color values

## Technical Details

### Component Structure
```tsx
"use client"

export default function AboutPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 10);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Slideshow with overlay + controls
}
```

### Slideshow Features
- **Auto-advance**: Every 5 seconds, loops seamlessly
- **Manual control**: Click dots to navigate instantly
- **Smooth transition**: 1-second fade between slides
- **Professional overlay**: 60% opacity gradient overlay
- **Responsive**: Works on all screen sizes
- **Accessible**: ARIA labels, keyboard-navigable buttons

### Color Scheme
- Background overlay: Clay/Cream gradient mix
- Dots: Clay with hover states
- Text: Foreground (ink) on cream background
- Maintains full WCAG contrast compliance

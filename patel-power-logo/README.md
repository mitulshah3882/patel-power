# Patel Power Logo Assets

This folder contains all the logo assets for the Patel Power app.

## Files Included

### SVG Files
- **`logo-full.svg`** - Full logo with "PATEL POWER" text (use in app header, about page)
- **`icon.svg`** - Lightning bolt icon only, transparent background (use as component)
- **`icon-with-bg.svg`** - Lightning bolt with warm rounded background (PWA icon)
- **`icon-maskable.svg`** - Lightning bolt with extra padding for Android adaptive icons
- **`favicon.svg`** - Small optimized version for browser favicon

### React Component
- **`Logo.tsx`** - React/TypeScript component with `PatelPowerLogo` and `PatelPowerIcon` exports

## Setup Instructions

### 1. Generate PNG Icons for PWA

Run this script to generate PNG files from the SVGs:

```bash
# Install sharp-cli for SVG to PNG conversion
npm install -g sharp-cli

# Generate PWA icons
npx sharp -i icon-with-bg.svg -o icon-192.png resize 192 192
npx sharp -i icon-with-bg.svg -o icon-512.png resize 512 512
npx sharp -i icon-maskable.svg -o icon-maskable-192.png resize 192 192
npx sharp -i icon-maskable.svg -o icon-maskable-512.png resize 512 512
npx sharp -i icon-with-bg.svg -o apple-touch-icon.png resize 180 180
npx sharp -i favicon.svg -o favicon-32.png resize 32 32
npx sharp -i favicon.svg -o favicon-16.png resize 16 16
```

Or use an online converter like https://realfavicongenerator.net/

### 2. Place Files in Project

```
/public
  /icons
    icon-192.png
    icon-512.png
    icon-maskable-192.png
    icon-maskable-512.png
    apple-touch-icon.png
  favicon.svg (or favicon.ico)
  manifest.json
  
/components
  Logo.tsx
```

### 3. Update manifest.json

```json
{
  "name": "Patel Power",
  "short_name": "Patel Power",
  "description": "Family fitness tracker for the Patel family",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fffbeb",
  "theme_color": "#f97316",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### 4. Add to HTML head (in layout.tsx or _document.tsx)

```html
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#f97316" />
```

### 5. Use the React Component

```tsx
import { PatelPowerLogo, PatelPowerIcon } from '@/components/Logo';

// Full logo with text
<PatelPowerLogo size={120} showText />

// Icon only (for nav, buttons, etc.)
<PatelPowerIcon size={32} />

// With custom className
<PatelPowerLogo className="animate-pulse" size={48} />
```

## Brand Colors

- **Primary Orange:** #f97316
- **Yellow Accent:** #fbbf24
- **Dark Text:** #1f2937
- **Warm Background:** #fffbeb

---
name: visual-test
description: Visual testing with Playwright CLI — capture screenshots, generate PDFs, compare pages across viewports and browsers
user-invocable: true
---

# Playwright Visual Testing Skill

Capture screenshots, generate PDFs, and perform visual comparisons of pages using the Playwright CLI (v1.58.2).

## Prerequisites

- **Playwright**: v1.58.2 (installed globally via npx)
- **Browsers installed**: Chromium, Firefox, WebKit
- **Dev server**: Must be running (default `http://localhost:3000`) before capturing

## Core Commands

### Screenshot

```bash
# Basic screenshot
bunx playwright screenshot <url> <output.png>

# Full page screenshot
bunx playwright screenshot --full-page <url> <output.png>

# Specific viewport
bunx playwright screenshot --viewport-size "1280,720" <url> <output.png>

# Mobile device emulation
bunx playwright screenshot --device "iPhone 14" <url> <output.png>

# Wait for element before capture
bunx playwright screenshot --wait-for-selector ".content-loaded" <url> <output.png>

# Wait for timeout (ms) before capture
bunx playwright screenshot --wait-for-timeout 3000 <url> <output.png>

# Dark mode
bunx playwright screenshot --color-scheme dark <url> <output.png>

# Specific browser
bunx playwright screenshot -b firefox <url> <output.png>
bunx playwright screenshot -b webkit <url> <output.png>
```

### PDF Generation

```bash
# Basic PDF
bunx playwright pdf <url> <output.pdf>

# Specific paper format
bunx playwright pdf --paper-format A4 <url> <output.pdf>

# Wait for content before PDF
bunx playwright pdf --wait-for-selector ".report-ready" <url> <output.pdf>
```

## Available Operations

When the user invokes `/visual-test`, determine what they need:

### Screenshot Capture
- **`/visual-test screenshot <page>`** — Take a screenshot of a page (relative to dev server)
- **`/visual-test screenshot <page> --full`** — Full page scrollable screenshot
- **`/visual-test screenshot <page> --mobile`** — Screenshot with iPhone 14 emulation
- **`/visual-test screenshot <page> --dark`** — Screenshot in dark mode

### Multi-Viewport Capture
- **`/visual-test responsive <page>`** — Capture at desktop (1280x720), tablet (768x1024), mobile (375x812)
- **`/visual-test cross-browser <page>`** — Capture same page in Chromium, Firefox, WebKit

### PDF
- **`/visual-test pdf <page>`** — Save page as PDF (A4 format)

### Comparison
- **`/visual-test compare <page>`** — Capture current state and compare with previous baseline (if exists)

## Output Directory

All visual test artifacts are saved to:

```
/mnt/data/projects/devbox/hostel_pro2/.visual-tests/
├── screenshots/
│   ├── <page>-desktop.png
│   ├── <page>-tablet.png
│   ├── <page>-mobile.png
│   └── <page>-dark.png
├── pdfs/
│   └── <page>.pdf
├── cross-browser/
│   ├── <page>-chromium.png
│   ├── <page>-firefox.png
│   └── <page>-webkit.png
└── baselines/
    └── <page>-baseline.png
```

## Implementation Notes

1. **Default base URL**: `http://localhost:3000` — prefix page paths with this unless user provides a full URL.
2. **Create output directories** before capturing: `mkdir -p .visual-tests/screenshots .visual-tests/pdfs .visual-tests/cross-browser .visual-tests/baselines`
3. **Always use `--wait-for-timeout 2000`** as a minimum to let pages render, unless the user specifies a selector to wait for.
4. **For responsive captures**, run 3 screenshots in parallel with different `--viewport-size` values:
   - Desktop: `1280,720`
   - Tablet: `768,1024`
   - Mobile: `375,812`
5. **For cross-browser**, run 3 screenshots with `-b chromium`, `-b firefox`, `-b webkit`.
6. **After capturing**, use the Read tool to display the screenshot/PDF to the user for review.
7. **For comparisons**, save current capture alongside the baseline and let the user visually inspect both.
8. **Ignore HTTPS errors** for local dev: use `--ignore-https-errors` when targeting localhost.

## Device Emulation Options

Common devices for `--device`:
- `"iPhone 14"`, `"iPhone 14 Pro Max"`, `"iPhone SE"`
- `"iPad Pro 11"`, `"iPad Mini"`
- `"Pixel 7"`, `"Galaxy S9+"`
- `"Desktop Chrome"`, `"Desktop Firefox"`, `"Desktop Safari"`

## Viewport Presets

| Name | Size | Use Case |
|------|------|----------|
| Desktop HD | 1920,1080 | Full desktop |
| Desktop | 1280,720 | Standard desktop |
| Tablet Landscape | 1024,768 | iPad landscape |
| Tablet Portrait | 768,1024 | iPad portrait |
| Mobile | 375,812 | iPhone standard |
| Mobile Small | 320,568 | iPhone SE |
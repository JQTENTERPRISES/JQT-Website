# Claude Review Notes — JQT HQ Hero Build

Branch: `claude-review-hq-heroes`

This branch is for code review only. It is intentionally not merged into `main`.

## Scope reviewed

The approved local site package was checked across all HTML, CSS, and JavaScript files, not only the homepage.

### Gemini review findings corroborated

1. **Capability expand controls**
   - `script.js` already handled the `.bc-go` click behavior and kept `aria-expanded` synchronized.
   - The controls were missing explicit `aria-controls` relationships.
   - Corrected: each button now references a unique expanded panel id.
   - Corrected: no-JavaScript behavior now leaves the explanatory text readable and hides the inert arrow control.

2. **Dynamic copyright year**
   - The homepage and Kept overview used an empty `<span data-year></span>`.
   - Corrected: both now contain a static `2026` fallback while `script.js` still replaces it dynamically when JavaScript runs.

3. **Hero video fallback / reduced motion**
   - Both hero videos already had poster attributes.
   - Corrected: `prefers-reduced-motion: reduce` now uses a static poster treatment rather than animated hero playback.
   - Homepage JS explicitly pauses/removes autoplay for reduced-motion users.
   - Kept hero segment logic also pauses rather than replaying the segment under reduced motion.
   - Kept hero preload changed from `auto` to `metadata`.

4. **Decorative mock navigation**
   - The homepage Kept product mock used `<a>` elements with no `href`.
   - Corrected: those decorative rail items are now `<span>` elements.
   - A full local HTML scan found no remaining anchor elements without `href`.

## Additional checks completed

- All local relative HTML links were checked; no missing local HTML targets were found.
- `node --check script.js` passes.
- `aria-expanded` controls have matching `aria-controls` targets.
- Both `data-year` instances have static fallback text.

## Hero media

The final approved media is intentionally **not committed to this review branch** because the connected GitHub write interface is text-oriented and the masters are large binary assets.

Use the approved local package for the exact media files:

### JQT hero
- path: `assets/jqt-city-hero.mp4`
- approved segment: source 00:08–00:28
- output duration: 20.0 s
- dimensions: 3814×2174
- frame rate: 60 fps
- size: 102,333,608 bytes
- SHA-256: `2c62bb7688c0ccc1ee41eadeae979175265b53f3b2c0308ba107f059e953e2bd`

### Kept hero
- path: `assets/kept-hospitality-hero.mp4`
- page playback segment: 00:05–00:29
- master duration: 34.0 s
- dimensions: 3840×2158
- frame rate: 30 fps
- size: 72,598,195 bytes
- SHA-256: `49cdd4547ac28b6455288638d63f431b3f66ced11af58509b0bb85ad97e09afb`

The HTML intentionally references those production paths. Do not replace them with compressed placeholder footage during review.

## Review request

Please review:
- semantics and accessibility
- mobile/responsive behavior
- JavaScript failure modes
- hero video behavior and segment handling
- internal navigation
- Kept demo interaction
- production-readiness risks

Do not redesign the approved visual direction unless a concrete defect requires a change.

---

# Media delivery pass (2026-09-29)

Review found two real defects. Both are fixed. No visual change was made.

## Defects found

1. **Reduced motion still downloaded the video.** `@media(prefers-reduced-motion:reduce)`
   set `display:none` on the element, but a hidden `<video autoplay>` still fetches.
   Measured: three requests for the 97.6 MB master against a page where it was
   `display:none`.
2. **No mobile or Save Data guard.** At 393px the phone loaded the full
   3814x2174 master. Nothing checked viewport, `navigator.connection` or `saveData`.

## Fix

The `<video>` elements now ship with no `<source>` and no `autoplay`.
`window.JQTHero.attach()` in `script.js` decides whether a source is wanted at
all, then which one. That is the only way to make reduced motion and Save Data
cost zero bytes.

Masters are untracked and live outside the repository. Only derivatives ship.
Deployed media weight: 167.9 MB -> 48.0 MB.

## Verification, measured from the server access log

| Condition | Result |
|---|---|
| prefers-reduced-motion: reduce | NO VIDEO REQUEST |
| navigator.connection.saveData | NO VIDEO REQUEST |
| mobile viewport | 1280 derivative |
| desktop viewport | 1920 derivative |
| master requests, all tests | 0 |

Also confirmed unchanged: display aspect ratio delta 0.000% on all four
derivatives (ffmpeg carried a compensating SAR, which is why `videoWidth`
reports 1922 rather than 1920); Kept hero still enters at 5.0s with no
title/QR flash; `START=5.0, END=29.0` untouched; seasonal JQT mark present on
all 7 pages; aria-expanded/aria-controls pairs intact; `data-year` fallback
intact; zero anchors without href.

## Derivatives

| File | Size | Resolution | FPS | Bitrate | SSIM | PSNR |
|---|---|---|---|---|---|---|
| jqt-city-hero-1920.mp4 | 21,423,982 | 1920x1094 | 60 | 8.57 Mbps | 0.9895 | 43.9 dB |
| jqt-city-hero-1280.mp4 | 9,403,467 | 1280x730 | 60 | 3.76 Mbps | 0.9842 | 40.9 dB |
| kept-hospitality-hero-1920.mp4 | 13,298,514 | 1920x1080 | 30 | 3.13 Mbps | 0.9928 | 48.7 dB |
| kept-hospitality-hero-1280.mp4 | 5,094,228 | 1280x720 | 30 | 1.20 Mbps | 0.9900 | 46.4 dB |

Encoded with libx264, preset slow, CRF 20 desktop / 22 mobile, lanczos scaling,
audio stripped (both masters are silent). SSIM and PSNR are measured against the
masters downscaled to matching size. Above 0.98 SSIM and 40 dB PSNR is the
visually transparent band.

A fixed 3 Mbps target was deliberately not used. The JQT desktop derivative needs
8.57 Mbps because 60fps aerial water and glass shows banding below that; the Kept
desktop derivative settled at 3.13 Mbps on its own because 30fps interior footage
needs less.

## Master files, archival, untracked

| File | Size | Resolution | FPS | SHA-256 |
|---|---|---|---|---|
| jqt-city-hero.mp4 | 102,333,608 | 3814x2174 | 60 | 2c62bb7688c0ccc1ee41eadeae979175265b53f3b2c0308ba107f059e953e2bd |
| kept-hospitality-hero.mp4 | 72,598,195 | 3840x2158 | 30 | 49cdd4547ac28b6455288638d63f431b3f66ced11af58509b0bb85ad97e09afb |

Both re-verified bit identical after being moved out of the tree.

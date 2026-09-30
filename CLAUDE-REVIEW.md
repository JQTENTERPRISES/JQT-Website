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

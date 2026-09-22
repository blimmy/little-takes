# Little Takes

A public, Thai-first ASCII art photobooth with violet-and-white botanical illustrations, glamorous calligraphy, 24 ASCII stickers, and eight little animal friends.

## Use

Choose a layout and frame, enable the camera, and take a timed photo sequence. You can also upload pictures or try the included illustrated samples. Decorate the composition, then download a PNG or use the device's native share menu.

- Four layouts: three-photo strip, four-photo strip, 2 × 2 grid, and a single-photo keepsake.
- Eight frames: Violet Garden, Love Letters, Cloud Notes, Moonlight, Paper Petals, Sweet Notes, Lavender, and Lilac Friends.
- Seven filters (including a live ASCII character filter), mirrored camera, front/rear camera request, optional countdown audio, and 0/3/5/10-second timers.
- 24 original ASCII stickers; dragging, resizing, rotation, and deletion.
- Thai or English lettering with glam script, clean, and typewriter fonts; seven ink colors, freehand drawing, undo/redo, custom caption, and optional date.
- Full-resolution strip PNG and a separate 1080 × 1920 story composition.
- Device sharing with a download fallback. Browsers cannot guarantee a direct Instagram/Facebook/LINE Story destination: available targets depend on the device and installed apps. Select the exported image inside the target app if its Story option is absent.
- Responsive layout, keyboard-accessible controls, reduced-motion support, and local fonts.

Photos stay in the current browser tab's memory. The app does not upload photos, track visitors, or require an account. Refreshing or closing the tab removes the session. The hosting provider may retain ordinary access logs.

## Local development

This is a static website using browser-native ES modules and Canvas. It has no application dependencies or build step.

```sh
python3 -m http.server 4175 --bind 127.0.0.1
```

Open `http://localhost:4175`. Camera access requires localhost or HTTPS. On a phone, use the HTTPS deployment; a plain HTTP LAN address generally cannot request the camera.

## GitHub Pages

Publish `main` from the repository root. `.nojekyll` serves the files directly, and all app asset references are relative so the site also works under a repository subpath. No API keys, environment variables, or backend services are required.

## Verification

`tests/browser_test.py` exercises camera capture using Chromium's synthetic camera, countdown cancellation, decoration, real PNG downloads, story dimensions, local upload, sharing fallback, responsive layouts, and denied camera permission. It never accesses the physical camera.

```sh
python3 -m venv .venv
.venv/bin/pip install playwright pillow
.venv/bin/python -m playwright install chromium
.venv/bin/python tests/browser_test.py http://localhost:4175
```

Set `CHROME_PATH` to use an existing Chrome binary. Test output and screenshots are written to the ignored `test-results/` directory.

Native mobile share sheets and physical front/rear cameras require a real device to verify. HEIC/HEIF decoding depends on browser support; unsupported files receive a message suggesting JPG, PNG, or WebP. Uploads are limited to 30 MB each and resized to at most 1800 px for a manageable editing session.

## Artwork and fonts

ASCII characters and frame designs are original compositions in `src/ascii.js` and `src/ornaments.js`, shared by SVG previews and Canvas exports. Original botanical and character drawings are sampled into shaded ASCII text, with explicit whitespace preservation for SVG rendering. The detailed character illustration direction was inspired by the [ASCII Art Archive](https://www.asciiart.eu/animals/insects/butterflies); no artwork was copied.

Locally bundled [Great Vibes](https://fonts.google.com/specimen/Great+Vibes) and [Charm](https://fonts.google.com/specimen/Charm) provide Latin and Thai calligraphy. Bai Jamjuree is used for small interface text, and system monospace fonts preserve the ASCII illustrations. Canvas exports wait for the font files, and text selection uses the same typeface as export. Font license texts are in `assets/fonts/`.

# Little Takes

A public Thai photobooth inside a playful retro Windows browser. Colorful pastel chrome, original ASCII illustrations, Fahkwang Thai text, and Great Vibes calligraphy.

**[Open the booth](https://blimmy.github.io/little-takes/)**

## Make a memory

1. **Choose a frame.** Twenty templates: strips, postcards, contact sheets, circles, hearts, and film borders, with one to eight photo slots.
2. **Take pictures.** Shoot individually or as a sequence, with a visible counter up to eight. Each supported camera capture saves a still and a silent 1.8-second Live clip. Eight photos are spare choices; continue as soon as you have enough for the selected frame. Local uploads and illustrated samples also work.
3. **Choose your favorites.** Assign photos to slots, swap their order, or use autofill. Changing the frame preserves the original captures.
4. **Decorate.** Twelve pastel palettes, custom frame colors, seven filters, 64 transparent PNG stickers, custom PNG imports, text, drawing, and undo/redo. Stickers and text can be moved, resized, rotated, and removed.
5. **Preview and save.** Download a full-resolution PNG or a six-second video. Live clips loop in their selected slots; still photos move with a gentle zoom. Frame colors, filters, text, and decorations are included in both exports. A separate 1080 × 1920 Story composition is available for images and videos.

Camera controls include mirror, front/rear camera requests, optional countdown audio, and 0/3/5/10-second timers. Capture and video generation can be cancelled.

Video is MP4 or WebM depending on browser support. Live capture and video export require MediaRecorder and Canvas captureStream; unsupported browsers retain the still-photo workflow. These are ordinary short videos, not Apple Live Photo files. Video exports fit within 1080 × 1920; image exports retain the template's full resolution.

The Share button sends the currently previewed image or video through the device's share menu. Available apps and Story destinations depend on the device and installed apps. If a Story target is unavailable, download the file and select it from the target app's gallery.

## Privacy

Photos, Live clips, and edits stay in the current browser tab's memory. The app does not upload media, request the microphone, track visitors, or require an account. The camera closes when leaving the capture screen or switching tabs. Closing or refreshing the tab removes the session, so download anything you want to keep. GitHub Pages may retain ordinary hosting access logs.

## Local development

The site uses browser-native ES modules and Canvas. No application dependencies, build step, API keys, or backend are required.

```sh
python3 -m http.server 4175 --bind 127.0.0.1
```

Open `http://localhost:4175`. Camera access requires localhost or HTTPS. A phone should use the HTTPS deployment; a plain HTTP LAN address generally cannot request the camera.

- `index.html`, `windows.css`: five-stage interface and responsive desktop theme.
- `src/app.js`: capture roll, photo selection, decoration, navigation, and sharing.
- `src/config.js`: templates, palettes, filters, and colors.
- `src/renderer.js`: shared still/video composition, clipping, filters, and Story format.
- `src/media.js`: silent Live capture and native video encoding.
- `src/stickers.js`, `assets/stickers/`: original sticker catalog and 64 transparent PNG files.
- `src/ascii.js`, `src/ornaments.js`: original ASCII artwork.
- `src/typography.js`, `assets/fonts/`: local fonts used by the interface and exports.

## GitHub Pages

Publish `main` from the repository root. `.nojekyll` serves files directly, and relative asset references support the repository subpath.

## Verification

`tests/browser_test.py` exercises all five stages with Chromium's synthetic camera, never the physical camera. It covers still/Live capture, cancellation, the eight-photo limit, early continuation, selective slot assignment, editing, actual PNG and video downloads, Story dimensions, native share file handoff, upload fallback, reset, and responsive widths from 320 to 1440 px. When ffmpeg is installed at `/opt/homebrew/bin`, it also decodes exported video and checks that frames contain movement.

```sh
python3 -m venv .venv
.venv/bin/pip install playwright pillow
.venv/bin/python -m playwright install chromium
.venv/bin/python tests/browser_test.py http://localhost:4175
```

Set `CHROME_PATH` to use an existing Chrome binary. Screenshots, downloads, and reports go to the ignored `test-results/` directory.

Physical front/rear cameras and native mobile share sheets need a real device to verify. HEIC/HEIF decoding depends on browser support; unsupported images receive a message suggesting JPG, PNG, or WebP. Photo uploads are limited to 30 MB each and resized to at most 1800 px. Custom decoration images are limited to 10 MB and normalized to a transparent 512 px canvas.

## Artwork and fonts

Frame designs, characters, botanical illustrations, and sticker drawings are original compositions. Vector shapes are sampled into shaded ASCII characters and rendered into SVG previews, Canvas compositions, and transparent PNG stickers. The illustration direction was inspired by the [ASCII Art Archive](https://www.asciiart.eu/animals/insects/butterflies); no artwork was copied.

Locally bundled [Fahkwang](https://fonts.google.com/specimen/Fahkwang) is used for all Thai text, including headings, controls, dialogs, and exported lettering. [Great Vibes](https://fonts.google.com/specimen/Great+Vibes) provides Latin calligraphy. Monospace fonts preserve ASCII artwork; all text styles fall back to Fahkwang for Thai glyphs. Exports wait for the fonts to load. Font licenses are in `assets/fonts/`.

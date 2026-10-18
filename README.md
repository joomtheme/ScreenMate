# ScreenMate — Free browser-based screen recorder

ScreenMate is a no-build HTML/CSS/JavaScript screen recorder. It uses the browser's native screen-sharing dialog and processes recordings locally in your browser.

## Features
- Select a screen, application window, or browser tab.
- Optional source audio when supported by your browser and chosen source.
- Optional microphone capture.
- 0, 3, 5, or 10 second countdown.
- Optional auto-stop after 1, 5, 10, or 30 minutes.
- WebM recording, preview, download, and session history.
- No account, analytics, upload, or server-side code.

## Run locally
Screen capture APIs require a secure context. `localhost` is considered secure by modern browsers.

```bash
python -m http.server 8000
```
Open http://localhost:8000 in a current desktop browser.

## Deploy to GitHub Pages
1. Open repository **Settings → Pages**.
2. Under Build and deployment, choose **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then save.
4. Wait for the deployment and open the URL shown there.

## Notes
- The user must choose a source in the browser's native permission dialog.
- Source/system audio depends on browser, operating system, and selected source.
- Output format is WebM; MP4 conversion is not included.
- The recording list is kept in page memory for the current session. Download clips you need to keep.
- Closing or reloading the page can interrupt a recording.
- Selected-rectangle cropping is not yet implemented in this web version.

## Privacy
Captured screen and audio are processed in the browser. This app does not send video to a server.

# TradeSmart PWA prototype

This package preserves the original login-flow interactions and visual design while adding an installable standalone PWA shell.

## Preview on a desktop

Serve this folder from a local web server and open the shown address. A desktop viewport wider than 430px keeps the rounded phone-frame presentation.

## Install on a phone

Host the folder over HTTPS, open it on the phone, and use **Add to Home Screen** or **Install app**. Launch TradeSmart from the new home-screen icon to remove browser chrome and use the full standalone viewport.

## Files

- `index.html` — original flow with PWA metadata, registration, and responsive viewport handling
- `manifest.webmanifest` — install name, colors, portrait orientation, and standalone display mode
- `service-worker.js` — app-shell caching for repeat/offline previews
- `icons/icon.svg` — TradeSmart app icon

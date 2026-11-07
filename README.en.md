# 行迹 · Travel Diary

> Give your photos a story, and let your footprints light up a map.

[中文](./README.md) | **English**

**Live demo**: <https://azunyan666.github.io/travel-diary/>

A mobile-first travel diary that runs entirely in your browser. Import photos from a trip, write a short note under each one, and watch the provinces and countries you've visited light up on a map.

No account, no server, no tracking — everything is stored locally in IndexedDB and can be exported as a backup.

> **Status: v0.1.0 (skeleton).** The app shell, four tabs, PWA install and offline support are ready. Photo import, notes and the map are in progress — see the [roadmap](./docs/ROADMAP.md).

## Features

- ✅ Mobile-first PWA: installable, works offline
- ✅ Warm-paper design system (see [docs/DESIGN.md](./docs/DESIGN.md))
- 🚧 Trips, photo import with EXIF time/GPS, thumbnails
- 🚧 Notes under every photo
- 🚧 Province / country map that lights up
- 📋 Export & import backups, world map, year-in-review

## Tech stack

Vue 3 · TypeScript · Vite · Pinia · Vue Router · IndexedDB (idb) · vite-plugin-pwa

## Getting started

Requires Node.js **>= 20.19** (22 LTS recommended).

```bash
git clone https://github.com/Azunyan666/travel-diary.git
cd travel-diary
npm install
npm run dev
```

For testing on a phone, open `http://<your-lan-ip>:5173` from a device on the same Wi-Fi.

```bash
npm run dev        # dev server on 0.0.0.0
npm run typecheck  # type checking
npm run build      # typecheck + production build
npm run preview    # preview the build
```

## Privacy

All data lives in the browser's IndexedDB. Nothing is uploaded. Clearing browser data removes your photos, so use the export feature (coming in M4) to keep backups.

## Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## License

[MIT](./LICENSE) © 2026 Azunyan666

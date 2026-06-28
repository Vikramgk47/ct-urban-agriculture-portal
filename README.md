# Connecticut Urban Agriculture Portal

A Vite React + React Leaflet web app for exploring Connecticut community gardens and urban agriculture sites.

## Data

The app uses only the uploaded dataset extracted into `public/data/sites.json`. The original map-ready CSV is included at `public/data/map_ready_sites.csv`, and records missing coordinates are kept at `public/data/manual_review_missing_coordinates.csv`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

The project is configured with `base: './'` in `vite.config.js`, so the built files can be hosted from a GitHub Pages project site.

Option A: deploy the `dist` folder manually after `npm run build`.

Option B: use the included deploy script after adding the GitHub remote:

```bash
npm run deploy
```

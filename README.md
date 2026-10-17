# Shiny Measure

[![Deploy](https://github.com/fildon/shiny-measure/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/fildon/shiny-measure/actions/workflows/deploy.yml)

My personal weight tracker. Hosted at [rupertmckay.com/shiny-measure](https://rupertmckay.com/shiny-measure).

Record your weight, and optionally your body fat percentage, then follow the 7-day average trend over time.

All data is only held in your browser's localStorage. Nothing is sent anywhere.

## Tech

- [React](https://react.dev) and TypeScript, built with [Vite](https://vite.dev)
- [Luxon](https://moment.github.io/luxon) for dates
- [React Hook Form](https://react-hook-form.com) and [Zod](https://zod.dev) for the entry form
- The trend chart is hand-drawn SVG, with no chart library
- Plain CSS with custom properties in `src/styles.css`, following the system light or dark theme

## Developer Guidance

1. Install dependencies

   ```shell
   npm install
   ```

2. Start the dev server

   ```shell
   npm run dev
   ```

   The app runs at [localhost:5173/shiny-measure/](http://localhost:5173/shiny-measure/).

3. Check types

   Vite doesn't type check while building, so run this separately:

   ```shell
   npm run typecheck
   ```

4. Build and preview the production bundle

   ```shell
   npm run build
   npm run preview
   ```

   The preview runs at [localhost:4173/shiny-measure/](http://localhost:4173/shiny-measure/).

## Deployment

Deployment is handled automatically via GitHub Actions.

Any push to the `main` branch builds the app and deploys `dist` to the `gh-pages` branch.

## Contributing

Contributions are always welcome!

Please begin by raising or commenting on a GitHub issue.
Then feel free to open a PR.

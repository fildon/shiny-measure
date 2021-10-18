# Shiny Measure

[![Build](https://github.com/fildon/shiny-measure/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/fildon/shiny-measure/actions/workflows/deploy.yml)

My personal fitness app. Hosted at [Shiny Measure](fildon.me/shiny-measure).

All data is only held in localStorage.

## Developer Guidance

1. Install dependencies

   ```shell
   npm install
   ```

2. Build the app

   ```shell
   npm run build:dev
   ```

3. Serve locally

   ```shell
   npm run serve
   ```

You will now have a running application at localhost:5000

## Linting

Linting is provided by ESLint, and run with

```shell
npm run lint
```

## Testing

Testing is provided by Jest, and run with

```shell
npm run test
```

## Deployment

Deployment is handled automatically via Github Actions.

Any update to the `main` branch will trigger a new build and deploy.

## Contributing

Contributions are always welcome!

Please begin by raising or commenting on a GitHub issue.
Then feel free to open a PR.

For any TypeScript changes, tests must be included.

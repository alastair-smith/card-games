# Documentation

The docs are Markdown files in `apps/docs`, built into a site with [VitePress](https://vitepress.dev): how the app is built under `technical/`, how each game works under `games/`.

## Adding a doc

Link each new doc from [`index.md`](../index.md), and add it to the sidebar in [`.vitepress/config.ts`](https://github.com/alastair-smith/card-games/blob/main/apps/docs/.vitepress/config.ts).

## Running the docs

To run the site locally from the repo root:

```bash
pnpm --filter @repo/docs dev:docs
```

Both build the diagrams first. `pnpm --filter @repo/docs build:docs` builds the site into `.vitepress/dist`.

## Publishing

The site is served at [docs.playcards.games](https://docs.playcards.games) by a Cloudflare Worker with static assets, set up in [`wrangler.jsonc`](https://github.com/alastair-smith/card-games/blob/main/apps/docs/wrangler.jsonc). The [Deploy Docs](https://github.com/alastair-smith/card-games/blob/main/.github/workflows/deploy-docs.yml) workflow builds and deploys it on each push to `main` that changes `apps/docs`, and can be run by hand from the Actions tab. There are no preview deploys for pull requests.

The workflow reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the `docs` GitHub environment, which only `main` can deploy to.

## Diagrams

Diagrams are written in [D2](https://d2lang.com) under [`diagrams/`](https://github.com/alastair-smith/card-games/tree/main/apps/docs/diagrams). Each builds to a `.light.svg` and a `.dark.svg`, which aren't committed. Link to the light one from a doc; the site swaps in the dark one when its light/dark toggle is set to dark.

To check a diagram compiles without starting the site, from the repo root:

```bash
pnpm --filter @repo/docs build:diagrams
```

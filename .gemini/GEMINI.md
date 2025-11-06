# Project Overview

This is a T3 Stack project for playing multiplayer card games online. It uses Next.js for the frontend and backend, tRPC for API communication including server-sent events, and Tailwind CSS for styling. The project is set up as a monorepo using pnpm workspaces and turbo for task running. It also uses Docker for background services.

The main application is in the `apps/web` directory. It's a Next.js app with a custom server. The application uses tRPC for type-safe API routes. The tRPC routers are defined in `apps/web/src/server/api/routers`. The two main routers are `lobby` and `highCard`.

## Building and Running

I will be running a dev version of the server in another terminal, so you do not need to build and start the app.

## Testing

To verify changes you can use the following commands:

```bash
pnpm format:check # check formatting is correct with biome
pnpm format:fix # fix easy formatting issues
pnpm typecheck # check for type issues
CI=true pnpm test # run unit tests, only use if asked to
```

## Git

The project has a pull request template in `.github/pull_request_template.md`.

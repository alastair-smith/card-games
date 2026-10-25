---
name: dev-servers
description: Start, wait for and stop the app's dev server (port 3000) or Storybook (port 6006). Use whenever a task needs either running, e.g. to check a change in the browser, take screenshots, run E2E tests or link to stories.
---

# Dev servers

Start the app or Storybook yourself when you need one, in the background, and
stop it when you're done:

```bash
pnpm dev
pnpm --filter @repo/web dev:stories
```

The app runs on port 3000 and Storybook on 6006. If a port is already in use,
the server is running, so use it rather than starting another. `pnpm dev`
starts the Docker services (Redis, Jaeger) first; restarting Jaeger wipes its
traces.

## Wait until it responds

After starting one in the background, wait for it before using it:

```bash
./.claude/skills/dev-servers/scripts/wait-for-server.ts --port 6006
./.claude/skills/dev-servers/scripts/wait-for-server.ts --port 3000
```

It returns once the server answers, or fails after two minutes, in which case
read the output of the command that started it.

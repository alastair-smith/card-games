#!/usr/bin/env node
import { setTimeout as wait } from 'node:timers/promises';
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage = 'Usage: wait-for-server.ts --port <3000|6006>';

const SERVER_NAMES = {
  '3000': 'The app',
  '6006': 'Storybook',
} as const satisfies Record<string, string>;

const TIMEOUT_SECONDS = 120;
const POLL_INTERVAL_MILLISECONDS = 1000;
// The app compiles a page on its first request, which can take a while
const REQUEST_TIMEOUT_MILLISECONDS = 30_000;

const isServerPort = (value: string): value is keyof typeof SERVER_NAMES =>
  Object.hasOwn(SERVER_NAMES, value);

const { port } = parseArguments(usage, {
  options: { port: { type: 'string' } },
}).values;

if (!port) {
  exitWithUsage(usage);
}

if (!isServerPort(port)) {
  exitWithError(
    `--port must be 3000 (the app) or 6006 (Storybook), not '${port}'.`,
  );
}

const serverName = SERVER_NAMES[port];
const deadline = Date.now() + TIMEOUT_SECONDS * 1000;

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://localhost:${port}/`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MILLISECONDS),
    });
    if (response.ok) {
      console.log(`${serverName} is responding on port ${port}.`);
      process.exit(0);
    }
  } catch {
    // Not listening yet
  }
  await wait(POLL_INTERVAL_MILLISECONDS);
}

exitWithError(
  `${serverName} didn't respond on port ${port} within ${TIMEOUT_SECONDS}s. Check the output of the command that started it.`,
);

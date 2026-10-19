#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import {
  exitWithError,
  exitWithUsage,
  getIssueBranch,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: take-screenshots.ts --path <path> --name <name> [--scroll-to-bottom]';

const DEV_SERVER_ORIGIN = 'http://localhost:3000';
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const SIZES = [
  { label: 'desktop', width: 1280, height: 800, isMobile: false },
  { label: 'mobile', width: 390, height: 844, isMobile: true },
] as const;

const {
  path,
  name,
  'scroll-to-bottom': isScrollingToBottom = false,
} = parseArguments(usage, {
  options: {
    path: { type: 'string' },
    name: { type: 'string' },
    'scroll-to-bottom': { type: 'boolean' },
  },
}).values;

if (!path?.startsWith('/') || !name) {
  exitWithUsage(usage);
}

if (!KEBAB_CASE.test(name)) {
  exitWithError(`--name must be lowercase kebab-case, not '${name}'.`);
}

const url = new URL(path, DEV_SERVER_ORIGIN);
// A path such as //example.com would otherwise point the browser elsewhere
if (url.origin !== DEV_SERVER_ORIGIN) {
  exitWithError(
    `--path must be a path on ${DEV_SERVER_ORIGIN}, not '${path}'.`,
  );
}

const branch = await getIssueBranch();
const directory = `.pr-screenshots/${branch}`;
await mkdir(directory, { recursive: true });

const browser = await chromium.launch();

try {
  for (const size of SIZES) {
    // Mobile contexts use overlay scrollbars, so the page gets the full width
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      isMobile: size.isMobile,
      hasTouch: size.isMobile,
    });
    const page = await context.newPage();

    try {
      await page.goto(url.href, { waitUntil: 'load' });
    } catch {
      exitWithError(
        `Couldn't load ${url.href}. Is the dev server running on ${DEV_SERVER_ORIGIN}?`,
      );
    }

    // Lets client components finish hydrating. Game pages keep a
    // subscription open and never go idle, so the timeout isn't an error
    await page
      .waitForLoadState('networkidle', { timeout: 5000 })
      .catch(() => {});

    // The dev-only Next.js indicator would otherwise sit over the page
    await page.evaluate(`document.querySelector('nextjs-portal')?.remove()`);

    if (isScrollingToBottom) {
      await page.evaluate(
        'window.scrollTo(0, document.documentElement.scrollHeight)',
      );
    }

    const file = `${directory}/${name}-${size.label}.png`;
    await page.screenshot({ path: file });
    console.log(file);

    await context.close();
  }
} finally {
  await browser.close();
}

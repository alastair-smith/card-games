#!/usr/bin/env node
import { mkdir } from 'node:fs/promises';
import { chromium, type Page } from 'playwright';
import { z } from 'zod';
import {
  exitWithError,
  exitWithUsage,
  getIssueBranch,
  parseArguments,
} from '../../lib/script-helpers.ts';

const usage =
  'Usage: take-screenshots.ts (--path <path> | --story <story id>) --name <name> [--full-page | --scroll-to-bottom]';

const DEV_SERVER_ORIGIN = 'http://localhost:3000';
const STORYBOOK_ORIGIN = 'http://localhost:6006';
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STORY_ID = /^[a-z0-9-]+--[a-z0-9-]+$/;

const SIZES = [
  { label: 'desktop', width: 1280, height: 800, isMobile: false },
  { label: 'mobile', width: 390, height: 844, isMobile: true },
] as const;

const {
  path,
  story,
  name,
  'full-page': isFullPage = false,
  'scroll-to-bottom': isScrollingToBottom = false,
} = parseArguments(usage, {
  options: {
    path: { type: 'string' },
    story: { type: 'string' },
    name: { type: 'string' },
    'full-page': { type: 'boolean' },
    'scroll-to-bottom': { type: 'boolean' },
  },
}).values;

if (!name || Boolean(path) === Boolean(story)) {
  exitWithUsage(usage);
}

if (!KEBAB_CASE.test(name)) {
  exitWithError(`--name must be lowercase kebab-case, not '${name}'.`);
}

if (isFullPage && isScrollingToBottom) {
  exitWithError('Pass --full-page or --scroll-to-bottom, not both.');
}

if (story && (isFullPage || isScrollingToBottom)) {
  exitWithError(
    '--full-page and --scroll-to-bottom only apply to --path, since --story captures just the component.',
  );
}

function getUrl(): URL {
  if (story) {
    if (!STORY_ID.test(story)) {
      exitWithError(
        `--story must be a Storybook story ID such as 'yaniv-scorecard--start', not '${story}'.`,
      );
    }
    const url = new URL('/iframe.html', STORYBOOK_ORIGIN);
    url.searchParams.set('id', story);
    url.searchParams.set('viewMode', 'story');
    return url;
  }

  if (!path?.startsWith('/')) {
    exitWithUsage(usage);
  }
  const url = new URL(path, DEV_SERVER_ORIGIN);
  // A path such as //example.com would otherwise point the browser elsewhere
  if (url.origin !== DEV_SERVER_ORIGIN) {
    exitWithError(
      `--path must be a path on ${DEV_SERVER_ORIGIN}, not '${path}'.`,
    );
  }
  return url;
}

// Game pages fit the screen and scroll inside main rather than the window.
// Returns how far main's content overflows it, or 0 when the window scrolls
// or main doesn't
const MAIN_OVERFLOW_SCRIPT = `(() => {
  const scrollingElement = document.scrollingElement ?? document.documentElement;
  if (scrollingElement.scrollHeight > scrollingElement.clientHeight) {
    return 0;
  }
  const main = document.querySelector('main');
  if (!main || !['auto', 'scroll'].includes(getComputedStyle(main).overflowY)) {
    return 0;
  }
  return Math.max(main.scrollHeight - main.clientHeight, 0);
})()`;

const SCROLL_TO_BOTTOM_SCRIPT = `(() => {
  const mainOverflow = ${MAIN_OVERFLOW_SCRIPT};
  if (mainOverflow > 0) {
    const main = document.querySelector('main');
    main.scrollTo(0, main.scrollHeight);
  } else {
    window.scrollTo(0, document.documentElement.scrollHeight);
  }
})()`;

const mainOverflowSchema = z.number().nonnegative();

async function capturePage(page: Page, file: string) {
  // Lets client components finish hydrating. Game pages keep a
  // subscription open and never go idle, so the timeout isn't an error
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // The dev-only Next.js indicator would otherwise sit over the page
  await page.evaluate(`document.querySelector('nextjs-portal')?.remove()`);

  if (isScrollingToBottom) {
    await page.evaluate(SCROLL_TO_BOTTOM_SCRIPT);
  }

  if (isFullPage) {
    const mainOverflow = mainOverflowSchema.parse(
      await page.evaluate(MAIN_OVERFLOW_SCRIPT),
    );
    // Playwright's full-page capture only grows to the window's scroll height.
    // A screen-height page grows with the viewport instead, so main fits all
    // of its content without changing the page's styles
    if (mainOverflow > 0) {
      const viewport = page.viewportSize();
      if (viewport) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height + Math.ceil(mainOverflow),
        });
      }
    }
  }

  await page.screenshot({ path: file, fullPage: isFullPage });
}

const boundsSchema = z.object({
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
});

// The global decorator fills the screen, so crop to what the story renders
// inside it, ignoring the Toaster's notifications region
const STORY_BOUNDS_SCRIPT = `(() => {
  const rects = [...document.querySelectorAll('#storybook-root > div > *')]
    .filter((element) => !element.matches('section[aria-label^="Notifications"]'))
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const right = Math.max(...rects.map((rect) => rect.right));
  const bottom = Math.max(...rects.map((rect) => rect.bottom));
  return { x: left, y: top + window.scrollY, width: right - left, height: bottom - top };
})()`;

// Matches the decorator's p-4, so the felt background frames the component
const STORY_PADDING = 16;

async function captureStory(page: Page, file: string) {
  try {
    await page
      .locator(
        '#storybook-root > div > :not(section[aria-label^="Notifications"])',
      )
      .first()
      .waitFor({ timeout: 10_000 });
  } catch {
    exitWithError(
      `The story '${story}' didn't render. Check its ID, which follows ?path=/story/ in Storybook's URL.`,
    );
  }

  const bounds = boundsSchema.safeParse(
    await page.evaluate(STORY_BOUNDS_SCRIPT),
  );
  if (!bounds.success) {
    exitWithError(`The story '${story}' didn't render anything visible.`);
  }

  const x = Math.max(bounds.data.x - STORY_PADDING, 0);
  const y = Math.max(bounds.data.y - STORY_PADDING, 0);
  await page.screenshot({
    path: file,
    fullPage: true,
    clip: {
      x,
      y,
      width: bounds.data.x + bounds.data.width + STORY_PADDING - x,
      height: bounds.data.y + bounds.data.height + STORY_PADDING - y,
    },
  });
}

const url = getUrl();
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
        `Couldn't load ${url.href}. Is ${story ? 'Storybook' : 'the dev server'} running on ${url.origin}?`,
      );
    }

    const file = `${directory}/${name}-${size.label}.png`;
    await (story ? captureStory(page, file) : capturePage(page, file));
    console.log(file);

    await context.close();
  }
} finally {
  await browser.close();
}

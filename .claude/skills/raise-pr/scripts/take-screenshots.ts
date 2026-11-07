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
  'Usage: take-screenshots.ts (--path <path> | --docs <path> | --story <story id> [--dialog] | --storybook-docs <docs id>) --name <name> [--full-page | --scroll-to-bottom] [--theme <light|dark>]';

const DEV_SERVER_ORIGIN = 'http://localhost:3000';
const STORYBOOK_ORIGIN = 'http://localhost:6006';
const DOCS_ORIGIN = 'http://localhost:5173';
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const STORY_ID = /^[a-z0-9-]+--[a-z0-9-]+$/;
const STORYBOOK_DOCS_ID = /^[a-z0-9-]+--docs$/;

const SIZES = [
  { label: 'desktop', width: 1280, height: 800, isMobile: false },
  { label: 'mobile', width: 390, height: 844, isMobile: true },
] as const;

const {
  path,
  docs,
  story,
  'storybook-docs': storybookDocs,
  name,
  'full-page': isFullPage = false,
  'scroll-to-bottom': isScrollingToBottom = false,
  theme = 'light',
  dialog: isDialog = false,
} = parseArguments(usage, {
  options: {
    path: { type: 'string' },
    docs: { type: 'string' },
    story: { type: 'string' },
    'storybook-docs': { type: 'string' },
    name: { type: 'string' },
    'full-page': { type: 'boolean' },
    'scroll-to-bottom': { type: 'boolean' },
    theme: { type: 'string' },
    dialog: { type: 'boolean' },
  },
}).values;

const isTheme = (value: string): value is 'light' | 'dark' =>
  value === 'light' || value === 'dark';

if (!isTheme(theme)) {
  exitWithError(`--theme must be light or dark, not '${theme}'.`);
}

// The app has no dark theme yet, unlike the docs site and Storybook's docs
if (theme === 'dark' && !docs && !storybookDocs) {
  exitWithError('--theme dark only applies to --docs and --storybook-docs.');
}

if (!name || [path, docs, story, storybookDocs].filter(Boolean).length !== 1) {
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
    '--full-page and --scroll-to-bottom only apply to --path, --docs and --storybook-docs, since --story captures just the component.',
  );
}

if (isDialog && !story) {
  exitWithError(
    '--dialog only applies to --story, whose play function opens the dialog.',
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

  if (storybookDocs) {
    if (!STORYBOOK_DOCS_ID.test(storybookDocs)) {
      exitWithError(
        `--storybook-docs must be a Storybook docs ID such as 'introduction--docs', not '${storybookDocs}'.`,
      );
    }
    const url = new URL('/iframe.html', STORYBOOK_ORIGIN);
    url.searchParams.set('id', storybookDocs);
    url.searchParams.set('viewMode', 'docs');
    return url;
  }

  const [option, pagePath, origin] = docs
    ? ['--docs', docs, DOCS_ORIGIN]
    : ['--path', path, DEV_SERVER_ORIGIN];
  if (!pagePath?.startsWith('/')) {
    exitWithUsage(usage);
  }
  const url = new URL(pagePath, origin);
  // A path such as //example.com would otherwise point the browser elsewhere
  if (url.origin !== origin) {
    exitWithError(`${option} must be a path on ${origin}, not '${pagePath}'.`);
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

// Lazy images off screen wouldn't load before the capture, so load them all
// now. The deadline keeps a slow or broken image from stalling the capture
const IMAGE_LOAD_TIMEOUT_MILLISECONDS = 10_000;
const LOAD_IMAGES_SCRIPT = `(async () => {
  for (const image of document.querySelectorAll('img[loading="lazy"]')) {
    image.loading = 'eager';
  }
  const loads = [...document.images]
    .filter((image) => !image.complete)
    .map((image) => new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    }));
  await Promise.race([
    Promise.all(loads),
    new Promise((resolve) => setTimeout(resolve, ${IMAGE_LOAD_TIMEOUT_MILLISECONDS})),
  ]);
})()`;

async function capturePage(page: Page, file: string) {
  // Lets client components finish hydrating. Game pages keep a
  // subscription open and never go idle, so the timeout isn't an error
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

  // The dev-only Next.js indicator would otherwise sit over the page
  await page.evaluate(`document.querySelector('nextjs-portal')?.remove()`);

  await page.evaluate(LOAD_IMAGES_SCRIPT);

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

// Storybook finishes a story once its play function has run and its CSS
// animations have ended
const STORY_FINISHED_SCRIPT = `window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished'`;

// Movement driven from JavaScript, such as a carousel sliding to the tab a
// play function picked, isn't something Storybook waits for, so wait until
// nothing moves between two frames. Looping movement, such as a spinner,
// never settles, so the deadline stops the wait
const LAYOUT_SETTLE_TIMEOUT_MILLISECONDS = 2_000;
const LAYOUT_SETTLED_SCRIPT = `new Promise((resolve) => {
  setTimeout(() => resolve(false), ${LAYOUT_SETTLE_TIMEOUT_MILLISECONDS});
  const getPositions = () =>
    [...document.querySelectorAll('#storybook-root *, #storybook-docs *, [role="dialog"] *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left + ',' + rect.top;
      })
      .join('|');
  let previous = getPositions();
  const check = () =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const current = getPositions();
        if (current === previous) resolve(true);
        else {
          previous = current;
          check();
        }
      }),
    );
  check();
})`;

async function waitForStoryToSettle(page: Page) {
  try {
    await page.waitForFunction(STORY_FINISHED_SCRIPT, undefined, {
      timeout: 15_000,
    });
  } catch {
    exitWithError(
      `The story '${story}' didn't finish. Check its ID, which follows ?path=/story/ in Storybook's URL, and that its play function passes.`,
    );
  }
  await page.evaluate(LAYOUT_SETTLED_SCRIPT);
}

async function captureStory(page: Page, file: string) {
  await waitForStoryToSettle(page);

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

const DIALOG_SELECTOR = '[role="dialog"], [role="alertdialog"]';

// A dialog renders in a portal outside the story's root, so crop to the
// dialog itself, framed by the overlay behind it
async function captureDialog(page: Page, file: string) {
  await waitForStoryToSettle(page);
  const dialog = page.locator(DIALOG_SELECTOR).first();
  if (!(await dialog.isVisible())) {
    exitWithError(
      `The story '${story}' didn't open a dialog. Its play function needs to open one and leave it open.`,
    );
  }

  const bounds = boundsSchema.safeParse(await dialog.boundingBox());
  if (!bounds.success) {
    exitWithError(`The dialog in '${story}' has no visible size.`);
  }

  const viewport = page.viewportSize();
  const x = Math.max(bounds.data.x - STORY_PADDING, 0);
  const y = Math.max(bounds.data.y - STORY_PADDING, 0);
  const right = bounds.data.x + bounds.data.width + STORY_PADDING;
  const bottom = bounds.data.y + bounds.data.height + STORY_PADDING;
  await page.screenshot({
    path: file,
    clip: {
      x,
      y,
      width: Math.min(right, viewport?.width ?? right) - x,
      height: Math.min(bottom, viewport?.height ?? bottom) - y,
    },
  });
}

// Docs pages have no render phase to wait on, unlike stories
async function captureStorybookDocs(page: Page, file: string) {
  try {
    await page.waitForSelector('#storybook-docs .sbdocs-content > *', {
      timeout: 15_000,
    });
  } catch {
    exitWithError(
      `The docs page '${storybookDocs}' didn't render. Check its ID, which follows ?path=/docs/ in Storybook's URL.`,
    );
  }
  await page.evaluate(LAYOUT_SETTLED_SCRIPT);
  await capturePage(page, file);
}

function capture(page: Page, file: string) {
  if (isDialog) return captureDialog(page, file);
  if (story) return captureStory(page, file);
  if (storybookDocs) return captureStorybookDocs(page, file);
  return capturePage(page, file);
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
      colorScheme: theme,
    });
    const page = await context.newPage();

    try {
      await page.goto(url.href, { waitUntil: 'load' });
    } catch {
      exitWithError(
        `Couldn't load ${url.href}. Is ${story || storybookDocs ? 'Storybook' : docs ? 'the docs site' : 'the dev server'} running on ${url.origin}?`,
      );
    }

    const file = `${directory}/${name}-${size.label}.png`;
    await capture(page, file);
    console.log(file);

    await context.close();
  }
} finally {
  await browser.close();
}

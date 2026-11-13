import type { Page } from 'playwright';
import { exitWithError } from '../../lib/script-helpers.ts';

export type Size = {
  label: string;
  width: number;
  height: number;
  isMobile: boolean;
};

// Common resolutions from Statcounter's 2026 figures, plus the iPad and the
// width where the app's larger-screen (`lg`) layouts start. Sizes are in CSS
// pixels, so a 4K screen at its usual 150% or 200% scaling is 1440p or 1080p
export const NAMED_SIZES = {
  desktop: { width: 1280, height: 800, isMobile: false },
  mobile: { width: 390, height: 844, isMobile: true },
  '1440p': { width: 2560, height: 1440, isMobile: false },
  '1080p': { width: 1920, height: 1080, isMobile: false },
  laptop: { width: 1536, height: 864, isMobile: false },
  '720p': { width: 1280, height: 720, isMobile: false },
  'small-desktop': { width: 1024, height: 768, isMobile: false },
  'ipad-landscape': { width: 1180, height: 820, isMobile: true },
  'ipad-portrait': { width: 820, height: 1180, isMobile: true },
  'large-mobile': { width: 414, height: 896, isMobile: true },
  'small-mobile': { width: 360, height: 800, isMobile: true },
} as const satisfies Record<string, Omit<Size, 'label'>>;

export const SIZES = [
  { label: 'desktop', ...NAMED_SIZES.desktop },
  { label: 'mobile', ...NAMED_SIZES.mobile },
] as const;

const STORYBOOK_ORIGIN = 'http://localhost:6006';
const STORY_ID = /^[a-z0-9-]+--[a-z0-9-]+$/;

export function getStoryUrl(story: string): URL {
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

export function getStorybookDocsUrl(docsId: string): URL {
  const url = new URL('/iframe.html', STORYBOOK_ORIGIN);
  url.searchParams.set('id', docsId);
  url.searchParams.set('viewMode', 'docs');
  return url;
}

// Storybook finishes a story once its play function has run and its CSS
// animations have ended
const STORY_FINISHED_SCRIPT = `window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished'`;

// Movement driven from JavaScript, such as a carousel sliding to the tab a
// play function picked, isn't something Storybook waits for, so wait until
// nothing moves between two frames. Looping movement, such as a spinner,
// never settles, so the deadline stops the wait
const LAYOUT_SETTLE_TIMEOUT_MILLISECONDS = 2_000;
export const LAYOUT_SETTLED_SCRIPT = `new Promise((resolve) => {
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

export async function waitForStoryToSettle(page: Page, story: string) {
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

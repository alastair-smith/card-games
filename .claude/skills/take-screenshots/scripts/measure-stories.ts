#!/usr/bin/env node
import { chromium, type Page } from 'playwright';
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';
import {
  getStoryUrl,
  NAMED_SIZES,
  SIZES,
  type Size,
  waitForStoryToSettle,
} from './story-page.ts';

const usage =
  'Usage: measure-stories.ts --story <story id> [--story <story id> ...] [--selector <css selector>] [--size <name or WxH> ...]';

const {
  story: stories = [],
  selector,
  size: sizeArguments = [],
} = parseArguments(usage, {
  options: {
    story: { type: 'string', multiple: true },
    selector: { type: 'string' },
    size: { type: 'string', multiple: true },
  },
}).values;

if (stories.length === 0 || selector === '') {
  exitWithUsage(usage);
}

const CUSTOM_SIZE = /^(\d{3,4})x(\d{3,4})$/;

function isNamedSize(name: string): name is keyof typeof NAMED_SIZES {
  return Object.hasOwn(NAMED_SIZES, name);
}

function parseSize(sizeArgument: string): Size {
  if (isNamedSize(sizeArgument)) {
    return { label: sizeArgument, ...NAMED_SIZES[sizeArgument] };
  }
  const match = CUSTOM_SIZE.exec(sizeArgument);
  if (!match) {
    exitWithError(
      `--size must be WxH, such as 1180x764, or one of: ${Object.keys(NAMED_SIZES).join(', ')}. Not '${sizeArgument}'.`,
    );
  }
  return {
    label: sizeArgument,
    width: Number(match[1]),
    height: Number(match[2]),
    isMobile: false,
  };
}

const sizes: readonly Size[] =
  sizeArguments.length > 0 ? sizeArguments.map(parseSize) : SIZES;

type Box = { x: number; y: number; width: number; height: number };

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

const BOX_SIDES = ['x', 'y', 'width', 'height'] as const;

const formatBox = (box: Box) =>
  BOX_SIDES.map((side) => `${side}=${box[side]}`).join(' ');

async function loadStory(page: Page, story: string) {
  try {
    await page.goto(getStoryUrl(story).href, { waitUntil: 'load' });
  } catch {
    exitWithError("Couldn't load Storybook. Is it running on port 6006?");
  }
  await waitForStoryToSettle(page, story);
}

async function measureBoxes(page: Page, story: string, cssSelector: string) {
  let measured: (Box | null)[];
  try {
    const elements = await page
      .locator('#storybook-root')
      .locator(cssSelector)
      .all();
    measured = await Promise.all(
      elements.map((element) => element.boundingBox()),
    );
  } catch {
    exitWithError(`'${cssSelector}' isn't a selector the page can use.`);
  }

  const boxes = measured.flatMap((box) =>
    box
      ? [
          {
            x: roundToTenth(box.x),
            y: roundToTenth(box.y),
            width: roundToTenth(box.width),
            height: roundToTenth(box.height),
          },
        ]
      : [],
  );
  if (boxes.length === 0) {
    exitWithError(`Nothing visible matches '${cssSelector}' in '${story}'.`);
  }
  return boxes;
}

type Scroller = { element: string; down: number; across: number };

// The page itself, then each element whose own overflow lets it scroll
const SCROLLERS_SCRIPT = `(() => {
  const CAN_SCROLL = ['auto', 'scroll'];
  const describe = (element) =>
    element.tagName.toLowerCase() +
    (element.id ? '#' + element.id : '') +
    [...element.classList].slice(0, 3).map((name) => '.' + name).join('');
  const page = document.scrollingElement;
  const scrollers = [];
  if (page) {
    scrollers.push({
      element: 'page',
      down: page.scrollHeight - page.clientHeight,
      across: page.scrollWidth - page.clientWidth,
    });
  }
  for (const element of document.querySelectorAll('body *')) {
    const style = getComputedStyle(element);
    scrollers.push({
      element: describe(element),
      down: CAN_SCROLL.includes(style.overflowY)
        ? element.scrollHeight - element.clientHeight
        : 0,
      across: CAN_SCROLL.includes(style.overflowX)
        ? element.scrollWidth - element.clientWidth
        : 0,
    });
  }
  return scrollers.filter((scroller) => scroller.down > 0 || scroller.across > 0);
})()`;

async function printScrollers(page: Page, story: string) {
  const scrollers: Scroller[] = await page.evaluate(SCROLLERS_SCRIPT);
  if (scrollers.length === 0) {
    console.log(`  Nothing scrolls in ${story}`);
    return;
  }
  console.log(`  Scrolls in ${story}:`);
  for (const scroller of scrollers) {
    const distances = [
      scroller.down > 0 ? `${scroller.down}px down` : '',
      scroller.across > 0 ? `${scroller.across}px across` : '',
    ].filter(Boolean);
    console.log(`    ${scroller.element}: ${distances.join(', ')}`);
  }
}

function printDifferences(
  baseStory: string,
  baseBoxes: Box[],
  story: string,
  boxes: Box[],
) {
  if (boxes.length !== baseBoxes.length) {
    console.log(
      `  DIFFERS: ${story} has ${boxes.length} matches, ${baseStory} has ${baseBoxes.length}`,
    );
    return true;
  }

  let hasDifference = false;
  boxes.forEach((box, elementIndex) => {
    const baseBox = baseBoxes[elementIndex];
    if (!baseBox) return;
    if (BOX_SIDES.every((side) => box[side] === baseBox[side])) return;
    hasDifference = true;
    console.log(
      `  DIFFERS: element ${elementIndex}: ${baseStory} ${formatBox(baseBox)}; ${story} ${formatBox(box)}`,
    );
  });
  return hasDifference;
}

const browser = await chromium.launch();

try {
  for (const size of sizes) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      isMobile: size.isMobile,
      hasTouch: size.isMobile,
    });
    const page = await context.newPage();

    console.log(`${size.label} (${size.width}×${size.height})`);

    const [baseStory, ...otherStories] = stories;
    if (!baseStory) exitWithUsage(usage);

    await loadStory(page, baseStory);
    await printScrollers(page, baseStory);
    const baseBoxes = selector
      ? await measureBoxes(page, baseStory, selector)
      : [];
    baseBoxes.forEach((box, elementIndex) => {
      console.log(`  element ${elementIndex}: ${formatBox(box)}`);
    });

    let hasDifference = false;
    for (const story of otherStories) {
      await loadStory(page, story);
      await printScrollers(page, story);
      if (!selector) continue;
      const boxes = await measureBoxes(page, story, selector);
      if (printDifferences(baseStory, baseBoxes, story, boxes)) {
        hasDifference = true;
      }
    }
    if (selector && otherStories.length > 0 && !hasDifference) {
      console.log('  No differences');
    }

    await context.close();
  }
} finally {
  await browser.close();
}

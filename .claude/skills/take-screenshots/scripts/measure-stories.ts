#!/usr/bin/env node
import { chromium, type Page } from 'playwright';
import {
  exitWithError,
  exitWithUsage,
  parseArguments,
} from '../../lib/script-helpers.ts';
import { getStoryUrl, SIZES, waitForStoryToSettle } from './story-page.ts';

const usage =
  'Usage: measure-stories.ts --story <story id> --story <story id> [--story <story id> ...] --selector <css selector>';

const { story: stories = [], selector } = parseArguments(usage, {
  options: {
    story: { type: 'string', multiple: true },
    selector: { type: 'string' },
  },
}).values;

if (stories.length < 2 || !selector) {
  exitWithUsage(usage);
}

type Box = { x: number; y: number; width: number; height: number };

const roundToTenth = (value: number) => Math.round(value * 10) / 10;

const BOX_SIDES = ['x', 'y', 'width', 'height'] as const;

const formatBox = (box: Box) =>
  BOX_SIDES.map((side) => `${side}=${box[side]}`).join(' ');

async function measureStory(page: Page, story: string, cssSelector: string) {
  try {
    await page.goto(getStoryUrl(story).href, { waitUntil: 'load' });
  } catch {
    exitWithError("Couldn't load Storybook. Is it running on port 6006?");
  }
  await waitForStoryToSettle(page, story);

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
  for (const size of SIZES) {
    const context = await browser.newContext({
      viewport: { width: size.width, height: size.height },
      isMobile: size.isMobile,
      hasTouch: size.isMobile,
    });
    const page = await context.newPage();

    console.log(`${size.label} (${size.width}×${size.height})`);

    const [baseStory, ...otherStories] = stories;
    if (!baseStory) exitWithUsage(usage);

    const baseBoxes = await measureStory(page, baseStory, selector);
    baseBoxes.forEach((box, elementIndex) => {
      console.log(`  element ${elementIndex}: ${formatBox(box)}`);
    });

    let hasDifference = false;
    for (const story of otherStories) {
      const boxes = await measureStory(page, story, selector);
      if (printDifferences(baseStory, baseBoxes, story, boxes)) {
        hasDifference = true;
      }
    }
    if (!hasDifference) {
      console.log('  No differences');
    }

    await context.close();
  }
} finally {
  await browser.close();
}

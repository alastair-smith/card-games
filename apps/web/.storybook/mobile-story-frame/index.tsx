import { DocsContext, Story } from '@storybook/addon-docs/blocks';
import { type RefObject, useContext, useEffect, useRef, useState } from 'react';
import {
  RESET_STORY_ARGS,
  UPDATE_STORY_ARGS,
} from 'storybook/internal/core-events';
import type { Args, PreparedStory } from 'storybook/internal/types';
import { PHONE_SCREEN_HEIGHT } from '../phone-viewport';

type UpdateArgsRequest = { storyId: string; updatedArgs: Args };
type ResetArgsRequest = { storyId: string; argNames?: string[] };

declare global {
  interface Window {
    __STORYBOOK_PREVIEW__?: {
      onUpdateArgs: (request: UpdateArgsRequest) => Promise<void>;
      onResetArgs: (request: ResetArgsRequest) => Promise<void>;
    };
  }
}

const STORY_CHILDREN_SELECTOR = '#storybook-root > div > *';

const isVisible = (element: Element) =>
  [element, ...element.querySelectorAll('*')].some(
    (descendant) => descendant.getBoundingClientRect().height > 0,
  );

// Dialogs and popovers portal to the body and position against the screen,
// so a story showing one needs the whole phone screen
const hasOpenOverlay = (frameDocument: Document) =>
  [...frameDocument.body.children].some(
    (child) =>
      !child.id.startsWith('storybook-') &&
      !child.classList.contains('sb-wrapper') &&
      isVisible(child),
  );

// The preview decorator stretches to the frame with min-h-screen, so measure
// the story inside it instead, leaving out fixed and absolute layers such as
// the toaster
const measureContentHeight = (frameDocument: Document) => {
  const frameWindow = frameDocument.defaultView;
  const decorator = frameDocument.querySelector('#storybook-root > div');
  if (!frameWindow || !decorator) return undefined;
  if (hasOpenOverlay(frameDocument)) return PHONE_SCREEN_HEIGHT;

  const contentBottoms = [...decorator.children]
    .filter(
      (child) =>
        !['fixed', 'absolute'].includes(
          frameWindow.getComputedStyle(child).position,
        ),
    )
    .map((child) => child.getBoundingClientRect().bottom);
  const decoratorPaddingBottom = Number.parseFloat(
    frameWindow.getComputedStyle(decorator).paddingBottom,
  );

  return Math.ceil(Math.max(0, ...contentBottoms) + decoratorPaddingBottom);
};

const useFrameContentHeight = (
  frameContainerRef: RefObject<HTMLDivElement | null>,
  isMeasuring: boolean,
) => {
  const [contentHeight, setContentHeight] = useState<number>();

  useEffect(() => {
    const frame = frameContainerRef.current?.querySelector('iframe');
    if (!isMeasuring || !frame) return;

    let resizeObserver: ResizeObserver | undefined;
    let mutationObserver: MutationObserver | undefined;

    const handleFrameLoad = () => {
      const frameDocument = frame.contentDocument;
      const frameWindow = frameDocument?.defaultView;
      if (!frameDocument || !frameWindow) return;

      const measure = () =>
        setContentHeight(measureContentHeight(frameDocument));
      // Observers from the frame's own window, so they see its layout
      const frameResizeObserver = new frameWindow.ResizeObserver(measure);
      const observeStoryChildren = () => {
        frameResizeObserver.disconnect();
        for (const child of frameDocument.querySelectorAll(
          STORY_CHILDREN_SELECTOR,
        )) {
          frameResizeObserver.observe(child);
        }
        measure();
      };
      const frameMutationObserver = new frameWindow.MutationObserver(
        observeStoryChildren,
      );
      frameMutationObserver.observe(frameDocument.body, {
        childList: true,
        subtree: true,
      });
      observeStoryChildren();

      resizeObserver = frameResizeObserver;
      mutationObserver = frameMutationObserver;
    };

    frame.addEventListener('load', handleFrameLoad);
    return () => {
      frame.removeEventListener('load', handleFrameLoad);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [frameContainerRef, isMeasuring]);

  return contentHeight;
};

type MobileStoryFrameProps = {
  story: PreparedStory;
  isFollowingControls: boolean;
};

export const MobileStoryFrame = ({
  story,
  isFollowingControls,
}: MobileStoryFrameProps) => {
  const { channel } = useContext(DocsContext);
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const isFullScreen = Boolean(story.parameters.isFullScreen);
  const contentHeight = useFrameContentHeight(frameContainerRef, !isFullScreen);

  // Storybook's iframe stories only get the story id, so changes from the
  // Controls block never reach them. The frame is same-origin, so apply each
  // request to its preview directly. Emitting on the frame's channel instead
  // would echo back to this page and loop
  useEffect(() => {
    if (!isFollowingControls) return;

    const getFramePreview = () =>
      frameContainerRef.current?.querySelector('iframe')?.contentWindow
        ?.__STORYBOOK_PREVIEW__;

    const handleUpdateArgs = (request: UpdateArgsRequest) => {
      if (request.storyId === story.id)
        getFramePreview()?.onUpdateArgs(request);
    };
    const handleResetArgs = (request: ResetArgsRequest) => {
      if (request.storyId === story.id) getFramePreview()?.onResetArgs(request);
    };

    channel.on(UPDATE_STORY_ARGS, handleUpdateArgs);
    channel.on(RESET_STORY_ARGS, handleResetArgs);
    return () => {
      channel.off(UPDATE_STORY_ARGS, handleUpdateArgs);
      channel.off(RESET_STORY_ARGS, handleResetArgs);
    };
  }, [channel, isFollowingControls, story.id]);

  return (
    <div
      ref={frameContainerRef}
      className='w-[375px] overflow-hidden rounded ring-1 ring-black/10'
    >
      <Story
        of={story.moduleExport}
        inline={false}
        height={`${contentHeight ?? PHONE_SCREEN_HEIGHT}px`}
      />
    </div>
  );
};

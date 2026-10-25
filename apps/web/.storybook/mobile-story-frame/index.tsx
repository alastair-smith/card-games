import { DocsContext, Story } from '@storybook/addon-docs/blocks';
import { type RefObject, useContext, useEffect, useRef, useState } from 'react';
import type { Channel } from 'storybook/internal/channels';
import {
  RESET_STORY_ARGS,
  STORY_RENDERED,
  UPDATE_STORY_ARGS,
} from 'storybook/internal/core-events';
import type { Args, PreparedStory } from 'storybook/internal/types';
import { PHONE_SCREEN_HEIGHT } from '../phone-viewport';

type UpdateArgsRequest = { storyId: string; updatedArgs: Args };
type ResetArgsRequest = { storyId: string; argNames?: string[] };

declare global {
  interface Window {
    __STORYBOOK_ADDONS_CHANNEL__?: Channel;
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
    .map((child) => child.getBoundingClientRect().bottom + frameWindow.scrollY);
  const decoratorPaddingBottom = Number.parseFloat(
    frameWindow.getComputedStyle(decorator).paddingBottom,
  );

  return Math.ceil(Math.max(0, ...contentBottoms) + decoratorPaddingBottom);
};

// The Story block may add its iframe after the first render, and the iframe
// may finish loading before a listener is attached, or reload later on
const useFrameDocument = (
  frameContainerRef: RefObject<HTMLDivElement | null>,
) => {
  const [frameDocument, setFrameDocument] = useState<Document>();

  useEffect(() => {
    const container = frameContainerRef.current;
    if (!container) return;
    let frame: HTMLIFrameElement | null = null;

    const handleFrameLoad = () => {
      if (frame?.contentDocument) setFrameDocument(frame.contentDocument);
    };
    const attachToFrame = () => {
      const currentFrame = container.querySelector('iframe');
      if (!currentFrame || currentFrame === frame) return;
      frame?.removeEventListener('load', handleFrameLoad);
      frame = currentFrame;
      frame.addEventListener('load', handleFrameLoad);
      const isLoaded =
        frame.contentDocument?.readyState === 'complete' &&
        frame.contentWindow?.location.href !== 'about:blank';
      if (isLoaded) handleFrameLoad();
    };

    const mutationObserver = new MutationObserver(attachToFrame);
    mutationObserver.observe(container, { childList: true, subtree: true });
    attachToFrame();

    return () => {
      mutationObserver.disconnect();
      frame?.removeEventListener('load', handleFrameLoad);
    };
  }, [frameContainerRef]);

  return frameDocument;
};

const useContentHeight = (frameDocument: Document | undefined) => {
  const [contentHeight, setContentHeight] = useState<number>();

  useEffect(() => {
    const frameWindow = frameDocument?.defaultView;
    if (!frameDocument || !frameWindow) return;

    const measure = () => setContentHeight(measureContentHeight(frameDocument));
    // Observers from the frame's own window, so they see its layout
    const resizeObserver = new frameWindow.ResizeObserver(measure);
    const observeStoryChildren = () => {
      resizeObserver.disconnect();
      for (const child of frameDocument.querySelectorAll(
        STORY_CHILDREN_SELECTOR,
      )) {
        resizeObserver.observe(child);
      }
      measure();
    };
    const mutationObserver = new frameWindow.MutationObserver(
      observeStoryChildren,
    );
    mutationObserver.observe(frameDocument.body, {
      childList: true,
      subtree: true,
    });
    observeStoryChildren();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [frameDocument]);

  return contentHeight;
};

// Storybook's iframe stories only get the story id, so changes from the
// Controls block never reach them. The frame is same-origin, so apply each
// request to its preview directly, along with any changes made before it
// rendered. Emitting on the frame's channel instead would echo back to this
// page and loop
const useFollowControls = (
  frameDocument: Document | undefined,
  story: PreparedStory,
  isFollowingControls: boolean,
) => {
  const { channel, getStoryContext } = useContext(DocsContext);

  useEffect(() => {
    const frameWindow = frameDocument?.defaultView;
    const framePreview = frameWindow?.__STORYBOOK_PREVIEW__;
    const frameChannel = frameWindow?.__STORYBOOK_ADDONS_CHANNEL__;
    if (!isFollowingControls || !frameDocument || !framePreview) return;
    let isStoryRendered = false;

    const applyCurrentArgs = async () => {
      await framePreview.onResetArgs({ storyId: story.id });
      await framePreview.onUpdateArgs({
        storyId: story.id,
        updatedArgs: getStoryContext(story).args,
      });
    };
    const handleStoryRendered = () => {
      if (isStoryRendered) return;
      isStoryRendered = true;
      void applyCurrentArgs();
    };
    const handleUpdateArgs = (request: UpdateArgsRequest) => {
      if (isStoryRendered && request.storyId === story.id)
        void framePreview.onUpdateArgs(request);
    };
    const handleResetArgs = (request: ResetArgsRequest) => {
      if (isStoryRendered && request.storyId === story.id)
        void framePreview.onResetArgs(request);
    };

    if (frameDocument.querySelector(STORY_CHILDREN_SELECTOR)) {
      handleStoryRendered();
    } else {
      frameChannel?.on(STORY_RENDERED, handleStoryRendered);
    }
    channel.on(UPDATE_STORY_ARGS, handleUpdateArgs);
    channel.on(RESET_STORY_ARGS, handleResetArgs);

    return () => {
      frameChannel?.off(STORY_RENDERED, handleStoryRendered);
      channel.off(UPDATE_STORY_ARGS, handleUpdateArgs);
      channel.off(RESET_STORY_ARGS, handleResetArgs);
    };
  }, [channel, frameDocument, getStoryContext, isFollowingControls, story]);
};

type MobileStoryFrameProps = {
  story: PreparedStory;
  isFollowingControls: boolean;
};

// The frame keeps a phone-sized viewport, so screen-relative sizes such as
// h-screen measure the same however tall the box around it is. The box shrinks
// to shorter stories, and taller ones scroll inside it as on a phone
export const MobileStoryFrame = ({
  story,
  isFollowingControls,
}: MobileStoryFrameProps) => {
  const frameContainerRef = useRef<HTMLDivElement>(null);
  const frameDocument = useFrameDocument(frameContainerRef);
  const contentHeight = useContentHeight(frameDocument);
  useFollowControls(frameDocument, story, isFollowingControls);

  return (
    <div
      ref={frameContainerRef}
      style={{
        height: Math.min(
          contentHeight ?? PHONE_SCREEN_HEIGHT,
          PHONE_SCREEN_HEIGHT,
        ),
      }}
      className='w-[375px] overflow-hidden rounded ring-1 ring-black/10'
    >
      <Story
        of={story.moduleExport}
        inline={false}
        height={`${PHONE_SCREEN_HEIGHT}px`}
      />
    </div>
  );
};

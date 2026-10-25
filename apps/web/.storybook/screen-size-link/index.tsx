import { DocsContext } from '@storybook/addon-docs/blocks';
import type { LucideIcon } from 'lucide-react';
import { type MouseEvent, useContext } from 'react';
import { SELECT_STORY, UPDATE_GLOBALS } from 'storybook/internal/core-events';
import type { PreparedStory } from 'storybook/internal/types';

type ScreenSizeLinkProps = {
  story: PreparedStory;
  screenName: string;
  icon: LucideIcon;
  size: { width: number; height: number } | undefined;
  viewport: string | undefined;
};

export const ScreenSizeLink = ({
  story,
  screenName,
  icon: Icon,
  size,
  viewport,
}: ScreenSizeLinkProps) => {
  const { channel } = useContext(DocsContext);
  // Relative to the preview's iframe.html, which sits beside the manager page
  const href = `./?path=/story/${story.id}${viewport ? `&globals=viewport.value:${viewport}` : ''}`;

  // The href does a full page load, so a plain click switches story inside
  // the manager instead, leaving modified clicks to open a new tab
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    channel.emit(UPDATE_GLOBALS, {
      globals: { viewport: { value: viewport, isRotated: false } },
    });
    channel.emit(SELECT_STORY, { storyId: story.id });
  };

  return (
    <p className='mt-0 mb-2 font-bold text-xs uppercase tracking-widest'>
      <a
        href={href}
        target='_top'
        onClick={handleClick}
        className='inline-flex items-center gap-1.5'
      >
        <Icon aria-hidden='true' className='size-4' />
        <span className='sr-only'>Open {story.name} at </span>
        {screenName}
        {size && (
          <span className='normal-case tracking-normal'>
            {` (${size.width} × ${size.height})`}
          </span>
        )}
      </a>
    </p>
  );
};

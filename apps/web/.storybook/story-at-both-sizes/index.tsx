import {
  Anchor,
  Canvas,
  Description,
  Subheading,
} from '@storybook/addon-docs/blocks';
import { MonitorIcon, SmartphoneIcon } from 'lucide-react';
import { useRef } from 'react';
import type { PreparedStory } from 'storybook/internal/types';
import { MobileStoryFrame } from '../mobile-story-frame';
import { PHONE_VIEWPORT_KEY } from '../phone-viewport';
import { ScreenSizeLink } from '../screen-size-link';
import { useRenderedSize } from '../use-rendered-size';

type StoryAtBothSizesProps = {
  story: PreparedStory;
  isPrimary?: boolean;
};

// Tailwind's breakpoints respond to the window, not the container, so the
// mobile layout only appears inside an iframe that is itself phone-sized
export const StoryAtBothSizes = ({
  story,
  isPrimary = false,
}: StoryAtBothSizesProps) => {
  const mobileGroupRef = useRef<HTMLDivElement>(null);
  const desktopGroupRef = useRef<HTMLDivElement>(null);
  const mobileSize = useRenderedSize(mobileGroupRef, 'iframe');
  const desktopSize = useRenderedSize(desktopGroupRef, '[data-story-block]');

  return (
    <Anchor storyId={isPrimary ? `primary--${story.id}` : story.id}>
      {!isPrimary && (
        <>
          <Subheading>{story.name}</Subheading>
          <Description of={story.moduleExport} />
        </>
      )}
      <div className='flex flex-col gap-6 lg:flex-row lg:items-start'>
        <div ref={mobileGroupRef} className='shrink-0'>
          <ScreenSizeLink
            story={story}
            screenName='Mobile'
            icon={SmartphoneIcon}
            size={mobileSize}
            viewport={PHONE_VIEWPORT_KEY}
          />
          <MobileStoryFrame story={story} isFollowingControls={isPrimary} />
        </div>
        <div ref={desktopGroupRef} className='min-w-0 flex-1'>
          <ScreenSizeLink
            story={story}
            screenName='Desktop'
            icon={MonitorIcon}
            size={desktopSize}
            viewport={undefined}
          />
          <Canvas
            of={story.moduleExport}
            withToolbar={isPrimary}
            story={{
              // Matches the mobile iframe, which runs play functions in story mode
              autoplay: true,
              __primary: isPrimary,
              __forceInitialArgs: !isPrimary,
            }}
            source={{ __forceInitialArgs: !isPrimary }}
          />
        </div>
      </div>
    </Anchor>
  );
};

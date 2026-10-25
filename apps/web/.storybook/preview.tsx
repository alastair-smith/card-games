import type { Preview } from '@storybook/nextjs-vite';
import { MINIMAL_VIEWPORTS } from 'storybook/viewport';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toast';
import { cn } from '~/utils/cn';
import { DocsPage } from './docs-page';
import { PHONE_VIEWPORT, PHONE_VIEWPORT_KEY } from './phone-viewport';
import { getSystemTheme } from './theme';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      theme: getSystemTheme(),
      page: DocsPage,
    },
    controls: {
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        [PHONE_VIEWPORT_KEY]: PHONE_VIEWPORT,
        ...MINIMAL_VIEWPORTS,
      },
    },
    a11y: {
      test: 'todo',
    },
    interactions: { disable: true },
  },
  decorators: [
    (Story, { viewMode, parameters }) => (
      <div
        className={cn(
          'bg-main-background background-noise prose text-dark-text',
          viewMode === 'story' && 'min-h-screen',
          !parameters.isFullScreen && 'p-4',
        )}
      >
        <Toaster />
        <Story />
      </div>
    ),
  ],
};

export default preview;

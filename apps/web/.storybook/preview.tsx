import type { Preview } from '@storybook/nextjs-vite';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toast';
import { cn } from '~/utils/cn';
import { getSystemTheme } from './theme';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      theme: getSystemTheme(),
    },
    controls: {
      disableSaveFromUI: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
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

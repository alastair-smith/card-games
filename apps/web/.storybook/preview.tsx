import type { Preview } from '@storybook/nextjs-vite';
import '~/styles/globals.css';
import { Toaster } from '~/components/ui/toast';
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
    (Story) => (
      <div className='bg-main-background background-noise prose text-dark-text min-h-screen'>
        <Toaster />
        <Story />
      </div>
    ),
  ],
};

export default preview;

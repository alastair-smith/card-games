import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-mcp',
  ],
  framework: '@storybook/nextjs-vite',
  core: {
    allowedHosts: ['localhost'],
  },
  staticDirs: ['./assets', '../public'],
  tags: {
    _docs: { defaultFilterSelection: 'include' },
  },
  features: {
    componentsManifest: true,
  },
};

export default config;

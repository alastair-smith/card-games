import { create } from 'storybook/theming';

const brand = {
  brandTitle: 'Play Cards',
  brandUrl: './',
  brandTarget: '_self',
  fontBase:
    'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
  fontCode:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export const lightTheme = create({
  ...brand,
  base: 'light',
  brandImage: './logo-light.svg',
  colorPrimary: '#f5d547',
  colorSecondary: '#178259',
  appBg: '#e5f8fa',
  appContentBg: '#ffffff',
  appPreviewBg: '#01321f',
  appBorderColor: 'rgba(31, 46, 61, 0.15)',
  textColor: '#1f2e3d',
  textInverseColor: '#f4eff5',
  barBg: '#ffffff',
  barTextColor: '#1f2e3d',
  barSelectedColor: '#01321f',
  barHoverColor: '#01321f',
  buttonBg: '#e5f8fa',
  buttonBorder: 'rgba(31, 46, 61, 0.25)',
  inputBg: '#ffffff',
  inputBorder: 'rgba(31, 46, 61, 0.25)',
  inputTextColor: '#1f2e3d',
});

export const darkTheme = create({
  ...brand,
  base: 'dark',
  brandImage: './logo-dark.svg',
  colorPrimary: '#f5d547',
  colorSecondary: '#5299e0',
  appBg: '#012819',
  appContentBg: '#0e3929',
  appPreviewBg: '#01321f',
  appBorderColor: 'rgba(244, 239, 245, 0.15)',
  textColor: '#f4eff5',
  textInverseColor: '#1f2e3d',
  textMutedColor: '#b8bfc2',
  barBg: '#0a291d',
  barTextColor: '#b8bfc2',
  barSelectedColor: '#f5d547',
  barHoverColor: '#f5d547',
  buttonBg: '#178259',
  buttonBorder: 'rgba(244, 239, 245, 0.25)',
  inputBg: '#01321f',
  inputBorder: 'rgba(244, 239, 245, 0.25)',
  inputTextColor: '#f4eff5',
});

export function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? darkTheme
    : lightTheme;
}

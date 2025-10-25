/** @type {import('@ladle/react').UserConfig} */
export default {
  appendToHead: `<style>
    :root {--ladle-main-padding: 0; --ladle-main-padding-mobile: 0;}
    .ladle-main {
      background: var(--color-dark-green);
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='p' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Ccircle cx='5' cy='5' r='1' fill='white' opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23p)'/%3E%3C/svg%3E");
    }
  </style>`,
  storyOrder: (stories) => {
    const docs = stories.filter((s) => s.includes('doc'));

    return [...docs, '*'];
  },
  theme: {
    defaultState: 'dark',
  },
  viteConfig: `${process.cwd()}/.ladle/vite.config.ts`,
};

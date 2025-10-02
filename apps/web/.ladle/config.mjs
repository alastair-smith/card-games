/** @type {import('@ladle/react').UserConfig} */
export default {
  appendToHead: `<style>
    :root {--ladle-main-padding: 0; --ladle-main-padding-mobile: 0;}
  </style>`,
  storyOrder: (stories) => {
    const docs = stories.filter((s) => s.includes('doc'));

    return [...docs, '*'];
  },
  theme: {
    defaultState: 'dark',
  },
};

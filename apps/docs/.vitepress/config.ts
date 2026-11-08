import { defineConfig } from 'vitepress';

const REPO_URL = 'https://github.com/alastair-smith/card-games';

export default defineConfig({
  title: 'Play Cards Docs',
  description: 'How Play Cards is built and how each game works',
  cleanUrls: true,
  // A fixed port, so tools such as the screenshot script can find the site
  vite: { server: { port: 5173, strictPort: true } },
  ignoreDeadLinks: 'localhostLinks',
  markdown: {
    config(markdown) {
      const renderImage = markdown.renderer.rules.image;
      if (!renderImage) {
        return;
      }

      // Render each diagram's light and dark copy, so it follows the theme
      // toggle. Lazy loading leaves the hidden copy unfetched
      markdown.renderer.rules.image = (tokens, index, options, env, self) => {
        const token = tokens[index];
        const source = token?.attrGet('src');
        if (!token || !source?.endsWith('.light.svg')) {
          return renderImage(tokens, index, options, env, self);
        }

        const originalAttributes = token.attrs;
        const html = (['light', 'dark'] as const)
          .map((theme) => {
            token.attrs =
              originalAttributes?.map(([name, value]) => [name, value]) ?? [];
            token.attrSet(
              'src',
              source.replace(/\.light\.svg$/, `.${theme}.svg`),
            );
            token.attrJoin('class', `diagram-${theme}`);
            token.attrSet('loading', 'lazy');
            return renderImage(tokens, index, options, env, self);
          })
          .join('');
        token.attrs = originalAttributes;
        return html;
      };
    },
  },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
  ],
  themeConfig: {
    logo: '/favicon.svg',
    siteTitle: 'Docs.PlayCards',
    sidebar: [
      {
        text: 'Technical',
        items: [
          { text: 'Getting started', link: '/technical/getting-started' },
          { text: 'Architecture', link: '/technical/architecture' },
          { text: 'Testing strategy', link: '/technical/testing-strategy' },
          { text: 'Documentation', link: '/technical/documentation' },
        ],
      },
      {
        text: 'Games',
        items: [
          { text: 'Lobby', link: '/games/lobby' },
          { text: 'Yaniv', link: '/games/yaniv' },
          { text: 'Shithead', link: '/games/shithead' },
        ],
      },
    ],
    nav: [
      {
        text: '<img class="app-link-icon" src="/app-icon.svg" alt="">PlayCards.Games',
        link: 'https://playcards.games',
      },
      {
        text: '<img class="app-link-icon" src="/stories-icon.svg" alt="">Storybook',
        link: 'https://stories.playcards.games',
      },
    ],
    socialLinks: [{ icon: 'github', link: REPO_URL }],
    search: { provider: 'local' },
  },
});

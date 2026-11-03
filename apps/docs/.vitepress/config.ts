import { defineConfig } from 'vitepress';

const REPO_URL = 'https://github.com/alastair-smith/card-games';

export default defineConfig({
  title: 'Play Cards Docs',
  description: 'How Play Cards is built and how each game works',
  cleanUrls: true,
  ignoreDeadLinks: 'localhostLinks',
  markdown: {
    config(markdown) {
      const renderImage = markdown.renderer.rules.image;
      if (!renderImage) {
        return;
      }

      // Swap each diagram for the light and dark copies build:diagrams makes,
      // so it follows the theme toggle rather than the system colour scheme
      markdown.renderer.rules.image = (tokens, index, options, env, self) => {
        const token = tokens[index];
        const source = token?.attrGet('src');
        if (!token || !source?.includes('/diagrams/')) {
          return renderImage(tokens, index, options, env, self);
        }

        return (['light', 'dark'] as const)
          .map((theme) => {
            token.attrSet('src', source.replace(/\.svg$/, `.${theme}.svg`));
            token.attrSet('class', `diagram-${theme}`);
            return renderImage(tokens, index, options, env, self);
          })
          .join('');
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
          { text: 'Maintaining the docs', link: '/technical/maintaining-docs' },
        ],
      },
      {
        text: 'Games',
        items: [
          { text: 'Lobby', link: '/games/lobby' },
          { text: 'Yaniv', link: '/games/yaniv' },
        ],
      },
    ],
    nav: [
      {
        text: '<img class="app-link-icon" src="/app-icon.svg" alt="">PlayCards.Games',
        link: 'https://playcards.games',
      },
    ],
    socialLinks: [{ icon: 'github', link: REPO_URL }],
    search: { provider: 'local' },
  },
});

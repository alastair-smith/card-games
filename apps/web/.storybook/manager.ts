import { addons, types } from 'storybook/manager-api';
import { SiteLinks } from './site-links';
import { getSystemTheme } from './theme';

addons.setConfig({ theme: getSystemTheme() });

addons.register('play-cards/site-links', () => {
  addons.add('play-cards/site-links/tool', {
    type: types.TOOLEXTRA,
    title: 'Play Cards sites',
    render: SiteLinks,
  });
});

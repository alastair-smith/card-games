import { addons } from 'storybook/manager-api';
import { getSystemTheme } from './theme';

addons.setConfig({ theme: getSystemTheme() });

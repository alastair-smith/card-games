import type { PlayerName } from '~/types/entities';
import { GameType, gameURL } from '~/types/game';

export type SharePlayer = {
  name: PlayerName;
  total: number;
  isWinner: boolean;
};

export const buildShareText = (players: SharePlayer[]): string =>
  players
    .map(
      ({ name, total, isWinner }) =>
        `${total.toString().padStart(3, '0')} ${name}${isWinner ? ' 🏆' : ''}`,
    )
    .join('\n');

export const buildShareData = (
  players: SharePlayer[],
  host: string,
): ShareData => ({
  title: 'We just played a game of Yaniv!',
  text: buildShareText(players),
  url: `https://${host}${gameURL[GameType.YANIV]}`,
});

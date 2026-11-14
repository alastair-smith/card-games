import type { PlayerName } from '~/types/entities';
import { GameType, gameURL } from '~/types/game';
import type { FinishingPosition } from '~/types/games/shithead';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';

type SharePlayer = {
  name: PlayerName;
  isUser: boolean;
  finishingPosition: FinishingPosition;
};

/** Takes the players in finishing order. */
export function buildShareText(players: SharePlayer[]): string {
  return players
    .map(({ name, finishingPosition }) => {
      const { label, medal } = FINISHING_POSITIONS[finishingPosition];
      return `${medal ?? label} ${name}`;
    })
    .join('\n');
}

/** Takes the players in finishing order. */
export function buildShareData(
  players: SharePlayer[],
  host: string,
): ShareData {
  const userWins = players.some(
    (player) => player.isUser && player.finishingPosition === 1,
  );
  return {
    title: userWins
      ? 'I just won a game of Shithead!'
      : 'I just played a game of Shithead!',
    text: buildShareText(players),
    url: `https://${host}${gameURL[GameType.SHITHEAD]}`,
  };
}

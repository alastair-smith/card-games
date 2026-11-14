import type { ClientFinishedPlayer } from '~/server/state/game/shithead/lib/to-client-game-state';
import { FINISHING_POSITIONS } from '~/utils/shithead/finishing-positions';

export type GameOverPlayer = Pick<
  ClientFinishedPlayer,
  'id' | 'name' | 'color' | 'isUser' | 'finishingPosition'
>;

export function sortByFinish<
  Player extends Pick<GameOverPlayer, 'finishingPosition'>,
>(players: Player[]): Player[] {
  return [...players].sort(
    (first, second) => first.finishingPosition - second.finishingPosition,
  );
}

export function buildShareText(
  players: Pick<GameOverPlayer, 'name' | 'finishingPosition'>[],
): string {
  return sortByFinish(players)
    .map(({ name, finishingPosition }) => {
      const { label, medal } = FINISHING_POSITIONS[finishingPosition];
      return `${medal ?? label} ${name}`;
    })
    .join('\n');
}

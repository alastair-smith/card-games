import type { PlayerName } from '~/types/entities';

type SharePlayer = {
  name: PlayerName;
  score: number;
  isWinner: boolean;
};

export function buildShareText(players: SharePlayer[]): string {
  return players
    .map(
      ({ name, score, isWinner }) =>
        `${score.toString().padStart(3, '0')} ${name}${isWinner ? ' 🏆' : ''}`,
    )
    .join('\n');
}

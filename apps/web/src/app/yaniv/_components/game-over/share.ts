import type { PlayerName, UserId } from '~/types/entities';
import { GameType, gameURL } from '~/types/game';

type SharePlayer = {
  id: UserId;
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

export function buildShareData(
  players: SharePlayer[],
  userId: UserId,
  host: string,
): ShareData {
  const userWins = players.some(
    (player) => player.isWinner && player.id === userId,
  );
  const text = buildShareText(players);
  return {
    title: userWins
      ? 'I just won a game of Yaniv!'
      : 'I just played a game of Yaniv!',
    text,
    url: `https://${host}${gameURL[GameType.YANIV]}`,
  };
}

export async function performShare(
  shareData: ShareData,
): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    await navigator.share(shareData);
    return 'shared';
  }
  await navigator.clipboard.writeText(
    `${shareData.title}\n\n${shareData.text}\n\nPlay at ${shareData.url}`,
  );
  return 'copied';
}

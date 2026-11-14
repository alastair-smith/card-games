import { type GameType, gameDisplayName, gameURL } from '~/types/game';

export function buildShareData({
  gameType,
  isUserWinner,
  text,
  host,
}: {
  gameType: GameType;
  isUserWinner: boolean;
  text: string;
  host: string;
}): ShareData {
  const gameName = gameDisplayName[gameType];
  return {
    title: isUserWinner
      ? `I just won a game of ${gameName}!`
      : `I just played a game of ${gameName}!`,
    text,
    url: `https://${host}${gameURL[gameType]}`,
  };
}

export async function performShare(
  shareData: ShareData,
): Promise<'shared' | 'copied' | 'cancelled'> {
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      // Closing the share sheet rejects with an AbortError
      if (error instanceof DOMException && error.name === 'AbortError') {
        return 'cancelled';
      }
      throw error;
    }
    return 'shared';
  }
  await navigator.clipboard.writeText(
    `${shareData.title}\n\n${shareData.text}\n\nPlay at ${shareData.url}`,
  );
  return 'copied';
}

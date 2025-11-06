import type { Metadata } from 'next';
import { connection } from 'next/server';
import { gameCodeSchema } from '~/types/game';
import HighCard from './client';

export const metadata: Metadata = {
  title: 'High Card',
  description:
    'Join a game of High Card! High Card is a fast and simple luck-based game for 2-10 players where the player with the highest card wins.',
  openGraph: {
    images: [
      {
        url: 'https://playcards.games/images/high-card.rectangle.png',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function HighCardPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  await connection();

  const { code: codeFromUrl } = await params;
  const { data: code, error: gameCodeParsingError } =
    gameCodeSchema.safeParse(codeFromUrl);

  if (gameCodeParsingError) {
    throw new Error(`Invalid game code syntax: '${codeFromUrl}'`, {
      cause: gameCodeParsingError,
    });
  }

  return <HighCard code={code} />;
}

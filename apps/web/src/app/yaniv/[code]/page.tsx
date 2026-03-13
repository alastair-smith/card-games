import type { Metadata } from 'next';
import { connection } from 'next/server';
import { gameCodeSchema } from '~/types/game';
import YanivClient from './client';

export const metadata: Metadata = {
  title: 'Yaniv',
  description:
    'Join a game of Yaniv! Yaniv is a fast-paced card game for 2-5 players where the goal is to be the first to get rid of your cards.',
};

export default async function YanivPage({
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

  return <YanivClient code={code} />;
}

import { connection } from 'next/server';
import { gameCodeSchema } from '~/types/game';
import HighCard from './client';

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

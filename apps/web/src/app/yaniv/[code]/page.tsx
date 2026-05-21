import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import { AUTH_COOKIE_NAME, getSession } from '~/server/auth';
import { gameCodeSchema } from '~/types/game';
import YanivClient from './client';

export const metadata: Metadata = {
  title: 'Yaniv',
  description:
    'Join a game of Yaniv! Win hands of 7 points or under and call Yaniv!',
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

  const authCookie = (await cookies()).get(AUTH_COOKIE_NAME)?.value;
  const session = await getSession(authCookie);

  return <YanivClient code={code} userId={session?.userId} />;
}

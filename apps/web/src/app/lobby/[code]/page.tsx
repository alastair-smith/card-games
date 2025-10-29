'use server';

import { TRPCError } from '@trpc/server';
import { redirect } from 'next/navigation';
import { api } from '~/trpc/server';
import { type GameCode, type GameType, gameURL } from '~/types/game';
import { logger } from '~/utils/logger';

const getLobbyURL = (type: GameType, code: GameCode) => {
  const baseUrl = gameURL[type];

  if (!baseUrl) throw new Error('No game exists for this type');

  return `${baseUrl}/${code}`;
};

const NotFound = () => <div>Not Found</div>;

const ErrorPage = () => (
  <div>Error joining game, check the code is correct!</div>
);

export default async function LobbyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  let url: string;
  try {
    const { code } = await params;

    const data = await api.lobby.getSummary({ code });

    url = getLobbyURL(data.type, data.code);
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      return <NotFound />;
    }

    logger.error(error);

    return <ErrorPage />;
  }

  redirect(url);
}

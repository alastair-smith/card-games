'use server';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { api } from '~/trpc/server';
import { GameType, gameURL } from '~/types/game';

export default async function LobbyPage() {
  await connection();

  const { code } = await api.lobby.create({ gameType: GameType.HIGH_CARD });

  redirect(`${gameURL[GameType.HIGH_CARD]}/${code}`);
}

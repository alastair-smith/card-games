'use server';

import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { api } from '~/trpc/server';
import { GameType, gameURL } from '~/types/game';

export default async function LobbyPage() {
  await connection();

  const { code } = await api.lobby.create({ gameType: GameType.YANIV });

  redirect(`${gameURL[GameType.YANIV]}/${code}`);
}

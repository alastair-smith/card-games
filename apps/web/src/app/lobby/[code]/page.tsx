'use server';

import { api } from "@/trpc/server";
import { GameCode, gameCodeSchema, GameType, gameURL } from "@/types/game";
import { TRPCError } from "@trpc/server";
import { redirect } from "next/navigation";

const getLobbyURL = (type: GameType, code: GameCode) => {
  const baseUrl = gameURL[type];

  if (!baseUrl) throw new Error('No game exists for this type');

  return `${baseUrl}/${code}`
}

const NotFound = () => (<div>Not Found</div>);

const ErrorPage = () => (<div>Error joining game, check the code is correct!</div>);

export default async function LobbyPage({ params }: { params: Promise<{ code?: string }> }) {
  try {
    const { code: codeParam } = await params;

    const code = gameCodeSchema.parse(codeParam);

    const data = await api.lobby.getSummary({ code });

    const url = getLobbyURL(data.type, code);

    redirect(url);
  } catch (error) {
    if (error instanceof TRPCError && error.code === 'NOT_FOUND') {
      return <NotFound />
    }

    return <ErrorPage />
  }
}
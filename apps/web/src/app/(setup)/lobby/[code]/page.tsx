'use server';

import LobbyClient from "./client";

export default async function Lobby({params}: {
  params: Promise<{code: string}>
}) {
  const code = (await params).code;

  return <LobbyClient joinCode={code} />;
}

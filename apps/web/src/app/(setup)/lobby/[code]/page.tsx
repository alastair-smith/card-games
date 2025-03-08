"use server";

import { auth } from "@/app/actions/auth";
import LobbyClient from "./client";

export default async function Lobby({
  params,
}: {
  params: Promise<{ game?: string; code?: string }>;
}) {
  const code = (await params).code;
  const { id } = await auth(`/lobby/${code}`);

  return <LobbyClient joinCode={code} userId={id} />;
}

"use server";

import { HydrateClient } from "@/trpc/server";
import { LoginButton } from "@/components/login";
import { JoinGame } from "./join-game";
import { NewGame } from "./new-game";

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-row flex-wrap items-center justify-center gap-4 bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <JoinGame />
        <NewGame />
      </main>
    </HydrateClient>
  );
}

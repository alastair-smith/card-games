"use server";

import { HydrateClient } from "@/trpc/server";
import { JoinGame } from "./join-game";
import { NewGame } from "./new-game";
import { About } from "./about";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="grid min-h-dvh place-items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <main className="flex w-full max-w-[80rem] flex-col gap-4 px-4 py-12">
          <h1 className="text-center text-4xl font-bold">Card Games</h1>

          <div className="flex w-full flex-wrap gap-4">
            <About className="flex-shrink-0 flex-grow-[2] basis-0" />
            <JoinGame className="flex-shrink flex-grow basis-0" />
          </div>

          <NewGame />
        </main>
      </div>
    </HydrateClient>
  );
}

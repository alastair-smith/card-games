"use server";

import { HydrateClient } from "@/trpc/server";
import { JoinGame } from "./join-game";
import { NewGame } from "./new-game";
import { About } from "./about";
import Link from "next/link";

export default async function Home() {
  return (
    <HydrateClient>
      <div className="grid min-h-dvh place-items-center justify-center text-white">
        <main className="flex w-full max-w-[80rem] flex-col gap-6 px-4 py-12">
          <Link href="/">
            <h1 className="mb-6 text-4xl font-bold">Card Games</h1>
          </Link>

          <div className="flex w-full flex-wrap gap-6">
            <About className="flex-shrink-0 flex-grow-[2] basis-0" />
            <JoinGame className="flex-shrink flex-grow basis-0" />
          </div>

          <NewGame />
        </main>
      </div>
    </HydrateClient>
  );
}

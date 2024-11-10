import { JoinGame } from "./join-game";
import { NewGame } from "./new-game";
import { About } from "./about";

export default async function Home() {
  return (
    <>
      <h1 className="sr-only">Home</h1>
      <div className="flex w-full flex-wrap gap-6">
        <About className="flex-shrink-0 flex-grow-[2] basis-0" />
        <JoinGame className="flex-shrink flex-grow basis-0" />
      </div>

      <NewGame />
    </>
  );
}

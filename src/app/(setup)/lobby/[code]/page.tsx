import { GameInfo } from "./game-info";
import { Players } from "./players";

export default function Lobby() {
  return (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">Lobby</h1>
      <GameInfo className="flex-1" />
      <Players className="flex-1" />
    </div>
  );
}

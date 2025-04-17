'use client';

import { PlayingCard } from "@/components/ui/playing-card/playing-card";
import { Player } from "@/server/data/high-card";
import { GameState } from "@/server/state/game/high-card";
import { RANK_FULL_NAME } from "@/types/cards";
import { UserId } from "@/types/entities";
import { useMemo } from "react";

export type HighCardGameProps = {
  state: GameState;
  pickupCard: () => void;
  playerUserId?: UserId;
};

export default function HighCardGameView({
  state,
  pickupCard,
}: HighCardGameProps) {
  const winner = useMemo(() => {
    if (state.winner) {
      return state.players.find(player => player.id === state.winner)
    }
  }, [state.winner]);

  return (
    <div className="flex flex-col gap-4 text-white items-start">
      {state.players.map((player, index) => {
        const canPickup = player.isUser && !player.card && (index === 0 || state.players[index - 1]?.card);

        return (
          <div key={player.id} className='grid grid-cols-2 gap-2 p-4'>
            <div className="col-start-1">{player.name}{player.isUser && " (You)"}</div>
            <div className="col-start-1">
              <PlayingCard card={player.card} onClick={canPickup ? pickupCard : undefined} />
            </div>
            {canPickup &&
              <div className="col-start-2">
                Tap your card to flip it!
              </div>}
          </div>
        )
      })}
      {winner && <Winner player={winner} />}
    </div>
  )
}

function Winner({ player }: { player: Player }) {
  return (
    <div className="text-3xl text-green-500">
      {player.name} wins{player.card && ` with a ${RANK_FULL_NAME[player.card.rank]} of ${player.card.suit}`}!
    </div>
  )
}
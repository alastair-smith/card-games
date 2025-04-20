import { Rank, StandardPlayingCard, Suit } from "@/types/cards";
import Game from "./game-view";
import { toast } from "@/components/ui/toast";
import { UserId } from "@/types/entities";
import { useState } from "react";

export const Turn1 = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => { toast.success('Card picked up!'); }}
        state={{
          players: [
            { id: '1' as UserId, name: 'Alice', isUser: false, card: null },
            { id: '2' as UserId, name: 'Bob', isUser: true, card: null },
            { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
          ],
          winner: null,
        }}
      />
    </div>
  );
}

export const Turn2 = () => {
  const [card2, setCard2] = useState<StandardPlayingCard | null>(null)
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => {
          setCard2({ suit: Suit.SPADES, rank: Rank.QUEEN });
          toast.success('Card picked up!');
        }}
        state={{
          players: [
            { id: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit.HEARTS, rank: Rank.THREE } },
            { id: '2' as UserId, name: 'Bob', isUser: true, card: card2 },
            { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
          ],
          winner: null,
        }}
      />
    </div>
  );
}

export const Turn3 = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => { toast.success('Card picked up!'); }}
        state={{
          players: [
            { id: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit.HEARTS, rank: Rank.THREE } },
            { id: '2' as UserId, name: 'Bob', isUser: true, card: { suit: Suit.SPADES, rank: Rank.QUEEN } },
            { id: '3' as UserId, name: 'Zoe', isUser: false, card: null },
          ],
          winner: null,
        }}
      />
    </div>
  );
}

export const Turn4 = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => { toast.success('Card picked up!'); }}
        state={{
          players: [
            { id: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit.HEARTS, rank: Rank.THREE } },
            { id: '2' as UserId, name: 'Bob', isUser: true, card: { suit: Suit.SPADES, rank: Rank.QUEEN } },
            { id: '3' as UserId, name: 'Zoe', isUser: false, card: { suit: Suit.CLUBS, rank: Rank.TEN } },
          ],
          winner: '2' as UserId,
        }}
      />
    </div>
  );
}
import { Suit } from "@/types/cards";
import Game from "./game";
import { toast } from "@/components/ui/toast";
import { UserId } from "@/types/entities";

export const Turn1 = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => { toast.success('Card picked up!'); }}
        state={{
          players: [
            { userId: '1' as UserId, name: 'Alice', isUser: false, card: null },
            { userId: '2' as UserId, name: 'Bob', isUser: true, card: null },
            { userId: '3' as UserId, name: 'Zoe', isUser: false, card: null },
          ],
          winner: null,
        }}
      />
    </div>
  );
}

export const Turn2 = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4 h-screen">
      <Game
        pickupCard={() => { toast.success('Card picked up!'); }}
        state={{
          players: [
            { userId: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit['hearts'], rank: '3' } },
            { userId: '2' as UserId, name: 'Bob', isUser: true, card: null },
            { userId: '3' as UserId, name: 'Zoe', isUser: false, card: null },
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
            { userId: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit['hearts'], rank: '3' } },
            { userId: '2' as UserId, name: 'Bob', isUser: true, card: { suit: Suit['spades'], rank: 'Q' } },
            { userId: '3' as UserId, name: 'Zoe', isUser: false, card: null },
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
            { userId: '1' as UserId, name: 'Alice', isUser: false, card: { suit: Suit['hearts'], rank: '3' } },
            { userId: '2' as UserId, name: 'Bob', isUser: true, card: { suit: Suit['spades'], rank: 'Q' } },
            { userId: '3' as UserId, name: 'Zoe', isUser: false, card: { suit: Suit['clubs'], rank: '10' } },
          ],
          winner: '2' as UserId,
        }}
      />
    </div>
  );
}
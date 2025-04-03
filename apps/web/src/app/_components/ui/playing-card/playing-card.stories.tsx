import { ranks, Suit } from "@/types/cards";
import { PlayingCard } from "./playing-card";

const decreasingOrder = [...ranks].reverse();
const deck = [Suit['spades'], Suit['hearts'], Suit['diamonds'], Suit['clubs']].flatMap(suit => {
  return decreasingOrder.map(rank => {
    return { rank, suit };
  })
});

export const AceOfSpades = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4">
      <PlayingCard card={{ rank: 'Joker', suit: 'red' }} />
      <PlayingCard card={{ rank: 'Joker', suit: 'black' }} />
      {deck.map((card, index) => (
        <PlayingCard key={index} card={card} />
      ))}
    </div>
  );
}
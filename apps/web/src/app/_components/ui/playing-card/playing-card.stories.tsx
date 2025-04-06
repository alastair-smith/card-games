import { ranks, Suit } from "@/types/cards";
import { PlayingCard, PlayingCardBack } from "./playing-card";
import { Button } from "../button";
import { useState } from "react";

const decreasingOrder = [...ranks].reverse();
const deck = [Suit['spades'], Suit['hearts'], Suit['diamonds'], Suit['clubs']].flatMap(suit => {
  return decreasingOrder.map(rank => {
    return { rank, suit };
  })
});

export const WholeDeck = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4">
      <PlayingCardBack />
      <PlayingCard card={{ rank: 'Joker', suit: 'red' }} />
      <PlayingCard card={{ rank: 'Joker', suit: 'black' }} />
      {deck.map((card, index) => (
        <PlayingCard key={index} card={card} />
      ))}
    </div>
  );
}

export const FlipCard = () => {
  const [showCard, setShowCard] = useState(false);
  const [cardHasValue, setCardHasValue] = useState(false);

  return (
    <div className="bg-felt-texture p-10 flex flex-col gap-8">
      <Button onClick={() => setShowCard(!showCard)}>Deal card</Button>
      <Button onClick={() => { setCardHasValue(!cardHasValue) }}>Flip card</Button>
      <div className="flex flex-wrap gap-4">
        {showCard && <PlayingCard card={cardHasValue ? { rank: 'A', suit: Suit['spades'] } : null} />}
      </div>
    </div>
  )
}
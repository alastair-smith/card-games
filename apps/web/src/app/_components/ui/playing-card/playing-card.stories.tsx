import { JOKER_RANK, JokerSuit, Rank, RANKS, Suit, SUITS } from "@/types/cards";
import { PlayingCard } from "./playing-card";
import { Button } from "../button";
import { useState } from "react";

const deck = SUITS.flatMap(suit => {
  return RANKS.map(rank => {
    return { rank, suit };
  })
});

export const WholeDeck = () => {
  return (
    <div className="bg-felt-texture p-10 flex flex-wrap gap-4">
      <PlayingCard card={null} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.RED }} />
      <PlayingCard card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }} />
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
        {showCard && <PlayingCard card={cardHasValue ? { rank: Rank.ACE, suit: Suit.SPADES } : null} />}
      </div>
    </div>
  )
}
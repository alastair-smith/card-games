import { useMemo } from 'react';
import { EmojiRain } from '~/components/emoji-rain/emoji-rain';
import GameLayout from '~/components/layout/game-layout';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType, type ReactionEmoji } from '~/types/game';
import type { YanivPlayingCard } from '~/types/games/yaniv';
import Controls from '../controls';
import Hand from '../hand';
import { HowToDialog } from '../how-to';
import PlayArea from '../play-area';
import { RoundSummary } from '../round-summary';
import ScoreCard from '../scorecard';

type BaseGameProps = {
  cards: YanivPlayingCard[];
  selectedCards?: YanivPlayingCard[];
  onCardToggle?: (card: YanivPlayingCard) => void;
  onPickupFromDeck?: () => void;
  onPickupFromDiscard?: () => void;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: () => void;
  drawnCard?: YanivPlayingCard;
  canAutoPlay?: boolean;
  onAutoPlayDrawnCard?: () => void;
  players: {
    id: UserId;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
    isYanivCalled: boolean;
    emojiReaction?: { emoji: ReactionEmoji; id: number };
    isPlayersTurn?: boolean;
  }[];
  userId: UserId;
  playedCards: YanivPlayingCard[];
  discardCard: YanivPlayingCard | null;
};

type InProgressGameProps = BaseGameProps & {
  stage: 'waiting-for-player' | 'picking-cards' | 'drawing-cards' | 'end-turn';
  roundSummary: null;
};

type EndOfRoundGameProps = BaseGameProps & {
  stage: 'end-of-round';
  roundSummary: {
    id: UserId;
    name: PlayerName;
    score: number;
  }[];
};

type GameProps = InProgressGameProps | EndOfRoundGameProps;

export default function Game({
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  onCardToggle,
  onPickupFromDeck,
  onPickupFromDiscard,
  players,
  stage,
  cards,
  selectedCards,
  userId,
  playedCards,
  discardCard,
  roundSummary,
  drawnCard,
  canAutoPlay,
  onAutoPlayDrawnCard,
}: GameProps) {
  const userPlayer = useMemo(() => {
    return players.find((player) => player.id === userId);
  }, [players, userId]);

  const playerTakingTurn = useMemo(() => {
    return players.find((player) => player.isPlayersTurn) ?? players[0];
  }, [players]);

  const isUserTakingTurn =
    !!userPlayer &&
    !!playerTakingTurn &&
    userPlayer?.id === playerTakingTurn?.id;

  const cardsWithSelection = useMemo(() => {
    return cards.map((card) => ({
      ...card,
      selected: selectedCards?.some(
        (selected) =>
          selected.rank === card.rank && selected.suit === card.suit,
      ),
    }));
  }, [cards, selectedCards]);

  return (
    <GameLayout
      actions={<HowToDialog />}
      gameType={GameType.YANIV}
      className='flex flex-col h-dvh w-full overflow-hidden pb-2 gap-4'
    >
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {players.map(({ id, emojiReaction, ...player }) => (
          <EmojiRain key={id} reaction={emojiReaction}>
            <ScoreCard {...player} />
          </EmojiRain>
        ))}
      </div>

      <div className='flex-1 max-h-120 flex flex-col justify-center items-center'>
        {stage === 'end-of-round' ? (
          <RoundSummary players={roundSummary} />
        ) : (
          <PlayArea
            playedCards={playedCards}
            discardCard={discardCard}
            isHighlighted={stage === 'drawing-cards' && isUserTakingTurn}
            onDeckClick={onPickupFromDeck}
            onDiscardClick={onPickupFromDiscard}
            className='md:text-2xl sm:text-lg h-fit'
            drawnCard={drawnCard}
            canAutoPlay={canAutoPlay}
            onAutoPlayDrawnCard={onAutoPlayDrawnCard}
          />
        )}
      </div>

      <Controls
        onEmojiClick={onEmojiClick}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
        onPlayCards={onPlayCards}
        playerTakingTurn={playerTakingTurn?.name}
        stage={stage}
      />

      <Hand
        className='md:text-2xl sm:text-lg'
        cards={cardsWithSelection}
        isFiftyScoreHalved={!!userPlayer?.isFiftyScoreHalved}
        isHundredScoreHalved={!!userPlayer?.isHundredScoreHalved}
        totalScore={userPlayer?.score ?? 0}
        onCardClick={onCardToggle}
        isHighlighted={stage === 'picking-cards' && isUserTakingTurn}
      />
    </GameLayout>
  );
}

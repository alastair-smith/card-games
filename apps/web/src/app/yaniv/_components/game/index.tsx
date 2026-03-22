import { useMemo } from 'react';
import { EmojiRain } from '~/components/emoji-rain/emoji-rain';
import GameLayout from '~/components/layout/game-layout';
import type { PlayerName, UserId } from '~/types/entities';
import { GameType, type ReactionEmoji } from '~/types/game';
import { GameViewStage, type YanivPlayingCard } from '~/types/games/yaniv';
import { sumYanivHand } from '~/utils/yaniv';
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
    roundScore: { original: number; adjusted: number };
    isYanivCalled: boolean;
    emojiReaction?: { emoji: ReactionEmoji; id: number };
    isPlayersTurn?: boolean;
  }[];
  userId: UserId;
  playedCards: YanivPlayingCard[];
  discardCard: YanivPlayingCard | null;
};

type GameProps = BaseGameProps & {
  stage: GameViewStage;
};

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
  drawnCard,
  canAutoPlay,
  onAutoPlayDrawnCard,
}: GameProps) {
  const userPlayer = useMemo(() => {
    return players.find((player) => player.id === userId);
  }, [players, userId]);

  if (!userPlayer) {
    throw new Error(`Current user ${userId} not found in players`);
  }

  const playerTakingTurn = useMemo(() => {
    return players.find((player) => player.isPlayersTurn);
  }, [players]);

  if (!playerTakingTurn) {
    throw new Error('No player taking turn found in players');
  }

  const isUserTakingTurn = userPlayer.id === playerTakingTurn.id;

  const cardsWithSelection = useMemo(() => {
    return cards.map((card) => ({
      ...card,
      selected: selectedCards?.some(
        (selected) =>
          selected.rank === card.rank && selected.suit === card.suit,
      ),
    }));
  }, [cards, selectedCards]);

  const roundSummary = useMemo(
    () =>
      [...players]
        .sort((a, b) => a.roundScore.adjusted - b.roundScore.adjusted)
        .map(({ id, name, roundScore }) => ({ id, name, roundScore })),
    [players],
  );

  const handTotal =
    stage === GameViewStage.END_OF_ROUND
      ? userPlayer.roundScore.original
      : sumYanivHand(cards);

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
        {stage === GameViewStage.END_OF_ROUND ? (
          <RoundSummary players={roundSummary} />
        ) : (
          <PlayArea
            playedCards={playedCards}
            discardCard={discardCard}
            isHighlighted={
              stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn
            }
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
        playerTakingTurn={playerTakingTurn.name}
        stage={stage}
      />

      <Hand
        className='md:text-2xl sm:text-lg'
        cards={cardsWithSelection}
        handTotal={handTotal}
        isFiftyScoreHalved={userPlayer.isFiftyScoreHalved}
        isHundredScoreHalved={userPlayer.isHundredScoreHalved}
        totalScore={userPlayer.score}
        onCardClick={onCardToggle}
        isHighlighted={
          stage === GameViewStage.PICKING_CARDS && isUserTakingTurn
        }
      />
    </GameLayout>
  );
}

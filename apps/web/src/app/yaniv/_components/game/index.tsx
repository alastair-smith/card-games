import { useMemo } from 'react';
import { PageEmojiRain } from '~/components/emoji-rain/page-emoji-rain';
import GameLayout from '~/components/layout/game-layout';
import { ScreenEdgeHighlight } from '~/components/ui/screen-edge-highlight';
import type { EmojiReactionId, PlayerName, UserId } from '~/types/entities';
import { GameType, type ReactionEmoji, type SystemEmoji } from '~/types/game';
import {
  GameViewStage,
  type HandSize,
  type RoundScore,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import type { PlayerColor } from '~/utils/player-color';
import { sumYanivHand } from '~/utils/yaniv';
import Controls from '../controls';
import Hand from '../hand';
import { HowToDialog } from '../how-to';
import PlayArea from '../play-area';
import { RoundSummary } from '../round-summary';
import ScoreCard from '../scorecard';
import { useDrawnCardVisibility } from './use-drawn-card-visibility';
import { usePageReactions } from './use-page-reactions';
import { useYanivCalledToast } from './use-yaniv-called-toast';

type BaseGameProps = {
  cards: YanivPlayingCard[];
  handSize: HandSize;
  selectedCards?: YanivPlayingCard[];
  onCardToggle?: (card: YanivPlayingCard) => void;
  onPickupFromDeck?: () => void;
  onPickupFromDiscard?: () => void;
  onEmojiClick: (emoji: ReactionEmoji) => void;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: (direction?: 'ascending' | 'descending') => void;
  isRunSelected?: boolean;
  drawnCard?: YanivPlayingCard;
  canAutoPlay?: boolean;
  onAutoPlayDrawnCard?: () => void;
  players: {
    id: UserId;
    color: PlayerColor;
    cardCount: number;
    isFiftyScoreHalved: boolean;
    isHundredScoreHalved: boolean;
    name: PlayerName;
    score: number;
    roundScores: RoundScore[];
    isYanivCalled: boolean;
    emojiReaction?: { emoji: ReactionEmoji | SystemEmoji; id: EmojiReactionId };
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
  isRunSelected,
  onCardToggle,
  onPickupFromDeck,
  onPickupFromDiscard,
  players,
  stage,
  cards,
  handSize,
  selectedCards,
  userId,
  playedCards,
  discardCard,
  drawnCard,
  canAutoPlay,
  onAutoPlayDrawnCard,
}: GameProps) {
  useYanivCalledToast(players);
  const pageReactions = usePageReactions(players);

  const { isShownInOverlay, onOverlayDismissed } =
    useDrawnCardVisibility(drawnCard);

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

  const cardsWithSelection = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        selected: selectedCards?.some(
          ({ suit, rank }) => rank === card.rank && suit === card.suit,
        ),
        hidden:
          isShownInOverlay &&
          drawnCard?.rank === card.rank &&
          drawnCard?.suit === card.suit,
      })),
    [cards, selectedCards, drawnCard, isShownInOverlay],
  );

  const handTotal =
    stage === GameViewStage.END_OF_ROUND ||
    stage === GameViewStage.WAITING_FOR_NEW_ROUND
      ? (userPlayer.roundScores.at(-1)?.original ?? 0)
      : sumYanivHand(cards);

  return (
    <GameLayout
      actions={<HowToDialog />}
      gameType={GameType.YANIV}
      className='h-dvh w-full overflow-hidden px-2 pb-2'
    >
      {isUserTakingTurn && <ScreenEdgeHighlight color={userPlayer.color} />}

      <div role='status' aria-live='polite' className='sr-only'>
        {isUserTakingTurn ? "It's your turn" : ''}
      </div>

      <PageEmojiRain
        reactions={pageReactions}
        className='flex-1 flex flex-col justify-center gap-4'
      >
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {players.map(({ id, emojiReaction, ...player }) => (
            <ScoreCard key={id} reactionEmoji={emojiReaction} {...player} />
          ))}
        </div>

        <div className='flex-1 max-h-120 flex flex-col justify-center items-center'>
          {stage === GameViewStage.END_OF_ROUND ||
          stage === GameViewStage.WAITING_FOR_NEW_ROUND ? (
            <RoundSummary players={players} userId={userId} />
          ) : (
            <PlayArea
              color={userPlayer.color}
              playedCards={playedCards}
              discardCard={discardCard}
              isActive={
                stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn
              }
              onDeckClick={onPickupFromDeck}
              onDiscardClick={onPickupFromDiscard}
              className='md:text-2xl sm:text-lg h-fit'
              drawnCard={drawnCard}
              canAutoPlay={canAutoPlay}
              onAutoPlayDrawnCard={onAutoPlayDrawnCard}
              onDrawnCardDismissed={onOverlayDismissed}
            />
          )}
        </div>

        <Controls
          onEmojiClick={onEmojiClick}
          onEndTurnClick={onEndTurnClick}
          onYanivClick={onYanivClick}
          onPlayCards={onPlayCards}
          isRunSelected={isRunSelected}
          playerTakingTurn={playerTakingTurn.name}
          stage={stage}
        />

        <Hand
          className='md:text-2xl sm:text-lg'
          color={userPlayer.color}
          cards={cardsWithSelection}
          handSize={handSize}
          handTotal={handTotal}
          isFiftyScoreHalved={userPlayer.isFiftyScoreHalved}
          totalScore={userPlayer.score}
          onCardClick={onCardToggle}
          isActive={stage === GameViewStage.PICKING_CARDS && isUserTakingTurn}
        />
      </PageEmojiRain>
    </GameLayout>
  );
}

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
import { cn } from '~/utils/cn';
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
  drawnCard?: YanivPlayingCard | undefined;
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
    emojiReaction?:
      | { emoji: ReactionEmoji | SystemEmoji; id: EmojiReactionId }
      | undefined;
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
        selected:
          selectedCards?.some(
            ({ suit, rank }) => rank === card.rank && suit === card.suit,
          ) ?? false,
        hidden:
          isShownInOverlay &&
          drawnCard?.rank === card.rank &&
          drawnCard?.suit === card.suit,
      })),
    [cards, selectedCards, drawnCard, isShownInOverlay],
  );

  const isRoundOver =
    stage === GameViewStage.END_OF_ROUND ||
    stage === GameViewStage.WAITING_FOR_NEW_ROUND;

  const handTotal = isRoundOver
    ? (userPlayer.roundScores.at(-1)?.original ?? 0)
    : sumYanivHand(cards);

  return (
    <GameLayout
      actions={<HowToDialog />}
      gameType={GameType.YANIV}
      className={cn(
        'w-full px-2 pb-2',
        !isRoundOver && 'h-dvh overflow-hidden',
      )}
    >
      {isUserTakingTurn && <ScreenEdgeHighlight color={userPlayer.color} />}

      <div role='status' aria-live='polite' className='sr-only'>
        {isUserTakingTurn ? "It's your turn" : ''}
      </div>

      <PageEmojiRain
        reactions={pageReactions}
        className='flex-1 grid grid-cols-1 grid-rows-[auto_1fr_auto_auto] gap-4'
      >
        <div
          className={cn(
            'col-start-1 row-start-1 grid grid-cols-2 md:grid-cols-3 gap-3',
            isRoundOver && 'invisible max-sm:hidden',
          )}
        >
          {players.map(({ id, emojiReaction, ...player }) => (
            <ScoreCard key={id} reactionEmoji={emojiReaction} {...player} />
          ))}
        </div>

        <div
          className={cn(
            'col-start-1 row-start-2 flex flex-col justify-center items-center',
            isRoundOver && 'invisible max-sm:hidden',
          )}
        >
          <PlayArea
            color={userPlayer.color}
            playedCards={playedCards}
            discardCard={discardCard}
            isActive={stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn}
            onDeckClick={onPickupFromDeck}
            onDiscardClick={onPickupFromDiscard}
            className='md:text-2xl sm:text-lg h-fit'
            drawnCard={drawnCard}
            canAutoPlay={canAutoPlay}
            onAutoPlayDrawnCard={onAutoPlayDrawnCard}
            onDrawnCardDismissed={onOverlayDismissed}
          />
        </div>

        {isRoundOver && (
          <div className='col-start-1 row-start-1 row-span-2 min-h-min flex flex-col justify-center items-center'>
            <RoundSummary players={players} userId={userId} />
          </div>
        )}

        <Controls
          className='col-start-1 row-start-3'
          onEmojiClick={onEmojiClick}
          onEndTurnClick={onEndTurnClick}
          onYanivClick={onYanivClick}
          onPlayCards={onPlayCards}
          isRunSelected={isRunSelected}
          playerTakingTurn={playerTakingTurn.name}
          stage={stage}
        />

        <Hand
          className={cn(
            'col-start-1 row-start-4 md:text-2xl sm:text-lg',
            isRoundOver && 'max-sm:hidden',
          )}
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

import { useEffect, useMemo, useState } from 'react';
import { PageEmojiRain } from '~/components/emoji-rain/page-emoji-rain';
import { EmojiReactions } from '~/components/emoji-reactions';
import GameLayout from '~/components/layout/game-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsViewport,
} from '~/components/ui/tabs';
import type { EmojiReactionId, PlayerName, UserId } from '~/types/entities';
import { GameType, type ReactionEmoji, type SystemEmoji } from '~/types/game';
import {
  type GameStep,
  GameViewStage,
  type RoundScore,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import type { PlayerColor } from '~/utils/player-color';
import { sumYanivHand } from '~/utils/yaniv';
import { Hand } from '../hand';
import { HowToDialog } from '../how-to';
import PlayArea from '../play-area';
import { PlayerStrip } from '../player-strip';
import { RoundSummary } from '../round-summary';
import { ScoresDialog } from '../scores-dialog';
import { TurnActions } from '../turn-actions';
import { TurnAnnouncement } from '../turn-status';
import { useDrawnCardVisibility } from './use-drawn-card-visibility';
import { usePageReactions } from './use-page-reactions';
import { useYanivCalledToast } from './use-yaniv-called-toast';

type GameTab = 'table' | 'hand' | 'scores';

const GAME_TABS = [
  { value: 'table', label: 'Table' },
  { value: 'hand', label: 'Your hand' },
  { value: 'scores', label: 'Scores' },
] as const satisfies { value: GameTab; label: string }[];

/** The tab your next move happens in, on your turn. */
const ACTION_TAB_BY_STAGE = {
  [GameViewStage.PICKING_CARDS]: 'hand',
  [GameViewStage.DRAWING_CARDS]: 'table',
  [GameViewStage.END_TURN]: 'table',
  [GameViewStage.END_OF_ROUND]: 'scores',
  [GameViewStage.WAITING_FOR_NEW_ROUND]: null,
  [GameViewStage.WAITING_FOR_PLAYER]: null,
} as const satisfies Record<GameViewStage, GameTab | null>;

type GameProps = {
  cards: YanivPlayingCard[];
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
  stage: GameViewStage;
  /** What the player taking their turn needs to do next. */
  step: GameStep;
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
  step,
  cards,
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

  // Only larger screens show the button; phones keep the hand private in its
  // own tab
  const [isFaceDown, setIsFaceDown] = useState(false);

  const userPlayer = players.find((player) => player.id === userId);
  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  const isUserTakingTurn =
    !!userPlayer && userPlayer.id === playerTakingTurn?.id;

  const isRoundOver =
    stage === GameViewStage.END_OF_ROUND ||
    stage === GameViewStage.WAITING_FOR_NEW_ROUND;

  const actionTab = isUserTakingTurn ? ACTION_TAB_BY_STAGE[stage] : null;
  const [activeTab, setActiveTab] = useState<string>(
    isRoundOver ? 'scores' : (actionTab ?? 'table'),
  );

  // Switch to wherever your next move is, and everyone to the scores when
  // the round ends
  useEffect(() => {
    if (isRoundOver) setActiveTab('scores');
    else if (actionTab) setActiveTab(actionTab);
  }, [actionTab, isRoundOver]);

  const cardsWithSelection = useMemo(
    () =>
      cards.map((card) => ({
        ...card,
        selected:
          selectedCards?.some(
            ({ suit, rank }) => rank === card.rank && suit === card.suit,
          ) ?? false,
        // Face down, the picked-up card stays in the hand rather than showing
        // over the deck
        hidden:
          !isFaceDown &&
          isShownInOverlay &&
          drawnCard?.rank === card.rank &&
          drawnCard?.suit === card.suit,
      })),
    [cards, selectedCards, drawnCard, isShownInOverlay, isFaceDown],
  );

  if (!userPlayer) {
    throw new Error(`Current user ${userId} not found in players`);
  }

  if (!playerTakingTurn) {
    throw new Error('No player taking turn found in players');
  }

  const handTotal = isRoundOver
    ? (userPlayer.roundScores.at(-1)?.original ?? 0)
    : sumYanivHand(cards);

  const playArea = (
    <PlayArea
      color={userPlayer.color}
      playedCards={playedCards}
      discardCard={discardCard}
      isActive={stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn}
      onDeckClick={onPickupFromDeck}
      onDiscardClick={onPickupFromDiscard}
      className='sm:text-lg md:text-2xl'
      drawnCard={!isFaceDown && isShownInOverlay ? drawnCard : undefined}
      canAutoPlay={canAutoPlay}
      onAutoPlayDrawnCard={onAutoPlayDrawnCard}
      onDrawnCardDismissed={onOverlayDismissed}
    />
  );

  const turnActionsProps = {
    stage,
    isRunSelected,
    onEndTurnClick,
    onYanivClick,
    onPlayCards,
    onStartNewRoundClick: () => onPlayCards(),
  };

  // On phones each tab's turn buttons are pinned to its bottom, so they slide
  // with it rather than taking space on every tab
  const panelTurnActions = (tab: GameTab) =>
    actionTab === tab && (
      <TurnActions className='pt-3 lg:hidden' {...turnActionsProps} />
    );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      actions={
        <div className='flex gap-2'>
          {/* Phones have a Scores tab instead */}
          <ScoresDialog
            className='hidden lg:flex'
            players={players}
            userId={userId}
          />
          <HowToDialog />
        </div>
      }
      className='not-prose w-full overflow-hidden px-2 pb-2'
    >
      <TurnAnnouncement players={players} userId={userId} step={step} />

      <PageEmojiRain
        reactions={pageReactions}
        className='flex min-h-0 flex-1 flex-col'
      >
        {/* Larger screens show the table and hand together, with no tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          // Matches the lg: classes, where the table and hand show together
          staticQuery='(min-width: 1024px)'
          className='min-h-0 flex-1 gap-3'
        >
          <TabsViewport
            // Leave a gap between tabs
            className='-mx-5 lg:contents'
            trackClassName='lg:contents'
          >
            <TabsContent
              value='table'
              className='flex flex-col px-5 lg:h-auto lg:min-h-0 lg:flex-1 lg:px-0'
            >
              <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'>
                <PlayerStrip players={players} userId={userId} step={step} />
                <div className='grid flex-1 place-items-center'>
                  {isRoundOver ? (
                    <>
                      {/* Phones show the round summary in the Scores tab */}
                      <div className='lg:hidden'>{playArea}</div>
                      <div className='hidden w-full lg:flex lg:justify-center'>
                        <RoundSummary
                          players={players}
                          userId={userId}
                          isRoundOver
                        />
                      </div>
                    </>
                  ) : (
                    playArea
                  )}
                </div>
              </div>
              {/* Phones keep the turn buttons' space on the table, so the
                  play area doesn't shift as they come and go */}
              <div className='mt-3 h-10 shrink-0 lg:hidden'>
                {actionTab === 'table' && <TurnActions {...turnActionsProps} />}
              </div>
              <EmojiReactions
                onEmojiClick={onEmojiClick}
                className='mt-3 shrink-0 self-center lg:hidden'
              />
            </TabsContent>

            <TabsContent
              value='hand'
              className='flex flex-col px-5 lg:order-last lg:h-auto lg:flex-none lg:px-0'
            >
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                <Hand
                  // Fills the tab on phones rather than floating in the middle
                  className='flex-1 lg:flex-none'
                  color={userPlayer.color}
                  cards={cardsWithSelection}
                  handTotal={handTotal}
                  isFiftyScoreHalved={userPlayer.isFiftyScoreHalved}
                  totalScore={userPlayer.score}
                  onCardClick={onCardToggle}
                  isActive={
                    stage === GameViewStage.PICKING_CARDS && isUserTakingTurn
                  }
                  isFaceDown={isFaceDown}
                  onVisibilityToggle={() =>
                    setIsFaceDown((previous) => !previous)
                  }
                />
              </div>
              {panelTurnActions('hand')}
            </TabsContent>

            <TabsContent
              value='scores'
              className='flex flex-col px-5 lg:hidden'
            >
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                <RoundSummary
                  className='self-center'
                  players={players}
                  userId={userId}
                  isRoundOver={isRoundOver}
                />
              </div>
              {panelTurnActions('scores')}
            </TabsContent>
          </TabsViewport>

          {/* Larger screens share this row between the table and hand. It
              keeps the turn buttons' height when they're gone, so the play
              area above doesn't shift as you play and pick up */}
          <div className='hidden lg:grid lg:h-10 lg:grid-cols-2 lg:items-center lg:gap-2'>
            <EmojiReactions onEmojiClick={onEmojiClick} />
            {actionTab && (
              <TurnActions
                // Face-down cards can't be played, so Play Cards hides with them
                className={cn(
                  'justify-end',
                  isFaceDown &&
                    stage === GameViewStage.PICKING_CARDS &&
                    'invisible',
                )}
                {...turnActionsProps}
              />
            )}
          </div>

          <TabsList className='mb-[env(safe-area-inset-bottom)] h-11 w-full shrink-0 lg:hidden'>
            {GAME_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                // Marks where your next move is when you're on another tab
                actionColor={
                  actionTab === tab.value && activeTab !== tab.value
                    ? userPlayer.color
                    : undefined
                }
                className='h-full'
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </PageEmojiRain>
    </GameLayout>
  );
}

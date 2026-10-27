// Prototype of the agreed Yaniv layout redesign, kept as the reference for
// building it. The design and build notes are in issue #162. The Full Game
// stories show the finished layout; the other option props (yanivStyle and
// so on) are left over from comparing options.
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import useEmblaCarousel from 'embla-carousel-react';
import {
  ArrowDownCircleIcon,
  ArrowRightCircleIcon,
  ArrowUpCircleIcon,
  BrainIcon,
  CircleCheckIcon,
  CogIcon,
  EyeIcon,
  EyeOffIcon,
  MegaphoneIcon,
  TrophyIcon,
  UserRoundIcon,
} from 'lucide-react';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { fn } from 'storybook/test';
import { EmojiReactions } from '~/components/emoji-reactions';
import GameLayout from '~/components/layout/game-layout';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameType } from '~/types/game';
import {
  GameStep,
  GameViewStage,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import { cn } from '~/utils/cn';
import {
  type PlayerColor,
  playerColorHighlight,
  playerColorValue,
} from '~/utils/player-color';
import { sumYanivHand } from '~/utils/yaniv';
import { sortYanivHand } from '~/utils/yaniv/sort';
import type Game from './game';
import GameOver from './game-over';
import { HowToDialog } from './how-to';
import PlayArea from './play-area';
import { getRoundMessage } from './round-summary/round-message';
import { getRoundCount, Scoreboard } from './scoreboard';

type MockPlayer = ComponentProps<typeof Game>['players'][number];
type YanivStyle = 'black' | 'sticker' | 'marquee' | 'stripes' | 'status-only';
type SelectableCard = YanivPlayingCard & { selected?: boolean };

const YANIV_STYLES = [
  'black',
  'sticker',
  'marquee',
  'stripes',
  'status-only',
] as const satisfies YanivStyle[];

/* -------------------------------------------------------------------------- */
/* Turn status                                                                */
/* -------------------------------------------------------------------------- */

const USER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: 'Your turn: choose what to play',
  [GameStep.PICKUP_CARD]: 'Pick up from the deck or discard pile',
  [GameStep.PROCEED]: 'Call Yaniv or end your turn',
  [GameStep.REDEAL]: 'Deal the next round',
} as const satisfies Record<GameStep, string>;

const OTHER_PLAYER_TURN_TEXT = {
  [GameStep.PLAY_CARDS]: (name: PlayerName) =>
    `${name} is choosing what to play`,
  [GameStep.PICKUP_CARD]: (name: PlayerName) => `${name} needs to pick up`,
  [GameStep.PROCEED]: (name: PlayerName) =>
    `${name} is deciding whether to call Yaniv`,
  [GameStep.REDEAL]: (name: PlayerName) => `Waiting for ${name} to deal`,
} as const satisfies Record<GameStep, (name: PlayerName) => string>;

const USER_STEP_BY_STAGE = {
  [GameViewStage.PICKING_CARDS]: GameStep.PLAY_CARDS,
  [GameViewStage.DRAWING_CARDS]: GameStep.PICKUP_CARD,
  [GameViewStage.END_TURN]: GameStep.PROCEED,
  [GameViewStage.END_OF_ROUND]: GameStep.REDEAL,
  [GameViewStage.WAITING_FOR_NEW_ROUND]: GameStep.REDEAL,
  [GameViewStage.WAITING_FOR_PLAYER]: GameStep.PLAY_CARDS,
} as const satisfies Record<GameViewStage, GameStep>;

function TurnStatus({
  players,
  userId,
  step,
}: {
  players: MockPlayer[];
  userId: UserId;
  step: GameStep;
}) {
  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  const yanivCaller = players.find((player) => player.isYanivCalled);
  if (!playerTakingTurn) return null;

  const isUserTakingTurn = playerTakingTurn.id === userId;
  const turnText = isUserTakingTurn
    ? USER_TURN_TEXT[step]
    : OTHER_PLAYER_TURN_TEXT[step](playerTakingTurn.name);

  return (
    <div
      role='status'
      aria-live='polite'
      className='flex flex-col items-center text-center'
    >
      {yanivCaller && (
        <span className='flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-dark-text-disabled'>
          <MegaphoneIcon size={12} aria-hidden='true' />
          {yanivCaller.id === userId ? 'You' : yanivCaller.name} called Yaniv!
          Last turns
        </span>
      )}
      <span className='flex flex-wrap items-center justify-center gap-x-2 font-semibold text-balance'>
        {turnText}
        {!isUserTakingTurn && (
          <span aria-hidden='true' className='flex'>
            <CogIcon size={20} className='motion-safe:animate-spin' />
            <BrainIcon size={20} className='motion-safe:animate-pulse' />
            <CogIcon size={20} className='motion-safe:animate-spin' />
          </span>
        )}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Player tags                                                                */
/* -------------------------------------------------------------------------- */

function TurnBrackets({
  children,
  isShown,
}: {
  children: ReactNode;
  isShown: boolean;
}) {
  return (
    <div className='relative'>
      {children}
      {isShown && (
        <span
          aria-hidden='true'
          className='pointer-events-none absolute -inset-1.5 text-white'
        >
          <span className='absolute top-0 left-0 size-2.5 border-t-3 border-l-3 border-current rounded-tl-sm' />
          <span className='absolute top-0 right-0 size-2.5 border-t-3 border-r-3 border-current rounded-tr-sm' />
          <span className='absolute bottom-0 left-0 size-2.5 border-b-3 border-l-3 border-current rounded-bl-sm' />
          <span className='absolute bottom-0 right-0 size-2.5 border-b-3 border-r-3 border-current rounded-br-sm' />
        </span>
      )}
    </div>
  );
}

function CardCount({ count }: { count: number }) {
  return (
    <>
      <span
        aria-hidden='true'
        className='grid place-items-center w-[1.4em] h-[1.9em] rounded-[3px] bg-true-white border border-black/40 text-slate font-bold'
      >
        {count}
      </span>
      <span className='sr-only'>{count} cards</span>
    </>
  );
}

function yanivTagBackground(color: PlayerColor, yanivStyle: YanivStyle) {
  const colorValue = playerColorValue(color);
  if (yanivStyle === 'black') return { backgroundColor: 'black' };
  if (yanivStyle === 'stripes') {
    return {
      backgroundImage: `repeating-linear-gradient(-45deg, ${colorValue} 0 0.5rem, black 0.5rem 1rem)`,
    };
  }
  return { backgroundColor: colorValue };
}

function YanivMarquee() {
  const phrases = Array.from({ length: 4 }, (_, index) => index);
  return (
    // contain stops the scrolling text widening the tag
    <div
      aria-hidden='true'
      className='overflow-hidden border-t-2 border-white bg-black [contain:inline-size]'
    >
      <div className='flex w-max'>
        {phrases.map((phrase) => (
          <span
            key={phrase}
            className='flex items-center gap-1 px-2 text-xs font-extrabold uppercase text-white motion-safe:animate-marquee'
          >
            Yaniv! <MegaphoneIcon size={12} />
          </span>
        ))}
      </div>
    </div>
  );
}

function PlayerTag({
  player,
  isUser,
  yanivStyle,
}: {
  player: MockPlayer;
  isUser: boolean;
  yanivStyle: YanivStyle;
}) {
  const {
    name,
    color,
    cardCount,
    isPlayersTurn,
    isYanivCalled,
    emojiReaction,
  } = player;
  const isMegaphoneShown =
    isYanivCalled && yanivStyle !== 'sticker' && yanivStyle !== 'marquee';

  return (
    <TurnBrackets isShown={!!isPlayersTurn}>
      <div
        style={
          isYanivCalled
            ? yanivTagBackground(color, yanivStyle)
            : { backgroundColor: playerColorValue(color) }
        }
        className='relative flex flex-col rounded border-2 border-white text-xs sm:text-sm overflow-visible'
      >
        <div className='flex items-center gap-1 px-1.5 py-0.5 sm:gap-1.5 sm:px-2 sm:py-1'>
          {isUser && (
            <>
              <UserRoundIcon
                size='1.15em'
                strokeWidth={3}
                aria-hidden='true'
                className='shrink-0 text-white icon-outline-black'
              />
              <span className='sr-only'>You:</span>
            </>
          )}
          <span className='whitespace-nowrap font-extrabold text-white text-outline-black'>
            {name}
          </span>
          {isMegaphoneShown && (
            <MegaphoneIcon
              size='1.15em'
              strokeWidth={3}
              aria-hidden='true'
              className='shrink-0 text-white icon-outline-black'
            />
          )}
          <CardCount count={cardCount} />
        </div>

        {isYanivCalled && yanivStyle === 'marquee' && <YanivMarquee />}

        {isYanivCalled && yanivStyle === 'sticker' && (
          <span
            aria-hidden='true'
            className='absolute -top-3 -right-4 rotate-12 rounded-sm border-2 border-black bg-true-white px-1 text-xs font-black uppercase text-slate'
          >
            Yaniv!
          </span>
        )}

        {isYanivCalled && <span className='sr-only'>, has called Yaniv</span>}

        {emojiReaction && (
          <span
            // A new key per reaction remounts it, restarting the animation
            key={emojiReaction.id}
            aria-hidden='true'
            className='pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-3xl animate-reaction-emoji'
          >
            {emojiReaction.emoji}
          </span>
        )}
      </div>
    </TurnBrackets>
  );
}

function PlayerStrip({
  className,
  players,
  userId,
  step,
  yanivStyle,
  action,
}: {
  className?: string;
  players: MockPlayer[];
  userId: UserId;
  step: GameStep;
  yanivStyle: YanivStyle;
  action?: ReactNode;
}) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <TurnStatus players={players} userId={userId} step={step} />
      <div className='flex items-start gap-2'>
        <ol
          aria-label='Players'
          className='flex-1 flex flex-wrap justify-evenly gap-3 list-none m-0 p-1.5 lg:justify-center'
        >
          {players.map((player) => (
            <li
              key={player.id}
              aria-current={player.isPlayersTurn ? 'step' : undefined}
            >
              <PlayerTag
                player={player}
                isUser={player.id === userId}
                yanivStyle={yanivStyle}
              />
              {player.isPlayersTurn && (
                <span className='sr-only'>, their turn</span>
              )}
            </li>
          ))}
        </ol>
        {action}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hand                                                                       */
/* -------------------------------------------------------------------------- */

type HandProps = {
  className?: string;
  cards: SelectableCard[];
  color: PlayerColor;
  handTotal: number;
  totalScore: number;
  isFiftyScoreHalved: boolean;
  isActive: boolean;
  isFaceDown: boolean;
  onCardClick: (card: SelectableCard) => void;
  onToggleVisibility: () => void;
};

function getScoreNote(totalScore: number, isFiftyScoreHalved: boolean) {
  const target = !isFiftyScoreHalved && totalScore < 50 ? 50 : 100;
  const away = target - totalScore;
  return `${Math.abs(away)} points ${away >= 0 ? 'to' : 'past'} ${target}`;
}

function HandInfo({
  className,
  handTotal,
  isHandTotalHidden,
  totalScore,
  isFiftyScoreHalved,
}: {
  className?: string;
  handTotal: number;
  isHandTotalHidden: boolean;
  totalScore: number;
  isFiftyScoreHalved: boolean;
}) {
  return (
    <dl
      className={cn(
        // Equal outer columns keep the middle item centred
        'grid grid-cols-[1fr_auto_1fr] items-baseline gap-x-3 m-0 text-sm text-dark-text',
        className,
      )}
    >
      <div className='flex items-baseline gap-1'>
        <dt>Hand</dt>
        {/* Both stay in the same grid cell, so hiding the total doesn't move
            the text around it */}
        <dd className='m-0 grid text-2xl/none font-extrabold'>
          <span
            className={cn(
              '[grid-area:1/1] text-center',
              isHandTotalHidden && 'invisible',
            )}
          >
            {handTotal}
          </span>
          <span
            className={cn(
              '[grid-area:1/1] text-center',
              !isHandTotalHidden && 'invisible',
            )}
          >
            ?<span className='sr-only'>, hidden</span>
          </span>
        </dd>
      </div>
      <div className='flex items-baseline'>
        <dt className='sr-only'>Until halving</dt>
        <dd className='m-0 text-dark-text-disabled'>
          {getScoreNote(totalScore, isFiftyScoreHalved)}
        </dd>
      </div>
      <div className='justify-self-end flex items-baseline gap-1'>
        <dt>Total</dt>
        <dd className='m-0 text-2xl/none font-extrabold'>{totalScore}</dd>
      </div>
    </dl>
  );
}

function ToggleVisibilityButton({
  className,
  isFaceDown,
  onClick,
}: {
  className?: string;
  isFaceDown: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size='sm'
      variant='secondary'
      onClick={onClick}
      className={cn('shrink-0', className)}
    >
      {isFaceDown ? <EyeIcon /> : <EyeOffIcon />}
      Toggle visibility
      <span className='sr-only'>
        , your cards are {isFaceDown ? 'face down' : 'face up'}
      </span>
    </Button>
  );
}

function HandCards({
  className,
  cards,
  isFaceDown,
  onCardClick,
}: {
  className?: string;
  cards: SelectableCard[];
  isFaceDown: boolean;
  onCardClick: (card: SelectableCard) => void;
}) {
  return (
    <ol
      aria-label='Your hand'
      className={cn(
        // A step up from the play area's cards on phones, where the hand has
        // its own tab to fill; the same as the play area from md up
        'flex flex-wrap justify-center gap-2 list-none m-0 p-0 pt-[0.4em] text-lg md:text-2xl',
        className,
      )}
    >
      {sortYanivHand(cards).map((card) => (
        <li key={`${card.suit}-${card.rank}`} className='flex'>
          <PlayingCard
            card={isFaceDown ? null : card}
            highlighted={card.selected && !isFaceDown}
            onClick={isFaceDown ? undefined : () => onCardClick(card)}
          />
        </li>
      ))}
    </ol>
  );
}

/**
 * On phones the hand has its own tab, which keeps it private. Larger screens
 * show it under the table, so it gets a button to turn the cards face down.
 */
function HandView({
  className,
  cards,
  color,
  handTotal,
  totalScore,
  isFiftyScoreHalved,
  isActive,
  isFaceDown,
  onCardClick,
  onToggleVisibility,
}: HandProps) {
  return (
    <section
      aria-label='Your hand'
      style={
        { '--color-highlight': playerColorHighlight(color) } as CSSProperties
      }
      className={cn(
        'flex flex-col gap-2 rounded-lg border-2 border-white/30 bg-black/20 p-2',
        isActive && 'animate-pulse-bg',
        className,
      )}
    >
      <div className='flex items-center justify-between gap-2'>
        <HandInfo
          className='flex-1'
          handTotal={handTotal}
          isHandTotalHidden={isFaceDown}
          totalScore={totalScore}
          isFiftyScoreHalved={isFiftyScoreHalved}
        />
        <ToggleVisibilityButton
          className='hidden lg:flex'
          isFaceDown={isFaceDown}
          onClick={onToggleVisibility}
        />
      </div>
      <HandCards
        cards={cards}
        isFaceDown={isFaceDown}
        onCardClick={onCardClick}
      />
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Scores                                                                     */
/* -------------------------------------------------------------------------- */

function ScoresDialog({
  players,
  userId,
}: {
  players: MockPlayer[];
  userId: UserId;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* Phones have a Scores tab instead */}
        <Button size='sm' variant='secondary' className='hidden lg:flex'>
          <TrophyIcon />
          Scores
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        // The scoreboard's pinned columns paint --card-surface behind them,
        // which a panel Card would otherwise set; without it they fall back
        // to the darker felt
        className='bg-panel-background text-dark-text border-2 border-white/30 max-h-[90dvh] overflow-y-auto [--card-surface:var(--color-panel-background)] [--card-muted-text:var(--color-dark-text-disabled)]'
      >
        <DialogHeader>
          <DialogTitle>Scores</DialogTitle>
        </DialogHeader>
        <Scoreboard players={players} userId={userId} isInitiallyExpanded />
      </DialogContent>
    </Dialog>
  );
}

/**
 * The scores mid-round and the round summary at the end of one, in the same
 * compact panel. The real build would make these changes in RoundSummary and
 * ScoreboardList; here the list is restyled from outside.
 */
function ScoresPanel({
  players,
  userId,
  isRoundOver,
}: {
  players: MockPlayer[];
  userId: UserId;
  isRoundOver: boolean;
}) {
  const roundNumber = getRoundCount(players);

  return (
    <Card variant='panel' className='w-full max-w-xl self-center'>
      <CardHeader className='items-center text-center space-y-1'>
        <CardDescription>
          {isRoundOver ? `Round ${roundNumber}` : `After round ${roundNumber}`}
        </CardDescription>
        <CardTitle className='text-xl'>
          {isRoundOver ? getRoundMessage(players, userId) : 'Scores'}
        </CardTitle>
      </CardHeader>
      {/* Narrower sides than the header, so a max-length name fits beside
          its points on a phone */}
      <CardContent className='px-3'>
        <Scoreboard
          players={players}
          userId={userId}
          // Each player on one line: name, then round points and total. A long
          // name keeps its full width and moves the points to a second line
          className='[&_ol>li]:flex-row [&_ol>li]:flex-wrap [&_ol>li]:items-baseline [&_ol>li]:gap-x-2 [&_ol>li]:gap-y-1 [&_ol>li]:py-2.5 [&_ol>li>div]:flex-1 [&_ol>li>div]:gap-2 [&_ol>li>span]:shrink-0 [&_ol>li>div>ul>li]:whitespace-nowrap'
        />
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Full game                                                                  */
/* -------------------------------------------------------------------------- */

type GameTab = 'table' | 'hand' | 'scores';

const ACTION_TAB_BY_STAGE = {
  [GameViewStage.PICKING_CARDS]: 'hand',
  [GameViewStage.DRAWING_CARDS]: 'table',
  [GameViewStage.END_TURN]: 'table',
  [GameViewStage.END_OF_ROUND]: 'scores',
  [GameViewStage.WAITING_FOR_NEW_ROUND]: null,
  [GameViewStage.WAITING_FOR_PLAYER]: null,
} as const satisfies Record<GameViewStage, GameTab | null>;

/** A tab that pulses in the player's colour when their next move is on it. */
function GameTabTrigger({
  value,
  color,
  isActionNeeded,
  children,
}: {
  value: GameTab;
  color: PlayerColor;
  isActionNeeded: boolean;
  children: ReactNode;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn('h-full', isActionNeeded && 'motion-safe:animate-pulse-bg')}
    >
      {children}
      {isActionNeeded && (
        <>
          <span
            aria-hidden='true'
            style={{ backgroundColor: playerColorValue(color) }}
            className='size-2.5 rounded-full border border-white'
          />
          <span className='sr-only'>, your move</span>
        </>
      )}
    </TabsTrigger>
  );
}

/** The turn buttons from Controls, without its emoji reactions or status. */
function TurnActions({
  className,
  stage,
  isRunSelected,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
  onStartNewRoundClick,
}: {
  className?: string;
  stage: GameViewStage;
  isRunSelected: boolean;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: (direction?: 'ascending' | 'descending') => void;
  onStartNewRoundClick: () => void;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 justify-center gap-2 *:flex-1 *:max-w-48',
        className,
      )}
    >
      {stage === GameViewStage.PICKING_CARDS &&
        (isRunSelected ? (
          <>
            <Button onClick={() => onPlayCards('ascending')}>
              <ArrowUpCircleIcon />
              Play ascending
            </Button>
            <Button onClick={() => onPlayCards('descending')}>
              <ArrowDownCircleIcon />
              Play descending
            </Button>
          </>
        ) : (
          <Button onClick={() => onPlayCards()}>
            <CircleCheckIcon />
            Play Cards
          </Button>
        ))}
      {stage === GameViewStage.END_TURN && (
        <>
          <Button onClick={onYanivClick}>
            <MegaphoneIcon /> Yaniv!
          </Button>
          <Button onClick={onEndTurnClick}>
            End Turn
            <ArrowRightCircleIcon />
          </Button>
        </>
      )}
      {stage === GameViewStage.END_OF_ROUND && (
        <Button onClick={onStartNewRoundClick}>
          Start new round
          <ArrowRightCircleIcon />
        </Button>
      )}
    </div>
  );
}

type MockGameProps = {
  players: MockPlayer[];
  userId: UserId;
  cards: YanivPlayingCard[];
  stage: GameViewStage;
  playedCards: YanivPlayingCard[];
  discardCard: YanivPlayingCard | null;
  /** The card the user just picked up from the deck, shown over the deck. */
  drawnCard?: YanivPlayingCard;
  /** What another player is doing on their turn; the user's comes from the stage. */
  otherPlayerStep: GameStep;
  yanivStyle: YanivStyle;
  /** The tab phones open on, before any switch to the next move. */
  initialTab?: GameTab;
  /** Cards already selected when the story opens. */
  initialSelectedCards?: YanivPlayingCard[];
  isRunSelected?: boolean;
  onEmojiClick: ComponentProps<typeof EmojiReactions>['onEmojiClick'];
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: (direction?: 'ascending' | 'descending') => void;
};

const TAB_ORDER = ['table', 'hand', 'scores'] as const satisfies GameTab[];

const LARGE_SCREEN_QUERY = '(min-width: 1024px)';

function subscribeToLargeScreen(onChange: () => void) {
  const mediaQuery = matchMedia(LARGE_SCREEN_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

function useIsLargeScreen() {
  return useSyncExternalStore(
    subscribeToLargeScreen,
    () => matchMedia(LARGE_SCREEN_QUERY).matches,
    () => false,
  );
}

function MockGame({
  players,
  userId,
  cards,
  stage,
  playedCards,
  discardCard,
  drawnCard,
  otherPlayerStep,
  yanivStyle,
  initialTab = 'table',
  initialSelectedCards = [],
  isRunSelected = false,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
}: MockGameProps) {
  const [selectedCards, setSelectedCards] =
    useState<YanivPlayingCard[]>(initialSelectedCards);
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const isLargeScreen = useIsLargeScreen();

  // The panels follow your finger and snap like the carousel. Large screens
  // show the table and hand together, so the carousel switches off there
  const [carouselRef, carouselApi] = useEmblaCarousel({
    startIndex: TAB_ORDER.indexOf(initialTab),
    breakpoints: { [LARGE_SCREEN_QUERY]: { active: false } },
  });

  useEffect(() => {
    if (!carouselApi) return;
    const tabIndex = TAB_ORDER.findIndex((tab) => tab === activeTab);
    if (tabIndex === carouselApi.selectedScrollSnap()) return;
    const isMotionAllowed = matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches;
    carouselApi.scrollTo(tabIndex, !isMotionAllowed);
  }, [carouselApi, activeTab]);

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () =>
      setActiveTab(TAB_ORDER[carouselApi.selectedScrollSnap()] ?? 'table');
    carouselApi.on('select', handleSelect);
    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi]);
  // Only the large-screen layout has the toggle, so phones never set this
  const [isFaceDown, setIsFaceDown] = useState(false);
  const [userReaction, setUserReaction] =
    useState<MockPlayer['emojiReaction']>();

  const playersWithReactions = players.map((player) =>
    player.id === userId && userReaction
      ? { ...player, emojiReaction: userReaction }
      : player,
  );

  const userPlayer = players.find((player) => player.id === userId);
  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  if (!userPlayer || !playerTakingTurn) {
    throw new Error('Mock needs the user and a player taking their turn');
  }
  const isUserTakingTurn = userPlayer.id === playerTakingTurn.id;
  const isRoundOver =
    stage === GameViewStage.END_OF_ROUND ||
    stage === GameViewStage.WAITING_FOR_NEW_ROUND;

  const actionTab = isUserTakingTurn ? ACTION_TAB_BY_STAGE[stage] : null;

  // Switch to whichever view the next action happens in, and to the scores for
  // everyone when the round summary comes up
  useEffect(() => {
    if (isRoundOver) setActiveTab('scores');
    else if (actionTab) setActiveTab(actionTab);
  }, [actionTab, isRoundOver]);

  const handleEmojiClick: MockGameProps['onEmojiClick'] = (emoji) => {
    setUserReaction({ emoji, id: crypto.randomUUID() as EmojiReactionId });
    onEmojiClick(emoji);
  };

  const handlePlayCards = (direction?: 'ascending' | 'descending') => {
    setActiveTab('table');
    onPlayCards(direction);
  };

  const isSameCard = (first: YanivPlayingCard, second: YanivPlayingCard) =>
    first.suit === second.suit && first.rank === second.rank;

  const handleCardClick = (clickedCard: SelectableCard) =>
    setSelectedCards((previous) =>
      previous.some((card) => isSameCard(card, clickedCard))
        ? previous.filter((card) => !isSameCard(card, clickedCard))
        : [...previous, clickedCard],
    );

  const handProps: HandProps = {
    cards: cards.map((card) => ({
      ...card,
      selected: selectedCards.some((selected) => isSameCard(selected, card)),
    })),
    color: userPlayer.color,
    handTotal: sumYanivHand(cards),
    totalScore: userPlayer.score,
    isFiftyScoreHalved: userPlayer.isFiftyScoreHalved,
    isActive: stage === GameViewStage.PICKING_CARDS && isUserTakingTurn,
    isFaceDown,
    onCardClick: handleCardClick,
    onToggleVisibility: () => setIsFaceDown((previous) => !previous),
  };

  const playerStrip = (
    <PlayerStrip
      players={playersWithReactions}
      userId={userId}
      step={isUserTakingTurn ? USER_STEP_BY_STAGE[stage] : otherPlayerStep}
      yanivStyle={yanivStyle}
    />
  );

  const playArea = (
    <PlayArea
      color={userPlayer.color}
      playedCards={playedCards}
      discardCard={discardCard}
      isActive={stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn}
      // Face down means someone may be looking, so keep the picked-up card
      // private too
      drawnCard={isFaceDown ? undefined : drawnCard}
      className='sm:text-lg md:text-2xl'
    />
  );

  // On phones the turn buttons only appear on the tab they belong to, pinned
  // to its bottom so they slide with it rather than taking space on every tab
  const panelTurnActions = (tab: GameTab) =>
    actionTab === tab && (
      <TurnActions
        className='pt-3 lg:hidden'
        stage={stage}
        isRunSelected={isRunSelected}
        onEndTurnClick={onEndTurnClick}
        onYanivClick={onYanivClick}
        onPlayCards={handlePlayCards}
        onStartNewRoundClick={() => onPlayCards()}
      />
    );

  // Off-screen panels stay visible so the neighbouring tab shows while
  // dragging, but can't be focused or clicked
  const isPanelInert = (tab: GameTab) => !isLargeScreen && activeTab !== tab;

  return (
    <GameLayout
      gameType={GameType.YANIV}
      actions={
        <div className='flex gap-2'>
          <ScoresDialog players={players} userId={userId} />
          <HowToDialog />
        </div>
      }
      // PageRoot is min-h-dvh, so cap main below the header (3.5rem plus a
      // 0.75rem gap) to stop the page scrolling past the tabs
      className='not-prose w-full px-2 pb-2 min-h-0 max-h-[calc(100dvh-4.25rem)] overflow-hidden'
    >
      {/* Phones switch between the table, hand and scores with tabs; larger
          screens show the table and hand together, with no tab list, and
          open the scores from the header */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex-1 min-h-0 gap-3'
      >
        {/* On phones the panels sit side by side in a carousel you can drag
            between. Each panel scrolls inside itself, above a footer that's
            pinned to its bottom */}
        <div
          ref={carouselRef}
          // Reaches the screen edges, and each panel takes the page's side
          // padding (px-3 on PageRoot plus px-2 on main) itself, so there's a
          // gap between panels while swiping
          className='relative -mx-5 flex-1 min-h-0 overflow-hidden lg:contents'
        >
          {/* Absolutely positioned because main has no fixed height for the
              panels' h-full to resolve against */}
          <div className='absolute inset-0 flex touch-pan-y lg:contents'>
            <TabsContent
              value='table'
              forceMount
              inert={isPanelInert('table')}
              className='min-w-0 flex-[0_0_100%] h-full px-5 flex flex-col lg:h-auto lg:min-h-0 lg:flex-1 lg:px-0'
            >
              <div className='flex-1 min-h-0 overflow-y-auto flex flex-col gap-3'>
                {playerStrip}
                <div className='flex-1 grid place-items-center'>
                  {/* Phones show the round summary in the Scores tab instead */}
                  {isRoundOver ? (
                    <>
                      <div className='lg:hidden'>{playArea}</div>
                      <div className='hidden w-full lg:flex lg:justify-center'>
                        <ScoresPanel
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
                <EmojiReactions
                  onEmojiClick={handleEmojiClick}
                  className='self-center lg:hidden'
                />
              </div>
              {panelTurnActions('table')}
            </TabsContent>
            <TabsContent
              value='hand'
              forceMount
              inert={isPanelInert('hand')}
              className='min-w-0 flex-[0_0_100%] h-full px-5 flex flex-col lg:h-auto lg:flex-none lg:order-last lg:px-0'
            >
              <div className='flex-1 min-h-0 overflow-y-auto flex flex-col'>
                {/* Fills the tab on phones rather than floating in the middle */}
                <HandView {...handProps} className='flex-1 lg:flex-none' />
              </div>
              {panelTurnActions('hand')}
            </TabsContent>
            <TabsContent
              value='scores'
              forceMount
              inert={isPanelInert('scores')}
              className='min-w-0 flex-[0_0_100%] h-full px-5 flex flex-col lg:hidden'
            >
              <div className='flex-1 min-h-0 overflow-y-auto flex flex-col'>
                <ScoresPanel
                  players={players}
                  userId={userId}
                  isRoundOver={isRoundOver}
                />
              </div>
              {panelTurnActions('scores')}
            </TabsContent>
          </div>
        </div>
        {/* Large screens share this row with the emoji reactions, like the
            current Controls */}
        <div className='hidden lg:grid lg:grid-cols-2 lg:items-center lg:gap-2'>
          <EmojiReactions onEmojiClick={handleEmojiClick} />
          {actionTab && (
            <TurnActions
              // Face-down cards can't be played, so Play Cards hides with them
              className={cn(
                'justify-end',
                isFaceDown &&
                  stage === GameViewStage.PICKING_CARDS &&
                  'invisible',
              )}
              stage={stage}
              isRunSelected={isRunSelected}
              onEndTurnClick={onEndTurnClick}
              onYanivClick={onYanivClick}
              onPlayCards={handlePlayCards}
              onStartNewRoundClick={() => onPlayCards()}
            />
          )}
        </div>
        <TabsList
          style={
            {
              '--color-highlight': playerColorHighlight(userPlayer.color),
            } as CSSProperties
          }
          className='w-full h-11 shrink-0 mb-[env(safe-area-inset-bottom)] lg:hidden'
        >
          {(
            [
              ['table', 'Table'],
              ['hand', 'Your hand'],
              ['scores', 'Scores'],
            ] as const
          ).map(([tab, label]) => (
            <GameTabTrigger
              key={tab}
              value={tab}
              color={userPlayer.color}
              isActionNeeded={actionTab === tab && activeTab !== tab}
            >
              {label}
            </GameTabTrigger>
          ))}
        </TabsList>
      </Tabs>
    </GameLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Data and stories                                                           */
/* -------------------------------------------------------------------------- */

const USER_ID = '1' as UserId;

const players: MockPlayer[] = [
  {
    ...buildClientPlayer({
      id: USER_ID,
      color: 'red',
      cardCount: 7,
      name: 'Al' as PlayerName,
      score: 9,
      roundScores: [
        buildRoundScore({ original: 9 }),
        buildRoundScore({ original: 5, adjusted: 0 }),
      ],
    }),
    isPlayersTurn: true,
  },
  buildClientPlayer({
    id: '2' as UserId,
    color: 'cyan',
    cardCount: 5,
    isFiftyScoreHalved: true,
    name: 'Kevin' as PlayerName,
    score: 25,
    roundScores: [
      buildRoundScore({ original: 38 }),
      buildRoundScore({ original: 12, halvedBy: 25 }),
    ],
  }),
  buildClientPlayer({
    id: '3' as UserId,
    color: 'purple',
    cardCount: 3,
    name: 'Paul' as PlayerName,
    score: 36,
    roundScores: [
      buildRoundScore({ original: 11 }),
      buildRoundScore({ original: 7, adjusted: 25 }),
    ],
  }),
  buildClientPlayer({
    id: '4' as UserId,
    color: 'green',
    cardCount: 6,
    name: 'Viola' as PlayerName,
    score: 10,
    roundScores: [
      buildRoundScore({ original: 6 }),
      buildRoundScore({ original: 4 }),
    ],
  }),
  buildClientPlayer({
    id: '5' as UserId,
    color: 'indigo',
    cardCount: 7,
    name: 'Duncan' as PlayerName,
    score: 13,
    roundScores: [
      buildRoundScore({ original: 2, adjusted: 0 }),
      buildRoundScore({ original: 13 }),
    ],
  }),
  buildClientPlayer({
    id: '6' as UserId,
    color: 'fuchsia',
    cardCount: 4,
    name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
      '',
    ) as PlayerName,
    score: 25,
    roundScores: [
      buildRoundScore({ original: 15 }),
      buildRoundScore({ original: 10 }),
    ],
  }),
];

const withTurn = (playerIndex: number, overrides: Partial<MockPlayer> = {}) =>
  players.map((player, index) => ({
    ...player,
    isPlayersTurn: index === playerIndex,
    ...(index === playerIndex ? overrides : {}),
  }));

const userCards: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.ACE },
  { suit: Suit.HEARTS, rank: Rank.KING },
  { suit: Suit.SPADES, rank: Rank.QUEEN },
  { suit: Suit.DIAMONDS, rank: Rank.JACK },
  { suit: Suit.CLUBS, rank: Rank.TEN },
  { suit: Suit.HEARTS, rank: Rank.NINE },
  { suit: Suit.SPADES, rank: Rank.EIGHT },
];

const meta = {
  title: 'Yaniv / Mockups / Layout redesign',
  component: MockGame,
  tags: ['!autodocs'],
  parameters: { isFullScreen: true },
  globals: { viewport: { value: 'phone' } },
  args: {
    players: withTurn(0),
    userId: USER_ID,
    cards: userCards,
    stage: GameViewStage.PICKING_CARDS,
    playedCards: [
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
      { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
    discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
    otherPlayerStep: GameStep.PLAY_CARDS,
    yanivStyle: 'sticker',
    onEmojiClick: fn(),
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
    otherPlayerStep: { control: 'select', options: Object.values(GameStep) },
    yanivStyle: { control: 'inline-radio', options: YANIV_STYLES },
  },
} satisfies Meta<typeof MockGame>;

export default meta;

type Story = StoryObj<typeof meta>;

/* Player tags ------------------------------------------------------------- */

function MockupSection({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <section className='flex flex-col gap-2 border-t border-white/20 pt-3'>
      <h2 className='m-0 text-xs font-semibold uppercase tracking-wide text-dark-text-disabled'>
        {heading}
      </h2>
      {children}
    </section>
  );
}

const longNamePlayers = players.map((player, index) => ({
  ...player,
  name: (
    [
      'Al',
      'Christophers',
      'WWWWWWWWWWWW',
      'Maximiliana',
      'MMMMMMMMMMMM',
      'Bartholomew',
    ] as const
  )[index] as PlayerName,
  isPlayersTurn: index === 2,
}));

const withYanivCalledBy = (callerIndex: number, turnIndex: number) =>
  withTurn(turnIndex).map((player, index) =>
    index === callerIndex ? { ...player, isYanivCalled: true } : player,
  );

export const PlayerTags: Story = {
  parameters: { isFullScreen: false },
  render: ({ userId, yanivStyle }) => (
    <div className='not-prose flex flex-col gap-4'>
      {Object.values(GameStep).map((step) => (
        <MockupSection key={step} heading={`Kevin's turn: ${step}`}>
          <PlayerStrip
            players={withTurn(1)}
            userId={userId}
            step={step}
            yanivStyle={yanivStyle}
          />
        </MockupSection>
      ))}
      <MockupSection heading='Your turn'>
        <PlayerStrip
          players={withTurn(0)}
          userId={userId}
          step={GameStep.PLAY_CARDS}
          yanivStyle={yanivStyle}
        />
      </MockupSection>
      <MockupSection heading='Longest names'>
        <PlayerStrip
          players={longNamePlayers}
          userId={userId}
          step={GameStep.PICKUP_CARD}
          yanivStyle={yanivStyle}
        />
      </MockupSection>
    </div>
  ),
};

export const PlayerTagsYanivCalled: Story = {
  parameters: { isFullScreen: false },
  render: ({ userId }) => (
    <div className='not-prose flex flex-col gap-4'>
      {YANIV_STYLES.map((yanivStyle) => (
        <MockupSection key={yanivStyle} heading={yanivStyle}>
          <PlayerStrip
            players={withYanivCalledBy(2, 1)}
            userId={userId}
            step={GameStep.PLAY_CARDS}
            yanivStyle={yanivStyle}
          />
          <PlayerStrip
            players={withYanivCalledBy(0, 3)}
            userId={userId}
            step={GameStep.PROCEED}
            yanivStyle={yanivStyle}
          />
        </MockupSection>
      ))}
    </div>
  ),
};

/* Full game --------------------------------------------------------------- */

export const FullGameYourTurnToPlay: Story = {};

export const FullGameFiveCardHand: Story = {
  args: { cards: userCards.slice(0, 5) },
};

export const FullGameThirteenCardHand: Story = {
  args: {
    cards: [
      ...userCards,
      { suit: Suit.DIAMONDS, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.HEARTS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.FIVE },
      { suit: Suit.DIAMONDS, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
  },
};

export const FullGameDrawingCards: Story = {
  args: { stage: GameViewStage.DRAWING_CARDS },
};

export const FullGameOtherPlayersTurn: Story = {
  args: {
    players: withTurn(4),
    stage: GameViewStage.WAITING_FOR_PLAYER,
    otherPlayerStep: GameStep.PICKUP_CARD,
  },
};

export const FullGameYanivCalled: Story = {
  args: {
    players: withYanivCalledBy(2, 3),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
};

export const FullGameLongestNames: Story = {
  args: {
    players: longNamePlayers,
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
};

export const FullGameTwoPlayers: Story = {
  args: { players: withTurn(0).slice(0, 2) },
};

const runCards: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.THREE },
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.CLUBS, rank: Rank.FIVE },
];

const runSelectedArgs = {
  cards: [...runCards, ...userCards.slice(0, 4)],
  initialSelectedCards: runCards,
  isRunSelected: true,
} satisfies Story['args'];

export const FullGameRunSelected: Story = { args: runSelectedArgs };

export const FullGameDesktopRunSelected: Story = {
  args: runSelectedArgs,
  globals: { viewport: { value: undefined } },
};

/** The current game over screen, to check against the new look. */
export const GameOverScreen: Story = {
  render: ({ userId }) => (
    <GameOver
      userId={userId}
      players={players.map((player) => ({
        ...player,
        isWinner: player.name === 'Viola',
      }))}
    />
  ),
};

export const FullGameEndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND },
};

export const FullGameScoresFivePlayers: Story = {
  args: {
    players: withTurn(2).slice(0, 5),
    stage: GameViewStage.WAITING_FOR_PLAYER,
    initialTab: 'scores',
  },
};

export const FullGameWaitingForNewRound: Story = {
  args: {
    players: withTurn(2),
    stage: GameViewStage.WAITING_FOR_NEW_ROUND,
    otherPlayerStep: GameStep.REDEAL,
  },
};

/** Fills the window, so resizing it shows where the layout changes. */
export const FullGameAnyWidth: Story = {
  globals: { viewport: { value: undefined } },
};

export const FullGameDesktop: Story = {
  globals: { viewport: { value: undefined } },
};

export const FullGameDesktopOtherPlayersTurn: Story = {
  args: {
    players: withTurn(4),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
  globals: { viewport: { value: undefined } },
};

export const FullGameDesktopPickedUpCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
  },
  globals: { viewport: { value: undefined } },
};

// Throwaway mockups for the Yaniv layout redesign (#162, #167). Delete before
// raising a PR.
import { Drawer } from '@base-ui/react/drawer';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  ArrowRightCircleIcon,
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
} from 'react';
import { fn } from 'storybook/test';
import { EmojiReactions } from '~/components/emoji-reactions';
import GameLayout from '~/components/layout/game-layout';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card';
import { ScreenEdgeHighlight } from '~/components/ui/screen-edge-highlight';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import {
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
import { HowToDialog } from './how-to';
import PlayArea from './play-area';
import { Scoreboard } from './scoreboard';

type MockPlayer = ComponentProps<typeof Game>['players'][number];
type YanivStyle = 'black' | 'sticker' | 'marquee' | 'stripes' | 'status-only';
type ScoresAccess = 'header-dialog' | 'strip-drawer';
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
        className='grid place-items-center w-[1.1rem] h-[1.5rem] rounded-[3px] bg-true-white border border-black/40 text-slate text-xs font-bold'
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
  const { name, color, cardCount, isPlayersTurn, isYanivCalled } = player;
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
        className='relative flex flex-col rounded border-2 border-white text-sm overflow-visible'
      >
        <div className='flex items-center gap-1.5 px-2 py-1'>
          {isUser && (
            <>
              <UserRoundIcon
                size={16}
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
              size={16}
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
          className='flex-1 flex flex-wrap justify-center gap-3 list-none m-0 p-1.5'
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
  onCardClick: (card: SelectableCard) => void;
};

function getScoreNote(totalScore: number, isFiftyScoreHalved: boolean) {
  const target = !isFiftyScoreHalved && totalScore < 50 ? 50 : 100;
  const away = target - totalScore;
  return `${Math.abs(away)} points ${away >= 0 ? 'to' : 'past'} ${target}`;
}

function HandInfo({
  className,
  handTotal,
  totalScore,
  isFiftyScoreHalved,
}: {
  className?: string;
  handTotal: number;
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
        <dd className='m-0 text-2xl/none font-extrabold'>{handTotal}</dd>
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

function HideHandButton({
  className,
  isHidden,
  onClick,
}: {
  className?: string;
  isHidden: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size='sm'
      variant='secondary'
      aria-pressed={isHidden}
      onClick={onClick}
      className={cn('shrink-0', className)}
    >
      {isHidden ? <EyeIcon /> : <EyeOffIcon />}
      Hide hand
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
        // Same sizes as the play area, so hand and table cards match
        'flex flex-wrap justify-center gap-2 list-none m-0 p-0 pt-[0.4em] sm:text-lg md:text-2xl',
        className,
      )}
    >
      {sortYanivHand(cards).map((card) => (
        <li
          key={`${card.suit}-${card.rank}`}
          className='flex justify-center shrink-0 basis-[calc((100%-1rem)/3)] lg:basis-auto'
        >
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
  onCardClick,
}: HandProps) {
  // Only the large-screen layout has the button, so phones never set this
  const [isFaceDown, setIsFaceDown] = useState(false);

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
        {isFaceDown ? (
          <span className='text-sm text-dark-text-disabled'>
            Hand total hidden
          </span>
        ) : (
          <HandInfo
            className='flex-1'
            handTotal={handTotal}
            totalScore={totalScore}
            isFiftyScoreHalved={isFiftyScoreHalved}
          />
        )}
        <HideHandButton
          className='hidden lg:flex'
          isHidden={isFaceDown}
          onClick={() => setIsFaceDown((previous) => !previous)}
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
        <Button size='sm' variant='secondary'>
          <TrophyIcon />
          Scores
        </Button>
      </DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className='bg-panel-background text-dark-text border-2 border-white/30 max-h-[90dvh] overflow-y-auto'
      >
        <DialogHeader>
          <DialogTitle>Scores</DialogTitle>
        </DialogHeader>
        <Scoreboard players={players} userId={userId} isInitiallyExpanded />
      </DialogContent>
    </Dialog>
  );
}

function ScoresDrawer({
  players,
  userId,
}: {
  players: MockPlayer[];
  userId: UserId;
}) {
  return (
    <Drawer.Root>
      <Drawer.Trigger
        render={
          <Button size='icon' variant='secondary' className='shrink-0 mt-1.5' />
        }
      >
        <TrophyIcon />
        <span className='sr-only'>Scores</span>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop className='fixed inset-0 bg-black/50 opacity-[calc(1-var(--drawer-swipe-progress))] motion-safe:transition-opacity motion-safe:duration-300 data-starting-style:opacity-0 data-ending-style:opacity-0' />
        <Drawer.Viewport className='fixed inset-0 flex items-end justify-center'>
          <Drawer.Popup className='not-prose w-full max-w-3xl max-h-[85dvh] overflow-y-auto rounded-t-xl border-2 border-b-0 border-white/30 bg-panel-background text-dark-text outline-none [transform:translateY(var(--drawer-swipe-movement-y))] motion-safe:transition-transform motion-safe:duration-300 data-swiping:duration-0 data-starting-style:[transform:translateY(100%)] data-ending-style:[transform:translateY(100%)]'>
            <div
              aria-hidden='true'
              className='mx-auto mt-2 h-1 w-12 rounded-full bg-white/40'
            />
            <Drawer.Content className='flex flex-col gap-3 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]'>
              <Drawer.Title className='text-lg font-semibold text-center'>
                Scores
              </Drawer.Title>
              <Scoreboard players={players} userId={userId} />
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Full game                                                                  */
/* -------------------------------------------------------------------------- */

/** The turn buttons from Controls, without its emoji reactions or status. */
function TurnActions({
  className,
  stage,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
}: {
  className?: string;
  stage: GameViewStage;
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: () => void;
}) {
  return (
    <div
      className={cn(
        'flex shrink-0 justify-center gap-2 *:flex-1 *:max-w-48',
        className,
      )}
    >
      {stage === GameViewStage.PICKING_CARDS && (
        <Button onClick={onPlayCards}>
          <CircleCheckIcon />
          Play Cards
        </Button>
      )}
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
  /** What another player is doing on their turn; the user's comes from the stage. */
  otherPlayerStep: GameStep;
  yanivStyle: YanivStyle;
  scoresAccess: ScoresAccess;
  onEmojiClick: ComponentProps<typeof EmojiReactions>['onEmojiClick'];
  onEndTurnClick: () => void;
  onYanivClick: () => void;
  onPlayCards: () => void;
};

function MockGame({
  players,
  userId,
  cards,
  stage,
  playedCards,
  discardCard,
  otherPlayerStep,
  yanivStyle,
  scoresAccess,
  onEmojiClick,
  onEndTurnClick,
  onYanivClick,
  onPlayCards,
}: MockGameProps) {
  const [selectedCards, setSelectedCards] = useState<YanivPlayingCard[]>([]);
  const [activeTab, setActiveTab] = useState('table');

  const userPlayer = players.find((player) => player.id === userId);
  const playerTakingTurn = players.find((player) => player.isPlayersTurn);
  if (!userPlayer || !playerTakingTurn) {
    throw new Error('Mock needs the user and a player taking their turn');
  }
  const isUserTakingTurn = userPlayer.id === playerTakingTurn.id;

  // Switch to whichever view the next action happens in
  useEffect(() => {
    if (!isUserTakingTurn) return;
    if (stage === GameViewStage.PICKING_CARDS) setActiveTab('hand');
    if (stage === GameViewStage.DRAWING_CARDS) setActiveTab('table');
  }, [isUserTakingTurn, stage]);

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
    onCardClick: handleCardClick,
  };

  const playerStrip = (
    <PlayerStrip
      players={players}
      userId={userId}
      step={isUserTakingTurn ? USER_STEP_BY_STAGE[stage] : otherPlayerStep}
      yanivStyle={yanivStyle}
      action={
        scoresAccess === 'strip-drawer' && (
          <ScoresDrawer players={players} userId={userId} />
        )
      }
    />
  );

  const playArea = (
    <PlayArea
      color={userPlayer.color}
      playedCards={playedCards}
      discardCard={discardCard}
      isActive={stage === GameViewStage.DRAWING_CARDS && isUserTakingTurn}
      className='sm:text-lg md:text-2xl'
    />
  );

  return (
    <GameLayout
      gameType={GameType.YANIV}
      actions={
        <div className='flex gap-2'>
          {scoresAccess === 'header-dialog' && (
            <ScoresDialog players={players} userId={userId} />
          )}
          <HowToDialog />
        </div>
      }
      // PageRoot is min-h-dvh, so cap main below the header (3.5rem plus a
      // 0.75rem gap) to stop the page scrolling past the tabs
      className='not-prose w-full px-2 pb-2 min-h-0 max-h-[calc(100dvh-4.25rem)] overflow-hidden'
    >
      {isUserTakingTurn && <ScreenEdgeHighlight color={userPlayer.color} />}

      {/* Phones switch between the table and hand with tabs; larger screens
          show both, with the hand last and no tab list */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='flex-1 min-h-0 gap-3'
      >
        {/* On phones both panels stay mounted and slide sideways; the inactive
            one turns invisible once it's off screen, so it can't be focused */}
        <div className='relative flex-1 min-h-0 overflow-hidden lg:contents'>
          <TabsContent
            value='table'
            forceMount
            className={cn(
              'absolute inset-0 overflow-y-auto flex flex-col gap-3',
              'data-[state=inactive]:-translate-x-full data-[state=inactive]:invisible',
              'motion-safe:transition-[translate,visibility] motion-safe:duration-300 motion-safe:ease-in-out',
              'lg:static lg:min-h-0 lg:data-[state=inactive]:translate-x-0 lg:data-[state=inactive]:visible',
            )}
          >
            {playerStrip}
            <div className='flex-1 grid place-items-center'>{playArea}</div>
            <EmojiReactions
              onEmojiClick={onEmojiClick}
              className='self-center'
            />
          </TabsContent>
          <TabsContent
            value='hand'
            forceMount
            className={cn(
              'absolute inset-0 overflow-y-auto flex flex-col gap-3 justify-center-safe',
              'data-[state=inactive]:translate-x-full data-[state=inactive]:invisible',
              'motion-safe:transition-[translate,visibility] motion-safe:duration-300 motion-safe:ease-in-out',
              'lg:static lg:flex-none lg:order-last lg:data-[state=inactive]:translate-x-0 lg:data-[state=inactive]:visible',
            )}
          >
            <HandView {...handProps} />
            {/* Lives in the hand panel so it slides with the cards rather
                than resizing the panels mid-slide */}
            {isUserTakingTurn && stage === GameViewStage.PICKING_CARDS && (
              <TurnActions
                className='lg:order-first'
                stage={stage}
                onEndTurnClick={onEndTurnClick}
                onYanivClick={onYanivClick}
                onPlayCards={onPlayCards}
              />
            )}
          </TabsContent>
        </div>
        {isUserTakingTurn && stage !== GameViewStage.PICKING_CARDS && (
          <TurnActions
            stage={stage}
            onEndTurnClick={onEndTurnClick}
            onYanivClick={onYanivClick}
            onPlayCards={onPlayCards}
          />
        )}
        <TabsList className='w-full h-11 shrink-0 mb-[env(safe-area-inset-bottom)] lg:hidden'>
          <TabsTrigger value='table' className='h-full'>
            Table
          </TabsTrigger>
          <TabsTrigger value='hand' className='h-full'>
            Your hand
          </TabsTrigger>
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
    scoresAccess: 'header-dialog',
    onEmojiClick: fn(),
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
    otherPlayerStep: { control: 'select', options: Object.values(GameStep) },
    yanivStyle: { control: 'inline-radio', options: YANIV_STYLES },
    scoresAccess: {
      control: 'inline-radio',
      options: ['header-dialog', 'strip-drawer'],
    },
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

/* Scores ------------------------------------------------------------------ */

export const ScoresFromHeader: Story = {
  args: { scoresAccess: 'header-dialog' },
};

export const ScoresFromPlayerStrip: Story = {
  args: { scoresAccess: 'strip-drawer' },
};

/* Full game --------------------------------------------------------------- */

export const FullGameYourTurnToPlay: Story = {};

export const FullGameFiveCardHand: Story = {
  args: { cards: userCards.slice(0, 5) },
};

export const FullGameLargeHand: Story = {
  args: {
    cards: [
      ...userCards,
      { suit: Suit.DIAMONDS, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.HEARTS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.FIVE },
      { suit: Suit.DIAMONDS, rank: Rank.SIX },
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

import { type ReactNode, useMemo, useState } from 'react';
import { PageEmojiRain } from '~/components/emoji-rain/page-emoji-rain';
import { usePageReactions } from '~/components/emoji-rain/use-page-reactions';
import { EmojiReactions } from '~/components/emoji-reactions';
import GameLayout from '~/components/layout/game-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TabsViewport,
} from '~/components/ui/tabs';
import type { ClientPlayer } from '~/server/state/game/shithead/lib/to-client-game-state';
import type { StandardPlayingCard } from '~/types/cards';
import type { EmojiReactionId } from '~/types/entities';
import { GameType } from '~/types/game';
import {
  GameStage,
  type ReactionEmoji,
  reactionEmojis,
} from '~/types/games/shithead';
import { PlayArea } from '../play-area';
import { PlayerArea } from '../player-area';
import { TurnAnnouncement, TurnStatus } from '../turn-status';
import { useDeckEmptyReaction } from './use-deck-empty-reaction';

type GameTab = 'table' | 'hand';

const GAME_TABS = [
  { value: 'table', label: 'Table' },
  { value: 'hand', label: 'Hand' },
] as const satisfies { value: GameTab; label: string }[];

type GameProps = {
  gameStage: GameStage.SWAPPING | GameStage.IN_PROGRESS;
  players: (ClientPlayer & {
    isPlayersTurn: boolean;
    emojiReaction?: { emoji: ReactionEmoji; id: EmojiReactionId } | undefined;
  })[];
  deckSize: number;
  /** Top-first */
  visibleDiscardCards: StandardPlayingCard[];
  hand: ReactNode;
  onEmojiClick: (emoji: ReactionEmoji) => void;
};

/** The table with every player's cards, beside the player's own hand. */
export default function Game({
  gameStage,
  players,
  deckSize,
  visibleDiscardCards,
  hand,
  onEmojiClick,
}: GameProps) {
  const playerReactions = usePageReactions(players);
  const deckEmptyReaction = useDeckEmptyReaction(deckSize);
  const pageReactions = useMemo(
    () =>
      deckEmptyReaction
        ? [...playerReactions, deckEmptyReaction]
        : playerReactions,
    [playerReactions, deckEmptyReaction],
  );

  const [activeTab, setActiveTab] = useState<string>('table');

  const userPlayer = players.find((player) => player.isUser);
  if (!userPlayer) {
    throw new Error('Current user not found in players');
  }

  const isUserActing =
    gameStage === GameStage.SWAPPING
      ? !userPlayer.isSwapConfirmed
      : userPlayer.isPlayersTurn;

  return (
    <GameLayout
      gameType={GameType.SHITHEAD}
      className='not-prose w-full overflow-hidden px-2 pb-2'
    >
      <TurnAnnouncement gameStage={gameStage} players={players} />

      <PageEmojiRain
        reactions={pageReactions}
        className='flex min-h-0 flex-1 flex-col'
      >
        {/* Larger screens show the table and hand side by side, with no tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          // Matches the lg: classes, where the table and hand show together
          staticQuery='(min-width: 1024px)'
          className='min-h-0 flex-1 gap-3 lg:grid lg:grid-cols-[3fr_2fr] lg:grid-rows-[minmax(0,1fr)] lg:gap-6'
        >
          <TabsViewport
            // Leave a gap between tabs
            className='-mx-5 lg:contents'
            trackClassName='lg:contents'
          >
            <TabsContent
              value='table'
              // Smaller screens reach over the game's gutter, to the page's
              // own, so two players fit a row
              className='flex flex-col px-3 sm:px-5 lg:h-auto lg:min-h-0 lg:px-0'
            >
              <div className='flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto'>
                <TurnStatus gameStage={gameStage} players={players} />
                <ol
                  aria-label='Players'
                  // Lines players up by their cards, as a long name's tag
                  // wraps taller
                  className='m-0 flex list-none flex-wrap items-end justify-evenly gap-x-2 gap-y-4 p-1.5 sm:gap-x-4'
                >
                  {players.map((player) => (
                    <li
                      key={player.id}
                      aria-current={player.isPlayersTurn ? 'step' : undefined}
                    >
                      <PlayerArea
                        name={player.name}
                        color={player.color}
                        isUser={player.isUser}
                        isPlayersTurn={player.isPlayersTurn}
                        emojiReaction={player.emojiReaction}
                        cardCount={player.cardCount}
                        tableCards={player.tableCards}
                        finishingPosition={player.finishingPosition}
                      />
                    </li>
                  ))}
                </ol>
                <div className='grid flex-1 place-items-center'>
                  <PlayArea
                    className='sm:text-lg'
                    deckSize={deckSize}
                    visibleDiscardCards={visibleDiscardCards}
                  />
                </div>
              </div>
              <EmojiReactions
                emojis={reactionEmojis}
                onEmojiClick={onEmojiClick}
                className='mt-3 shrink-0 self-center'
              />
            </TabsContent>

            <TabsContent
              value='hand'
              className='flex flex-col px-3 sm:px-5 lg:h-auto lg:min-h-0 lg:px-0'
            >
              <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
                {hand}
              </div>
            </TabsContent>
          </TabsViewport>

          <TabsList className='mb-[env(safe-area-inset-bottom)] h-11 w-full shrink-0 lg:hidden'>
            {GAME_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                // Marks where your next move is when you're on another tab
                actionColor={
                  isUserActing && tab.value === 'hand' && activeTab !== 'hand'
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

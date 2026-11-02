'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '~/components/layout/game-layout';
import Loading from '~/components/loading';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '~/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import type { UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import { cn } from '~/utils/cn';
import { HowToDialog } from '../../../_components/how-to';
import useYanivScoreboard from '../../_hooks/useYanivScoreboard';
import { previewGameSummary } from '../../_libs/derive-game-summary';
import CarouselControls from '../carousel-controls';
import GameOver from '../game-over';
import Round from '../round';
import SavedGame from '../saved-game';
import ScoreTable from '../score-table';
import Setup from '../setup';

const SETUP_SLIDE_INDEX = 0;

// Phone: 3.75rem of header, 0.75rem of gap, 1rem of padding above and 6rem of
// tab switch below. Desktop: the same but 1rem below, with no switch to keep
// clear of.
const SCORE_TABLE_MAX_HEIGHT =
  'max-h-[calc(100dvh-11.5rem)] lg:max-h-[calc(100dvh-6.5rem)]';

/** Which half of the scoreboard is on show when there is only room for one. */
enum PageTab {
  ROUNDS = 'rounds',
  SCORES = 'scores',
}

type SlideErrors = {
  slideIndex: number;
  messages: Partial<Record<UserId, string>>;
};

export default function Game() {
  const {
    scoreboardState,
    gameSummary,
    isRestored,
    hasSavedGame,
    continueGame,
    startNewGame,
    startNewGameWithSamePlayers,
    updatePlayerName,
    reorderPlayers,
    addPlayer,
    removePlayer,
    startGame,
    endRound,
    updateRoundScore,
  } = useYanivScoreboard();
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(SETUP_SLIDE_INDEX);
  const [errors, setErrors] = useState<SlideErrors | null>(null);
  const [activeTab, setActiveTab] = useState<PageTab>(PageTab.ROUNDS);
  // The first slide shown is arrived at rather than turned to.
  const hasFoundItsPlace = useRef(false);
  // Where the end of the game was when the slides last changed, so following it
  // along can tell whoever was standing there from whoever was not.
  const previousLastSlideIndex = useRef(SETUP_SLIDE_INDEX);

  const { players, rounds } = scoreboardState;
  const roundCount = rounds.length;
  // Setup is the first slide, then a slide per round, then the final scores.
  const lastSlideIndex = roundCount + (gameSummary.isGameOver ? 1 : 0);

  useEffect(() => {
    if (!carouselApi) return;

    const handleSelect = () =>
      setSelectedIndex(carouselApi.selectedScrollSnap());

    handleSelect();
    carouselApi.on('select', handleSelect);
    carouselApi.on('reInit', handleSelect);

    return () => {
      carouselApi.off('select', handleSelect);
      carouselApi.off('reInit', handleSelect);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;

    // Read before the carousel is told about the new slide, so this is where
    // the players were standing rather than where they have been put.
    const slideIndexInView = carouselApi.selectedScrollSnap();
    const endOfTheGame = previousLastSlideIndex.current;
    previousLastSlideIndex.current = lastSlideIndex;

    carouselApi.reInit();

    // Picking up a saved game goes straight to where it was left, rather than
    // racing through every round played so far.
    if (!hasFoundItsPlace.current) {
      hasFoundItsPlace.current = true;
      carouselApi.scrollTo(lastSlideIndex, true);
      return;
    }

    // A round opened by the controls arrives as a new slide at the end, as do
    // the final scores once the game is won, and whoever pressed Next follows
    // it along. Only from the end, though: putting right a score from an
    // earlier round can end the game as well, and that must not take the page
    // out from under the player still typing in it.
    if (slideIndexInView === endOfTheGame) {
      carouselApi.scrollTo(lastSlideIndex);
    }
  }, [carouselApi, lastSlideIndex]);

  // Putting right whatever was missing takes the message away with it.
  // biome-ignore lint/correctness/useExhaustiveDependencies: clearing is the point, the state is not read
  useEffect(() => {
    setErrors(null);
  }, [scoreboardState]);

  const findUnnamedPlayers = useCallback(() => {
    const messages: Partial<Record<UserId, string>> = {};

    for (const player of players) {
      if (player.name.trim() === '') {
        messages[player.id] = 'Enter a name for this player';
      }
    }

    return messages;
  }, [players]);

  const findMissingScores = useCallback(
    (roundIndex: number) => {
      const messages: Partial<Record<UserId, string>> = {};
      const round = rounds[roundIndex];
      if (!round) return messages;

      for (const player of players) {
        if (round.handTotals[player.id] === undefined) {
          messages[player.id] = 'Enter score';
        }
      }

      return messages;
    },
    [players, rounds],
  );

  const handleNextClick = () => {
    // Leaving the player names behind, at the start or after coming back to add
    // somebody, is only allowed once everybody has a name.
    if (selectedIndex === SETUP_SLIDE_INDEX) {
      const messages = findUnnamedPlayers();

      if (Object.keys(messages).length > 0) {
        setErrors({ slideIndex: SETUP_SLIDE_INDEX, messages });
        return;
      }
    }

    const roundIndex = selectedIndex - 1;
    const round = rounds[roundIndex];

    if (round && !round.isComplete) {
      const messages = findMissingScores(roundIndex);

      if (Object.keys(messages).length > 0) {
        setErrors({ slideIndex: selectedIndex, messages });
        return;
      }
    }

    if (carouselApi?.canScrollNext()) {
      carouselApi.scrollNext();
      return;
    }

    if (roundCount === 0) {
      startGame();
      return;
    }

    endRound();
  };

  const messagesForSlide = (slideIndex: number) =>
    errors?.slideIndex === slideIndex ? errors.messages : undefined;

  // Until the saved game has been read there is nothing worth showing: the
  // scoreboard underneath is a new game that may be about to be replaced.
  if (!isRestored) {
    return (
      <GameLayout
        gameType={GameType.YANIV}
        actions={<HowToDialog />}
        className='items-center gap-4 p-4'
      >
        <Loading />
      </GameLayout>
    );
  }

  if (hasSavedGame) {
    return (
      <GameLayout
        gameType={GameType.YANIV}
        actions={<HowToDialog />}
        className='items-center gap-4 p-4'
      >
        <div className='w-full max-w-md'>
          <SavedGame
            players={players}
            // The totals a returning player last saw included whatever they had
            // entered into the round they were part way through.
            gameSummary={previewGameSummary(scoreboardState, gameSummary)}
            onContinue={continueGame}
            onStartNew={startNewGame}
            onStartNewWithSamePlayers={startNewGameWithSamePlayers}
          />
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout
      gameType={GameType.YANIV}
      actions={<HowToDialog />}
      className={cn(
        'items-center gap-4 p-4',
        // Held to the height of the screen, so the game sits still as it is
        // played rather than growing a round at a time. Whatever outgrows its
        // share of the screen scrolls where it stands instead.
        'min-h-0',
        // Room for the switch pinned to the foot of the screen.
        rounds.length > 0 && 'pb-24 lg:pb-4',
      )}
    >
      {/* Centred while the carousel is on its own, and once the table joins it
          the table takes up the slack, leaving the carousel against the left. */}
      <div className='flex w-full min-h-0 flex-1 justify-center gap-6'>
        {/* The controls belong to the carousel, so a table that grows with
            every round played does not push them down the page. */}
        <div
          className={cn(
            'w-full min-h-0 max-w-md shrink-0 flex-col gap-4',
            // Both are on show side by side once there is room for them.
            activeTab === PageTab.ROUNDS ? 'flex' : 'hidden lg:flex',
          )}
        >
          {/* Gives way to the screen before the controls do, so a round with a
              table full of players still has its Next button in reach. */}
          <Carousel setApi={setCarouselApi} className='min-h-0 overflow-y-auto'>
            <CarouselContent>
              {/* Only the page on show can be reached, so tabbing cannot wander
              off into the rounds either side of it. */}
              <CarouselItem inert={selectedIndex !== SETUP_SLIDE_INDEX}>
                <Setup
                  players={players}
                  errors={messagesForSlide(SETUP_SLIDE_INDEX)}
                  updatePlayerName={updatePlayerName}
                  reorderPlayers={reorderPlayers}
                  removePlayer={removePlayer}
                  addPlayer={addPlayer}
                />
              </CarouselItem>

              {rounds.map((round, roundIndex) => (
                <CarouselItem
                  key={round.id}
                  inert={selectedIndex !== roundIndex + 1}
                >
                  <Round
                    players={players}
                    round={round}
                    roundNumber={roundIndex + 1}
                    gameSummary={gameSummary}
                    errors={messagesForSlide(roundIndex + 1)}
                    onScoreChange={(playerId, handTotal) =>
                      updateRoundScore(round.id, playerId, handTotal)
                    }
                  />
                </CarouselItem>
              ))}

              {gameSummary.isGameOver && (
                <CarouselItem inert={selectedIndex !== lastSlideIndex}>
                  <GameOver
                    players={players}
                    gameSummary={gameSummary}
                    onPlayAgain={startNewGameWithSamePlayers}
                  />
                </CarouselItem>
              )}
            </CarouselContent>
          </Carousel>

          <CarouselControls
            isAtFirst={selectedIndex === SETUP_SLIDE_INDEX}
            isAtLast={selectedIndex === lastSlideIndex}
            onFirst={() => carouselApi?.scrollTo(SETUP_SLIDE_INDEX)}
            onPrevious={() => carouselApi?.scrollPrev()}
            onNext={handleNextClick}
            onLast={() => carouselApi?.scrollTo(lastSlideIndex)}
          />
        </div>

        {/* Read only, so it can sit in the page alongside the carousel without
            a second set of score boxes to tab through. */}
        {rounds.length > 0 && (
          <ScoreTable
            players={players}
            rounds={rounds}
            gameSummary={gameSummary}
            currentRoundNumber={selectedIndex}
            onRoundSelect={(roundNumber) => {
              carouselApi?.scrollTo(roundNumber);
              setActiveTab(PageTab.ROUNDS);
            }}
            className={cn(
              // Given the run of the page beside the carousel, so a table of
              // six players has the room to lay itself out, and min-w-0 lets it
              // give way to the screen with the table left to scroll.
              'w-full max-w-md lg:max-w-none lg:min-w-0 lg:flex-1',
              // Held against the screen rather than against the page around it:
              // measured off the viewport, the height holds however the page is
              // laid out. What is taken off is the chrome the card sits within —
              // the header and the gap under it, the padding of the page, and on
              // a phone the room kept clear for the tab switch.
              SCORE_TABLE_MAX_HEIGHT,
              // Shown as a flex column rather than a block: the table lays
              // itself out inside one, and the last word on display belongs to
              // whoever writes it last.
              activeTab === PageTab.SCORES ? 'flex' : 'hidden lg:flex',
            )}
          />
        )}
      </div>

      {rounds.length > 0 && (
        // Pinned to the foot of the screen, so a long game does not carry the
        // switch off the bottom of the page.
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as PageTab)}
          className='fixed inset-x-0 bottom-0 z-10 bg-main-background px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden'
        >
          <TabsList className='w-full'>
            <TabsTrigger value={PageTab.ROUNDS} className='flex-1'>
              Rounds
            </TabsTrigger>
            <TabsTrigger value={PageTab.SCORES} className='flex-1'>
              Scores
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}
    </GameLayout>
  );
}

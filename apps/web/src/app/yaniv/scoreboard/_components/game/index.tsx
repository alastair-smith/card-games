'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '~/components/layout/game-layout';
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
import CarouselControls from '../carousel-controls';
import GameOver from '../game-over';
import Round from '../round';
import SavedGame from '../saved-game';
import ScoreTable from '../score-table';
import Setup from '../setup';

const SETUP_SLIDE_INDEX = 0;

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

    // A round opened by the controls arrives as a new slide, which is then
    // turned to, as are the final scores once the game is won. Picking up a
    // saved game goes straight to where it was left instead, rather than racing
    // through every round played so far.
    carouselApi.reInit();
    carouselApi.scrollTo(lastSlideIndex, !hasFoundItsPlace.current);
    hasFoundItsPlace.current = true;
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
            gameSummary={gameSummary}
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
        // Room for the switch pinned to the foot of the screen.
        rounds.length > 0 && 'pb-24 lg:pb-4',
      )}
    >
      <div className='flex w-full items-start justify-center gap-6'>
        {/* The controls belong to the carousel, so a table that grows with
            every round played does not push them down the page. */}
        <div
          className={cn(
            'w-full max-w-md flex-col gap-4',
            // Both are on show side by side once there is room for them.
            activeTab === PageTab.ROUNDS ? 'flex' : 'hidden lg:flex',
          )}
        >
          <Carousel setApi={setCarouselApi}>
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
              'w-full max-w-md',
              activeTab === PageTab.SCORES ? 'block' : 'hidden lg:block',
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

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import GameLayout from '~/components/layout/game-layout';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '~/components/ui/carousel';
import type { UserId } from '~/types/entities';
import { GameType } from '~/types/game';
import { HowToDialog } from '../../../_components/how-to';
import useYanivScoreboard from '../../_hooks/useYanivScoreboard';
import CarouselControls from '../carousel-controls';
import GameOver from '../game-over';
import Round from '../round';
import SavedGame from '../saved-game';
import Setup from '../setup';

const SETUP_SLIDE_INDEX = 0;

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
      className='items-center gap-4 p-4'
    >
      <Carousel className='w-full max-w-md' setApi={setCarouselApi}>
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
    </GameLayout>
  );
}

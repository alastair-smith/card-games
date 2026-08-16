'use client';

import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import type { PlayerName } from '~/types/entities';
import useYanivScoreboard from '../../_hooks/useYanivScoreboard';
import Round from '../round';
import SavedGame from '../saved-game';
import Setup from '../setup';

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

  const roundCount = scoreboardState.rounds.length;

  // Moving past the last slide is what starts the game and ends each round, so
  // there is nothing to press beyond the one control that turns the page.
  const handleNextClick = () => {
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

  useEffect(() => {
    if (!carouselApi) return;

    // A round opened by the control above arrives as a new slide, which is then
    // turned to. Returning to a saved game lands on its current round the same way.
    carouselApi.reInit();
    carouselApi.scrollTo(roundCount);
  }, [carouselApi, roundCount]);

  if (hasSavedGame) {
    return (
      <SavedGame
        onContinue={continueGame}
        onStartNew={startNewGame}
        onStartNewWithSamePlayers={startNewGameWithSamePlayers}
      />
    );
  }

  return (
    <div>
      <h1>Yaniv</h1>

      <Carousel className='w-full max-w-xs' setApi={setCarouselApi}>
        <CarouselContent>
          <CarouselItem>
            <Setup
              players={scoreboardState.players}
              updatePlayerName={updatePlayerName}
              reorderPlayers={reorderPlayers}
              removePlayer={removePlayer}
            />
          </CarouselItem>

          {scoreboardState.rounds.map((round) => (
            <CarouselItem key={round.id}>
              <Round
                players={scoreboardState.players}
                round={round}
                gameSummary={gameSummary}
                onScoreChange={(playerId, handTotal) =>
                  updateRoundScore(round.id, playerId, handTotal)
                }
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious />
        <CarouselNext disabled={false} onClick={handleNextClick} />
      </Carousel>

      <Button onClick={() => addPlayer('' as PlayerName)}>Add Player</Button>
    </div>
  );
}
